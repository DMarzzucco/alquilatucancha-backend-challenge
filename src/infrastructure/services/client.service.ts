import { Injectable } from "@nestjs/common";
import { EventBus, QueryBus } from "@nestjs/cqrs";
import { SlotBookedEvent, SlotAvailableEvent, ClubUpdatedEvent, CourtUpdatedEvent, ClubWithAvailability, GetAvailabilityQuery } from "../../domain";
import { ExternalEventDTO, GetAvailabilityDTO } from "../DTOs";
import { RedisService } from "../../redis/service/Redis.service";

@Injectable()
export class ClientService {
    /**
     * ClientService.
     * @param queryBus - Manejador para ejecutar consultas.
     * @param eventBus - Bus para publicar eventos.
     * @param redisService - Servicio para interactuar con Redis como sistema de almacenamiento en caché.
     */
    constructor(
        private queryBus: QueryBus,
        private eventBus: EventBus,
        private redisService: RedisService
    ) { }

    /**
     * Procesa eventos externos y publica eventos correspondientes en el EventBus.
     * 
     * @param externalEvent - El evento externo recibido.
     * @throws Error si el tipo del evento no es reconocido.
     */
    public async receive(externalEvent: ExternalEventDTO) {
        switch (externalEvent.type) {
            case 'booking_created':
                this.eventBus.publish(
                    new SlotBookedEvent(
                        externalEvent.clubId,
                        externalEvent.courtId,
                        externalEvent.slot,
                    ),
                );
                break;
            case 'booking_cancelled':
                this.eventBus.publish(
                    new SlotAvailableEvent(
                        externalEvent.clubId,
                        externalEvent.courtId,
                        externalEvent.slot,
                    ),
                );
                break;
            case 'club_updated':
                this.eventBus.publish(
                    new ClubUpdatedEvent(externalEvent.clubId, externalEvent.fields),
                );
                break;
            case 'court_updated':
                this.eventBus.publish(
                    new CourtUpdatedEvent(
                        externalEvent.clubId,
                        externalEvent.courtId,
                        externalEvent.fields,
                    ),
                );
                break;
        }
    }
    /**
     * Busca la disponibilidad de clubes en una fecha específica.
     * @param query 
     * @returns Una lista de clubes con disponibilidad.
     */
    public async searchQuery(query: GetAvailabilityDTO): Promise<ClubWithAvailability[]> {
        const cacheKey = `availability:${query.placeId}:${query.date}`;
        const cachedResult = await this.redisService.get(cacheKey);

        if (cachedResult) {
            return JSON.parse(cachedResult);
        }

        const result = await this.queryBus.execute(new GetAvailabilityQuery(query.placeId, query.date));

        await this.redisService.set(cacheKey, JSON.stringify(result), 3600);
        return result;
    }
}