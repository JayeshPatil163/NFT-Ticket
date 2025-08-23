// routes/api/events.js
// Contains all API endpoints for handling events

const express = require('express');
const router = express.Router();
const Event = require('../db/Event');

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST new event
router.post('/', async (req, res) => {
  const event = new Event({
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    venue: req.body.venue,
    totalTickets: req.body.totalTickets,
    price: req.body.price
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
