import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TrackingOrderItemService } from './tracking-order-item.service';

@ApiTags('Tracking Order Item')
@Controller('tracking-order-items')
@ApiBearerAuth()
export class TrackingOrderItemController {
  constructor(
    private readonly trackingOrderItemService: TrackingOrderItemService,
  ) {}
}
