export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
  createdAt?: string;
  _count?: { posts?: number; likes?: number };
}

export interface Post {
  id: string;
  caption: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'gif';
  shareCount: number;
  createdAt: string;
  author: User;
  _count: { likes: number; comments: number; saves: number };
  likedByMe: boolean;
  savedByMe: boolean;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  user: User;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
  actor?: User;
}

export interface Conversation {
  id: string;
  updatedAt: string;
  otherUser: User;
  lastMessage?: { text: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  sender: User;
}
