import { useState, useEffect, useCallback } from 'react';
import { 
  CollaborationClient, 
  User, 
  Operation, 
  Comment,
  getCollaborationClient 
} from '@/lib/collaboration-client';

interface UseCollaborationOptions {
  documentId: string;
  userId: string;
  autoConnect?: boolean;
}

interface UseCollaborationReturn {
  client: CollaborationClient | null;
  isConnected: boolean;
  activeUsers: User[];
  operations: Operation[];
  comments: Comment[];
  connect: () => Promise<void>;
  disconnect: () => void;
  sendOperation: (type: Operation['type'], target: string, data: any) => Operation | null;
  sendComment: (text: string, position: { x: number; y: number }) => Comment | null;
  updateCursor: (x: number, y: number) => void;
  updateSelection: (selection: string[]) => void;
}

export function useCollaboration({
  documentId,
  userId,
  autoConnect = true
}: UseCollaborationOptions): UseCollaborationReturn {
  const [client, setClient] = useState<CollaborationClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const collaborationClient = getCollaborationClient(documentId, userId);
    setClient(collaborationClient);

    // Set up event listeners
    const handleStateUpdate = (state: any) => {
      setActiveUsers(Array.from(state.users.values()));
      setOperations(state.operations);
      setIsConnected(true);
    };

    const handleUserJoined = (user: User) => {
      setActiveUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
    };

    const handleUserLeft = (user: User) => {
      setActiveUsers(prev => prev.filter(u => u.id !== user.id));
    };

    const handleRemoteOperation = (operation: Operation) => {
      setOperations(prev => [...prev, operation]);
    };

    const handleComment = (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    };

    const handleError = (error: any) => {
      console.error('Collaboration error:', error);
      setIsConnected(false);
    };

    const handleReconnectFailed = () => {
      console.error('Failed to reconnect to collaboration server');
      setIsConnected(false);
    };

    collaborationClient.on('state-update', handleStateUpdate);
    collaborationClient.on('user-joined', handleUserJoined);
    collaborationClient.on('user-left', handleUserLeft);
    collaborationClient.on('remote-operation', handleRemoteOperation);
    collaborationClient.on('comment', handleComment);
    collaborationClient.on('error', handleError);
    collaborationClient.on('reconnect-failed', handleReconnectFailed);

    // Auto-connect if enabled
    if (autoConnect) {
      collaborationClient.connect().catch(console.error);
    }

    return () => {
      collaborationClient.off('state-update', handleStateUpdate);
      collaborationClient.off('user-joined', handleUserJoined);
      collaborationClient.off('user-left', handleUserLeft);
      collaborationClient.off('remote-operation', handleRemoteOperation);
      collaborationClient.off('comment', handleComment);
      collaborationClient.off('error', handleError);
      collaborationClient.off('reconnect-failed', handleReconnectFailed);
      
      collaborationClient.disconnect();
    };
  }, [documentId, userId, autoConnect]);

  const connect = useCallback(async () => {
    if (client && !isConnected) {
      await client.connect();
    }
  }, [client, isConnected]);

  const disconnect = useCallback(() => {
    if (client) {
      client.disconnect();
      setIsConnected(false);
    }
  }, [client]);

  const sendOperation = useCallback((
    type: Operation['type'], 
    target: string, 
    data: any
  ): Operation | null => {
    if (!client || !isConnected) return null;
    return client.sendOperation(type, target, data);
  }, [client, isConnected]);

  const sendComment = useCallback((
    text: string, 
    position: { x: number; y: number }
  ): Comment | null => {
    if (!client || !isConnected) return null;
    return client.sendComment(text, position);
  }, [client, isConnected]);

  const updateCursor = useCallback((x: number, y: number) => {
    if (client && isConnected) {
      client.updateCursor(x, y);
    }
  }, [client, isConnected]);

  const updateSelection = useCallback((selection: string[]) => {
    if (client && isConnected) {
      client.updateSelection(selection);
    }
  }, [client, isConnected]);

  return {
    client,
    isConnected,
    activeUsers,
    operations,
    comments,
    connect,
    disconnect,
    sendOperation,
    sendComment,
    updateCursor,
    updateSelection
  };
}