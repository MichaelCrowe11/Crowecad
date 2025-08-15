/**
 * CroweCad Real-time Collaboration Client
 * Handles WebSocket connections, presence, and operational transformation
 */

import { EventEmitter } from 'events';

export interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: string[];
  avatar?: string;
}

export interface CollaborationState {
  users: Map<string, User>;
  operations: Operation[];
  version: number;
  documentId: string;
}

export interface Operation {
  id: string;
  userId: string;
  type: 'create' | 'update' | 'delete' | 'transform';
  target: string;
  data: any;
  timestamp: number;
  version: number;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  position: { x: number; y: number };
  timestamp: number;
  resolved: boolean;
  replies?: Comment[];
}

export class CollaborationClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private state: CollaborationState;
  private userId: string;
  private documentId: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private operationQueue: Operation[] = [];
  private isConnected = false;

  constructor(documentId: string, userId: string) {
    super();
    this.documentId = documentId;
    this.userId = userId;
    this.state = {
      users: new Map(),
      operations: [],
      version: 0,
      documentId
    };
  }

  /**
   * Connect to collaboration server
   */
  connect(url?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = url || `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Collaboration connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Join document session
        this.send('join', {
          documentId: this.documentId,
          userId: this.userId,
          user: this.getCurrentUser()
        });
        
        // Start heartbeat
        this.startHeartbeat();
        
        // Process queued operations
        this.processOperationQueue();
        
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        this.handleMessage(JSON.parse(event.data));
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
      
      this.ws.onclose = () => {
        console.log('Collaboration disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.attemptReconnect();
      };
      
      // Timeout connection attempt
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.stopHeartbeat();
    this.isConnected = false;
  }

  /**
   * Send message to server
   */
  private send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      // Queue operation if disconnected
      if (type === 'operation') {
        this.operationQueue.push(data);
      }
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: any) {
    const { type, data } = message;
    
    switch (type) {
      case 'state':
        this.handleStateUpdate(data);
        break;
        
      case 'user-joined':
        this.handleUserJoined(data);
        break;
        
      case 'user-left':
        this.handleUserLeft(data);
        break;
        
      case 'cursor-update':
        this.handleCursorUpdate(data);
        break;
        
      case 'selection-update':
        this.handleSelectionUpdate(data);
        break;
        
      case 'operation':
        this.handleRemoteOperation(data);
        break;
        
      case 'comment':
        this.handleComment(data);
        break;
        
      case 'presence':
        this.handlePresenceUpdate(data);
        break;
        
      case 'conflict':
        this.handleConflict(data);
        break;
        
      case 'ack':
        this.handleAcknowledgment(data);
        break;
    }
  }

  /**
   * Handle state synchronization
   */
  private handleStateUpdate(data: any) {
    this.state.version = data.version;
    this.state.users = new Map(data.users);
    this.state.operations = data.operations || [];
    
    this.emit('state-update', this.state);
  }

  /**
   * Handle user joining
   */
  private handleUserJoined(data: any) {
    const user: User = data.user;
    this.state.users.set(user.id, user);
    this.emit('user-joined', user);
  }

  /**
   * Handle user leaving
   */
  private handleUserLeft(data: any) {
    const userId = data.userId;
    const user = this.state.users.get(userId);
    if (user) {
      this.state.users.delete(userId);
      this.emit('user-left', user);
    }
  }

  /**
   * Handle cursor position updates
   */
  private handleCursorUpdate(data: any) {
    const { userId, cursor } = data;
    const user = this.state.users.get(userId);
    if (user) {
      user.cursor = cursor;
      this.emit('cursor-update', { userId, cursor });
    }
  }

  /**
   * Handle selection updates
   */
  private handleSelectionUpdate(data: any) {
    const { userId, selection } = data;
    const user = this.state.users.get(userId);
    if (user) {
      user.selection = selection;
      this.emit('selection-update', { userId, selection });
    }
  }

  /**
   * Handle remote operations (with OT)
   */
  private handleRemoteOperation(data: Operation) {
    // Apply operational transformation if needed
    const transformedOp = this.transformOperation(data);
    
    // Update local state
    this.state.operations.push(transformedOp);
    this.state.version = transformedOp.version;
    
    // Emit for local application
    this.emit('remote-operation', transformedOp);
  }

  /**
   * Transform operation for conflict resolution
   */
  private transformOperation(operation: Operation): Operation {
    // Simple last-write-wins for now
    // In production, implement proper OT or CRDT
    
    const conflictingOps = this.state.operations.filter(
      op => op.target === operation.target && 
            op.version >= operation.version &&
            op.userId !== operation.userId
    );
    
    if (conflictingOps.length > 0) {
      // Transform the operation based on conflicts
      // This is a simplified version - real OT is more complex
      operation.version = this.state.version + 1;
      
      // Emit conflict for UI handling
      this.emit('conflict-detected', {
        operation,
        conflicts: conflictingOps
      });
    }
    
    return operation;
  }

  /**
   * Send local operation
   */
  sendOperation(type: Operation['type'], target: string, data: any) {
    const operation: Operation = {
      id: this.generateId(),
      userId: this.userId,
      type,
      target,
      data,
      timestamp: Date.now(),
      version: this.state.version + 1
    };
    
    // Optimistically apply locally
    this.state.operations.push(operation);
    this.state.version = operation.version;
    
    // Send to server
    this.send('operation', operation);
    
    return operation;
  }

  /**
   * Update cursor position
   */
  updateCursor(x: number, y: number) {
    this.send('cursor-update', { cursor: { x, y } });
  }

  /**
   * Update selection
   */
  updateSelection(selection: string[]) {
    this.send('selection-update', { selection });
  }

  /**
   * Send comment
   */
  sendComment(text: string, position: { x: number; y: number }): Comment {
    const comment: Comment = {
      id: this.generateId(),
      userId: this.userId,
      text,
      position,
      timestamp: Date.now(),
      resolved: false
    };
    
    this.send('comment', comment);
    return comment;
  }

  /**
   * Handle incoming comment
   */
  private handleComment(data: Comment) {
    this.emit('comment', data);
  }

  /**
   * Handle presence updates
   */
  private handlePresenceUpdate(data: any) {
    this.emit('presence-update', data);
  }

  /**
   * Handle conflicts
   */
  private handleConflict(data: any) {
    this.emit('conflict', data);
  }

  /**
   * Handle operation acknowledgment
   */
  private handleAcknowledgment(data: any) {
    this.emit('ack', data);
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect-failed');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Reconnect attempt ${this.reconnectAttempts}`);
      this.connect().catch(() => {
        // Reconnect will be attempted again
      });
    }, delay);
  }

  /**
   * Process queued operations
   */
  private processOperationQueue() {
    while (this.operationQueue.length > 0) {
      const operation = this.operationQueue.shift();
      if (operation) {
        this.send('operation', operation);
      }
    }
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('ping', { timestamp: Date.now() });
      }
    }, 30000);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Get current user info
   */
  private getCurrentUser(): User {
    return {
      id: this.userId,
      name: `User ${this.userId.substring(0, 8)}`,
      color: this.generateUserColor(this.userId)
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate user color from ID
   */
  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#FFD93D'
    ];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Get active users
   */
  getActiveUsers(): User[] {
    return Array.from(this.state.users.values());
  }

  /**
   * Get current state
   */
  getState(): CollaborationState {
    return this.state;
  }

  /**
   * Check connection status
   */
  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

// Singleton instance management
let collaborationInstance: CollaborationClient | null = null;

export function getCollaborationClient(documentId: string, userId: string): CollaborationClient {
  if (!collaborationInstance || collaborationInstance.getState().documentId !== documentId) {
    if (collaborationInstance) {
      collaborationInstance.disconnect();
    }
    collaborationInstance = new CollaborationClient(documentId, userId);
  }
  return collaborationInstance;
}