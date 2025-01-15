import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  CreateCouponDto,
  UpdateCouponDto,
  CouponListResponseDto,
} from '../dto/coupon.dto';

@Controller('coupon')
@UseGuards(JwtAuthGuard)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<CouponListResponseDto> {
    return this.couponService.findAll(query);
  }

  @Get('user')
  async getUserCoupons(@CurrentUser() userId: number) {
    return this.couponService.getUserCoupons(userId);
  }

  @Get('valid')
  async getValidCoupons() {
    return this.couponService.getValidCoupons();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.couponService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ) {
    return this.couponService.update(+id, updateCouponDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.couponService.remove(+id);
  }

  @Post('draw')
  async drawCoupon(@CurrentUser() userId: number) {
    return this.couponService.drawCoupon(userId);
  }
}
