import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { Order } from '../entities/order.entity';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { IOrderService } from '../interfaces/order-service.interface';
import { IOrderFilter } from '../interfaces/order-filter.interface';
import { OrderRepository } from '../repositories/order.repository';
import { IdGeneratorUtil } from '../../../common/utils/id-generator.utils';

@Injectable()
export class OrdersService implements IOrderService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly idGenerator: IdGeneratorUtil,
    ) {}

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const existingOrder = await this.orderRepository.findByOrderNumber(createOrderDto.orderNumber);

        if (existingOrder) {
          this.logger.warn(`Attempted to create duplicate order: ${createOrderDto.orderNumber}`);
          throw new ConflictException(`Order with number ${createOrderDto.orderNumber} already exists`);
        }

        const uniqueId = this.idGenerator.generateUniqueId();
        
        const orderData = {
          ...createOrderDto,
          uniqueId,
        };

        this.logger.log(`Creating new order: ${orderData.orderNumber} with uniqueId: ${uniqueId}`);
        return this.orderRepository.create(orderData);
    }

    async findAll(filter: IOrderFilter = {}): Promise<Order[]> {
        const orders = await this.orderRepository.findAll(filter);

        return orders.sort((a, b) => {
          if (a.country === 'Estonia' && b.country !== 'Estonia') return -1;
          if (a.country !== 'Estonia' && b.country === 'Estonia') return 1;
          
          return a.paymentDueDate.getTime() - b.paymentDueDate.getTime();
        });
    }

    async findByUniqueId(uniqueId: string): Promise<Order> {
        const order = await this.orderRepository.findByUniqueId(uniqueId);

        if (!order) {
          this.logger.warn(`Order with unique ID ${uniqueId} not found`);
          throw new NotFoundException(`Order with unique ID ${uniqueId} not found`);
        }

        return order;
    }

    async findByOrderNumber(orderNumber: string): Promise<Order> {
        const order = await this.orderRepository.findByOrderNumber(orderNumber);

        if (!order) {
          this.logger.warn(`Order with number ${orderNumber} not found`);
          throw new NotFoundException(`Order with number ${orderNumber} not found`);
        }

        return order;
    }
}
