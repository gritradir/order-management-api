import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../../src/app.module';
import { Order } from '../../src/modules/orders/entities/order.entity';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;
  let orderRepository: Repository<Order>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    orderRepository = moduleFixture.get<Repository<Order>>(getRepositoryToken(Order));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean the repository before each test
    await orderRepository.clear();
  });

  describe('/orders (POST)', () => {
    it('should create a new order', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-TEST-001',
          paymentDescription: 'E2E Test Order',
          streetAddress: '123 Test St',
          town: 'Test Town',
          country: 'Estonia',
          amount: 99.99,
          currency: 'EUR',
          paymentDueDate: '2023-12-31',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.orderNumber).toEqual('E2E-TEST-001');
          expect(res.body.uniqueId).toBeDefined();
          expect(res.body.country).toEqual('Estonia');
        });
    });

    it('should reject duplicate order numbers', async () => {
      // First create an order
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-TEST-002',
          paymentDescription: 'First Test Order',
          streetAddress: '123 Test St',
          town: 'Test Town',
          country: 'Estonia',
          amount: 99.99,
          currency: 'EUR',
          paymentDueDate: '2023-12-31',
        })
        .expect(201);

      // Try to create another with same order number
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-TEST-002', // Same order number
          paymentDescription: 'Second Test Order',
          streetAddress: '456 Test Ave',
          town: 'Test City',
          country: 'Latvia',
          amount: 199.99,
          currency: 'EUR',
          paymentDueDate: '2023-12-31',
        })
        .expect(409) // Conflict
        .expect(res => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject invalid input data', () => {
      return request(app.getHttpServer())
        .post('/orders')
        .send({
          // Missing required fields
          orderNumber: 'E2E-TEST-003',
          // Missing paymentDescription
          streetAddress: '123 Test St',
          // Missing other fields
        })
        .expect(400)
        .expect(res => {
          expect(res.body.message).toBeInstanceOf(Array);
          expect(res.body.error).toBe('Bad Request');
        });
    });
  });

  describe('/orders (GET)', () => {
    beforeEach(async () => {
      // Seed with test data
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-EST-001',
          paymentDescription: 'Monthly Subscription',
          streetAddress: '123 Tallinn St',
          town: 'Tallinn',
          country: 'Estonia',
          amount: 99.99,
          currency: 'EUR',
          paymentDueDate: '2023-01-15',
        });

      await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-EST-002',
          paymentDescription: 'Annual Subscription',
          streetAddress: '456 Tartu St',
          town: 'Tartu',
          country: 'Estonia',
          amount: 199.99,
          currency: 'EUR',
          paymentDueDate: '2023-01-05',
        });

      await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-FIN-001',
          paymentDescription: 'Product Purchase',
          streetAddress: '789 Helsinki St',
          town: 'Helsinki',
          country: 'Finland',
          amount: 299.99,
          currency: 'EUR',
          paymentDueDate: '2023-01-10',
        });
    });

    it('should return all orders sorted correctly (Estonia first, then by due date)', () => {
      return request(app.getHttpServer())
        .get('/orders')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveLength(3);
          // First two should be Estonia
          expect(res.body[0].country).toEqual('Estonia');
          expect(res.body[1].country).toEqual('Estonia');
          // Third should be Finland
          expect(res.body[2].country).toEqual('Finland');
          
          // Estonia orders should be sorted by payment due date
          expect(new Date(res.body[0].paymentDueDate).getTime())
            .toBeLessThan(new Date(res.body[1].paymentDueDate).getTime());
        });
    });

    it('should filter orders by country', () => {
      return request(app.getHttpServer())
        .get('/orders?country=Finland')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].country).toEqual('Finland');
        });
    });

    it('should filter orders by description (partial match)', () => {
      return request(app.getHttpServer())
        .get('/orders?description=Subscription')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveLength(2);
          // Both should contain "Subscription" in description
          expect(res.body[0].paymentDescription).toContain('Subscription');
          expect(res.body[1].paymentDescription).toContain('Subscription');
        });
    });

    it('should apply combined filters', () => {
      return request(app.getHttpServer())
        .get('/orders?country=Estonia&description=Annual')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveLength(1);
          expect(res.body[0].country).toEqual('Estonia');
          expect(res.body[0].paymentDescription).toContain('Annual');
        });
    });

    it('should return empty array when no orders match filters', () => {
      return request(app.getHttpServer())
        .get('/orders?country=Latvia')
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveLength(0);
        });
    });
  });

  describe('/orders/unique/:id (GET)', () => {
    let uniqueId: string;
    
    beforeEach(async () => {
      // Create order and capture its uniqueId
      const response = await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-UNIQUE-001',
          paymentDescription: 'Test Unique ID',
          streetAddress: '123 Test St',
          town: 'Test Town',
          country: 'Estonia',
          amount: 99.99,
          currency: 'EUR',
          paymentDueDate: '2023-12-31',
        });
      
      uniqueId = response.body.uniqueId;
    });

    it('should find order by unique ID', () => {
      return request(app.getHttpServer())
        .get(`/orders/unique/${uniqueId}`)
        .expect(200)
        .expect(res => {
          expect(res.body.uniqueId).toEqual(uniqueId);
          expect(res.body.orderNumber).toEqual('E2E-UNIQUE-001');
        });
    });

    it('should return 404 when order not found by unique ID', () => {
      return request(app.getHttpServer())
        .get('/orders/unique/NON-EXISTENT-ID')
        .expect(404)
        .expect(res => {
          expect(res.body.message).toContain('not found');
        });
    });
  });

  describe('/orders/number/:orderNumber (GET)', () => {
    beforeEach(async () => {
      // Create test order
      await request(app.getHttpServer())
        .post('/orders')
        .send({
          orderNumber: 'E2E-NUMBER-001',
          paymentDescription: 'Test Order Number',
          streetAddress: '123 Test St',
          town: 'Test Town',
          country: 'Estonia',
          amount: 99.99,
          currency: 'EUR',
          paymentDueDate: '2023-12-31',
        });
    });

    it('should find order by order number', () => {
      return request(app.getHttpServer())
        .get('/orders/number/E2E-NUMBER-001')
        .expect(200)
        .expect(res => {
          expect(res.body.orderNumber).toEqual('E2E-NUMBER-001');
        });
    });

    it('should return 404 when order not found by order number', () => {
      return request(app.getHttpServer())
        .get('/orders/number/NON-EXISTENT')
        .expect(404)
        .expect(res => {
          expect(res.body.message).toContain('not found');
        });
    });
  });
});