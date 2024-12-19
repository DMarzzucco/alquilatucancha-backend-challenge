import { z } from 'nestjs-zod/z';
import { ExternalEventSchema } from "../validations/ExternalEventSchema";

export type ExternalEventDTO = z.infer<typeof ExternalEventSchema>;
