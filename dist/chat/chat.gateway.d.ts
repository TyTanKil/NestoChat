import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private users;
    private messages;
    private messageLikes;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleRegister(name: string, client: Socket): void;
    handleMessage(data: {
        sender: string;
        content: string;
    }, client: Socket): void;
    handleLike(messageId: string, client: Socket): void;
    private updateUserList;
}
