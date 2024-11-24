const { TwitterApi } = require('twitter-api-v2');
const TelegramBot = require('node-telegram-bot-api');
const Snoowrap = require('snoowrap');
const Sentiment = require('sentiment');
const logger = require('../utils/logger');

const sentiment = new Sentiment();

// Initialize API clients
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const redditClient = new Snoowrap({
  userAgent: 'sentiment-analysis-app',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD,
});

const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Analyze sentiment of text
const analyzeSentiment = (text) => {
  const result = sentiment.analyze(text);
  return {
    score: result.score,
    comparative: result.comparative,
    tokens: result.tokens,
    words: result.words,
    positive: result.positive,
    negative: result.negative,
  };
};

// Setup social media listeners
const setupSocialMediaListeners = (io) => {
  // Twitter Stream
  const streamTwitter = async () => {
    try {
      const stream = await twitterClient.v2.searchStream({
        'tweet.fields': ['text', 'created_at'],
      });

      stream.on('data', async (tweet) => {
        const sentimentResult = analyzeSentiment(tweet.data.text);
        io.emit('tweet', {
          platform: 'twitter',
          text: tweet.data.text,
          sentiment: sentimentResult,
          timestamp: tweet.data.created_at,
        });
      });
    } catch (error) {
      logger.error('Twitter stream error:', error);
    }
  };

  // Reddit Stream
  const streamReddit = async () => {
    try {
      const subreddit = await redditClient.getSubreddit('all');
      const stream = subreddit.stream();

      stream.on('item', (post) => {
        const sentimentResult = analyzeSentiment(post.title + ' ' + post.selftext);
        io.emit('reddit', {
          platform: 'reddit',
          text: post.title,
          sentiment: sentimentResult,
          timestamp: new Date(post.created_utc * 1000),
        });
      });
    } catch (error) {
      logger.error('Reddit stream error:', error);
    }
  };

  // Telegram Bot
  telegramBot.on('message', (msg) => {
    const sentimentResult = analyzeSentiment(msg.text);
    io.emit('telegram', {
      platform: 'telegram',
      text: msg.text,
      sentiment: sentimentResult,
      timestamp: new Date(msg.date * 1000),
    });
  });

  // Start streams
  streamTwitter();
  streamReddit();
};

module.exports = {
  setupSocialMediaListeners,
  analyzeSentiment,
};
