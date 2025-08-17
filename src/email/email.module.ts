import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  providers: [EmailService],
  controllers: [EmailController],  // usuń, jeśli nie chcesz endpointu
  exports: [EmailService],
})
export class EmailModule {}
