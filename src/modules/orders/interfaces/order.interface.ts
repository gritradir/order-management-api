export interface IOrder {
    orderNumber: string;
    uniqueId: string;
    paymentDescription: string;
    streetAddress: string;
    town: string;
    country: string;
    amount: number;
    currency: string;
    paymentDueDate: Date;
    createdAt: Date;
    updatedAt: Date;
}