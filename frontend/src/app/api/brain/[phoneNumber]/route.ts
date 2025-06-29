import { NextRequest, NextResponse } from 'next/server';
import { mem0Service } from '@/services/mem0';

// GET /api/brain/[phoneNumber] - Get brain context for a phone number
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumber: string }> }
) {
  try {
    const { phoneNumber } = await params;
    
    console.log('🧠 Getting brain context for:', phoneNumber);
    
    const brainContext = await mem0Service.getUserBrainContext(phoneNumber);
    
    return NextResponse.json({
      phoneNumber,
      memoriesCount: brainContext.memoriesCount || 0,
      firstMessage: brainContext.firstMessage,
      contextPrompt: brainContext.contextPrompt,
      success: true
    });
  } catch (error) {
    console.error('❌ Brain context error:', error);
    return NextResponse.json({
      phoneNumber: '',
      memoriesCount: 0,
      firstMessage: 'Hello! How can I help you today?',
      contextPrompt: '',
      success: false,
      error: 'Failed to get brain context'
    });
  }
}

// POST /api/brain/[phoneNumber] - Add memories for a phone number
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumber: string }> }
) {
  try {
    const { phoneNumber } = await params;
    const body = await request.json();
    
    console.log('🧠 Adding memories for:', phoneNumber);
    
    const { callId, messages } = body;
    
    if (!callId || !messages) {
      return NextResponse.json({
        success: false,
        error: 'Missing callId or messages'
      }, { status: 400 });
    }

    const result = await mem0Service.addConversationMemory(callId, phoneNumber, messages);
    
    return NextResponse.json({
      success: true,
      result,
      message: `Added memories for ${phoneNumber}`
    });
  } catch (error) {
    console.error('❌ Memory addition error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to add memories'
    }, { status: 500 });
  }
}