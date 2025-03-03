import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrdersService } from 'src/modules/orders/services/orders.service';
import { OrderRepository } from 'src/modules/orders/repositories/order.repository';
import { IdGeneratorUtil } from 'src/common/utils/id-generator.utils';
import { CreateOrderDto } from 'src/modules/orders/dtos/create-order.dto';
import { Order } from 'src/modules/orders/entities/order.entity';

// Mock repositories and services
const mockOrderRepository = () => ({
  findByOrderNumber: jest.fn(),
  findByUniqueId: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
});

const mockIdGenerator = () => ({
  generateUniqueId: jest.fn().mockReturnValue('ABC-1234-XYZ'),
});

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: OrderRepository;
  let idGenerator: IdGeneratorUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: OrderRepository,
          useFactory: mockOrderRepository,
        },
        {
          provide: IdGeneratorUtil,
          useFactory: mockIdGenerator,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    repository = module.get<OrderRepository>(OrderRepository);
    idGenerator = module.get<IdGeneratorUtil>(IdGeneratorUtil);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'ORD-123',
        paymentDescription: 'Payment for services',
        streetAddress: '123 Main St',
        town: 'Anytown',
        country: 'Estonia',
        amount: 100.50,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
      };

      const newOrder = {
        id: 'uuid',
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(newOrder);

      // Act
      const result = await service.create(createOrderDto);

      // Assert
      expect(repository.findByOrderNumber).toHaveBeenCalledWith(createOrderDto.orderNumber);
      expect(idGenerator.generateUniqueId).toHaveBeenCalled();
      expect(repository.create).toHaveBeenCalledWith({
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
      });
      expect(result).toEqual(newOrder);
    });

    it('should throw ConflictException if order number already exists', async () => {
      // Arrange
      const createOrderDto: CreateOrderDto = {
        orderNumber: 'ORD-123',
        paymentDescription: 'Payment for services',
        streetAddress: '123 Main St',
        town: 'Anytown',
        country: 'Estonia',
        amount: 100.50,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
      };

      const existingOrder = {
        id: 'existing-uuid',
        ...createOrderDto,
        uniqueId: 'DEF-5678-UVW',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(existingOrder);

      // Act & Assert
      await expect(service.create(createOrderDto)).rejects.toThrow(ConflictException);
      expect(repository.findByOrderNumber).toHaveBeenCalled();
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all orders sorted correctly (Estonia first, then by due date)', async () => {
      // Arrange
      const orders = [
        {
          orderNumber: 'ORD-1',
          uniqueId: 'ABC-1234-XYZ',
          paymentDescription: 'Service A',
          streetAddress: '123 Main St',
          town: 'Tallinn',
          country: 'Estonia',
          amount: 100,
          currency: 'EUR',
          paymentDueDate: new Date('2023-12-15'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          orderNumber: 'ORD-2',
          uniqueId: 'DEF-5678-UVW',
          paymentDescription: 'Service B',
          streetAddress: '456 Oak St',
          town: 'Berlin',
          country: 'Germany',
          amount: 200,
          currency: 'EUR',
          paymentDueDate: new Date('2023-12-10'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          orderNumber: 'ORD-3',
          uniqueId: 'GHI-9012-RST',
          paymentDescription: 'Service C',
          streetAddress: '789 Pine St',
          town: 'Tartu',
          country: 'Estonia',
          amount: 150,
          currency: 'EUR',
          paymentDueDate: new Date('2023-12-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as Order[];

      jest.spyOn(repository, 'findAll').mockResolvedValue(orders);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(repository.findAll).toHaveBeenCalled();
      // Estonia first
      expect(result[0].country).toBe('Estonia');
      expect(result[1].country).toBe('Estonia');
      // Then sorted by payment due date
      expect(result[0].paymentDueDate.getTime()).toBeLessThan(result[1].paymentDueDate.getTime());
      // Non-Estonia countries last
      expect(result[2].country).toBe('Germany');
    });
  });

  describe('findByUniqueId', () => {
    it('should return an order when found by uniqueId', async () => {
      // Arrange
      const order = {
        id: 'uuid',
        orderNumber: 'ORD-123',
        uniqueId: 'ABC-1234-XYZ',
        paymentDescription: 'Payment for services',
        streetAddress: '123 Main St',
        town: 'Anytown',
        country: 'Estonia',
        amount: 100.50,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;

      jest.spyOn(repository, 'findByUniqueId').mockResolvedValue(order);

      // Act
      const result = await service.findByUniqueId('ABC-1234-XYZ');

      // Assert
      expect(repository.findByUniqueId).toHaveBeenCalledWith('ABC-1234-XYZ');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when order not found by uniqueId', async () => {
      // Arrange
      jest.spyOn(repository, 'findByUniqueId').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUniqueId('NON-EXISTENT')).rejects.toThrow(NotFoundException);
      expect(repository.findByUniqueId).toHaveBeenCalled();
    });
  });

  describe('findByOrderNumber', () => {
    it('should return an order when found by orderNumber', async () => {
      // Arrange
      const order = {
        id: 'uuid',
        orderNumber: 'ORD-123',
        uniqueId: 'ABC-1234-XYZ',
        paymentDescription: 'Payment for services',
        streetAddress: '123 Main St',
        town: 'Anytown',
        country: 'Estonia',
        amount: 100.50,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(order);

      // Act
      const result = await service.findByOrderNumber('ORD-123');

      // Assert
      expect(repository.findByOrderNumber).toHaveBeenCalledWith('ORD-123');
      expect(result).toEqual(order);
    });

    it('should throw NotFoundException when order not found by orderNumber', async () => {
      // Arrange
      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByOrderNumber('NON-EXISTENT')).rejects.toThrow(NotFoundException);
      expect(repository.findByOrderNumber).toHaveBeenCalled();
    });
  });
});