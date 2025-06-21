import React, { useState } from 'react';
import { X, Brain, Database, Zap, Bug } from 'lucide-react';
import VectorDatabaseViz from './VectorDatabaseViz';

interface BrainContext {
  id: string;
  type: 'contact' | 'location' | 'preference' | 'history';
  label: string;
  value: string;
  confidence: number;
}

interface BrainWindowProps {
  isOpen: boolean;
  onClose: () => void;
  context: BrainContext[];
  keywords: string[];
  isDebugMode?: boolean;
  onToggleDebug?: () => void;
}

const BrainWindow: React.FC<BrainWindowProps> = ({
  isOpen,
  onClose,
  context,
  keywords,
  isDebugMode = false,
  onToggleDebug
}) => {
  const [activeTab, setActiveTab] = useState<'vector' | 'context'>('vector');

  if (!isOpen) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-700 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg border w-full max-w-2xl max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium">Brain Context</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Tab buttons */}
            <div className="flex bg-muted rounded-md p-0.5">
              <button
                onClick={() => setActiveTab('context')}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                  activeTab === 'context'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setActiveTab('vector')}
                className={`px-3 py-1 text-xs font-medium rounded-sm transition-all ${
                  activeTab === 'vector'
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Graph
              </button>
            </div>
            
            {/* Debug toggle button */}
            {onToggleDebug && (
              <button
                onClick={onToggleDebug}
                className={`p-2 rounded-md transition-all ${
                  isDebugMode
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'text-muted-foreground hover:text-foreground hover:bg-gray-100'
                }`}
                title={isDebugMode ? 'Hide debug info' : 'Show debug info'}
              >
                <Bug className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-hidden">
          {activeTab === 'context' ? (
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {keywords.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3 h-3 text-yellow-600" />
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords</h4>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {context.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Database className="w-3 h-3 text-blue-600" />
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Matches</h4>
                    </div>
                    <div className="space-y-2">
                      {context.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-3 bg-muted/50 rounded-md border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.value}</p>
                            <p className="text-xs text-muted-foreground/70 uppercase tracking-wide mt-1">
                              {item.type}
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <span
                              className={`px-2 py-1 text-xs rounded-md ${getConfidenceColor(
                                item.confidence
                              )}`}
                            >
                              {Math.round(item.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {context.length === 0 && keywords.length === 0 && (
                  <div className="text-center py-8">
                    <Brain className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No context detected</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Start typing to activate brain
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-96">
              <VectorDatabaseViz keywords={keywords} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainWindow;