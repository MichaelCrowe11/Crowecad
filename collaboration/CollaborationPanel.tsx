import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Mic, 
  MicOff,
  VideoOff,
  Share2,
  Clock,
  Eye,
  Edit3,
  MousePointer2
} from 'lucide-react';
import { 
  CollaborationClient, 
  User, 
  Comment,
  getCollaborationClient 
} from '@/lib/collaboration-client';

interface CollaborationPanelProps {
  documentId: string;
  userId: string;
  onClose?: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  documentId,
  userId,
  onClose
}) => {
  const [client, setClient] = useState<CollaborationClient | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    // Initialize collaboration client
    const collaborationClient = getCollaborationClient(documentId, userId);
    setClient(collaborationClient);

    // Set up event listeners
    collaborationClient.on('state-update', (state) => {
      setActiveUsers(Array.from(state.users.values()));
      setIsConnected(true);
    });

    collaborationClient.on('user-joined', (user: User) => {
      setActiveUsers(prev => [...prev, user]);
    });

    collaborationClient.on('user-left', (user: User) => {
      setActiveUsers(prev => prev.filter(u => u.id !== user.id));
    });

    collaborationClient.on('comment', (comment: Comment) => {
      setComments(prev => [...prev, comment]);
    });

    collaborationClient.on('cursor-update', ({ userId, cursor }) => {
      setActiveUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, cursor } : u
      ));
    });

    collaborationClient.on('selection-update', ({ userId, selection }) => {
      setActiveUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, selection } : u
      ));
    });

    // Connect to server
    collaborationClient.connect().catch(console.error);

    // Session timer
    const startTime = Date.now();
    const timer = setInterval(() => {
      setSessionDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
      collaborationClient.disconnect();
    };
  }, [documentId, userId]);

  const handleSendComment = () => {
    if (!client || !newComment.trim()) return;
    
    const comment = client.sendComment(newComment, { x: 0, y: 0 });
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleFollowUser = (user: User) => {
    setSelectedUser(user);
    // Emit follow event to sync viewport
    client?.send('follow-user', { targetUserId: user.id });
  };

  const handleShareScreen = () => {
    // Implement screen sharing
    navigator.mediaDevices.getDisplayMedia({ video: true })
      .then(stream => {
        // Handle screen share stream
        console.log('Screen sharing started');
      })
      .catch(console.error);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // Implement video toggle logic
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // Implement audio toggle logic
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getUserActivity = (user: User): string => {
    if (user.selection && user.selection.length > 0) {
      return 'Editing';
    }
    if (user.cursor) {
      return 'Viewing';
    }
    return 'Idle';
  };

  return (
    <Card className="w-96 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(sessionDuration)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden p-0">
        <Tabs defaultValue="users" className="h-full flex flex-col">
          <TabsList className="mx-4">
            <TabsTrigger value="users" className="flex-1">
              Users ({activeUsers.length})
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1">
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="session" className="flex-1">
              Session
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="flex-1 overflow-hidden px-4">
            <ScrollArea className="h-full">
              <div className="space-y-3 py-2">
                {activeUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback style={{ backgroundColor: user.color }}>
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div 
                          className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background"
                          style={{ backgroundColor: user.color }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {user.name}
                          {user.id === userId && ' (You)'}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {getUserActivity(user) === 'Editing' && <Edit3 className="h-3 w-3" />}
                          {getUserActivity(user) === 'Viewing' && <Eye className="h-3 w-3" />}
                          {getUserActivity(user)}
                        </div>
                      </div>
                    </div>
                    
                    {user.id !== userId && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleFollowUser(user)}
                              className="h-8 w-8 p-0"
                            >
                              <MousePointer2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Follow {user.name}'s cursor</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                ))}
                
                {activeUsers.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No other users online
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="comments" className="flex-1 overflow-hidden flex flex-col px-4">
            <ScrollArea className="flex-1">
              <div className="space-y-3 py-2">
                {comments.map(comment => {
                  const commentUser = activeUsers.find(u => u.id === comment.userId);
                  return (
                    <div key={comment.id} className="p-3 rounded-lg bg-accent/50">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback style={{ 
                            backgroundColor: commentUser?.color || '#888',
                            fontSize: '10px'
                          }}>
                            {commentUser?.name.substring(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">
                              {commentUser?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {comments.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No comments yet
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2 py-3">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
                className="flex-1"
              />
              <Button onClick={handleSendComment} size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="session" className="flex-1 px-4">
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Button 
                  variant={isVideoEnabled ? "default" : "outline"}
                  className="flex-1"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? <Video className="h-4 w-4 mr-2" /> : <VideoOff className="h-4 w-4 mr-2" />}
                  Video
                </Button>
                <Button 
                  variant={isAudioEnabled ? "default" : "outline"}
                  className="flex-1"
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? <Mic className="h-4 w-4 mr-2" /> : <MicOff className="h-4 w-4 mr-2" />}
                  Audio
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleShareScreen}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Screen
              </Button>
              
              <div className="border rounded-lg p-3">
                <h4 className="text-sm font-medium mb-2">Session Info</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document ID:</span>
                    <span className="font-mono">{documentId.substring(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Users:</span>
                    <span>{activeUsers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{formatDuration(sessionDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Operations:</span>
                    <span>{client?.getState().operations.length || 0}</span>
                  </div>
                </div>
              </div>
              
              {selectedUser && (
                <div className="border rounded-lg p-3">
                  <h4 className="text-sm font-medium mb-2">Following</h4>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback style={{ backgroundColor: selectedUser.color }}>
                        {selectedUser.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{selectedUser.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(null)}
                      className="ml-auto h-6 px-2"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};