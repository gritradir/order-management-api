import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Order } from '../entities/order.entity';
import { IOrderRepository } from '../interfaces/order-repository.interface';
import { IOrderFilter } from '../interfaces/order-filter.interface';

@Injectable()
export class OrderRepository implements IOrderRepository {
    constructor(
        @InjectRepository(Order)
        private typeormRepository: Repository<Order>,
    ) {}

    async create(order: Partial<Order>): Promise<Order> {
        const newOrder = this.typeormRepository.create(order);
        return this.typeormRepository.save(newOrder);
    }

    async findAll(filter?: IOrderFilter): Promise<Order[]> {
        const queryOptions: FindManyOptions<Order> = {
        where: {},
        };

        if (filter) {
            if (filter.country) {
                queryOptions.where = {
                ...queryOptions.where,
                country: filter.country,
                };
            }

            if (filter.description) {
                queryOptions.where = {
                ...queryOptions.where,
                paymentDescription: Like(`%${filter.description}%`),
                };
            }
        }

        return this.typeormRepository.find(queryOptions);
    }

    async findByUniqueId(uniqueId: string): Promise<Order | null> {
        return this.typeormRepository.findOne({
        where: { uniqueId },
        });
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        return this.typeormRepository.findOne({
        where: { orderNumber },
        });
    }
}