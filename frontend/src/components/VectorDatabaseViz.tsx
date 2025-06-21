import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface VectorNode {
  id: string;
  type: 'memory' | 'contact' | 'location' | 'preference' | 'keyword';
  content: string;
  embedding?: number[];
  similarity?: number;
  lastAccessed?: Date;
}

interface VectorDatabaseVizProps {
  keywords: string[];
  searchQuery?: string;
}

const nodeTypes = {
  memory: ({ data }: { data: VectorNode }) => (
    <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <div className="text-gray-700 text-xs font-medium uppercase tracking-wide">Memory</div>
      </div>
      <div className="text-gray-900 text-sm leading-relaxed">{data.content}</div>
      {data.similarity && (
        <div className="text-gray-500 text-xs mt-2 font-mono">
          {(data.similarity * 100).toFixed(0)}% match
        </div>
      )}
    </div>
  ),
  contact: ({ data }: { data: VectorNode }) => (
    <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <div className="text-gray-700 text-xs font-medium uppercase tracking-wide">Contact</div>
      </div>
      <div className="text-gray-900 text-sm leading-relaxed">{data.content}</div>
      {data.similarity && (
        <div className="text-gray-500 text-xs mt-2 font-mono">
          {(data.similarity * 100).toFixed(0)}% match
        </div>
      )}
    </div>
  ),
  location: ({ data }: { data: VectorNode }) => (
    <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <div className="text-gray-700 text-xs font-medium uppercase tracking-wide">Location</div>
      </div>
      <div className="text-gray-900 text-sm leading-relaxed">{data.content}</div>
      {data.similarity && (
        <div className="text-gray-500 text-xs mt-2 font-mono">
          {(data.similarity * 100).toFixed(0)}% match
        </div>
      )}
    </div>
  ),
  preference: ({ data }: { data: VectorNode }) => (
    <div className="px-6 py-4 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-w-[180px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
        <div className="text-gray-700 text-xs font-medium uppercase tracking-wide">Preference</div>
      </div>
      <div className="text-gray-900 text-sm leading-relaxed">{data.content}</div>
      {data.similarity && (
        <div className="text-gray-500 text-xs mt-2 font-mono">
          {(data.similarity * 100).toFixed(0)}% match
        </div>
      )}
    </div>
  ),
  keyword: ({ data }: { data: VectorNode }) => (
    <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg shadow-sm">
      <div className="text-white text-sm font-medium">{data.content}</div>
    </div>
  ),
};

