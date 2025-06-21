export interface SearchResult {
  businessName: string;
  phoneNumber: string;
  address?: string;
  confidence: number;
}

export async function searchForPhoneNumber(query: string): Promise<string | null> {
  try {
    // Call your backend API endpoint that handles web search
    const response = await fetch('/api/search-phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error('Search failed');
    }

    const data = await response.json();
    
    // Return the phone number if found
    if (data.phoneNumber) {
      return data.phoneNumber;
    }
    
    return null;
  } catch (error) {
    console.error('Phone search error:', error);
    return null;
  }
}

// Mock function for testing without backend
export async function mockSearchForPhoneNumber(query: string): Promise<string | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock responses for testing
  const mockData: Record<string, string> = {
    'dominos pizza w1t 3bg': '+44 20 7935 9323',
    'pizza hut oxford street': '+44 20 7580 3443',
    'mcdonalds piccadilly': '+44 20 7734 8845',
    'starbucks covent garden': '+44 20 7836 8955',
  };
  
  const queryLower = query.toLowerCase();
  
  // Check for exact match first
  if (mockData[queryLower]) {
    return mockData[queryLower];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(mockData)) {
    if (queryLower.includes(key.split(' ')[0]) || key.includes(queryLower.split(' ')[0])) {
      return value;
    }
  }
  
  return null;
}