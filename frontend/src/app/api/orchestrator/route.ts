import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🔄 Proxying request to orchestrator:', body);
    
    const response = await fetch('https://ayman-agent-534113739138.europe-west2.run.app/run-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Orchestrator error:', errorText);
      return NextResponse.json(
        { error: `Orchestrator error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Orchestrator response:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}