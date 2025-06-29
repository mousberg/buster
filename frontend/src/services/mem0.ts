import MemoryClient from 'mem0ai';

class Mem0Service {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    const apiKey = process.env.NEXT_PUBLIC_MEM0_API_KEY;
    if (!apiKey) {
      console.warn('Mem0 API key not found. Memory features will be disabled.');
      return;
    }

    try {
      this.client = new MemoryClient({ apiKey });
      this.initialized = true;
      console.log('✅ Mem0 client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Mem0 client:', error);
    }
  }

  async addCallMemory(callId: string, userId: string, messages: any[]) {
    if (!this.initialized) return null;

    try {
      const metadata = {
        call_id: callId,
        timestamp: new Date().toISOString(),
        type: 'voice_call'
      };

      const result = await this.client.add(messages, { 
        user_id: userId,
        metadata 
      });

      console.log('📝 Added call memory:', result);
      return result;
    } catch (error) {
      console.error('Failed to add call memory:', error);
      return null;
    }
  }

  async searchMemories(query: string, userId: string, limit: number = 5) {
    if (!this.initialized) return [];

    try {
      const filters = {
        "AND": [
          { "user_id": userId },
          { "metadata.type": "voice_call" }
        ]
      };

      const results = await this.client.search(query, { 
        version: "v2", 
        filters,
        limit 
      });

      console.log('🔍 Found memories:', results);
      return results;
    } catch (error) {
      console.error('Failed to search memories:', error);
      return [];
    }
  }

  async getCallMemories(callId: string, userId: string) {
    if (!this.initialized) return [];

    try {
      const filters = {
        "AND": [
          { "user_id": userId },
          { "metadata.call_id": callId }
        ]
      };

      const memories = await this.client.search("", { 
        version: "v2", 
        filters,
        limit: 100 
      });

      console.log('📞 Retrieved call memories:', memories);
      return memories;
    } catch (error) {
      console.error('Failed to get call memories:', error);
      return [];
    }
  }

  async getUserHistory(userId: string, limit: number = 10) {
    if (!this.initialized) return [];

    try {
      const filters = {
        "AND": [
          { "user_id": userId },
          { "metadata.type": "voice_call" }
        ]
      };

      const history = await this.client.search("", { 
        version: "v2", 
        filters,
        limit 
      });

      console.log('📚 Retrieved user history:', history);
      return history;
    } catch (error) {
      console.error('Failed to get user history:', error);
      return [];
    }
  }

  async addConversationTurn(callId: string, userId: string, role: 'user' | 'assistant', content: string) {
    const messages = [{ role, content }];
    return this.addCallMemory(callId, userId, messages);
  }

  isInitialized() {
    return this.initialized;
  }
}

export const mem0Service = new Mem0Service();