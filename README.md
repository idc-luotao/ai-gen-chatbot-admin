# AI Gen Chatbot Admin

Admin interface for AI-generated chatbot management.

## Environment Setup

This project uses environment variables for configuration. To set up your environment:

1. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set your environment-specific values:
   ```
   NEXT_PUBLIC_API_TOKEN=your-api-token-here
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
   ```

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
