"use client";

import { useState } from 'react';
import CallButton from '@/components/CallButton';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import InstructionsInput from '@/components/InstructionsInput';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isFormValid = phoneNumber.trim() !== '' && instructions.trim() !== '';

  const handleMakeCall = async () => {
    if (!isFormValid) {
      console.log("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    // Placeholder for ElevenLabs voice agent integration
    console.log("Making call to:", phoneNumber);
    console.log("Instructions:", instructions);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="container mx-auto py-10 px-4 max-w-3xl flex-1 flex flex-col justify-center">
        <div className="flex-none mb-10">
          <h1 className="text-3xl font-medium text-center">
            Who you gonna call?
          </h1>
        </div>
        
        <div className="w-full">
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
                disabled={!isFormValid}
              />
            </div>
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
