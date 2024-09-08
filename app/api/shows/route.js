import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.API_PORT || 3001}`;

export const GET = withApiAuthRequired(async function shows(req) {
  try {
    const res = new NextResponse();
    const { accessToken } = await getAccessToken(req, res, {
      scopes: ['read:shows']
    });
    const response = await fetch(`${apiBaseUrl}/api/shows`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    const shows = await response.json();
    return NextResponse.json(shows, res);
  } catch (error) {
    console.error('Failed to fetch shows:', error);  // Improved error logging
    return NextResponse.json({ error: error.message }, { status: error.status || 500 });
  }
});
