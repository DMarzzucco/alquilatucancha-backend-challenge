import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { ClubWithAvailability, } from '../../domain';
import { GetAvailabilityDTO } from '../DTOs';
import { ClientService } from '../services/client.service';

@Controller('search')
export class SearchController {
  constructor(private service: ClientService) { }

  @Get()
  @UsePipes(ZodValidationPipe)
  public async searchAvailability(@Query() query: GetAvailabilityDTO): Promise<ClubWithAvailability[]> {
    return await this.service.searchQuery(query)
  }
}
