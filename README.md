# Real-Time Social Sentiment Dashboard

A real-time dashboard for analyzing and visualizing emotional trends across social media platforms using Node.js, React, and Socket.IO.

## Features

- Real-time sentiment analysis
- Interactive dashboard with live updates
- Telegram bot integration for stats
- Sentiment distribution visualization
- Platform-wise statistics
- Trend analysis over time

## Tech Stack

- **Frontend**: React, Material-UI, Recharts, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO
- **Integration**: Telegram Bot API

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
4. Add your Telegram bot token to `.env`

## Development

Start the development server:
```bash
npm run dev
```

This will run both frontend and backend in development mode:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Telegram Bot Commands

- `/start` - Welcome message
- `/stats` - Get current sentiment statistics

## License

MIT
