import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../interfaces/response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';
    let code = 500;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      message = exceptionResponse.message || exception.message;

      // 根据不同的状态码设置不同的业务码
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          code = 400;
          break;
        case HttpStatus.UNAUTHORIZED:
          code = 401;
          break;
        case HttpStatus.FORBIDDEN:
          code = 403;
          break;
        case HttpStatus.NOT_FOUND:
          code = 404;
          break;
        default:
          code = status;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ApiResponse = {
      code,
      message,
      data: null,
    };

    this.logger.error(`${request.method} ${request.url} - ${message}`, {
      url: request.url,
      method: request.method,
      body: request.body,
      error: exception instanceof Error ? exception.stack : String(exception),
    });

    response.status(status).json(errorResponse);
  }
}
