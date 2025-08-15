/**
 * React Hook for CroweCad Real-time Collaboration
 * Handles WebSocket connection, presence, and operational transformation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CollaboratorInfo {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: any;
  viewport?: { x: number; y: number; zoom: number };
  isActive: boolean;
  isFollowing?: boolean;
}

export interface CollaborationState {
  isConnected: boolean;
  sessionId: string | null;
  collaborators: Map<string, CollaboratorInfo>;
  localUserId: string | null;
  messages: ChatMessage[];
  operations: Operation[];
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  message: string;
  timestamp: Date;
}

export interface Operation {
  id: string;
  type: string;
  userId: string;
  data: any;
  timestamp: Date;
}

interface UseCollaborationOptions {
  projectId: string;
  userName?: string;
  userAvatar?: string;
  onOperationReceived?: (operation: Operation) => void;
  onCollaboratorJoined?: (collaborator: CollaboratorInfo) => void;
  onCollaboratorLeft?: (collaboratorId: string) => void;
}

export function useCollaboration(options: UseCollaborationOptions) {
  const { projectId, userName = 'Anonymous', userAvatar, onOperationReceived, onCollaboratorJoined, onCollaboratorLeft } = options;
  
  const [state, setState] = useState<CollaborationState>({
    isConnected: false,
    sessionId: null,
    collaborators: new Map(),
    localUserId: null,
    messages: [],
    operations: []
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Connect to collaboration server
  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/collab`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        console.log('Collaboration connected');
        setState(prev => ({ ...prev, isConnected: true }));
        
        // Join session
        ws.send(JSON.stringify({
          type: 'join',
          sessionId: projectId,
          data: {
            projectId,
            name: userName,
            avatar: userAvatar
          },
          timestamp: new Date()
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse collaboration message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('Collaboration WebSocket error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to collaboration server",
          variant: "destructive"
        });
      };
      
      ws.onclose = () => {
        console.log('Collaboration disconnected');
        setState(prev => ({ ...prev, isConnected: false }));
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [projectId, userName, userAvatar, toast]);

  // Handle incoming messages
  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'connected':
        setState(prev => ({ ...prev, localUserId: message.userId }));
        break;
        
      case 'session-joined':
        setState(prev => ({
          ...prev,
          sessionId: message.sessionId,
          localUserId: message.userId,
          collaborators: new Map(message.users.filter((u: any) => u.id !== message.userId).map((u: any) => [u.id, u]))
        }));
        toast({
          title: "Joined Collaboration",
          description: `${message.users.length} user(s) in session`
        });
        break;
        
      case 'user-joined':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          newCollaborators.set(message.user.id, message.user);
          return { ...prev, collaborators: newCollaborators };
        });
        onCollaboratorJoined?.(message.user);
        toast({
          title: "User Joined",
          description: `${message.user.name} joined the session`
        });
        break;
        
      case 'user-left':
      case 'user-disconnected':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          newCollaborators.delete(message.userId);
          return { ...prev, collaborators: newCollaborators };
        });
        onCollaboratorLeft?.(message.userId);
        if (message.user) {
          toast({
            title: "User Left",
            description: `${message.user.name} left the session`
          });
        }
        break;
        
      case 'cursor-update':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          const collaborator = newCollaborators.get(message.userId);
          if (collaborator) {
            collaborator.cursor = message.cursor;
            newCollaborators.set(message.userId, { ...collaborator });
          }
          return { ...prev, collaborators: newCollaborators };
        });
        break;
        
      case 'selection-update':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          const collaborator = newCollaborators.get(message.userId);
          if (collaborator) {
            collaborator.selection = message.selection;
            newCollaborators.set(message.userId, { ...collaborator });
          }
          return { ...prev, collaborators: newCollaborators };
        });
        break;
        
      case 'operation':
        setState(prev => ({
          ...prev,
          operations: [...prev.operations, message.operation].slice(-100)
        }));
        onOperationReceived?.(message.operation);
        break;
        
      case 'chat':
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, {
            id: Date.now().toString(),
            userId: message.userId,
            userName: message.user.name,
            userColor: message.user.color,
            message: message.message,
            timestamp: new Date(message.timestamp)
          }].slice(-50)
        }));
        break;
        
      case 'viewport-update':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          const collaborator = newCollaborators.get(message.userId);
          if (collaborator) {
            collaborator.viewport = message.viewport;
            newCollaborators.set(message.userId, { ...collaborator });
          }
          return { ...prev, collaborators: newCollaborators };
        });
        break;
        
      case 'presence-update':
        setState(prev => {
          const newCollaborators = new Map(prev.collaborators);
          const collaborator = newCollaborators.get(message.userId);
          if (collaborator) {
            collaborator.isActive = message.isActive;
            newCollaborators.set(message.userId, { ...collaborator });
          }
          return { ...prev, collaborators: newCollaborators };
        });
        break;
    }
  }, [onOperationReceived, onCollaboratorJoined, onCollaboratorLeft, toast]);

  // Send cursor position
  const sendCursor = useCallback((x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor',
        sessionId: state.sessionId,
        data: { cursor: { x, y } },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Send selection
  const sendSelection = useCallback((selection: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'selection',
        sessionId: state.sessionId,
        data: { selection },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Send operation
  const sendOperation = useCallback((type: string, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'operation',
        sessionId: state.sessionId,
        data: { type, data },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Send chat message
  const sendMessage = useCallback((message: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        sessionId: state.sessionId,
        data: { message },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Send viewport update
  const sendViewport = useCallback((viewport: { x: number; y: number; zoom: number }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'viewport',
        sessionId: state.sessionId,
        data: { viewport },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Send presence update
  const sendPresence = useCallback((isActive: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'presence',
        sessionId: state.sessionId,
        data: { isActive },
        timestamp: new Date()
      }));
    }
  }, [state.sessionId]);

  // Follow collaborator
  const followCollaborator = useCallback((collaboratorId: string | null) => {
    setState(prev => {
      const newCollaborators = new Map(prev.collaborators);
      newCollaborators.forEach((collab, id) => {
        collab.isFollowing = id === collaboratorId;
      });
      return { ...prev, collaborators: newCollaborators };
    });
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      sendPresence(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sendPresence]);

  return {
    ...state,
    sendCursor,
    sendSelection,
    sendOperation,
    sendMessage,
    sendViewport,
    sendPresence,
    followCollaborator,
    isFollowing: Array.from(state.collaborators.values()).some(c => c.isFollowing)
  };
}