// src/workers/deliveryWorker.js
const { Worker } = require('bullmq');
const redis = require('../config/redis'); // ioredis instance
const prisma = require('../config/prismaClient');
const axios = require('axios');
const crypto = require('crypto');

const queueName = 'events';

function signPayload(secret, payload) {
  // header format: sha256=<hex>
  return 'sha256=' + crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
}

const worker = new Worker(queueName, async (job) => {
  if (job.name !== 'dispatch') return;
  const { eventId } = job.data;
  const event = await prisma.event.findUnique({ where: { id: eventId }});
  if (!event) throw new Error('event_not_found');

  const webhooks = await prisma.webhook.findMany({ where: { eventType: event.eventType, isActive: true }});
  for (const wh of webhooks) {
    // idempotency: create delivery only if not exists for this event+webhook
    const existing = await prisma.delivery.findFirst({ where: { eventId: event.id, webhookId: wh.id }});
    if (existing && existing.status === 'SUCCESS') continue;

    const delivery = await prisma.delivery.create({ data: { eventId: event.id, webhookId: wh.id, status: 'PENDING' }});
    const signature = signPayload(wh.secret, { eventType: event.eventType, payload: event.payload, deliveryId: delivery.id });

    try {
      const resp = await axios.post(wh.targetUrl, { eventType: event.eventType, payload: event.payload }, {
        headers: {
          'X-Webhook-Signature': signature,
          'X-Delivery-Id': delivery.id,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      await prisma.delivery.update({ where: { id: delivery.id }, data: { status: 'SUCCESS', attempts: delivery.attempts + 1, lastResponseCode: resp.status, lastResponseBody: JSON.stringify(resp.data).slice(0,1000) }});
    } catch (err) {
      const code = err.response ? err.response.status : null;
      const body = err.response && err.response.data ? JSON.stringify(err.response.data).slice(0,1000) : err.message;
      await prisma.delivery.update({ where: { id: delivery.id }, data: { status: 'FAILED', attempts: delivery.attempts + 1, lastResponseCode: code, lastResponseBody: body }});
      // If job-level retry/backoff is configured by BullMQ, Bull will re-run job.
    }
  }
  await prisma.event.update({ where: { id: event.id }, data: { published: true }});
  return true;
}, { connection: redis });

worker.on('completed', job => console.log('job completed', job.id));
worker.on('failed', (job, err) => console.error('job failed', job.id, err));
