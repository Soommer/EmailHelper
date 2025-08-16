import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

class RegisterDto {
  @IsEmail() email!: string;
  @IsNotEmpty() @MinLength(6) password!: string;
  name?: string;
}
class LoginDto {
  @IsEmail() email!: string;
  @IsNotEmpty() password!: string;
}
class RefreshDto {
  @IsNotEmpty() refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) { return this.auth.register(dto.email, dto.password, dto.name); }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
}
