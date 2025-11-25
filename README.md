# CreatorMetrics (Bolt Hackathon MVP)

CreatorMetrics is a full-funnel analytics and agentic co-pilot for creators.

It connects Instagram, LTK, and Amazon performance into a single dashboard and offers AI agents
that help you interpret the data, clean it, and generate creative.

## Quickstart

```bash
npm install
npm run dev
```

Then open:

- `/dashboard` - Overview of all metrics and performance
- `/creators` - List of creators and their profiles
- `/campaigns` - Campaign management and analytics
- `/agents` - AI agent playground (Atlas, Muse, Nina, Echo)
- `/upload` - Data ingestion interface for CSV/XML files

## For Bolt Reviewers

### Setup
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev`
4. Open `http://localhost:3000`

### Demo Data
The app uses **mock data by default** - no database setup required! The mock data includes:
- Sample creator: Nicki Entenmann
- Sample campaign: LMNT Q4 Collab
- Sample posts and metrics across Instagram, LTK, and Amazon platforms

### Environment Variables (Optional)
Create a `.env.local` file if you want to customize:

```env
# Set to 'true' to use Supabase (requires Supabase setup)
# Default: false (uses mock data)
USE_SUPABASE=false

# Optional: OpenAI API key for embeddings
OPENAI_API_KEY=
```

### Testing Routes
- **Dashboard** (`/dashboard`) - Shows aggregated metrics and summary
- **Creators** (`/creators`) - Browse creator profiles
- **Campaigns** (`/campaigns`) - View campaign details and performance
- **Agents** (`/agents`) - Test AI agents with sample queries
- **Upload** (`/upload`) - Upload CSV/XML files for data ingestion

### Build Verification
```bash
npm run build  # Should complete without errors
npm start      # Test production build
```

## Tech Stack
- **Next.js 14.2.33** - App Router
- **React 18.3.1** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Supabase** (optional) - Database (falls back to mock data)
