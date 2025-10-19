const prisma = require('../config/prismaClient');
const crypto = require('crypto');

function generateSecret() {
  return crypto.randomBytes(32).toString('hex');
}

exports.registerWebhook = async(req,res) =>{
    try {
        const { clientName, clientEmail, eventType, targetUrl } = req.body;
        if (!clientEmail || !eventType || !targetUrl){
            return res.status(400).json({ error: 'clientEmail, eventType and targetUrl required' });
        }
        let client = await prisma.client.findUnique({where:{email:clientEmail}});
        if (!client) {
            client = await prisma.client.create({
            data: { name: clientName || clientEmail.split('@')[0], email: clientEmail, apiKey: crypto.randomBytes(16).toString('hex') },
        });
    }
    const secret = generateSecret();
    const webhook = await prisma.webhook.create({
      data: { clientId: client.id, eventType, targetUrl, secret },
    });
    return res.status(201).json({ ok: true, webhookId: webhook.id, secret });
    } catch (error) {
        console.error(err);
        return res.status(500).json({ error: 'internal_error' });
    }
}

exports.listenWebhook = async(req,res) =>{
    const webhooks = await prisma.webhook.findMany({ include: { client: true } });
    res.json(webhooks);
}