// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const attachUser = require('./middleware/attachUser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const cropRoutes = require('./routes/cropRoutes');
const marketRoutes = require('./routes/marketRoutes');
const helperRoutes = require('./routes/helperRoutes');
const hireRoutes = require('./routes/hireRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(attachUser);

mongoose.connect('mongodb://localhost:27017/agriapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error(err));

  (async () => {
  try {
    // Will drop any indexes that are NOT defined in the current schema
    await User.syncIndexes();
    console.log('User indexes synced ✅');
  } catch (e) {
    console.error('Failed to sync User indexes:', e?.message || e);
  }
})();
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/hires', hireRoutes);

app.listen(3001, () => console.log("Server running on port 3001"));
