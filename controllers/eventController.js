const prisma = require('../config/prismaClient');
const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URL);
const eventQueue = new Queue('events', { connection });


exports.receiveEvent = async(req, res) => {
  try {
    const { eventType, source, payload } = req.body;

    if (!eventType || !payload) {
      return res.status(400).json({ error: 'eventType and payload required' });
    }

    const event = await prisma.event.create({
      data: {
        eventType,
        source: source || 'unknown',
        payload,
      },
    });

    await eventQueue.add('dispatch', { eventId: event.id }, { removeOnComplete: true, attempts: 1 });

    return res.status(201).json({ ok: true, id: event.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

exports.getAllEvents = async (req, res) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
};
