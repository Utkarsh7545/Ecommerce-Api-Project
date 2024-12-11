/* eslint-disable no-empty-function */
/* eslint-disable import/no-unresolved */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PostgresService } from 'src/ecosystem-services/postgres.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CheckoutModel } from '../data-models/checkout.model';

@Injectable()
export class CheckoutService {
  constructor(private readonly poolClient: PostgresService) {}

  async processCheckout(checkoutDto: CheckoutDto) {
    const { customerId, items, totalPrice, shippingAddress } = checkoutDto;

    const checkoutModel = CheckoutModel.build({
      customerId,
      shippingAddress,
      totalPrice,
      items,
    });

    const user = await checkoutModel.validateAndFetchUser().catch((error) => {
      console.error('Error validating and fetching user:', error);
      throw new HttpException('Error validating user', HttpStatus.BAD_REQUEST);
    });

    await checkoutModel.validateAndFetchProducts().catch((error) => {
      console.error('Error validating and fetching products:', error);
      throw new HttpException(
        'Error validating products',
        HttpStatus.BAD_REQUEST,
      );
    });

    await checkoutModel.save(this.poolClient.pool).catch((error) => {
      console.error('Error saving checkout data:', error);
      throw new HttpException(
        'Error saving checkout data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    await checkoutModel.saveItems(this.poolClient.pool).catch((error) => {
      console.error('Error saving checkout items:', error);
      throw new HttpException(
        'Error saving checkout items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    });

    return {
      message: 'Checkout successful: Order created and stock updated',
      customer: { id: customerId, name: user.name },
      shippingAddress,
      totalPrice,
      items,
    };
  }
}
