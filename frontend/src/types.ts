export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: number;
}

export interface ChatMessage {
  id: number;
  content: string;
  senderUsername: string;
  senderId: number;
  timestamp: string;
  roomId?: string;
  recipientId?: number;
}

export interface SendMessageRequest {
  content: string;
  roomId?: string;
  recipientId?: number;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
}