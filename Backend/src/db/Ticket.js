// models/Ticket.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ticketSchema = new mongoose.Schema({
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event', // This creates a reference to the Event model
    required: true
  },
  owner: {
    type: String, // Wallet address of the ticket holder
    required: true,
    lowercase: true,
    trim: true
  },
  tokenId: {
    type: Number, // The NFT token ID from the smart contract
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false // To track if the ticket has been checked-in/used
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create a compound index to ensure one user can't have the same tokenId for the same event
ticketSchema.index({ event: 1, tokenId: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);