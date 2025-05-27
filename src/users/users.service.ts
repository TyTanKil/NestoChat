import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(username: string, password: string): Promise<boolean> {
    const existing = await this.prisma.user.findUnique({ where: { username } });
    if (existing) return false;
    const passwordHash = await bcrypt.hash(password, 10);
    await this.prisma.user.create({
      data: { username, password: passwordHash },
    });
    return true;
  }

  async find(username: string) {
    return this.prisma.user.findUnique({ where: { username } });
  }
}
