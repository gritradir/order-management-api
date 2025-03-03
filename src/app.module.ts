import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersModule } from './modules/orders/orders.module';
import { DatabaseConfig } from './config/database.config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
        }),
        
        // Database
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DatabaseConfig,
        }),
        
        // Feature modules
        OrdersModule,
    ],
    providers: [
        // Global exception filter
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        
        // Global logging interceptor
        {
          provide: APP_INTERCEPTOR,
          useClass: LoggingInterceptor,
        },
    ],
})
export class AppModule {}