import MemoryClient from 'mem0ai';
import dotenv from 'dotenv';

dotenv.config();

class Mem0Service {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.initialize();
  }

  initialize() {
    const apiKey = process.env.MEM0_API_KEY;
    if (!apiKey) {
      console.warn('[Mem0] API key not found. Memory features will be disabled.');
      return;
    }

    try {
      this.client = new MemoryClient({ apiKey });
      this.initialized = true;
      console.log('[Mem0] ✅ Client initialized successfully');
    } catch (error) {
      console.error('[Mem0] Failed to initialize client:', error);
    }
  }

  async addConversationMemory(callId, phoneNumber, messages) {
    if (!this.initialized) return null;

    try {
      const userId = this.getUserIdFromPhone(phoneNumber);
      const metadata = {
        call_id: callId,
        phone_number: phoneNumber,
        timestamp: new Date().toISOString(),
        type: 'voice_call',
        source: 'twilio_elevenlabs'
      };

      const result = await this.client.add(messages, { 
        user_id: userId,
        metadata 
      });

      console.log('[Mem0] 📝 Added conversation memory:', result);
      return result;
    } catch (error) {
      console.error('[Mem0] Failed to add conversation memory:', error);
      return null;
    }
  }

  async addTranscript(callId, phoneNumber, role, content) {
    const messages = [{ role, content }];
    return this.addConversationMemory(callId, phoneNumber, messages);
  }

  async getCallContext(callId, phoneNumber, query = '') {
    if (!this.initialized) return [];

    try {
      const userId = this.getUserIdFromPhone(phoneNumber);
      
      // First try to get memories from previous calls
      const filters = {
        "AND": [
          { "user_id": userId },
          { "metadata.type": "voice_call" }
        ]
      };

      const memories = await this.client.search(query || "previous conversations", { 
        version: "v2", 
        filters,
        limit: 5 
      });

      console.log(`[Mem0] 🔍 Retrieved ${memories.length} relevant memories for context`);
      return memories;
    } catch (error) {
      console.error('[Mem0] Failed to get call context:', error);
      return [];
    }
  }

  async summarizeCall(callId, phoneNumber, transcripts) {
    if (!this.initialized || !transcripts.length) return null;

    try {
      // Create a conversation summary
      const summary = {
        role: 'system',
        content: `Call Summary - Duration: ${transcripts.length} turns, Topics discussed: ${this.extractTopics(transcripts)}`
      };

      const messages = [...transcripts, summary];
      return this.addConversationMemory(callId, phoneNumber, messages);
    } catch (error) {
      console.error('[Mem0] Failed to summarize call:', error);
      return null;
    }
  }

  getUserIdFromPhone(phoneNumber) {
    // Normalize phone number to create consistent user ID
    return `phone_${phoneNumber.replace(/[^0-9]/g, '')}`;
  }

  extractTopics(transcripts) {
    // Simple topic extraction from transcripts
    const allContent = transcripts.map(t => t.content).join(' ').toLowerCase();
    const topics = [];
    
    // Common topics to look for
    const topicKeywords = {
      'scheduling': ['appointment', 'schedule', 'meeting', 'calendar'],
      'support': ['help', 'issue', 'problem', 'support'],
      'product': ['product', 'feature', 'pricing', 'plan'],
      'general': ['information', 'question', 'inquiry']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics.join(', ') : 'general conversation';
  }

  // Format memories for ElevenLabs agent brain injection
  async formatMemoriesForAgent(memories) {
    if (!memories || memories.length === 0) {
      return '';
    }

    const contextLines = memories.map(memory => {
      const content = memory.memory || memory.content;
      const timestamp = memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'Recent';
      return `- ${content} (${timestamp})`;
    });

    return `\n\nPREVIOUS CONVERSATION CONTEXT:\n${contextLines.join('\n')}\n\nUse this context to provide personalized, continuous service. Reference previous interactions naturally when relevant.`;
  }

  // Generate personalized first message based on memories
  generatePersonalizedGreeting(memories) {
    if (!memories || memories.length === 0) {
      return "Hello! How can I help you today?";
    }

    // Extract recent topics or preferences
    const recentTopics = memories
      .slice(0, 2)
      .map(m => m.memory || m.content)
      .join(', ');

    if (recentTopics.toLowerCase().includes('appointment') || recentTopics.toLowerCase().includes('schedule')) {
      return "Welcome back! I'm here to help with your scheduling needs. How can I assist you today?";
    } else if (recentTopics.toLowerCase().includes('support') || recentTopics.toLowerCase().includes('issue')) {
      return "Hi there! I see we've been working on some support items. How can I help you today?";
    } else {
      return "Welcome back! I remember our previous conversations. How can I assist you today?";
    }
  }

  // Get comprehensive user context for agent brain
  async getUserBrainContext(phoneNumber) {
    if (!this.initialized) return { contextPrompt: '', firstMessage: '' };

    try {
      const userId = this.getUserIdFromPhone(phoneNumber);
      
      // Get recent and relevant memories
      const recentMemories = await this.client.search("", {
        version: "v2",
        filters: {
          "AND": [
            { "user_id": userId },
            { "metadata.type": "voice_call" }
          ]
        },
        limit: 5
      });

      const contextPrompt = await this.formatMemoriesForAgent(recentMemories);
      const firstMessage = this.generatePersonalizedGreeting(recentMemories);

      console.log(`[Mem0] 🧠 Generated brain context with ${recentMemories.length} memories`);
      
      return {
        contextPrompt,
        firstMessage,
        memoriesCount: recentMemories.length
      };
    } catch (error) {
      console.error('[Mem0] Failed to get user brain context:', error);
      return { contextPrompt: '', firstMessage: 'Hello! How can I help you today?' };
    }
  }

  // Note: Removed syncMemoryToFrontend - Mem0 should not handle status tracking
  // Mem0 is purely for conversation memory and brain context
}

export const mem0Service = new Mem0Service();
export default mem0Service;