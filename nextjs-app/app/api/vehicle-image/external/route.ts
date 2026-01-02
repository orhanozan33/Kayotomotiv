import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand');
    const model = searchParams.get('model');
    const year = searchParams.get('year');

    if (!brand || !model) {
      return NextResponse.json({ error: 'Brand and model are required' }, { status: 400 });
    }

    // Generate a simple SVG car illustration based on brand/model
    // This is a placeholder - you can replace with actual external API call if needed
    const svgCar = `
      <svg width="200" height="120" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="60" width="160" height="50" rx="5" fill="#4CAF50" opacity="0.3"/>
        <rect x="30" y="40" width="60" height="35" rx="3" fill="#4CAF50" opacity="0.5"/>
        <rect x="110" y="40" width="60" height="35" rx="3" fill="#4CAF50" opacity="0.5"/>
        <circle cx="50" cy="110" r="15" fill="#333"/>
        <circle cx="50" cy="110" r="8" fill="#ccc"/>
        <circle cx="150" cy="110" r="15" fill="#333"/>
        <circle cx="150" cy="110" r="8" fill="#ccc"/>
        <text x="100" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#333">${brand}</text>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${model}</text>
      </svg>
    `.trim();

    // Convert SVG to data URL (encode properly for URL)
    const svgEncoded = encodeURIComponent(svgCar);
    const imageUrl = `data:image/svg+xml;charset=utf-8,${svgEncoded}`;

    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate vehicle image' }, { status: 500 });
  }
}

