import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query' },
        { status: 400 }
      );
    }

    // TODO: Implement actual web search here
    // For now, return mock data based on the query
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock business data
    const mockBusinessData: Record<string, { name: string; phone: string; address: string }> = {
      'dominos': {
        name: 'Dominos Pizza',
        phone: '+44 20 7935 9323',
        address: 'W1T 3BG, London'
      },
      'pizza hut': {
        name: 'Pizza Hut',
        phone: '+44 20 7580 3443',
        address: 'Oxford Street, London'
      },
      'mcdonalds': {
        name: 'McDonalds',
        phone: '+44 20 7734 8845',
        address: 'Piccadilly, London'
      },
      'starbucks': {
        name: 'Starbucks',
        phone: '+44 20 7836 8955',
        address: 'Covent Garden, London'
      }
    };

    // Search for matching business
    const queryLower = query.toLowerCase();
    let matchedBusiness = null;

    for (const [key, value] of Object.entries(mockBusinessData)) {
      if (queryLower.includes(key)) {
        matchedBusiness = value;
        break;
      }
    }

    if (matchedBusiness) {
      return NextResponse.json({
        phoneNumber: matchedBusiness.phone,
        businessName: matchedBusiness.name,
        address: matchedBusiness.address,
        confidence: 0.95
      });
    }

    // If no match found
    return NextResponse.json({
      phoneNumber: null,
      error: 'No phone number found for this search'
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}