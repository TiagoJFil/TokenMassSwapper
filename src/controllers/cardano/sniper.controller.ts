import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { SniperService } from '../../services/sniper/sniper.service';
import { SniperFilterInputParameters } from './dto/InputDTOs';

@Controller('sniper')
export class SniperController {
  constructor(
    private readonly sniperService: SniperService,
) {}

  @Post('user/:user_id/submit/')
  async submitRequest(
    @Param('user_id') userID: number,
    @Body() parameters: SniperFilterInputParameters,
  ) {
    return await this.sniperService.submitRequest(userID, parameters);
  }

  @Delete('cancel/:requestId')
  async cancelRequest(@Param('requestId') requestId: number) {
    const request = await this.sniperService.cancelRequest(requestId);
    if (!request) {
      throw new Error(`Sniper request with ID ${requestId} not found or already inactive`);
    }
    return { message: `Sniper request with ID ${requestId} has been canceled` };
  }
}

