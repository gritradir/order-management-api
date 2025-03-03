import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrdersService } from '../../../../../src/modules/orders/services/orders.service';
import { OrderRepository } from '../../../../../src/modules/orders/repositories/order.repository';
import { IdGeneratorUtil } from '../../../../../src/common/utils/id-generator.utils';
import { CreateOrderDto } from '../../../../../src/modules/orders/dtos/create-order.dto';
import { Order } from '../../../../../src/modules/orders/entities/order.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let repository: OrderRepository;
  let idGenerator: IdGeneratorUtil;

  // Enhanced mock repository with behavior verification capabilities
  const mockOrderRepository = () => ({
    findByOrderNumber: jest.fn(),
    findByUniqueId: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  });

  const mockIdGenerator = () => ({
    generateUniqueId: jest.fn().mockReturnValue('ABC-1234-XYZ'),
  });

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

  describe('create', () => {
    it('should verify order number uniqueness before creating', async () => {
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

      // Act
      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);
      try {
        await service.create(createOrderDto);
      } catch (e) {}

      // Assert
      expect(repository.findByOrderNumber).toHaveBeenCalledWith(createOrderDto.orderNumber);
    });

    it('should throw ConflictException with detailed message when order number exists', async () => {
      // Arrange
      const existingOrderNumber = 'EXISTING-123';
      const createOrderDto: CreateOrderDto = {
        orderNumber: existingOrderNumber,
        paymentDescription: 'Payment for services',
        streetAddress: '123 Main St',
        town: 'Anytown',
        country: 'Estonia',
        amount: 100.50,
        currency: 'EUR',
        paymentDueDate: new Date('2023-12-31'),
      };

      const existingOrder = {
        orderNumber: existingOrderNumber,
        uniqueId: 'DEF-5678-UVW',
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(existingOrder);

      // Act & Assert
      await expect(service.create(createOrderDto)).rejects.toThrow(
        new ConflictException(`Order with number ${existingOrderNumber} already exists`)
      );
    });

    it('should generate unique ID when creating new order', async () => {
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
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(newOrder);

      // Act
      await service.create(createOrderDto);

      // Assert
      expect(idGenerator.generateUniqueId).toHaveBeenCalled();
    });

    it('should pass correct data to repository when creating order', async () => {
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
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
      } as Order;

      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockResolvedValue(newOrder);

      // Act
      await service.create(createOrderDto);

      // Assert
      expect(repository.create).toHaveBeenCalledWith({
        ...createOrderDto,
        uniqueId: 'ABC-1234-XYZ',
      });
    });
  });

  describe('findAll - integrating repository behavior', () => {
    it('should apply filters correctly to repository calls', async () => {
      // Arrange
      const filter = { country: 'Estonia', description: 'subscription' };
      const mockResults = [
        { orderNumber: 'ORD-1', country: 'Estonia', paymentDueDate: new Date('2023-01-10') },
      ] as Order[];

      jest.spyOn(repository, 'findAll').mockResolvedValue(mockResults);

      // Act
      await service.findAll(filter);

      // Assert
      expect(repository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should handle database-specific edge cases properly', async () => {
      // Arrange - testing with empty result to simulate empty database
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      // Act
      const result = await service.findAll({ country: 'NonExistent' });

      // Assert
      expect(result).toEqual([]);
      expect(repository.findAll).toHaveBeenCalledWith({ country: 'NonExistent' });
    });

    it('should correctly sort returned data regardless of repository order', async () => {
      // Arrange - return data in unsorted order from repository
      const unsortedData = [
        {
          orderNumber: 'ORD-1',
          country: 'Finland',
          paymentDueDate: new Date('2023-01-10'),
        },
        {
          orderNumber: 'ORD-2',
          country: 'Estonia',
          paymentDueDate: new Date('2023-01-20'),
        },
        {
          orderNumber: 'ORD-3',
          country: 'Estonia',
          paymentDueDate: new Date('2023-01-05'),
        },
      ] as Order[];

      jest.spyOn(repository, 'findAll').mockResolvedValue(unsortedData);

      // Act
      const result = await service.findAll();

      // Assert
      // First two should be Estonia
      expect(result[0].country).toBe('Estonia');
      expect(result[1].country).toBe('Estonia');
      // Last should be Finland
      expect(result[2].country).toBe('Finland');
      
      // Estonia orders should be sorted by payment due date
      expect(result[0].paymentDueDate.getTime()).toBeLessThan(result[1].paymentDueDate.getTime());
    });
  });

  describe('findByUniqueId', () => {
    it('should throw NotFoundException with descriptive message when uniqueId not found', async () => {
      // Arrange
      const nonExistentId = 'NON-EXISTENT';
      jest.spyOn(repository, 'findByUniqueId').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUniqueId(nonExistentId)).rejects.toThrow(
        new NotFoundException(`Order with unique ID ${nonExistentId} not found`)
      );
    });

    it('should handle potential injection and sanitize uniqueId input', async () => {
      // Arrange
      const potentiallyDangerousId = 'ABC\'; DROP TABLE orders; --';
      jest.spyOn(repository, 'findByUniqueId').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUniqueId(potentiallyDangerousId)).rejects.toThrow(NotFoundException);
      
      // Check that the repository call is made with exactly the same string
      // This verifies that our service passes the raw uniqueId to the repository
      // and relies on TypeORM's parameter binding for security
      expect(repository.findByUniqueId).toHaveBeenCalledWith(potentiallyDangerousId);
    });
  });

  describe('findByOrderNumber', () => {
    it('should throw NotFoundException with descriptive message when orderNumber not found', async () => {
      // Arrange
      const nonExistentNumber = 'NON-EXISTENT';
      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByOrderNumber(nonExistentNumber)).rejects.toThrow(
        new NotFoundException(`Order with number ${nonExistentNumber} not found`)
      );
    });

    it('should handle potential injection and sanitize orderNumber input', async () => {
      // Arrange
      const potentiallyDangerousNumber = 'ORD\'; DROP TABLE orders; --';
      jest.spyOn(repository, 'findByOrderNumber').mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByOrderNumber(potentiallyDangerousNumber)).rejects.toThrow(NotFoundException);
      
      // Check that the repository call is made with exactly the same string
      expect(repository.findByOrderNumber).toHaveBeenCalledWith(potentiallyDangerousNumber);
    });
  });

  describe('Service-specific business logic', () => {
    it('should perform custom sorting even with large datasets', async () => {
      // Arrange - simulate a large dataset with mixed countries and dates
      const largeDataset = Array(100).fill(null).map((_, index) => ({
        orderNumber: `ORD-${index}`,
        country: index % 3 === 0 ? 'Estonia' : (index % 3 === 1 ? 'Finland' : 'Latvia'),
        paymentDueDate: new Date(2023, 0, index % 31 + 1), // Dates across January
      })) as Order[];

      jest.spyOn(repository, 'findAll').mockResolvedValue(largeDataset);

      // Act
      const result = await service.findAll();

      // Assert
      // Check that all Estonia orders come first
      let lastEstoniaIndex = -1;
      let firstNonEstoniaIndex = -1;
      
      for (let i = 0; i < result.length; i++) {
        if (result[i].country === 'Estonia') {
          lastEstoniaIndex = i;
        } else if (firstNonEstoniaIndex === -1) {
          firstNonEstoniaIndex = i;
        }
      }
      
      // All Estonia entries should come before any non-Estonia entries
      expect(lastEstoniaIndex).toBeLessThan(firstNonEstoniaIndex);
      
      // Check date ordering within each country group
      let prevDateEstonia = new Date(0); // Start with earliest possible date
      let prevDateOther = new Date(0);
      
      for (let i = 0; i < result.length; i++) {
        if (result[i].country === 'Estonia') {
          expect(result[i].paymentDueDate.getTime()).toBeGreaterThanOrEqual(prevDateEstonia.getTime());
          prevDateEstonia = result[i].paymentDueDate;
        } else {
          expect(result[i].paymentDueDate.getTime()).toBeGreaterThanOrEqual(prevDateOther.getTime());
          prevDateOther = result[i].paymentDueDate;
        }
      }
    });

    it('should handle empty string filter values appropriately', async () => {
      // Arrange
      const filter = { country: '', description: '' };
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      // Act
      await service.findAll(filter);

      // Assert - check if it treats empty strings as valid filters or ignores them
      expect(repository.findAll).toHaveBeenCalledWith(filter);
    });

    it('should handle null or undefined filter values appropriately', async () => {
      // Arrange
      const filter = { country: undefined, description: undefined };
      jest.spyOn(repository, 'findAll').mockResolvedValue([]);

      // Act
      await service.findAll(filter);

      // Assert - check if it properly handles null/undefined values
      expect(repository.findAll).toHaveBeenCalledWith(filter);
    });
  });
});