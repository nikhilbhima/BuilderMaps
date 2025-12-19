# Builder Maps

A community-driven platform that helps founders and builders discover coworking spaces, hacker houses, cafes, and community venues where builders gather in cities around the world.

## Features

- **Discover Spots** - Browse curated venues across 40+ cities in 5 regions
- **Interactive Maps** - View spots on an interactive map with Leaflet
- **Community Engagement** - Upvote favorites, write reviews, and nominate new places
- **City Browsing** - Explore spots organized by city with filtering options
- **Admin Panel** - Moderation tools for managing nominations, reports, and content

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Twitter/LinkedIn OAuth)
- **Maps**: Leaflet

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- A Supabase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/builder-maps.git
   cd builder-maps
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase credentials to `.env.local`

4. Run the development server
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
/src
  /app          # Next.js pages and API routes
  /components   # React components
  /contexts     # React Context providers
  /lib          # Utilities and Supabase setup
  /data         # Static data (cities, regions)
/database       # SQL schema and seed data
```

## License

MIT
