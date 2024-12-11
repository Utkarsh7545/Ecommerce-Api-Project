/* eslint-disable no-empty-function */
/* eslint-disable import/no-extraneous-dependencies */
import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @ApiOperation({ summary: 'Process a new checkout' })
  @ApiResponse({ status: 201, description: 'Checkout processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async processCheckout(@Body() checkoutDto: CheckoutDto) {
    const result = await this.checkoutService.processCheckout(checkoutDto);
    return {
      message: 'Checkout processed successfully',
      data: result,
    };
  }
}
