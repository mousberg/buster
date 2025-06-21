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
          'google-calendar': 'Google Calendar',
          'whatsapp': 'WhatsApp',
          'gmail': 'Gmail',
          'notion': 'Notion'
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Call interface */}
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
      
      {/* Agent Settings Panel */}
      <AgentSettingsPanel
        isOpen={isSettingsPanelOpen}
        onClose={() => setIsSettingsPanelOpen(false)}
      />
    </div>
  );
}
