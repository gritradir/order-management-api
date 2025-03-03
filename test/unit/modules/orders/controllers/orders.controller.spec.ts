import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, HttpStatus, ConflictException, NotFoundException } from '@nestjs/common';
import { OrdersController } from '../../../../../src/modules/orders/controllers/orders.controller';
import { OrdersService } from '../../../../../src/modules/orders/services/orders.service';
import { CreateOrderDto } from '../../../../../src/modules/orders/dtos/create-order.dto';
import { OrderFilterDto } from '../../../../../src/modules/orders/dtos/order-filter.dto';
import { Order } from '../../../../../src/modules/orders/entities/order.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  // Mock service
  const mockOrdersService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByUniqueId: jest.fn(),
    findByOrderNumber: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useFactory: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'ORD-123',
        paymentDescription: 'Test order',
        streetAddress: '123 Test St',
        town: 'Test Town',
        country: 'Estonia',
        amount: 99.99,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
      };

      const createdOrder = {
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;

      jest.spyOn(service, 'create').mockResolvedValue(createdOrder);

      // Act
      const result = await controller.create(createOrderDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createOrderDto);
      expect(result).toEqual(createdOrder);
    });

    it('should handle conflict when order number already exists', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'ORD-123',
        paymentDescription: 'Test order',
        streetAddress: '123 Test St',
        town: 'Test Town',
        country: 'Estonia',
        amount: 99.99,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
      };

      jest.spyOn(service, 'create').mockRejectedValue(
        new ConflictException(`Order with number ${createOrderDto.orderNumber} already exists`)
      );

      // Act & Assert
      await expect(controller.create(createOrderDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all orders when no filter is provided', async () => {
      // Arrange
      const orders = [
        { orderNumber: 'ORD-1', country: 'Estonia' },
        { orderNumber: 'ORD-2', country: 'Finland' },
      ] as Order[];

      jest.spyOn(service, 'findAll').mockResolvedValue(orders);

      // Act
      const result = await controller.findAll({});

      // Assert
      expect(service.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(orders);
    });

    it('should filter orders by country', async () => {
      // Arrange
      const filterDto: OrderFilterDto = { country: 'Estonia' };
      
      const filteredOrders = [
        { orderNumber: 'ORD-1', country: 'Estonia' },
      ] as Order[];

      jest.spyOn(service, 'findAll').mockResolvedValue(filteredOrders);

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(filteredOrders);
    });

    it('should filter orders by description', async () => {
      // Arrange
      const filterDto: OrderFilterDto = { description: 'subscription' };
      
      const filteredOrders = [
        { orderNumber: 'ORD-1', paymentDescription: 'Monthly subscription' },
      ] as Order[];

      jest.spyOn(service, 'findAll').mockResolvedValue(filteredOrders);

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(filteredOrders);
    });

    it('should handle combined filters', async () => {
      // Arrange
      const filterDto: OrderFilterDto = { 
        country: 'Estonia',
        description: 'subscription'
      };
      
      const filteredOrders = [
        { 
          orderNumber: 'ORD-1', 
          country: 'Estonia',
          paymentDescription: 'Monthly subscription'
        },
      ] as Order[];

      jest.spyOn(service, 'findAll').mockResolvedValue(filteredOrders);

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
      expect(result).toEqual(filteredOrders);
    });

    it('should return empty array when no orders match filter', async () => {
      // Arrange
      const filterDto: OrderFilterDto = { country: 'NonExistent' };
      
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findByUniqueId', () => {
    it('should return an order when found by unique ID', async () => {
      // Arrange
      const uniqueId = 'ABC-1234-XYZ';
      const order = { 
        orderNumber: 'ORD-1',
        uniqueId,
      } as Order;

      jest.spyOn(service, 'findByUniqueId').mockResolvedValue(order);

      // Act
      const result = await controller.findByUniqueId(uniqueId);

      // Assert
      expect(service.findByUniqueId).toHaveBeenCalledWith(uniqueId);
      expect(result).toEqual(order);
    });

    it('should handle not found error for unique ID', async () => {
      // Arrange
      const uniqueId = 'NON-EXISTENT';
      
      jest.spyOn(service, 'findByUniqueId').mockRejectedValue(
        new NotFoundException(`Order with unique ID ${uniqueId} not found`)
      );

      // Act & Assert
      await expect(controller.findByUniqueId(uniqueId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrderNumber', () => {
    it('should return an order when found by order number', async () => {
      // Arrange
      const orderNumber = 'ORD-123';
      const order = { 
        orderNumber,
        uniqueId: 'ABC-1234-XYZ',
      } as Order;

      jest.spyOn(service, 'findByOrderNumber').mockResolvedValue(order);

      // Act
      const result = await controller.findByOrderNumber(orderNumber);

      // Assert
      expect(service.findByOrderNumber).toHaveBeenCalledWith(orderNumber);
      expect(result).toEqual(order);
    });

    it('should handle not found error for order number', async () => {
      // Arrange
      const orderNumber = 'NON-EXISTENT';
      
      jest.spyOn(service, 'findByOrderNumber').mockRejectedValue(
        new NotFoundException(`Order with number ${orderNumber} not found`)
      );

      // Act & Assert
      await expect(controller.findByOrderNumber(orderNumber)).rejects.toThrow(NotFoundException);
    });
  });

  // Handle edge cases
  describe('edge cases', () => {
    it('should handle orders with special characters in description', async () => {
      // Arrange
      const filterDto: OrderFilterDto = { description: 'special&!@#' };
      
      jest.spyOn(service, 'findAll').mockResolvedValue([]);

      // Act
      const result = await controller.findAll(filterDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filterDto);
    });

    it('should handle orders with special characters in order number', async () => {
      // Arrange
      const orderNumber = 'ORDER#123!@';
      
      jest.spyOn(service, 'findByOrderNumber').mockRejectedValue(
        new NotFoundException(`Order with number ${orderNumber} not found`)
      );

      // Act & Assert
      await expect(controller.findByOrderNumber(orderNumber)).rejects.toThrow(NotFoundException);
      expect(service.findByOrderNumber).toHaveBeenCalledWith(orderNumber);
    });
  });
});
