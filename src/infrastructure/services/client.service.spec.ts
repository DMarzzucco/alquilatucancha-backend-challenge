import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus, EventBus } from '@nestjs/cqrs';
import { RedisService } from '../../redis/service/Redis.service';
import {
    SlotBookedEvent,
    SlotAvailableEvent,
    ClubUpdatedEvent,
    CourtUpdatedEvent,
    GetAvailabilityQuery,
} from '../../domain';
import { ExternalEventDTO, GetAvailabilityDTO } from '../DTOs';
import { ClientService } from './client.service';

describe('ClientService', () => {
    let clientService: ClientService;
    let queryBus: QueryBus;
    let eventBus: EventBus;
    let redisService: RedisService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ClientService,
                {
                    provide: QueryBus,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: EventBus,
                    useValue: {
                        publish: jest.fn(),
                    },
                },
                {
                    provide: RedisService,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                    },
                },
            ],
        }).compile();

        clientService = module.get<ClientService>(ClientService);
        queryBus = module.get<QueryBus>(QueryBus);
        eventBus = module.get<EventBus>(EventBus);
        redisService = module.get<RedisService>(RedisService);
    });

    //Test: Verifica que se publique SlotBookedEvent dependiendo del tipo que tenga.
    describe('receive', () => {
        it('debería publicar SlotBookedEvent cuando el tipo sea booking_created', async () => {
            const externalEvent: ExternalEventDTO = {
                type: 'booking_created',
                clubId: 1,
                courtId: 2,
                slot: {
                    price: 20,
                    duration: 60,
                    datetime: '2024-12-18T10:00:00',
                    start: '2024-12-18T10:00:00',
                    end: '2024-12-18T11:00:00',
                    _priority: 1,
                },
            };

            await clientService.receive(externalEvent);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new SlotBookedEvent(externalEvent.clubId, externalEvent.courtId, externalEvent.slot),
            );
        });

        it('debería publicar SlotAvailableEvent cuando el tipo sea booking_cancelled', async () => {
            const externalEvent: ExternalEventDTO = {
                type: 'booking_cancelled',
                clubId: 1,
                courtId: 2,
                slot: {
                    price: 20,
                    duration: 60,
                    datetime: '2024-12-18T10:00:00',
                    start: '2024-12-18T10:00:00',
                    end: '2024-12-18T11:00:00',
                    _priority: 1,
                },
            };

            await clientService.receive(externalEvent);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new SlotAvailableEvent(externalEvent.clubId, externalEvent.courtId, externalEvent.slot),
            );
        });

        it('debería publicar ClubUpdatedEvent cuando el tipo sea club_updated', async () => {
            const externalEvent: ExternalEventDTO = {
                type: 'club_updated',
                clubId: 1,
                fields: ["attributes"],
            };

            await clientService.receive(externalEvent);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new ClubUpdatedEvent(externalEvent.clubId, externalEvent.fields),
            );
        });

        it('debería publicar  CourtUpdatedEvent cuando el tipo sea court_updated', async () => {
            const externalEvent: ExternalEventDTO = {
                type: 'court_updated',
                clubId: 1,
                courtId: 2,
                fields: ["attributes"],
            };

            await clientService.receive(externalEvent);

            expect(eventBus.publish).toHaveBeenCalledWith(
                new CourtUpdatedEvent(externalEvent.clubId, externalEvent.courtId, externalEvent.fields),
            );
        });
    });

    
    describe('searchQuery', () => {
        const query: GetAvailabilityDTO = { placeId: 'place123', date: new Date('2022-08-25T03:00:00.000Z') };
        const cacheKey = `availability:${query.placeId}:${query.date}`;
        
        it('debería devolver el resultado almacenado en caché si está disponible', async () => {
            const cachedData = [{ clubId: 'club123', courts: [] }];
            jest.spyOn(redisService, 'get').mockResolvedValue(JSON.stringify(cachedData));
            const result = await clientService.searchQuery(query);
            expect(redisService.get).toHaveBeenCalledWith(cacheKey);
            expect(result).toEqual(cachedData);
        });

        it('debe buscar y almacenar en caché el resultado si no está en el caché', async () => {
            const fetchedData = [{ clubId: 'club123', courts: [] }];
            jest.spyOn(redisService, 'get').mockResolvedValue(null);
            jest.spyOn(queryBus, 'execute').mockResolvedValue(fetchedData);
            jest.spyOn(redisService, 'set').mockResolvedValue();
            const result = await clientService.searchQuery(query);
            expect(redisService.get).toHaveBeenCalledWith(cacheKey);
            expect(queryBus.execute).toHaveBeenCalledWith(new GetAvailabilityQuery(query.placeId, query.date));
            expect(redisService.set).toHaveBeenCalledWith(cacheKey, JSON.stringify(fetchedData), 3600);
            expect(result).toEqual(fetchedData);
        });
    });
});
