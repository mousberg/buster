"use client";

import { useState, useCallback } from 'react';
import { Brain } from 'lucide-react';
import CallButton from '@/components/CallButton';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import InstructionsInput from '@/components/InstructionsInput';
import CallTranscript from '@/components/CallTranscript';
import CallHistory from '@/components/CallHistory';
import BrainWindow from '@/components/BrainWindow';
import { useCallStore } from '@/store/callStore';
import { makeCall, generateMockTranscript } from '@/services/api';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [brainContext, setBrainContext] = useState<any[]>([]);
  const [isBrainWindowOpen, setIsBrainWindowOpen] = useState(false);
  const [hasBrainData, setHasBrainData] = useState(false);

  // Clear brain context when user provides explicit phone number
  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    
    // If user is typing a phone number, clear brain context
    if (value.trim() !== '') {
      setBrainContext([]);
      setHasBrainData(false);
    } else {
      // If they clear the phone number, re-evaluate keywords
      handleKeywordsDetected(detectedKeywords);
    }
  };
  
  const {
    currentCall,
    isCallActive,
    isLoading,
    callHistory,
    pendingInfoRequests,
    startCall,
    updateCallStatus,
    addTranscriptMessage,
    completeCall,
    resolveInfoRequest,
    setLoading,
  } = useCallStore();

  // Updated form validation - phone number is optional if brain has context
  const isFormValid = instructions.trim() !== '' && (phoneNumber.trim() !== '' || hasBrainData);

  const handleMakeCall = async () => {
    if (!isFormValid) {
      console.log("Please fill in all fields");
      return;
    }
    
    // Start the call in the store
    startCall(phoneNumber, instructions);
    
    try {
      console.log("Making call to:", phoneNumber);
      console.log("Instructions:", instructions);
      
      // For now, use mock data - replace with actual API call later
      updateCallStatus('active');
      
      // Simulate getting transcript after delay
      setTimeout(() => {
        const mockTranscript = generateMockTranscript(instructions);
        
        // Add messages one by one to simulate real-time
        mockTranscript.messages.forEach((message, index) => {
          setTimeout(() => {
            addTranscriptMessage(message);
          }, (index + 1) * 1000);
        });
        
        // Complete call after all messages
        setTimeout(() => {
          completeCall(mockTranscript.summary);
        }, (mockTranscript.messages.length + 1) * 1000);
        
      }, 2000);
      
    } catch (error) {
      console.error("Error making call:", error);
      updateCallStatus('failed');
      setTimeout(() => {
        completeCall("Call failed to connect");
      }, 1000);
    }
  };

  const handleInfoProvided = (requestId: string) => {
    resolveInfoRequest(requestId);
  };

  const handleKeywordsDetected = useCallback((keywords: string[]) => {
    setDetectedKeywords(keywords);
    
    // Only use brain context if user hasn't provided a phone number
    // If they have a number, they're being explicit about who to call
    if (keywords.length > 0 && phoneNumber.trim() === '') {
      const mockContext = [];
      
      if (keywords.includes('pizza') || keywords.includes('dominos')) {
        mockContext.push({
          id: 'contact_dominos',
          type: 'contact' as const,
          label: 'Dominos Pizza',
          value: '+1-800-DOMINOS',
          confidence: 0.95
        });
        mockContext.push({
          id: 'location_home',
          type: 'location' as const,
          label: 'Home Address',
          value: '123 Main St, San Francisco, CA',
          confidence: 0.90
        });
      }
      
      if (keywords.includes('doctor') || keywords.includes('appointment')) {
        mockContext.push({
          id: 'contact_doctor',
          type: 'contact' as const,
          label: 'Dr. Smith',
          value: '+1-555-DOCTOR',
          confidence: 0.88
        });
      }
      
      setBrainContext(mockContext);
      setHasBrainData(mockContext.length > 0);
    } else {
      // If user provided phone number or no keywords, don't use brain context
      setBrainContext([]);
      setHasBrainData(false);
    }
  }, [phoneNumber]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto py-10 px-4 max-w-4xl flex-1">
        <div className="flex-none mb-10">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-3xl font-medium text-center">
              Who you gonna call?
            </h1>
            <button
              onClick={() => setIsBrainWindowOpen(true)}
              className={`p-2 rounded-full transition-all duration-300 ${
                hasBrainData 
                  ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 animate-pulse' 
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
              title="Open Brain Window"
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Call interface */}
          <div className="space-y-6">
            <div className={`bg-white rounded-[28px] border shadow-[0_10px_20px_rgba(0,0,0,0.10)] overflow-hidden transition-all duration-300 ${
              hasBrainData 
                ? 'border-purple-200 shadow-[0_10px_20px_rgba(147,51,234,0.15)]' 
                : 'border-[rgba(13,13,13,0.05)]'
            }`}>
              <InstructionsInput
                value={instructions}
                onChange={setInstructions}
                onKeywordsDetected={handleKeywordsDetected}
              />
              
              <div className="flex items-center px-4 pb-4 gap-2">
                <PhoneNumberInput 
                  value={phoneNumber} 
                  onChange={handlePhoneNumberChange} 
                />
                
                <CallButton 
                  onClick={handleMakeCall}
                  isLoading={isLoading}
                  disabled={!isFormValid || isCallActive}
                />
              </div>
              
              {/* Brain context indicator */}
              {hasBrainData && (
                <div className="px-4 pb-4">
                  <div className="flex items-center gap-2 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                    <Brain className="w-3 h-3" />
                    <span>Brain context detected • Phone number optional</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Current call transcript */}
            {currentCall && (
              <CallTranscript
                messages={currentCall.transcript}
                summary={currentCall.summary}
                isVisible={true}
                isLive={isCallActive}
                callId={currentCall.id}
                onInfoProvided={handleInfoProvided}
              />
            )}
          </div>
          
          {/* Right column - Call history */}
          <div className="space-y-6">
            <CallHistory calls={callHistory} />
          </div>
        </div>
      </div>
      
      {/* Brain Window */}
      <BrainWindow
        isOpen={isBrainWindowOpen}
        onClose={() => setIsBrainWindowOpen(false)}
        context={brainContext}
        keywords={detectedKeywords}
      />
      
      <footer className="py-6 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <p className="text-sm text-gray-600 font-medium">Powered by</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img src="/mistral-logo.svg" alt="Mistral" className="w-8 h-8 object-contain" />
                <span className="text-xs text-gray-600">Orchestration</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <img src="/elevenlabs-logo.svg" alt="ElevenLabs" className="w-8 h-8 object-contain" />
                <span className="text-xs text-gray-600">Voice</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <img src="/twilio-logo.svg" alt="Twilio" className="w-8 h-8 object-contain" />
                <span className="text-xs text-gray-600">Calling</span>
              </div>
              <div className="text-gray-300">|</div>
              <div className="flex items-center gap-2">
                <img src="/langflow-logo.svg" alt="Langflow" className="w-8 h-8 object-contain" />
                <span className="text-xs text-gray-600">Memory</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
