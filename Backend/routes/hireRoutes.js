const express = require('express');
require('dotenv');
const twilio = require("twilio");
const router = express.Router();
const Hire = require('../models/Hire');
const User = require('../models/User');


// Farmer creates a hire request
router.post('/request', async (req, res) => {
  try {
    const { farmerId, helperId, cropId, notes } = req.body;
    const farmer = await User.findById(farmerId);
    const helper = await User.findById(helperId);
    if (!farmer || farmer.role !== 'farmer') return res.status(400).json({ msg: 'Only farmers can request hires' });
    if (!helper || helper.role !== 'helper') return res.status(400).json({ msg: 'Target must be a helper' });
    const hire = new Hire({ farmerId, helperId, cropId: cropId || null, notes });
    await hire.save();
    // const accountSid = 'xxxxx';
    // const authToken = 'yyyyyy';
    const client = twilio(accountSid, authToken);

    async function createMessage() {
      try {
        const message = await client.messages.create({
          body: "You have a new hire request from " + farmer.name + " - " + farmer.phone + ". Please call / message them back to discuss further about your availability.\n\nNotes: " + notes,
          from: "+13142480934",
          to: '+91' + helper.phone,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Failed to send SMS notification', error: err.message });
      }
    }
    createMessage();
    res.json({ msg: 'hire request sent' });
  } catch (err) {
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
});

// Helper or farmer lists hires relevant to them
router.get('/byUser/:userId', async (req, res) => {
  const userId = req.params.userId;
  // return hires where user is farmer OR helper
  const hires = await Hire.find({ $or: [{ farmerId: userId }, { helperId: userId }] })
    .populate('farmerId', 'name')
    .populate('helperId', 'name')
    .populate('cropId', 'cropName');
  res.json(hires);
});

// Update hire status (accept / reject / complete)
// Who can update: the helper (to accept/reject), or farmer (to mark completed) - leaving checks simple
router.post('/updateStatus', async (req, res) => {
  const { hireId, newStatus } = req.body;
  if (!['requested', 'accepted', 'rejected', 'completed'].includes(newStatus)) return res.status(400).json({ msg: 'Invalid status' });

  const hire = await Hire.findById(hireId);
  if (!hire) return res.status(404).json({ msg: 'Hire not found' });

  hire.status = newStatus;
  await hire.save();
  res.json(hire);
});

module.exports = router;
