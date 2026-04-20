# AGEIS Map Prototype

Prototype web app for exploring the AGEIS dataset on an interactive Mapbox map.
Built with Next.js (App Router) + Mapbox GL JS.

## What this prototype does

- Renders household point data with **two aggregation levels**: municipality/city clusters and barangay clusters.
- Click a cluster to **focus the map** and open a **right-side info card** with aggregate counts.
- Provides filters (year range, barangay, income range) and optional visualization layers (risk coloring + heatmaps).
- Includes search powered by **Mapbox Geocoding** plus local matches for municipalities/cities and barangays.

Note: To comply with privacy requirements, the UI does **not** show per-household details.

## Installation

### Prerequisites

- Node.js 18+ (recommended)
- A Mapbox access token

### Setup

1) Install dependencies:

```bash
npm install
```

2) Create a local env file `.env.local` in the project root:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=YOUR_TOKEN_HERE
```

3) Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000

## Build / Production

```bash
npm run build
npm start
```

## Data

- The active dataset file is `data/val-31-ver2.geojson`.
- It is served by the API route `GET /api/geojson/val-31-ver2`.

If you want to use a different GeoJSON file, place it under `data/` and add its name to the allowlist in `app/api/geojson/[name]/route.ts`.
