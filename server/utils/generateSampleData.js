const mongoose = require('mongoose');
const Sentiment = require('../models/Sentiment');
require('dotenv').config();

const sampleTexts = [
  "I absolutely love this new feature! It's amazing! 🎉",
  "This is terrible, worst experience ever. 😠",
  "The product is okay, nothing special.",
  "Great customer service, very helpful team! 👍",
  "Disappointed with the quality, not worth the price 👎",
  "Neutral review, does what it says.",
  "Amazing work on the latest update! 🚀",
  "Could be better, needs improvement.",
  "Just what I needed, perfect solution! ⭐",
  "Not happy with the service, needs work."
];

const platforms = ['twitter', 'reddit', 'telegram'];

async function generateSampleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    await Sentiment.deleteMany({});

    // Generate sample data
    const sampleData = [];
    for (let i = 0; i < 100; i++) {
      const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      const score = Math.random() * 2 - 1; // Random score between -1 and 1

      sampleData.push({
        platform,
        text,
        sentiment: {
          score,
          comparative: score / text.split(' ').length,
          positive: score > 0 ? ['good', 'great'] : [],
          negative: score < 0 ? ['bad', 'poor'] : []
        },
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24 hours
      });
    }

    await Sentiment.insertMany(sampleData);
    console.log('Sample data generated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error generating sample data:', error);
    process.exit(1);
  }
}

generateSampleData();
