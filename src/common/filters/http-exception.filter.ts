import {
  InvalidProductException,
  ProductNotFoundException,
} from '@/product/domain/exceptions/product.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof ProductNotFoundException) {
      status = HttpStatus.NOT_FOUND; // 404
      message = exception.message;
    } else if (exception instanceof InvalidProductException) {
      status = HttpStatus.BAD_REQUEST; // 400
      message = exception.message;
    } else {
      console.error(exception);
    }

    if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      message = (message as any).message;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
