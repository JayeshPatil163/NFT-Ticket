// server.js
// Main entry point for the NFT Ticketing backend

// --- Imports ---
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import DB connection function
require('dotenv').config();

// --- Initializations ---
const app = express();
const PORT = process.env.PORT || 5001;

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

// Define API Routes
// This tells the app to use the routes defined in the events.js file
// for any URL that starts with /api/events
app.use('/api/events', require('./routes/api/events'));


// --- TODO: Future Enhancements ---
// 1. Add a route to generate NFT metadata and pin to IPFS (e.g., using Pinata).
// 2. Set up a listener for smart contract events (e.g., TicketMinted) using ethers.js.
// 3. Add user authentication (e.g., sign-in with wallet).
// 4. Protect routes (e.g., only the event organizer can edit their event).


// --- Server Listener ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
