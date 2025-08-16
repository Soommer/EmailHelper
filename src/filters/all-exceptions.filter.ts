import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      return res.status(status).send({ statusCode: status, message: response });
    }

    // Prisma: p2002 unique violation itd.
    const message = (exception as any)?.message ?? 'Internal server error';
    this.logger.error(message);

    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
