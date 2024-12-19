import { Body, Controller, Post } from '@nestjs/common';
import { UseZodGuard } from 'nestjs-zod';

import { ExternalEventSchema } from '../validations/ExternalEventSchema';
import { ExternalEventDTO } from '../DTOs';
import { ClientService } from '../services/client.service';

@Controller('events')
export class EventsController {

  constructor(private service: ClientService) { }

  @Post()
  @UseZodGuard('body', ExternalEventSchema)
  async receiveEvent(@Body() externalEvent: ExternalEventDTO) {
    return await this.service.receive(externalEvent);
  }
}
