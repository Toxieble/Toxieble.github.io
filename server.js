require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = require('./models/database');
const priceRoutes = require('./routes/price');
const aiRoutes = require('./routes/ai');
const demandRoutes = require('./routes/demand');
const adminRoutes = require('./routes/admin');
const businessPlanRoutes = require('./routes/businessPlan');

app.use('/api/price', priceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/demand', demandRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business-plan', businessPlanRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

db.initDatabase().then(() => {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});