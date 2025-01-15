import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  Put,
} from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/order.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Request } from 'express';
import { Roles } from '../decorators/roles.decorator';
import { OrderStatus } from '../entities/order.entity';
import { RolesGuard } from '../guards/roles.guard';

interface AuthRequest extends Request {
  user: { id: number; [key: string]: any };
}

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: AuthRequest,
  ) {
    return this.orderService.create(createOrderDto, req.user.id);
  }

  @Get()
  async getUserOrders(@Req() req: AuthRequest, @Query() query: any) {
    return this.orderService.findByUserId(req.user.id, query);
  }

  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: number, @Req() req: AuthRequest) {
    return this.orderService.cancelOrder(id, req.user.id);
  }

  @Get('business')
  @Roles('business')
  async getBusinessOrders(@Query() query: any) {
    return this.orderService.findBusinessOrders(query);
  }

  @Put(':id/status')
  @Roles('business')
  async updateOrderStatus(
    @Param('id') id: number,
    @Body() updateStatusDto: { status: OrderStatus },
  ) {
    return this.orderService.updateStatus(id, updateStatusDto.status);
  }
}
