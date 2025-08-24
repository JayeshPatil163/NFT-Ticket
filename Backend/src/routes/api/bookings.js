// routes/api/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../../db/Booking');
const Event = require('../../db/Event');

// POST a new booking (no changes here)
router.post('/', async (req, res) => {
  // ... existing code
});

// GET all bookings for a specific user (no changes here)
router.get('/user/:userId', async (req, res) => {
  // ... existing code
});

// POST to validate a ticket and check in a user
router.post('/validate-checkin', async (req, res) => {
  const { eventId, bookingId } = req.body;

  if (!eventId || !bookingId) {
    return res.status(400).json({ message: 'Event ID and Booking ID are required.' });
  }

  try {
    const booking = await Booking.findById(bookingId);

    // 1. Check if the booking exists
    if (!booking) {
      return res.status(404).json({ message: 'Invalid ticket: Booking not found.' });
    }

    // 2. Check if the ticket belongs to the correct event
    if (booking.eventId.toString() !== eventId) {
      return res.status(400).json({ message: 'Invalid ticket for this event.' });
    }

    // 3. Check if the ticket has already been used
    if (booking.isCheckedIn) {
      return res.status(409).json({ message: 'This ticket has already been checked in.' });
    }

    // 4. Mark as checked in and save
    booking.isCheckedIn = true;
    await booking.save();

    res.status(200).json({ message: 'Check-in successful!' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
