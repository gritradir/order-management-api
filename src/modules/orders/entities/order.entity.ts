import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { IOrder } from '../interfaces/order.interface';

@Entity('orders')
export class Order implements IOrder {
    @PrimaryColumn()
    @Index()
    orderNumber: string;

    @Column({ unique: true })
    @Index()
    uniqueId: string;

    @Column()
    paymentDescription: string;

    @Column()
    streetAddress: string;

    @Column()
    town: string;

    @Column()
    @Index()
    country: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column('date')
    @Index()
    paymentDueDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}