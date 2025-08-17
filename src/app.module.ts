import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EmailGrupsModule } from './emailGrup/emailGrup.module';
import { EmailModule } from './email/email.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development','production','test').required(),
        PORT: Joi.number().default(3000),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES: Joi.string().default('15m'),
        DATABASE_URL: Joi.string().uri().required(),
      }),
    }),
    LoggerModule.forRoot({
      pinoHttp: { level: process.env.NODE_ENV === 'production' ? 'info' : 'debug' },
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
    EmailGrupsModule,
    EmailModule
  ],
})
export class AppModule {}
