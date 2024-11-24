const express = require('express');
const router = express.Router();
const Sentiment = require('../models/Sentiment');

// Get overall sentiment statistics
router.get('/stats', async (req, res) => {
  try {
    const total = await Sentiment.countDocuments();
    const positive = await Sentiment.countDocuments({ 'sentiment.score': { $gt: 0 } });
    const negative = await Sentiment.countDocuments({ 'sentiment.score': { $lt: 0 } });
    const neutral = await Sentiment.countDocuments({ 'sentiment.score': 0 });

    res.json({
      total,
      positive,
      negative,
      neutral
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sentiment data for specific platform
router.get('/platform/:platform', async (req, res) => {
  try {
    const { platform } = req.params;
    const data = await Sentiment.find({ platform })
      .sort({ timestamp: -1 })
      .limit(100);
    
    res.json({
      platform,
      data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sentiment trends
router.get('/trends', async (req, res) => {
  try {
    const trends = await Sentiment.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d %H", date: "$timestamp" }
          },
          averageSentiment: { $avg: "$sentiment.score" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": -1 } },
      { $limit: 24 }
    ]);

    res.json({ trends });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
