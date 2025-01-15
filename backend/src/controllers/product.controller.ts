import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { ProductService } from '../services/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from '../dto/product.dto';

@Controller('product')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('business')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const data = await this.productService.create(createProductDto);
    return {
      code: 200,
      message: '创建成功',
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const data = await this.productService.update(id, updateProductDto);
    return {
      code: 200,
      message: '更新成功',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.remove(id);
    return {
      code: 200,
      message: '删除成功',
      data,
    };
  }

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    const data = await this.productService.findAll(query);
    return {
      code: 200,
      message: '获取成功',
      data,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.productService.findOne(id);
    return {
      code: 200,
      message: '获取成功',
      data,
    };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: 'on' | 'off',
  ) {
    const data = await this.productService.updateStatus(id, status);
    return {
      code: 200,
      message: '更新成功',
      data,
    };
  }

  @Patch(':id/hot')
  async updateHot(
    @Param('id', ParseIntPipe) id: number,
    @Body('isHot') isHot: boolean,
  ) {
    const data = await this.productService.updateHot(id, isHot);
    return {
      code: 200,
      message: '更新成功',
      data,
    };
  }
}
