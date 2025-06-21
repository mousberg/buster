import React, { useState } from 'react';
import { X, ChevronDown, Settings } from 'lucide-react';
import Image from 'next/image';

interface AgentSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const voices = [
  { id: 'david-british', name: 'David (British)', flag: '🇬🇧' },
  { id: 'sarah-american', name: 'Sarah (American)', flag: '🇺🇸' },
  { id: 'emma-australian', name: 'Emma (Australian)', flag: '🇦🇺' },
  { id: 'james-irish', name: 'James (Irish)', flag: '🇮🇪' },
];

const languages = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
];

const AgentSettingsPanel: React.FC<AgentSettingsPanelProps> = ({ isOpen, onClose }) => {
  const [selectedVoice, setSelectedVoice] = useState('david-british');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [customBehavior, setCustomBehavior] = useState('');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" />
              <h2 className="text-sm font-medium text-black">Agent Settings</h2>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Saved</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Voice Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-sm font-medium text-black">
                  Voice
                </label>
                <span className="text-gray-400">🎤</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Select the ElevenLabs voice you want to use for the agent.
              </p>
              
              <div className="relative">
                <select 
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-white text-sm"
                >
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.flag} {voice.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Agent Language */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-sm font-medium text-black">
                  Agent Language
                </label>
                <span className="text-gray-400">🌍</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Choose the default language the agent will communicate in.
              </p>
              
              <div className="relative">
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 appearance-none bg-white text-sm"
                >
                  {languages.map((language) => (
                    <option key={language.id} value={language.id}>
                      {language.flag} {language.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Custom Behavior */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <label className="block text-sm font-medium text-black">
                  Custom Behavior
                </label>
                <span className="text-gray-400">⚙️</span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Customize the assistant's behavior. 
                <button className="text-blue-500 hover:underline ml-1 text-xs">Learn more</button>
              </p>
              
              <textarea
                value={customBehavior}
                onChange={(e) => setCustomBehavior(e.target.value)}
                placeholder="Describe how you want your agent to behave..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 resize-none h-20 text-sm placeholder-gray-400"
              />
            </div>

            {/* Integrations Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-black">
                    Integrations
                  </label>
                  <span className="text-gray-400">🔌</span>
                </div>
                <button className="text-xs text-blue-500 hover:underline">
                  Add Integration
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Provide the agent with integrations to extend its capabilities.
              </p>
              
              {/* Sample Integration */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">H</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">HackerNews</p>
                    <p className="text-xs text-gray-500">Summarize the top stories on HackerNews</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-50 rounded">
                  <span className="text-gray-400">⚙️</span>
                </button>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between">
            <button className="px-3 py-2 text-xs text-red-500 hover:bg-red-50 rounded transition-colors">
              Delete Agent
            </button>
            <button className="px-4 py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};


export default AgentSettingsPanel;