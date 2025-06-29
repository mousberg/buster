'use client';

import { useState } from 'react';

export default function DemoPage() {
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [memories, setMemories] = useState(null);
  const [loading, setLoading] = useState(false);

  const createDemoMemories = async () => {
    setLoading(true);
    try {
      // Use the frontend brain API instead of backend demo endpoint
      const response = await fetch(`/api/brain/${encodeURIComponent(phoneNumber)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callId: `demo_${Date.now()}`,
          messages: [
            {
              role: 'user',
              content: 'I prefer morning appointments, usually around 9 AM'
            },
            {
              role: 'assistant', 
              content: 'I\'ve noted your preference for 9 AM appointments'
            },
            {
              role: 'user',
              content: 'I need help with my subscription plan'
            },
            {
              role: 'assistant',
              content: 'I can help you with subscription changes. What would you like to do?'
            }
          ]
        }),
      });
      const result = await response.json();
      console.log('Created memories:', result);
      alert('Demo memories created! Wait 5 seconds then test retrieval.');
    } catch (error) {
      console.error('Error creating memories:', error);
      alert('Error creating memories');
    }
    setLoading(false);
  };

  const getMemories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brain/${encodeURIComponent(phoneNumber)}`);
      const result = await response.json();
      setMemories(result);
      console.log('Retrieved memories:', result);
    } catch (error) {
      console.error('Error getting memories:', error);
      alert('Error getting memories');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧠 Mem0 Voice Agent Demo
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number for Testing
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={createDemoMemories}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : '1. Create Demo Memories'}
              </button>
              
              <button
                onClick={getMemories}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : '2. Test Memory Retrieval'}
              </button>
            </div>

            {memories && (
              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">🧠 Agent Brain Context</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700">Phone Number:</h3>
                    <p className="text-gray-900">{memories.phoneNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Memories Count:</h3>
                    <p className="text-gray-900">{memories.memoriesCount || 0}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Personalized Greeting:</h3>
                    <p className="text-gray-900 italic">"{memories.firstMessage}"</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700">Context Prompt Injection:</h3>
                    <pre className="text-sm text-gray-900 bg-white p-3 rounded border overflow-auto">
                      {memories.contextPrompt || 'No context available'}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">🎯 How to Demo:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Click "Create Demo Memories" to add test conversations to Mem0</li>
                <li>Wait 5-10 seconds for Mem0 to process the memories</li>
                <li>Click "Test Memory Retrieval" to see how the agent brain gets personalized</li>
                <li>Make a voice call - the agent will use this context automatically!</li>
              </ol>
            </div>

            <div className="mt-6 p-6 bg-green-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-3">✨ What Happens During Voice Calls:</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Call Start:</strong> Mem0 loads previous conversation context</li>
                <li><strong>Brain Injection:</strong> ElevenLabs agent gets personalized prompt</li>
                <li><strong>Personalized Greeting:</strong> Agent says context-aware welcome message</li>
                <li><strong>Smart Responses:</strong> Agent references previous preferences/conversations</li>
                <li><strong>Continuous Learning:</strong> New conversation gets saved to Mem0</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}