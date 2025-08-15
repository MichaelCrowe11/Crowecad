/**
 * CroweCad Collaboration Panel
 * Shows active collaborators, cursors, and chat
 */

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Send,
  Eye,
  EyeOff,
  UserPlus,
  Share2,
  Circle,
  Square,
  MousePointer,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Pin,
  PinOff
} from 'lucide-react';
import { useCollaboration, type CollaboratorInfo } from '@/hooks/use-collaboration';

interface CollaborationPanelProps {
  projectId: string;
  userName?: string;
  userAvatar?: string;
  onFollowUser?: (userId: string | null) => void;
}

export function CollaborationPanel({
  projectId,
  userName = 'Anonymous',
  userAvatar,
  onFollowUser
}: CollaborationPanelProps) {
  const [message, setMessage] = useState('');
  const [showCursors, setShowCursors] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const {
    isConnected,
    collaborators,
    messages,
    sendMessage: sendChatMessage,
    sendPresence,
    followCollaborator,
    isFollowing
  } = useCollaboration({
    projectId,
    userName,
    userAvatar
  });

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };

  const handleFollowUser = (userId: string | null) => {
    followCollaborator(userId);
    onFollowUser?.(userId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Collaboration
          </CardTitle>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Badge variant="default" className="bg-green-500">
                <Circle className="w-2 h-2 mr-1 fill-current" />
                Live
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Circle className="w-2 h-2 mr-1" />
                Offline
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {collaborators.size} online
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue="users" className="h-full flex flex-col">
          <TabsList className="mx-3">
            <TabsTrigger value="users" className="flex-1">
              Users ({collaborators.size})
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1 relative">
              Chat
              {messages.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="flex-1 px-3 pb-3">
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {/* Current User */}
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{userName} (You)</p>
                        <p className="text-xs text-muted-foreground">Active now</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant={isVideoOn ? "default" : "ghost"}
                              className="w-7 h-7"
                              onClick={() => setIsVideoOn(!isVideoOn)}
                            >
                              {isVideoOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isVideoOn ? 'Turn off video' : 'Turn on video'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant={isMicOn ? "default" : "ghost"}
                              className="w-7 h-7"
                              onClick={() => setIsMicOn(!isMicOn)}
                            >
                              {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isMicOn ? 'Mute' : 'Unmute'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                {/* Collaborators */}
                <AnimatePresence>
                  {Array.from(collaborators.values()).map((collaborator) => (
                    <motion.div
                      key={collaborator.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback 
                                className="text-xs"
                                style={{ backgroundColor: collaborator.color + '20', color: collaborator.color }}
                              >
                                {getInitials(collaborator.name)}
                              </AvatarFallback>
                            </Avatar>
                            {collaborator.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium flex items-center gap-1">
                              {collaborator.name}
                              {collaborator.isFollowing && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  Following
                                </Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {collaborator.isActive ? 'Active' : 'Away'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant={collaborator.isFollowing ? "default" : "ghost"}
                                  className="w-7 h-7"
                                  onClick={() => handleFollowUser(collaborator.isFollowing ? null : collaborator.id)}
                                >
                                  {collaborator.isFollowing ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {collaborator.isFollowing ? 'Unfollow' : 'Follow viewport'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <div
                            className="w-7 h-7 rounded flex items-center justify-center"
                            style={{ backgroundColor: collaborator.color + '20' }}
                          >
                            <MousePointer className="w-3 h-3" style={{ color: collaborator.color }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {collaborators.size === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No other users online</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite Collaborators
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 flex flex-col px-3 pb-3">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-2">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <Avatar className="w-6 h-6 mt-0.5">
                        <AvatarFallback 
                          className="text-xs"
                          style={{ backgroundColor: msg.userColor + '20', color: msg.userColor }}
                        >
                          {getInitials(msg.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium">{msg.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{msg.message}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Cursor component to show on canvas
export function CollaboratorCursor({ 
  x, 
  y, 
  color, 
  name 
}: { 
  x: number; 
  y: number; 
  color: string; 
  name: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1, x, y }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" className="relative">
        <path
          d="M0 0L8 14L12 10L20 20L0 0Z"
          fill={color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div 
        className="absolute top-5 left-5 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </motion.div>
  );
}