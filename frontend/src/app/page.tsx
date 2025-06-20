"use client";

import { useState } from 'react';
import CallButton from '@/components/CallButton';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import InstructionsInput from '@/components/InstructionsInput';
import CallTranscript from '@/components/CallTranscript';
import CallHistory from '@/components/CallHistory';
import { useCallStore } from '@/store/callStore';
import { makeCall, generateMockTranscript } from '@/services/api';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  
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

  const isFormValid = phoneNumber.trim() !== '' && instructions.trim() !== '';

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto py-10 px-4 max-w-4xl flex-1">
        <div className="flex-none mb-10">
          <h1 className="text-3xl font-medium text-center">
            Who you gonna call?
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Call interface */}
          <div className="space-y-6">
            <div className="bg-white rounded-[28px] border border-[rgba(13,13,13,0.05)] shadow-[0_10px_20px_rgba(0,0,0,0.10)] overflow-hidden">
              <InstructionsInput
                value={instructions}
                onChange={setInstructions}
              />
              
              <div className="flex items-center px-4 pb-4 gap-2">
                <PhoneNumberInput 
                  value={phoneNumber} 
                  onChange={setPhoneNumber} 
                />
                
                <CallButton 
                  onClick={handleMakeCall}
                  isLoading={isLoading}
                  disabled={!isFormValid || isCallActive}
                />
              </div>
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
