require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const logger = require('./utils/logger');
const TelegramBotService = require('./services/telegramBot');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const sentimentData = [];
const telegramBot = new TelegramBotService(process.env.TELEGRAM_BOT_TOKEN, sentimentData);

app.use(cors());
app.use(express.json());

app.get('/api/sentiment/stats', (req, res) => {
  const positive = sentimentData.filter(d => d.sentiment.score > 0).length;
  const negative = sentimentData.filter(d => d.sentiment.score < 0).length;
  const neutral = sentimentData.filter(d => d.sentiment.score === 0).length;
  
  res.json({
    total: sentimentData.length,
    positive,
    negative,
    neutral
  });
});

app.get('/api/sentiment/platform/:platform', (req, res) => {
  const { platform } = req.params;
  const data = sentimentData
    .filter(d => d.platform === platform)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 100);
  
  res.json({ platform, data });
});

app.get('/api/sentiment/trends', (req, res) => {
  const trends = sentimentData
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 24)
    .map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString(),
      sentiment: d.sentiment.score
    }));
  
  res.json({ trends });
});

io.on('connection', (socket) => {
  logger.info('Client connected');
  socket.emit('initial-data', sentimentData.slice(-100));
  
  const interval = setInterval(() => {
    const platforms = ['twitter', 'reddit', 'telegram'];
    const texts = [
      "Love this new feature! ",
      "Not happy with the service ",
      "This is okay, nothing special",
      "Great work! ",
      "Could be better"
    ];
    
    const newData = {
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      text: texts[Math.floor(Math.random() * texts.length)],
      sentiment: {
        score: Math.random() * 2 - 1,
        comparative: Math.random()
      },
      timestamp: new Date()
    };
    
    sentimentData.push(newData);
    if (sentimentData.length > 1000) sentimentData.shift();
    socket.emit('sentiment-data', newData);
  }, 3000);
  
  socket.on('disconnect', () => {
    clearInterval(interval);
    logger.info('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
