import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5432),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'orders'),
      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
      synchronize: this.configService.get<boolean>('DB_SYNCHRONIZE', false),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
      ssl: this.configService.get<boolean>('DB_SSL', false)
        ? {
            rejectUnauthorized: false,
          }
        : false,
    };
  }
}
