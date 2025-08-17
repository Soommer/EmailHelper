import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

class SendMailDto {
  @ApiProperty() @IsEmail() to: string;
  @ApiProperty() @IsNotEmpty() subject: string;
  @ApiProperty() @IsString() template: string; // 'welcome'
  @ApiProperty()@IsOptional() context?: Record<string, any>;
}

@ApiTags('mail')
@ApiBearerAuth()
@Controller('mail')
export class EmailController {
  constructor(private readonly mail: EmailService) {}

  @Post('send')
  async send(@Body() dto: SendMailDto) {


    return this.mail.sendTemplateMail({
      to: dto.to,
      subject: dto.subject,
      template: dto.template,
      context: dto.context ?? {},
    });
  }
}
