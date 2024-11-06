// app/api/stream/route.ts

import { NextRequest } from 'next/server';

export const runtime = 'nodejs'; // Ensure that the route runs on the Node.js runtime

export async function POST(request: NextRequest) {
  const { query } = await request.json();

  const response = await fetch('http://localhost:8080/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include any necessary headers, e.g., authentication
    },
    body: JSON.stringify({ query }),
  });

  // Check if the response has a body
  if (!response.body) {
    return new Response('No response body from FastAPI server', { status: 500 });
  }

  // Return the response as a streaming response
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
