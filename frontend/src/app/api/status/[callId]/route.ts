import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { callId: string } }
) {
  try {
    const { callId } = params;
    
    console.log('🔄 Proxying status request for call:', callId);
    
    const response = await fetch(`https://langflow-status-checker-534113739138.europe-west1.run.app/status/${callId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('📊 No status updates yet for call:', callId);
        return NextResponse.json([]);
      }
      const errorText = await response.text();
      console.error('❌ Status checker error:', errorText);
      return NextResponse.json([]);
    }

    const data = await response.json();
    console.log('📊 Status response:', data);
    
    // Handle status checker errors gracefully
    if (data && data.detail && data.detail.includes("Collection")) {
      console.warn('⚠️ Status checker has a database issue, returning empty array');
      return NextResponse.json([]);
    }
    
    // Ensure we return an array
    const statusUpdates = Array.isArray(data) ? data : [];
    return NextResponse.json(statusUpdates);
  } catch (error) {
    console.error('❌ Status proxy error:', error);
    return NextResponse.json([]);
  }
}