const prisma = require('../config/prismaClient');

exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        webhook: true,
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(deliveries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
};
