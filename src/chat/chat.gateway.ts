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

@WebSocketGateway({ cors: {
    origin: 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST'],
  } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private users: User[] = [];

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Retirer l'utilisateur déconnecté
    this.users = this.users.filter(user => user.id !== client.id);
    this.updateUserList();
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() name: string,
    @ConnectedSocket() client: Socket,
  ) {
    // Vérifie si l'utilisateur est déjà enregistré
    const alreadyExists = this.users.find(user => user.id === client.id);
    if (!alreadyExists) {
      this.users.push({ id: client.id, name });
      this.updateUserList();
    }
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { sender: string; message: string; timestamp: string },
  ) {
    this.server.emit('message', payload);
  }

  private updateUserList() {
    const usernames = this.users.map(u => u.name);
    this.server.emit('users', usernames);
  }
}