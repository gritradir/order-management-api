import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, Raw } from 'typeorm';
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
        const queryBuilder = this.typeormRepository.createQueryBuilder('order');
        
        if (filter) {
            if (filter.country) {
                queryBuilder.andWhere('order.country = :country', { 
                    country: filter.country 
                });
            }

            if (filter.description) {
                queryBuilder.andWhere('order.paymentDescription LIKE :description', { 
                    description: `%${filter.description}%` 
                });
            }
        }
        
        queryBuilder.orderBy(
            'CASE WHEN order.country = :priorityCountry THEN 0 ELSE 1 END',
            'ASC'
        )
        .addOrderBy('order.paymentDueDate', 'ASC')
        .setParameter('priorityCountry', 'Estonia');
        
        return queryBuilder.getMany();
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