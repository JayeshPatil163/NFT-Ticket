// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  totalTickets: { type: Number, required: true },
  ticketPrice: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  organizer: { type: String, required: true, lowercase: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);