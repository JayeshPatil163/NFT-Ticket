// server.js
// Main entry point for the NFT Ticketing backend

// --- Imports ---
const express = require('express');
const connectDB = require('./db/db'); // Import DB connection function
const cors = require('cors');
require('dotenv').config(); // Remove the path option since .env is in root
const IP_ADDRESS = '10.20.190.198'; 

// --- Initializations ---
const app = express();
const PORT = process.env.PORT;

// --- Connect to Database ---
connectDB();

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// --- API Routes ---

// Test Route
app.get('/', (req, res) => {
  res.send('Welcome to the NFT Ticket Backend API!');
});


const eventsRouter = require('./routes/api/events');
const bookingsRouter = require('./routes/api/bookings');

app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);

// Define API Routes
// app.use('/api/events', require('./routes/events'));


// --- TODO: Future Enhancements ---
// 1. Add a route to generate NFT metadata and pin to IPFS (e.g., using Pinata).
// 2. Set up a listener for smart contract events (e.g., TicketMinted) using ethers.js.
// 3. Add user authentication (e.g., sign-in with wallet).
// 4. Protect routes (e.g., only the event organizer can edit their event).


// --- Server Listener ---
app.listen(PORT, IP_ADDRESS, () => console.log(`Server started on http://${IP_ADDRESS}:${PORT}`));
