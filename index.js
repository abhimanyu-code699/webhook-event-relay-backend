const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhookRoute');
const eventRoutes = require('./routes/eventRoute');
const deliveryRoute = require('./routes/deliveryRoute');

dotenv.config();

const app = express();

require('./config/redis');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(bodyParser.json());

app.use('/api',webhookRoutes);
app.use('/api',eventRoutes);
app.use('/api',deliveryRoute);


app.post('/webhook-test', (req, res) => {
  console.log('Webhook received:', req.body);
  res.status(200).json({ ok: true });
});

app.get('/',(req,res)=>{
    res.send('event-relay-backend');
})
const PORT = process.env.PORT || 7132
app.listen(PORT,()=>{
    console.log(`Server is running at port : ${PORT}`);
})