// routes/api/events.js
// Contains all API endpoints for handling events

const express = require('express');
const router = express.Router();

// Import the Event and Ticket models
const Event = require('../../models/Event');
const Ticket = require('../../models/Ticket');

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Find all events and sort them by date in ascending order
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Public (in a real app, this would be protected)
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      date,
      location,
      totalTickets,
      ticketPrice,
      imageUrl,
      organizer
    } = req.body;

    // Basic validation to ensure all required fields are present
    if (!name || !description || !date || !location || !totalTickets || !ticketPrice || !imageUrl || !organizer) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Create a new Event instance
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      totalTickets,
      ticketPrice,
      imageUrl,
      organizer,
    });

    // Save the new event to the database
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent); // Respond with the created event

  } catch (error) {
    console.error('Error creating event:', error.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   GET /api/events/organizer/:address
 * @desc    Get all events created by a specific organizer
 * @access  Public
 */
router.get('/organizer/:address', async (req, res) => {
    try {
        // Find events where the organizer field matches the address in the URL
        const organizerAddress = req.params.address.toLowerCase();
        const events = await Event.find({ organizer: organizerAddress }).sort({ date: -1 });

        if (!events || events.length === 0) {
            return res.status(404).json({ msg: 'No events found for this organizer' });
        }

        res.json(events);
    } catch (error) {
        console.error('Error fetching organizer events:', error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/events/user/:address
 * @desc    Get all events for which a user owns a ticket
 * @access  Public
 */
router.get('/user/:address', async (req, res) => {
    try {
        const userAddress = req.params.address.toLowerCase();

        // Step 1: Find all tickets owned by the user
        const tickets = await Ticket.find({ owner: userAddress });

        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ msg: 'No tickets found for this user' });
        }

        // Step 2: Get an array of unique event IDs from the tickets
        // Using Set to automatically handle duplicates
        const eventIds = [...new Set(tickets.map(ticket => ticket.event))];

        // Step 3: Find all events that match the collected event IDs
        const events = await Event.find({ '_id': { $in: eventIds } });

        res.json(events);
    } catch (error) {
        console.error('Error fetching user ticketed events:', error.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   GET /api/events/:id
 * @desc    Get a single event by its ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    // Find a single event by its unique MongoDB ID
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event by ID:', error.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
