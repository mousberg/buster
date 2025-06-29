"use client";

import { useState, useCallback } from 'react';
import { Brain } from 'lucide-react';
import CallButton from '@/components/CallButton';
import PhoneNumberInput from '@/components/PhoneNumberInput';
import InstructionsInput from '@/components/InstructionsInput';
import CallTranscript from '@/components/CallTranscript';
import CallHistory from '@/components/CallHistory';
import BrainWindow from '@/components/BrainWindow';
import IntegrationsButton from '@/components/IntegrationsButton';
import IntegrationsModal from '@/components/IntegrationsModal';
import IntegrationIndicators from '@/components/IntegrationIndicators';
import TopNavigation from '@/components/TopNavigation';
import AgentSettingsPanel from '@/components/AgentSettingsPanel';
import { useCallStore } from '@/store/callStore';
import { makeCall } from '@/services/api';
import { searchForPhoneNumber } from '@/services/searchService';

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [detectedKeywords, setDetectedKeywords] = useState<string[]>([]);
  const [brainContext, setBrainContext] = useState<Array<{
    id: string;
    type: 'contact' | 'location';
    label: string;
    value: string;
    confidence: number;
  }>>([]);
  const [isBrainWindowOpen, setIsBrainWindowOpen] = useState(false);
  const [hasBrainData, setHasBrainData] = useState(false);
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [activeIntegrations, setActiveIntegrations] = useState<Array<{
    id: string;
    name: string;
    connected: boolean;
  }>>([]);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showMadeBy, setShowMadeBy] = useState(false);

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
  
  // Handle search queries in phone number field
  const handlePhoneSearch = async (query: string): Promise<string | null> => {
    try {
      const phoneNumber = await searchForPhoneNumber(query);
      return phoneNumber;
    } catch (error) {
      console.error('Search failed:', error);
      return null;
    }
  };
  
  const {
    currentCall,
    isCallActive,
    isLoading,
    callHistory,
    startCall,
    updateCallStatus,
    completeCall,
    resolveInfoRequest,
    startStatusPolling,
  } = useCallStore();

  // Updated form validation - phone number is always optional since orchestrator can find numbers
  const isFormValid = instructions.trim() !== '';

  const handleMakeCall = async () => {
    console.log("🔴 BUTTON CLICKED - handleMakeCall function called!");
    console.log("🔴 Form valid:", isFormValid);
    console.log("🔴 Phone number:", phoneNumber);
    console.log("🔴 Instructions:", instructions);
    
    if (!isFormValid) {
      console.log("❌ Please fill in all fields");
      return;
    }
    
    console.log("🎯 Starting call process...");
    
    // Start the call in the store
    startCall(phoneNumber, instructions);
    
    try {
      console.log("📞 Making call to:", phoneNumber);
      console.log("📝 Instructions:", instructions);
      
      // Get the current call to access the generated call ID
      const currentCallState = useCallStore.getState().currentCall;
      if (!currentCallState) {
        throw new Error("Failed to create call record");
      }
      
      const callId = currentCallState.id;
      console.log("🆔 Generated call ID:", callId);
      
      // Call the orchestrator
      console.log("🚀 Calling orchestrator...");
      await makeCall(phoneNumber, instructions, callId);
      
      // Update status to active and start polling
      console.log("✅ Orchestrator call successful, starting status polling...");
      updateCallStatus('active');
      startStatusPolling(callId);
      
      console.log("🎉 Call initiated successfully with ID:", callId);
      
    } catch (error) {
      console.error("❌ Error making call:", error);
      updateCallStatus('failed');
      setTimeout(() => {
        completeCall(`Call failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleToggleIntegration = (id: string) => {
    setActiveIntegrations(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.filter(i => i.id !== id);
      } else {
        const integrationNames: Record<string, string> = {
          'calendar': 'Calendar',
          'email': 'Email', 
          'whatsapp': 'WhatsApp'
        };
        return [...prev, { id, name: integrationNames[id] || id, connected: true }];
      }
    });
  };

  const handleIntegrationIndicatorClick = (integrationId: string) => {
    setSelectedIntegration(integrationId);
    setIsIntegrationsOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navigation */}
      <TopNavigation onSettingsClick={() => setIsSettingsPanelOpen(true)} />
      
      <div className="container mx-auto py-10 px-4 max-w-4xl flex-1">
        <div className="flex-none mb-10">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-[28px] font-normal text-center" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Who you gonna call?
            </h1>
            <div className="flex items-center gap-2">
              <IntegrationsButton
                onClick={() => setIsIntegrationsOpen(true)}
                hasActiveIntegrations={activeIntegrations.length > 0}
              />
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
        </div>
        
        {/* Debug section - togglable */}
        {isDebugMode && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Info</h3>
            <div className="text-xs text-yellow-700 space-y-1">
              <div>Orchestrator: /api/orchestrator (proxy)</div>
              <div>Status Checker: /api/status (proxy)</div>
              <div>Current Call ID: {currentCall?.id || 'None'}</div>
              <div>Status Updates: {currentCall?.statusUpdates?.length || 0}</div>
              <div>Call Status: {currentCall?.status || 'None'}</div>
              <div>Is Loading: {isLoading ? 'Yes' : 'No'}</div>
              <div>Is Call Active: {isCallActive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
        
        <div className="max-w-2xl mx-auto">
          {/* Main call interface - now full width */}
          <div className="space-y-6">
            <div className="relative">
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
                    onSearchDetected={handlePhoneSearch}
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
                      <span>Brain context detected</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Integration Indicators - Glued to bottom */}
              {activeIntegrations.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-1/2">
                  <IntegrationIndicators 
                    integrations={activeIntegrations} 
                    onIntegrationClick={handleIntegrationIndicatorClick}
                  />
                </div>
              )}
            </div>
            
            {/* Current call transcript */}
            {currentCall && (
              <CallTranscript
                messages={currentCall.transcript}
                statusUpdates={currentCall.statusUpdates}
                summary={currentCall.summary}
                isVisible={true}
                isLive={isCallActive}
                callId={currentCall.id}
                callStatus={currentCall.status}
                onInfoProvided={handleInfoProvided}
                onEndCall={() => completeCall('Call ended manually')}
                activeIntegrations={activeIntegrations}
              />
            )}
          </div>
          
          {/* Call history - hidden for now */}
          {false && (
            <div className="space-y-6">
              <CallHistory calls={callHistory} />
            </div>
          )}
        </div>
      </div>
      
      
      {/* Brain Window */}
      <BrainWindow
        isOpen={isBrainWindowOpen}
        onClose={() => setIsBrainWindowOpen(false)}
        context={brainContext}
        keywords={detectedKeywords}
        isDebugMode={isDebugMode}
        onToggleDebug={() => setIsDebugMode(!isDebugMode)}
      />
      
      {/* Integrations Modal */}
      <IntegrationsModal
        isOpen={isIntegrationsOpen}
        onClose={() => {
          setIsIntegrationsOpen(false);
          setSelectedIntegration(null);
        }}
        integrations={activeIntegrations}
        onToggleIntegration={handleToggleIntegration}
        initialSelectedIntegration={selectedIntegration}
      />
      
      <footer className="py-6 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-3 flex-1">
              <p className="text-sm text-gray-600 font-medium">Powered by</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <img src="/elevenlabs-logo.svg" alt="ElevenLabs" className="w-8 h-8 object-contain" />
                  <span className="text-xs text-gray-600">Voice</span>
                </div>
                <div className="text-gray-300">|</div>
                <div className="flex items-center gap-2">
                  <img src="/twilio-logo.svg" alt="Twilio" className="w-8 h-8 object-contain" />
                  <span className="text-xs text-gray-600">Calling</span>
                </div>
              </div>
            </div>
            
            {/* Made by circular logo */}
            <div className="relative">
              <button
                onClick={() => setShowMadeBy(!showMadeBy)}
                className="w-10 h-10 bg-black hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors duration-200"
                title="Made by Unicorn Mafia"
              >
                <img src="/gh-um.svg" alt="Unicorn Mafia" className="w-6 h-6 object-contain filter invert bg-transparent" />
              </button>
              
              {showMadeBy && (
                <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg whitespace-nowrap z-50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-700 font-medium">Made by Unicorn Mafia</span>
                    <a 
                      href="https://github.com/Ches-ctrl/langflow-hack" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  </div>
                  {/* Arrow pointing down */}
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-200 translate-y-px"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
      
      {/* Agent Settings Panel */}
      <AgentSettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
      />
    </div>
  );
}
