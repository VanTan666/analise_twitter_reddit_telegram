const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');

class TelegramBotService {
  constructor(token, sentimentData) {
    this.bot = new TelegramBot(token, { polling: true });
    this.sentimentData = sentimentData;
    this.setupHandlers();
    logger.info('Telegram bot initialized with token');
  }

  setupHandlers() {
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from.username;
      
      logger.info(`Received message from @${username} (${msg.from.id}): ${msg.text}`);

      if (msg.text === '/start') {
        await this.bot.sendMessage(chatId, 
          'Welcome to Sentiment Analysis Bot! 👋\n\n' +
          'Available commands:\n' +
          '/stats - Get current sentiment statistics'
        );
      } else if (msg.text === '/stats') {
        try {
          logger.info('Generating stats for user');
          const stats = this.generateStats();
          await this.bot.sendMessage(chatId, stats, { parse_mode: 'HTML' });
          logger.info('Stats sent successfully');
        } catch (error) {
          logger.error('Error sending stats:', error);
          await this.bot.sendMessage(chatId, 'Sorry, there was an error generating statistics.');
        }
      } else {
        await this.bot.sendMessage(chatId, 
          'Available commands:\n' +
          '/stats - Get current sentiment statistics'
        );
      }
    });

    this.bot.on('polling_error', (error) => {
      logger.error('Telegram Bot Polling Error:', error);
    });

    this.bot.on('error', (error) => {
      logger.error('Telegram Bot Error:', error);
    });
  }

  generateStats() {
    const total = this.sentimentData.length;
    
    if (total === 0) {
      return `<b>📊 Sentiment Analysis Statistics</b>\n\n` +
             `No messages analyzed yet.\n` +
             `Waiting for data...`;
    }

    const positive = this.sentimentData.filter(d => d.sentiment.score > 0).length;
    const negative = this.sentimentData.filter(d => d.sentiment.score < 0).length;
    const neutral = this.sentimentData.filter(d => d.sentiment.score === 0).length;

    const posPercent = ((positive/total) * 100).toFixed(1);
    const negPercent = ((negative/total) * 100).toFixed(1);
    const neutPercent = ((neutral/total) * 100).toFixed(1);

    return `<b>📊 Sentiment Analysis Statistics</b>\n\n` +
           `Total Messages: ${total}\n\n` +
           `✅ Positive: ${positive} (${posPercent}%)\n` +
           `❌ Negative: ${negative} (${negPercent}%)\n` +
           `➖ Neutral: ${neutral} (${neutPercent}%)\n\n` +
           `Mood Indicator: ${this.getMoodIndicator(posPercent, negPercent)}`;
  }

  getMoodIndicator(posPercent, negPercent) {
    if (posPercent > 60) return '🌟 Very Positive';
    if (posPercent > negPercent) return '😊 Positive';
    if (negPercent > 60) return '😡 Very Negative';
    if (negPercent > posPercent) return '😕 Negative';
    return '😐 Neutral';
  }
}

module.exports = TelegramBotService;
