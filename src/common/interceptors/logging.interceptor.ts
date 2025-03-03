import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const requestId = request.headers['x-request-id'] || this.generateRequestId();

    // Add request ID to response headers for traceability
    response.set('X-Request-ID', requestId.toString());

    const startTime = Date.now();
    this.logger.log(
      `[${requestId}] ${method} ${url} - ${controller}.${handler} - ${ip} - ${userAgent}`,
    );

    if (body && Object.keys(body).length > 0) {
      // Sanitize sensitive data for logging
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`[${requestId}] Request body: ${JSON.stringify(sanitizedBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] ${method} ${url} ${error.status || 500} ${duration}ms`,
          );
        },
      }),
    );
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeBody(body: any): any {
    // Clone the body to avoid modifying the original
    const sanitized = { ...body };
    
    // List of sensitive fields to mask
    const sensitiveFields = ['password', 'token', 'secret', 'credit_card', 'creditCard'];
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '******';
      }
    }
    
    return sanitized;
  }
}
