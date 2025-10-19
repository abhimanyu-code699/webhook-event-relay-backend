const { Worker } = require('bullmq'); // 👈 import Worker
const redisClient = require('../config/redis'); // your ioredis client
const prisma = require('../config/prismaClient');
const axios = require('axios');
const crypto = require('crypto');

const queueName = 'events';

// HMAC helper
function signPayload(secret, payload) {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

// Worker
const worker = new Worker(
  queueName,
  async job => {
    if (job.name !== 'dispatch') return;
    const { eventId } = job.data;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new Error('event_not_found');

    const webhooks = await prisma.webhook.findMany({ where: { eventType: event.eventType, isActive: true } });

    for (const wh of webhooks) {
      const delivery = await prisma.delivery.create({ data: { eventId: event.id, webhookId: wh.id } });

      const signature = signPayload(wh.secret, event.payload);

      try {
        const resp = await axios.post(
          wh.targetUrl,
          { eventType: event.eventType, payload: event.payload },
          {
            headers: { 'X-Webhook-Signature': signature, 'X-Delivery-Id': delivery.id },
            timeout: 10000,
          }
        );

        await prisma.delivery.update({
          where: { id: delivery.id },
          data: { status: 'SUCCESS', attempts: 1, lastResponseCode: resp.status, lastResponseBody: JSON.stringify(resp.data).slice(0, 1000) },
        });
      } catch (err) {
        console.error('delivery_error', err.message || err.toString());
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: {
            status: 'FAILED',
            attempts: 1,
            lastResponseCode: err.response ? err.response.status : null,
            lastResponseBody: err.response && err.response.data ? JSON.stringify(err.response.data).slice(0, 1000) : err.message,
          },
        });
      }
    }

    await prisma.event.update({ where: { id: event.id }, data: { published: true } });
    return { ok: true };
  },
  { connection: redisClient } // 👈 use the redisClient from redis.js
);

worker.on('completed', job => console.log('job completed', job.id));
worker.on('failed', (job, err) => console.error('job failed', job.id, err));

module.exports = worker;
