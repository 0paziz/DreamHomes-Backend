Real Estate Backend

This is a simple Express + MongoDB backend for the Real Estate Project. It includes a Property model, CRUD routes, and an AI-assisted search endpoint that uses the OpenAI API to parse natural language queries into filters.

Setup

1. Copy `.env` to `.env` and set `MONGODB_URI` and `OPENAI_API_KEY`.
2. Install dependencies: `npm install`.
3. Start the server: `npm run dev` (needs nodemon) or `npm start`.

Routes

- GET /api/properties - list all properties
- GET /api/properties/:id - get property by id
- POST /api/properties - create property
- PUT /api/properties/:id - update property
- DELETE /api/properties/:id - delete property
- POST /api/ai-search - body { query: string } - returns parsed filters and matching properties

Notes

- All routes are public for now. Authentication can be added later.
- The AI endpoint sends your query to OpenAI (configured via `OPENAI_API_KEY`) and expects the model to return a JSON object of filters. The backend tries to parse that JSON and uses it to query MongoDB.
