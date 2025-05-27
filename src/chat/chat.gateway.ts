import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface User {
  id: string;
  name: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  likes: number;  
}

@WebSocketGateway({ cors: {
    origin: 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST'],
  } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: User[] = [];
  private messages: ChatMessage[] = [];
  private messageLikes: Record<string, Set<string>> = {};

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.users = this.users.filter(user => user.id !== client.id);
    this.updateUserList();
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() name: string,
    @ConnectedSocket() client: Socket,
  ) {
    const alreadyExists = this.users.find(user => user.id === client.id);
    if (!alreadyExists) {
      this.users.push({ id: client.id, name });
      this.updateUserList();
    }
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { sender: string; content: string; color?: string }, @ConnectedSocket() client: Socket): void {
    const newMessage = {
      id: Date.now().toString() + Math.floor(Math.random() * 10000),
      sender: data.sender,
      content: data.content,
      color: data.color || '#0077cc',
      likes: 0,
      timestamp: new Date().toISOString()
    };
    this.messages.push(newMessage);

    this.server.emit('message', {
      ...newMessage,
      index: this.messages.length - 1
    });
  }

 @SubscribeMessage('like')
    handleLike(
    @MessageBody() messageId: string,
    @ConnectedSocket() client: Socket,
  ): void {
    const message = this.messages.find(m => m.id === messageId);
    if (!message) return;

    if (!this.messageLikes[messageId]) {
      this.messageLikes[messageId] = new Set();
    }

    const alreadyLiked = this.messageLikes[messageId].has(client.id);
    if (alreadyLiked) return;

    this.messageLikes[messageId].add(client.id);
    message.likes += 1;

    this.server.emit('like', {
      messageId,
      likes: message.likes,
    });
  }


  private updateUserList() {
    const usernames = this.users.map(u => u.name);
    this.server.emit('users', usernames);
  }
}