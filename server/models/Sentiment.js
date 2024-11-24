const mongoose = require('mongoose');

const sentimentSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit', 'telegram']
  },
  text: {
    type: String,
    required: true
  },
  sentiment: {
    score: Number,
    comparative: Number,
    positive: [String],
    negative: [String]
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sentiment', sentimentSchema);
