import { Module } from '@nestjs/common';
import { ChatGateway } from './chat/chat.gateway';
import { AuthModule } from './auth/auth.module';

@Module({
  providers: [ChatGateway],
  imports: [AuthModule],
})
export class AppModule {}
