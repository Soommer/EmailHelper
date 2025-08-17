import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy'; // <-- DODAJ

@Module({
  imports: [
    UsersModule,
    PassportModule, // ważne, żeby Passport był w module
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET!,
        signOptions: { expiresIn: process.env.JWT_EXPIRES ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <-- DODAJ
  exports: [AuthService], // (opcjonalnie) jeśli korzystasz gdzie indziej
})
export class AuthModule {}
