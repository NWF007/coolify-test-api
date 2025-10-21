import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { ChatMessage } from './types';

const CHAT_HUB_URL = process.env.NODE_ENV === 'production' 
  ? 'https://test-api.stor8.cloud/chathub' 
  : 'http://localhost:5123/chathub';

class ChatService {
  private connection: HubConnection | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private userJoinedHandlers: ((username: string) => void)[] = [];
  private userLeftHandlers: ((username: string) => void)[] = [];

  async connect(token: string): Promise<void> {
    if (this.connection) {
      await this.disconnect();
    }

    this.connection = new HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Set up event handlers
    this.connection.on('ReceiveMessage', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.connection.on('UserJoined', (username: string) => {
      this.userJoinedHandlers.forEach(handler => handler(username));
    });

    this.connection.on('UserLeft', (username: string) => {
      this.userLeftHandlers.forEach(handler => handler(username));
    });

    try {
      await this.connection.start();
      console.log('Connected to chat hub');
    } catch (error) {
      console.error('Error connecting to chat hub:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      console.log('Disconnected from chat hub');
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('JoinRoom', roomId);
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('LeaveRoom', roomId);
    }
  }

  async sendMessage(content: string, roomId: string): Promise<void> {
    if (this.connection) {
      await this.connection.invoke('SendMessageToRoom', content, roomId);
    }
  }

  onMessageReceived(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      const index = this.messageHandlers.indexOf(handler);
      if (index > -1) {
        this.messageHandlers.splice(index, 1);
      }
    };
  }

  onUserJoined(handler: (username: string) => void): () => void {
    this.userJoinedHandlers.push(handler);
    return () => {
      const index = this.userJoinedHandlers.indexOf(handler);
      if (index > -1) {
        this.userJoinedHandlers.splice(index, 1);
      }
    };
  }

  onUserLeft(handler: (username: string) => void): () => void {
    this.userLeftHandlers.push(handler);
    return () => {
      const index = this.userLeftHandlers.indexOf(handler);
      if (index > -1) {
        this.userLeftHandlers.splice(index, 1);
      }
    };
  }

  get isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }
}

export const chatService = new ChatService();