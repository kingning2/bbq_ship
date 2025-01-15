import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { PurchaseService } from '../services/purchase.service';
import { CreatePurchaseDto, PurchaseQueryDto } from '../dto/purchase.dto';

@Controller('purchase')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('business')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    const data = await this.purchaseService.create(createPurchaseDto);
    return {
      code: 200,
      message: '创建成功',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: PurchaseQueryDto) {
    const data = await this.purchaseService.findAll(query);
    return {
      code: 200,
      message: '查询成功',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.purchaseService.remove(+id);
    return {
      code: 200,
      message: '删除成功',
      data,
    };
  }
}
