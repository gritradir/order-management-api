import { IOrderFilter } from "./order-filter.interface";
import { IOrder } from "./order.interface";

export interface IOrderRepository {
    create(order: Partial<IOrder>): Promise<IOrder>;
    findAll(filter?: IOrderFilter): Promise<IOrder[]>;
    findByUniqueId(uniqueId: string): Promise<IOrder | null>;
    findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
}