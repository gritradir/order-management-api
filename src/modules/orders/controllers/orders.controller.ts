import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Query, 
    Param, 
    UsePipes, 
    ValidationPipe, 
    HttpStatus, 
    HttpCode,
    Logger
  } from '@nestjs/common';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiParam } from '@nestjs/swagger';
  import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../entities/order.entity';
import { OrderFilterDto } from '../dtos/order-filter.dto';
  
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(private readonly orderService: OrdersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(new ValidationPipe({ transform: true }))
    @ApiOperation({ summary: 'Create a new order' })
    @ApiBody({ type: CreateOrderDto })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully', type: Order })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' })
    @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Order number already exists' })
    async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
        this.logger.log(`Creating order: ${createOrderDto.orderNumber}`);
        return this.orderService.create(createOrderDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all orders with optional filtering' })
    @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
    @ApiQuery({ name: 'description', required: false, description: 'Filter by description (partial match)' })
    @ApiResponse({ status: HttpStatus.OK, description: 'List of orders', type: [Order] })
    async findAll(@Query() filterDto: OrderFilterDto): Promise<Order[]> {
        this.logger.log(`Getting orders with filters: ${JSON.stringify(filterDto)}`);
        return this.orderService.findAll(filterDto);
    }

    @Get('unique/:id')
    @ApiOperation({ summary: 'Get order by unique ID' })
    @ApiParam({ name: 'id', description: 'Unique ID of the order' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order found', type: Order })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async findByUniqueId(@Param('id') id: string): Promise<Order> {
        this.logger.log(`Getting order by unique ID: ${id}`);
        return this.orderService.findByUniqueId(id);
    }

    @Get('number/:orderNumber')
    @ApiOperation({ summary: 'Get order by order number' })
    @ApiParam({ name: 'orderNumber', description: 'Order number' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Order found', type: Order })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
    async findByOrderNumber(@Param('orderNumber') orderNumber: string): Promise<Order> {
        this.logger.log(`Getting order by order number: ${orderNumber}`);
        return this.orderService.findByOrderNumber(orderNumber);
    }
}