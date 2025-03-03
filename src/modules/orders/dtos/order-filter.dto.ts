import { ApiPropertyOptional } from '@nestjs/swagger';
import { IOrderFilter } from '../interfaces/order-filter.interface';

export class OrderFilterDto implements IOrderFilter {
    @ApiPropertyOptional({
        description: 'Filter by country',
        example: 'Estonia'
    })
    country?: string;

    @ApiPropertyOptional({
        description: 'Filter by description (partial match)',
        example: 'subscription'
    })
    description?: string;
}