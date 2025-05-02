import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private users;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(name: string, client: Socket): void;
    handleMessage(client: Socket, payload: {
        sender: string;
        message: string;
        timestamp: string;
    }): void;
    private updateUserList;
}
