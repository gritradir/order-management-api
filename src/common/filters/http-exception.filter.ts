import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse();
    
    // Get error response details
    const errorMessage = 
      typeof errorResponse === 'object' && 'message' in errorResponse
        ? errorResponse['message']
        : exception.message;
    
    const error = 
      typeof errorResponse === 'object' && 'error' in errorResponse
        ? errorResponse['error']
        : 'Error';

    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message: errorMessage,
    };

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} ${status} - ${JSON.stringify(errorMessage)}`,
      exception.stack,
    );

    // Send response
    response.status(status).json(responseBody);
  }
}
