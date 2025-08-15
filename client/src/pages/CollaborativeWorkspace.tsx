import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel';
import { CollaborativeCanvas } from '@/components/collaboration/CollaborativeCanvas';
import { useCollaboration } from '../hooks/use-collaboration';
import { Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CollaborativeWorkspace() {
  const [showCollabPanel, setShowCollabPanel] = useState(false);
  const [documentId] = useState(() => `doc-${Date.now()}`);
  const [userId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  
  const {
    client,
    isConnected,
    activeUsers,
    operations,
    sendOperation,
    updateCursor,
    updateSelection
  } = useCollaboration({
    documentId,
    userId,
    autoConnect: true
  });

  // Example CAD operation
  const handleDrawCircle = () => {
    if (!client) return;
    
    const operation = sendOperation('create', 'circle', {
      center: { x: 200, y: 200 },
      radius: 50,
      style: { stroke: '#000', fill: 'none' }
    });
    
    console.log('Created circle:', operation);
  };

  const handleDrawRectangle = () => {
    if (!client) return;
    
    const operation = sendOperation('create', 'rectangle', {
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      style: { stroke: '#000', fill: 'none' }
    });
    
    console.log('Created rectangle:', operation);
  };

  const handleDrawLine = () => {
    if (!client) return;
    
    const operation = sendOperation('create', 'line', {
      start: { x: 50, y: 50 },
      end: { x: 250, y: 150 },
      style: { stroke: '#000' }
    });
    
    console.log('Created line:', operation);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">CroweCad Collaborative Workspace</h1>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? 'Connected' : 'Connecting...'}
          </Badge>
          {activeUsers.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollabPanel(!showCollabPanel)}
          >
            <Users className="h-4 w-4 mr-2" />
            Collaboration
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b px-4 py-2 flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDrawCircle}>
              Circle
            </Button>
            <Button variant="outline" size="sm" onClick={handleDrawRectangle}>
              Rectangle
            </Button>
            <Button variant="outline" size="sm" onClick={handleDrawLine}>
              Line
            </Button>
            <div className="ml-auto text-sm text-muted-foreground">
              Operations: {operations.length}
            </div>
          </div>
          
          {/* Collaborative Canvas */}
          <div className="flex-1 relative">
            {client && (
              <CollaborativeCanvas
                collaborationClient={client}
                currentUserId={userId}
              >
                {/* Main CAD canvas content */}
                <div className="w-full h-full bg-grid-pattern">
                  <svg className="w-full h-full">
                    {/* Render operations as SVG elements */}
                    {operations.map((op, index) => {
                      if (op.type === 'create') {
                        switch (op.target) {
                          case 'circle':
                            return (
                              <circle
                                key={op.id}
                                cx={op.data.center.x}
                                cy={op.data.center.y}
                                r={op.data.radius}
                                style={op.data.style}
                              />
                            );
                          case 'rectangle':
                            return (
                              <rect
                                key={op.id}
                                x={op.data.x}
                                y={op.data.y}
                                width={op.data.width}
                                height={op.data.height}
                                style={op.data.style}
                              />
                            );
                          case 'line':
                            return (
                              <line
                                key={op.id}
                                x1={op.data.start.x}
                                y1={op.data.start.y}
                                x2={op.data.end.x}
                                y2={op.data.end.y}
                                style={op.data.style}
                              />
                            );
                        }
                      }
                      return null;
                    })}
                  </svg>
                  
                  {/* Example content */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-muted-foreground">
                      Click the toolbar buttons to add shapes
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Other users will see your changes in real-time
                    </p>
                  </div>
                </div>
              </CollaborativeCanvas>
            )}
          </div>
        </div>
        
        {/* Collaboration panel */}
        {showCollabPanel && (
          <div className="border-l">
            <CollaborationPanel
              documentId={documentId}
              userId={userId}
              onClose={() => setShowCollabPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}