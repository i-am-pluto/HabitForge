# Mathematical Habit Tracker

A modern habit tracking web application that uses exponential mathematical functions to predict habit formation. The app calculates habit strength using the formula `y = 0.5 × e^(0.18×(x1-x2))` where habits are considered "formed" when the curve crosses the y=x line (typically after 20+ days of consistent practice).

## Features

- **Mathematical Progress Tracking**: Uses weighted exponential functions calibrated for realistic 20+ day habit formation
- **Visual Analytics**: Interactive charts showing habit strength progression over time
- **Smart Missed Day Detection**: Automatically tracks missed days between app sessions
- **Multiple Categories**: Organize habits across Health & Fitness, Learning, Productivity, Mindfulness, Creative, and Social
- **Persistent Storage**: MongoDB Atlas database that survives server restarts and auto-scaling

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Chart.js
- **Backend**: Express.js + Node.js
- **Database**: MongoDB Atlas (free tier)
- **Deployment**: Vercel
- **Build Tool**: Vite

## Local Development

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB Atlas:**
   - Create a free account at [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new M0 (free) cluster
   - Create a database user and get your connection string
   - Add your connection string to `.env` file:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/habitsdb
     ```

3. **Run the development server:**
   ```bash
   # Option 1: Quick start
   ./run.sh
   
   # Option 2: Manual start
   npm run dev
   ```

4. **Open your browser:**
   - Visit `http://localhost:5000`

## Deployment on Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/habit-tracker&env=MONGODB_URI&envDescription=MongoDB%20Atlas%20connection%20string&envLink=https://docs.mongodb.com/atlas/getting-started/)

### Manual Deployment

1. **Fork this repository**

2. **Connect to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Import your forked repository
   - Add environment variable: `MONGODB_URI` with your MongoDB Atlas connection string

3. **Deploy:**
   ```bash
   # Full deployment with checks
   ./deploy.sh
   
   # Quick deployment
   ./deploy-quick.sh
   
   # Manual deployment
   npm run build && vercel --prod
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB Atlas connection string | Yes |

## Mathematical Formula

The app uses the formula: **y = 0.5 × e^(0.18×(x1-x2))**

Where:
- `x1` = Number of successful days
- `x2` = Number of missed days
- `y` = Current habit strength

**Habit Formation**: A habit is considered "formed" when `y ≥ days since start`, typically occurring after 20+ consistent days.

## License

MIT License