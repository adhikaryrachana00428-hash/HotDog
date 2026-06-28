# HotDog - Engineering Intelligence Platform

HotDog transforms repositories and engineering resources into interactive engineering knowledge. Understand every technology, dependency, architecture decision, and workflow behind your project.

## Features

- **Engineering Blueprint** - Visualize complete software architecture
- **Technology Knowledge Cards** - Learn frameworks, dependencies, APIs with clear explanations
- **Engineering Relationships** - Understand component communication
- **AI Documentation** - Auto-generate educational documentation
- **Smart Recommendations** - Discover better technologies and alternatives
- **Learning Roadmap** - Turn projects into structured learning journeys

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd HotDog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your API keys and configuration.

### Running Locally

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. Open the application in your browser
2. Paste a GitHub repository URL or any public engineering resource
3. Click "Extract Project DNA" to analyze
4. Explore the generated engineering intelligence report

## Project Structure

```
HotDog/
├── src/              # TypeScript source files
│   ├── agents/       # AI agent implementations
│   ├── prompts/      # AI prompt templates
│   └── services/     # Service layer
├── server/           # Express server
├── public/           # Static assets
├── index.html        # Landing page
├── styles.css        # Neobrutalism styles
├── api.js            # Frontend API client
├── app.js            # Frontend interactions
└── package.json      # Dependencies
```

## Deployment

### Deploy to Vercel

#### Prerequisites

- Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repository with your code
- Vercel CLI installed (optional)

#### Step 1: Prepare Your Repository

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Ensure your `.env` variables are set up in Vercel (don't commit sensitive keys)

#### Step 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables from your `.env` file:
   - Go to Settings > Environment Variables
   - Add each variable with its value
6. Click "Deploy"

#### Step 3: Deploy via Vercel CLI (Alternative)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. For production deployment:
```bash
vercel --prod
```

#### Step 4: Configure Serverless Functions

If you're using the Express server, you may need to adapt it for Vercel:

1. Create `vercel.json` in project root:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    }
  ]
}
```

2. Update your Express server to export the app:
```typescript
// server/index.ts
import express from 'express';
const app = express();

// Your middleware and routes

export default app;
```

#### Step 5: Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### Environment Variables

Required environment variables for Vercel:

- `OPENAI_API_KEY` - OpenAI API key for AI features
- `ANTHROPIC_API_KEY` - Anthropic API key (optional)
- Any other API keys your services require

Add these in Vercel Dashboard > Settings > Environment Variables

## Troubleshooting

### Common Errors Explained

#### "Error: listen EADDRINUSE: address already in use :::3001"

**What this means:** Another program is already using port 3001, so HotDog can't start.

**How to fix it:**
```bash
# Option 1: Kill the process using port 3001
lsof -ti:3001 | xargs kill -9

# Option 2: Use a different port
PORT=3002 npm run dev
```

**Why this happens:** This is normal if you previously ran `npm run dev` and didn't stop it properly, or if another application is using that port.

#### "throw er; // Unhandled 'error' event"

**What this means:** An error occurred in the server but wasn't caught by error handling code.

**How to fix it:** The server now has better error handling. If you see this, it's usually the port conflict error above. Follow those steps.

#### "BuildDNA_API is not defined"

**What this means:** The code is trying to use an old API name that was changed.

**How to fix it:** This has been fixed in the latest code. Make sure you have the latest version by pulling from git or checking your files reference `HotDog_API` instead of `BuildDNA_API`.

### Port Already in Use

If you get `EADDRINUSE` error:
```bash
# Find process using port 3001
lsof -ti:3001

# Kill the process
kill -9 <PID>
```

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18+
- Check TypeScript compilation: `npm run typecheck`

### Vercel Deployment Issues

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure build command outputs to correct directory
- Check that `package.json` has correct scripts

## License

© 2026 HotDog. All rights reserved.
