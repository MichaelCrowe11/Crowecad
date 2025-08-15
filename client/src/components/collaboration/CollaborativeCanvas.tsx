import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CollaborativeCursor, SelectionBox } from './CollaborativeCursor';
import { CollaborationClient, User } from '@/lib/collaboration-client';
import { useThrottle } from '../../hooks/use-throttle';

interface CollaborativeCanvasProps {
  children: React.ReactNode;
  collaborationClient: CollaborationClient;
  currentUserId: string;
}

interface UserState {
  user: User;
  cursor?: { x: number; y: number };
  selection?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const CollaborativeCanvas: React.FC<CollaborativeCanvasProps> = ({
  children,
  collaborationClient,
  currentUserId
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<Map<string, UserState>>(new Map());
  const [isFollowing, setIsFollowing] = useState<string | null>(null);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  // Throttle cursor updates to 60fps
  const throttledCursorUpdate = useThrottle((x: number, y: number) => {
    if (collaborationClient) {
      collaborationClient.updateCursor(x, y);
    }
  }, 16);

  // Handle mouse movement
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    lastMousePosition.current = { x, y };
    throttledCursorUpdate(x, y);
  }, [throttledCursorUpdate]);

  // Handle collaboration events
  useEffect(() => {
    if (!collaborationClient) return;

    const handleUserJoined = (user: User) => {
      setUsers(prev => {
        const next = new Map(prev);
        next.set(user.id, { user });
        return next;
      });
    };

    const handleUserLeft = (user: User) => {
      setUsers(prev => {
        const next = new Map(prev);
        next.delete(user.id);
        return next;
      });
    };

    const handleCursorUpdate = ({ userId, cursor }: { userId: string; cursor: { x: number; y: number } }) => {
      if (userId === currentUserId) return;
      
      setUsers(prev => {
        const next = new Map(prev);
        const userState = next.get(userId);
        if (userState) {
          userState.cursor = cursor;
        }
        return next;
      });
    };

    const handleSelectionUpdate = ({ userId, selection }: { userId: string; selection: any }) => {
      if (userId === currentUserId) return;
      
      setUsers(prev => {
        const next = new Map(prev);
        const userState = next.get(userId);
        if (userState && selection) {
          // Convert selection array to bounds if needed
          if (Array.isArray(selection) && selection.length === 4) {
            userState.selection = {
              x: selection[0],
              y: selection[1],
              width: selection[2],
              height: selection[3]
            };
          } else if (typeof selection === 'object' && 'x' in selection) {
            userState.selection = selection;
          }
        }
        return next;
      });
    };

    const handleStateUpdate = (state: any) => {
      const newUsers = new Map<string, UserState>();
      state.users.forEach((user: User) => {
        if (user.id !== currentUserId) {
          let selectionBounds = undefined;
          // Convert selection to bounds if needed
          if (user.selection) {
            if (Array.isArray(user.selection) && user.selection.length === 4) {
              selectionBounds = {
                x: user.selection[0],
                y: user.selection[1],
                width: user.selection[2],
                height: user.selection[3]
              };
            }
          }
          newUsers.set(user.id, { 
            user,
            cursor: user.cursor,
            selection: selectionBounds
          });
        }
      });
      setUsers(newUsers);
    };

    collaborationClient.on('user-joined', handleUserJoined);
    collaborationClient.on('user-left', handleUserLeft);
    collaborationClient.on('cursor-update', handleCursorUpdate);
    collaborationClient.on('selection-update', handleSelectionUpdate);
    collaborationClient.on('state-update', handleStateUpdate);

    return () => {
      collaborationClient.off('user-joined', handleUserJoined);
      collaborationClient.off('user-left', handleUserLeft);
      collaborationClient.off('cursor-update', handleCursorUpdate);
      collaborationClient.off('selection-update', handleSelectionUpdate);
      collaborationClient.off('state-update', handleStateUpdate);
    };
  }, [collaborationClient, currentUserId]);

  // Follow user viewport
  useEffect(() => {
    if (!isFollowing || !canvasRef.current) return;
    
    const userState = users.get(isFollowing);
    if (!userState?.cursor) return;
    
    // Smoothly scroll to follow user's cursor
    const rect = canvasRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const offsetX = userState.cursor.x - centerX;
    const offsetY = userState.cursor.y - centerY;
    
    canvasRef.current.scrollTo({
      left: offsetX,
      top: offsetY,
      behavior: 'smooth'
    });
  }, [isFollowing, users]);

  // Add mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove]);

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden"
      data-testid="collaborative-canvas"
    >
      {/* Main canvas content */}
      <div className="relative w-full h-full">
        {children}
      </div>
      
      {/* Render other users' cursors */}
      {Array.from(users.values()).map(({ user, cursor }) => (
        cursor && (
          <CollaborativeCursor
            key={user.id}
            userId={user.id}
            userName={user.name}
            color={user.color}
            position={cursor}
            isActive={true}
          />
        )
      ))}
      
      {/* Render selection boxes */}
      {Array.from(users.values()).map(({ user, selection }) => (
        selection && (
          <SelectionBox
            key={`selection-${user.id}`}
            userId={user.id}
            color={user.color}
            bounds={selection}
          />
        )
      ))}
    </div>
  );
};