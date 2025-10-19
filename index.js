const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const webhookRoutes = require('./routes/webhookRoute');
const eventRoutes = require('./routes/eventRoute');
dotenv.config();

const app = express();

require('./config/redis');

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api',webhookRoutes);
app.use('/api',eventRoutes);

const PORT = process.env.PORT || 7132
app.listen(PORT,()=>{
    console.log(`Server is running at port : ${PORT}`);
})