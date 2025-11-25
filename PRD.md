# CreatorMetrics – PRD (Bolt Hackathon)

## Overview

CreatorMetrics is a full-funnel analytics and agentic co-pilot for creators and their managers.
It stitches together Instagram, LTK, and Amazon data into a single view and lets AI agents help
explain performance and suggest actions.

This MVP is implemented as a Next.js App Router project that is Bolt-friendly.

## Tech Stack

- **Frontend**: Next.js 14.2.33 (App Router), React 18.3.1, TypeScript 5.9.3
- **Database**: Supabase (optional - falls back to mock data)
- **Data Sources**: Instagram Business Suite CSV, LTK exports, Amazon Associates XML
- **AI/ML**: OpenAI embeddings (optional), custom agent functions

## Key Features

1. **Multi-Platform Analytics Dashboard**
   - Unified view of Instagram, LTK, and Amazon performance
   - Campaign-level and creator-level metrics
   - Revenue, conversions, clicks, impressions tracking

2. **Data Ingestion Pipeline**
   - CSV parsing for Instagram and LTK exports
   - XML parsing for Amazon Associates data
   - Automatic data normalization and deduplication

3. **AI Agent System**
   - **Atlas**: Analytics interpretation and insights
   - **Muse**: Creative suggestions and content ideas
   - **Nina**: Data cleaning and mapping guidance
   - **Echo**: Debug and diagnostic tools

4. **Link Mapping**
   - Connects Instagram posts → LTK links → Amazon tracking IDs
   - Full-funnel attribution across platforms

## Hackathon Goals

- Demonstrate full-funnel creator analytics
- Show AI agent capabilities for data interpretation
- Provide working MVP that can ingest real data
- Bolt-friendly: works out-of-the-box with mock data

## Architecture

- **App Router**: Next.js 14 App Router for routing
- **Server Components**: Dashboard and list pages use server components
- **Client Components**: Interactive pages (agents, upload) use client components
- **API Routes**: `/api/agent` and `/api/upload` for backend functionality
- **Storage Layer**: Abstraction between Supabase and mock data via `lib/storage.ts`
