// routes/api/events.js
const express = require('express');
const router = express.Router();
const Event = require('../../db/Event');

// GET all available events with pagination (for the user feed)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const events = await Event.find({
      // Only find events that are not sold out
      $expr: { $lt: ["$ticketsSold", "$totalTickets"] }
    })
    .sort({ date: 1 }) // Sort by the soonest events
    .skip(skip)
    .limit(limit);
    
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all events created by a specific organizer
router.get('/organizer/:organizerId', async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.params.organizerId });
    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this organizer' });
    }
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new event
router.post('/', async (req, res) => {
  const { name, description, date, venue, totalTickets, price, organizerId } = req.body;

  if (!organizerId) {
    return res.status(400).json({ message: 'Organizer ID (wallet address) is required.' });
  }

  const event = new Event({
    name,
    description,
    date,
    venue,
    totalTickets,
    price,
    organizerId
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;