const VectorDatabaseViz: React.FC<VectorDatabaseVizProps> = ({
  keywords,
  searchQuery,
}) => {
  // Generate mock vector database nodes based on keywords
  const generateNodes = useMemo(() => {
    const nodes: Node[] = [];
    const baseNodes: VectorNode[] = [
      // Food/Pizza related
      { id: 'contact-dominos', type: 'contact', content: 'Dominos Pizza\n+1-800-DOMINOS', similarity: 0.95 },
      { id: 'location-home', type: 'location', content: '123 Main St\nSan Francisco, CA', similarity: 0.90 },
      { id: 'pref-pizza', type: 'preference', content: 'Pepperoni Pizza\nExtra Cheese', similarity: 0.88 },
      { id: 'memory-last-order', type: 'memory', content: 'Last order: Large pepperoni\n2 days ago', similarity: 0.85 },
      
      // Medical related
      { id: 'contact-doctor', type: 'contact', content: 'Dr. Smith\n+1-555-DOCTOR', similarity: 0.82 },
      { id: 'location-clinic', type: 'location', content: 'Medical Center\n456 Health Ave', similarity: 0.78 },
      { id: 'memory-appointment', type: 'memory', content: 'Next appointment\nFriday 2PM', similarity: 0.75 },
      
      // General
      { id: 'pref-time', type: 'preference', content: 'Preferred time:\n6-8 PM', similarity: 0.70 },
      { id: 'contact-work', type: 'contact', content: 'Work Office\n+1-555-WORK', similarity: 0.65 },
    ];

    // Add keyword nodes
    keywords.forEach((keyword, index) => {
      nodes.push({
        id: `keyword-${keyword}`,
        type: 'keyword',
        position: { x: 50 + index * 80, y: 50 },
        data: { id: `keyword-${keyword}`, type: 'keyword', content: keyword },
      });
    });

    // Filter and add relevant nodes based on keywords
    const relevantNodes = baseNodes.filter(node => {
      if (keywords.length === 0) return node.similarity! > 0.8; // Show high confidence nodes when no keywords
      
      return keywords.some(keyword => {
        const content = node.content.toLowerCase();
        const keywordLower = keyword.toLowerCase();
        
        if (keywordLower === 'pizza' || keywordLower === 'food' || keywordLower === 'order') {
          return content.includes('pizza') || content.includes('dominos') || content.includes('pepperoni');
        }
        if (keywordLower === 'dominos') {
          return content.includes('dominos') || content.includes('pizza');
        }
        if (keywordLower === 'doctor' || keywordLower === 'medical' || keywordLower === 'appointment') {
          return content.includes('doctor') || content.includes('medical') || content.includes('appointment');
        }
        if (keywordLower === 'delivery') {
          return content.includes('main st') || content.includes('dominos');
        }
        
        return content.includes(keywordLower);
      });
    });

    // Position nodes in a circular layout
    relevantNodes.forEach((node, index) => {
      const angle = (index / relevantNodes.length) * 2 * Math.PI;
      const radius = 200;
      const centerX = 400;
      const centerY = 300;
      
      nodes.push({
        id: node.id,
        type: node.type,
        position: {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        },
        data: node,
      });
    });

    return nodes;
  }, [keywords]);

  // Generate edges based on similarity
  const generateEdges = useMemo(() => {
    const edges: Edge[] = [];
    
    // Connect keywords to relevant nodes
    keywords.forEach(keyword => {
      generateNodes.forEach(node => {
        if (node.type === 'keyword') return;
        
        const similarity = node.data.similarity || 0;
        if (similarity > 0.7) {
          edges.push({
            id: `keyword-${keyword}-${node.id}`,
            source: `keyword-${keyword}`,
            target: node.id,
            type: 'smoothstep',
            animated: similarity > 0.9,
            style: {
              strokeWidth: Math.max(0.5, similarity * 1.5),
              stroke: similarity > 0.9 ? '#6366f1' : similarity > 0.8 ? '#8b5cf6' : '#d1d5db',
              strokeOpacity: Math.max(0.3, similarity * 0.8),
            },
          });
        }
      });
    });

    // Connect related nodes
    for (let i = 0; i < generateNodes.length; i++) {
      for (let j = i + 1; j < generateNodes.length; j++) {
        const nodeA = generateNodes[i];
        const nodeB = generateNodes[j];
        
        if (nodeA.type === 'keyword' || nodeB.type === 'keyword') continue;
        
        // Connect related nodes (e.g., contact and location for same business)
        const shouldConnect = 
          (nodeA.data.content.includes('Dominos') && nodeB.data.content.includes('Main St')) ||
          (nodeA.data.content.includes('Dr. Smith') && nodeB.data.content.includes('Medical')) ||
          (nodeA.data.content.includes('pepperoni') && nodeB.data.content.includes('Dominos'));
          
        if (shouldConnect) {
          edges.push({
            id: `${nodeA.id}-${nodeB.id}`,
            source: nodeA.id,
            target: nodeB.id,
            type: 'smoothstep',
            style: {
              strokeWidth: 0.5,
              stroke: '#e5e7eb',
              strokeOpacity: 0.3,
            },
          });
        }
      }
    }

    return edges;
  }, [generateNodes, keywords]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 80 }}
        className="bg-transparent"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={30} 
          size={0.5} 
          color="#d1d5db"
        />
        <MiniMap 
          nodeColor="#6366f1"
          nodeStrokeWidth={1}
          className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg"
        />
        <Controls className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg [&>button]:text-gray-700 [&>button]:border-gray-200" />
      </ReactFlow>
    </div>
  );
};

export default VectorDatabaseViz;