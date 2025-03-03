import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { IdGeneratorUtil } from '../../common/utils/id-generator.utils';
import { Order } from './entities/order.entity';
import { OrderRepository } from './repositories/order.repository';

@Module({
    imports: [
      TypeOrmModule.forFeature([Order]),
    ],
    controllers: [OrdersController],
    providers: [
      OrdersService,
      OrderRepository,
      IdGeneratorUtil,
    ],
    exports: [OrdersService],
})
export class OrdersModule {}
