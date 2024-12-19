import { GetAvailabilitySchema } from "../validations/GetAvailabilitySchema";
import {createZodDto} from 'nestjs-zod';

export class GetAvailabilityDTO extends createZodDto(GetAvailabilitySchema) {}
