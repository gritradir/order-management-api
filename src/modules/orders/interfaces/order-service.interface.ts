import { IOrderFilter } from "./order-filter.interface";
import { IOrder } from "./order.interface";

export interface IOrderService {
    create(createOrderData: Omit<IOrder, 'id' | 'uniqueId' | 'createdAt' | 'updatedAt'>): Promise<IOrder>;
    findAll(filter: IOrderFilter): Promise<IOrder[]>;
    findByUniqueId(uniqueId: string): Promise<IOrder>;
    findByOrderNumber(orderNumber: string): Promise<IOrder>;
}