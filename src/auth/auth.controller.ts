import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { ApiProperty } from '@nestjs/swagger';



class LoginDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsNotEmpty() password!: string;
}
class RefreshDto {
  @ApiProperty() @IsNotEmpty() refreshToken!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) { return this.auth.register(dto.email, dto.password, dto.name); }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) { return this.auth.login(dto.email, dto.password); }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }
}
