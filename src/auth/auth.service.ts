import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const user = await this.users.create({ email, password, name });
    const accessToken = await this.sign(user.id, user.email, user.role);
    const refresh = await this.issueRefresh(user.id);
    return { user: { id:user.id, email:user.email, role:user.role }, accessToken, refreshToken: refresh.token };
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = await this.sign(user.id, user.email, user.role);
    const refresh = await this.issueRefresh(user.id);
    return { user: { id:user.id, email:user.email, role:user.role }, accessToken, refreshToken: refresh.token };
  }

  async refresh(token: string) {
    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.users.findByEmail((await this.prisma.user.findUnique({ where: { id: stored.userId } }))!.email);
    const accessToken = await this.sign(user!.id, user!.email, user!.role);
    return { accessToken };
  }

  private sign(sub: string, email: string, role: 'USER'|'ADMIN') {
    return this.jwt.signAsync({ sub, email, role });
  }

  private async issueRefresh(userId: string) {
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 dni
    return this.prisma.refreshToken.create({
      data: { userId, token: crypto.randomUUID(), expiresAt },
    });
  }
}
