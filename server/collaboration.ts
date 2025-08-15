/**
 * CroweCad Real-time Collaboration Server
 * Handles WebSocket connections, operational transformation, and presence
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { randomUUID } from 'crypto';

export interface CollaborationUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: any;
  viewport?: { x: number; y: number; zoom: number };
  isActive: boolean;
  lastActivity: Date;
}

export interface CollaborationSession {
  id: string;
  projectId: string;
  users: Map<string, CollaborationUser>;
  operations: Operation[];
  document: any;
  createdAt: Date;
  lastModified: Date;
}

export interface Operation {
  id: string;
  type: 'insert' | 'delete' | 'modify' | 'move' | 'transform';
  userId: string;
  timestamp: Date;
  data: any;
  revision: number;
}

export interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'selection' | 'operation' | 'chat' | 'presence' | 'sync' | 'viewport';
  userId: string;
  sessionId: string;
  data: any;
  timestamp: Date;
}

// User colors for collaboration
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#FFD93D', '#6C5CE7', '#FD79A8',
  '#A29BFE', '#FDCB6E', '#6C63FF', '#00B894', '#E17055'
];

class CollaborationManager {
  private wss: WebSocketServer | null = null;
  private sessions: Map<string, CollaborationSession> = new Map();
  private userConnections: Map<string, WebSocket> = new Map();
  private documentVersions: Map<string, any[]> = new Map();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/collab',
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          memLevel: 7,
          level: 3
        },
        zlibInflateOptions: {
          chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
      }
    });

    this.wss.on('connection', (ws: WebSocket, req) => {
      const userId = randomUUID();
      console.log(`New collaboration connection: ${userId}`);
      
      this.handleConnection(ws, userId);
    });

    // Cleanup inactive sessions periodically
    setInterval(() => this.cleanupInactiveSessions(), 60000); // Every minute
  }

  private handleConnection(ws: WebSocket, userId: string) {
    this.userConnections.set(userId, ws);

    ws.on('message', (data: Buffer) => {
      try {
        const message: CollaborationMessage = JSON.parse(data.toString());
        this.handleMessage(message, userId, ws);
      } catch (error) {
        console.error('Error parsing collaboration message:', error);
      }
    });

    ws.on('close', () => {
      this.handleDisconnect(userId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      userId,
      timestamp: new Date()
    }));
  }

  private handleMessage(message: CollaborationMessage, userId: string, ws: WebSocket) {
    switch (message.type) {
      case 'join':
        this.handleJoinSession(message, userId, ws);
        break;
      case 'leave':
        this.handleLeaveSession(message, userId);
        break;
      case 'cursor':
        this.handleCursorUpdate(message, userId);
        break;
      case 'selection':
        this.handleSelectionUpdate(message, userId);
        break;
      case 'operation':
        this.handleOperation(message, userId);
        break;
      case 'chat':
        this.handleChatMessage(message, userId);
        break;
      case 'viewport':
        this.handleViewportUpdate(message, userId);
        break;
      case 'sync':
        this.handleSyncRequest(message, userId, ws);
        break;
      case 'presence':
        this.handlePresenceUpdate(message, userId);
        break;
    }
  }

  private handleJoinSession(message: CollaborationMessage, userId: string, ws: WebSocket) {
    const { sessionId, data } = message;
    
    // Get or create session
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        projectId: data.projectId,
        users: new Map(),
        operations: [],
        document: data.document || {},
        createdAt: new Date(),
        lastModified: new Date()
      };
      this.sessions.set(sessionId, session);
    }

    // Create user
    const user: CollaborationUser = {
      id: userId,
      name: data.name || `User ${session.users.size + 1}`,
      email: data.email,
      avatar: data.avatar,
      color: USER_COLORS[session.users.size % USER_COLORS.length],
      isActive: true,
      lastActivity: new Date()
    };

    session.users.set(userId, user);

    // Send session state to joining user
    ws.send(JSON.stringify({
      type: 'session-joined',
      sessionId,
      userId,
      user,
      users: Array.from(session.users.values()),
      document: session.document,
      operations: session.operations.slice(-100), // Last 100 operations
      timestamp: new Date()
    }));

    // Notify other users
    this.broadcastToSession(sessionId, {
      type: 'user-joined',
      user,
      timestamp: new Date()
    }, userId);
  }

  private handleLeaveSession(message: CollaborationMessage, userId: string) {
    const { sessionId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId);
      session.users.delete(userId);

      // Notify other users
      this.broadcastToSession(sessionId, {
        type: 'user-left',
        userId,
        user,
        timestamp: new Date()
      });

      // Clean up empty sessions
      if (session.users.size === 0) {
        this.sessions.delete(sessionId);
      }
    }
  }

  private handleCursorUpdate(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId)!;
      user.cursor = data.cursor;
      user.lastActivity = new Date();

      // Broadcast cursor position to other users
      this.broadcastToSession(sessionId, {
        type: 'cursor-update',
        userId,
        cursor: data.cursor,
        color: user.color,
        name: user.name,
        timestamp: new Date()
      }, userId);
    }
  }

  private handleSelectionUpdate(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId)!;
      user.selection = data.selection;
      user.lastActivity = new Date();

      // Broadcast selection to other users
      this.broadcastToSession(sessionId, {
        type: 'selection-update',
        userId,
        selection: data.selection,
        color: user.color,
        timestamp: new Date()
      }, userId);
    }
  }

  private handleOperation(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Create operation
      const operation: Operation = {
        id: randomUUID(),
        type: data.type,
        userId,
        timestamp: new Date(),
        data: data.data,
        revision: session.operations.length
      };

      // Apply operational transformation if needed
      const transformedOp = this.transformOperation(operation, session);
      
      // Add to operation history
      session.operations.push(transformedOp);
      session.lastModified = new Date();

      // Apply operation to document
      this.applyOperation(transformedOp, session);

      // Broadcast operation to all users
      this.broadcastToSession(sessionId, {
        type: 'operation',
        operation: transformedOp,
        timestamp: new Date()
      });

      // Update user activity
      const user = session.users.get(userId);
      if (user) {
        user.lastActivity = new Date();
      }
    }
  }

  private handleChatMessage(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId)!;
      
      // Broadcast chat message to all users
      this.broadcastToSession(sessionId, {
        type: 'chat',
        userId,
        user: {
          name: user.name,
          avatar: user.avatar,
          color: user.color
        },
        message: data.message,
        timestamp: new Date()
      });
    }
  }

  private handleViewportUpdate(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId)!;
      user.viewport = data.viewport;
      user.lastActivity = new Date();

      // Broadcast viewport to other users (for minimap/following)
      this.broadcastToSession(sessionId, {
        type: 'viewport-update',
        userId,
        viewport: data.viewport,
        timestamp: new Date()
      }, userId);
    }
  }

  private handleSyncRequest(message: CollaborationMessage, userId: string, ws: WebSocket) {
    const { sessionId } = message;
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Send full document state
      ws.send(JSON.stringify({
        type: 'sync-response',
        sessionId,
        document: session.document,
        operations: session.operations,
        users: Array.from(session.users.values()),
        timestamp: new Date()
      }));
    }
  }

  private handlePresenceUpdate(message: CollaborationMessage, userId: string) {
    const { sessionId, data } = message;
    const session = this.sessions.get(sessionId);
    
    if (session && session.users.has(userId)) {
      const user = session.users.get(userId)!;
      user.isActive = data.isActive;
      user.lastActivity = new Date();

      // Broadcast presence update
      this.broadcastToSession(sessionId, {
        type: 'presence-update',
        userId,
        isActive: data.isActive,
        timestamp: new Date()
      }, userId);
    }
  }

  private handleDisconnect(userId: string) {
    // Remove from all sessions
    this.sessions.forEach((session, sessionId) => {
      if (session.users.has(userId)) {
        const user = session.users.get(userId);
        session.users.delete(userId);

        // Notify other users
        this.broadcastToSession(sessionId, {
          type: 'user-disconnected',
          userId,
          user,
          timestamp: new Date()
        });
      }
    });

    // Remove connection
    this.userConnections.delete(userId);
  }

  private broadcastToSession(sessionId: string, message: any, excludeUserId?: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.users.forEach((user, userId) => {
      if (userId !== excludeUserId) {
        const ws = this.userConnections.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      }
    });
  }

  private transformOperation(operation: Operation, session: CollaborationSession): Operation {
    // Implement Operational Transformation algorithm
    // This is a simplified version - real OT is more complex
    
    // For now, just return the operation as-is
    // In production, you'd implement proper OT or use CRDTs
    return operation;
  }

  private applyOperation(operation: Operation, session: CollaborationSession) {
    // Apply the operation to the document
    // This depends on your document structure
    
    switch (operation.type) {
      case 'insert':
        // Insert element
        break;
      case 'delete':
        // Delete element
        break;
      case 'modify':
        // Modify element
        break;
      case 'move':
        // Move element
        break;
      case 'transform':
        // Transform element
        break;
    }
  }

  private cleanupInactiveSessions() {
    const now = new Date();
    const inactivityThreshold = 30 * 60 * 1000; // 30 minutes

    this.sessions.forEach((session, sessionId) => {
      // Check if all users are inactive
      let allInactive = true;
      session.users.forEach(user => {
        if (now.getTime() - user.lastActivity.getTime() < inactivityThreshold) {
          allInactive = false;
        }
      });

      // Remove inactive sessions
      if (allInactive && session.users.size === 0) {
        this.sessions.delete(sessionId);
        console.log(`Cleaned up inactive session: ${sessionId}`);
      }
    });
  }

  // Public methods for external access
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId);
  }

  getSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values());
  }

  getActiveUsers(sessionId: string): CollaborationUser[] {
    const session = this.sessions.get(sessionId);
    return session ? Array.from(session.users.values()).filter(u => u.isActive) : [];
  }
}

export const collaborationManager = new CollaborationManager();
export default collaborationManager;