import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EventsController } from './events.controller';
import { ClientService } from '../services/client.service';
import { ZodExceptionFilter } from '../../utils/ZodFilterException';

describe('EventsController (integration)', () => {
    let app: INestApplication;
    let clientServiceMock: Partial<ClientService>;

    beforeEach(async () => {
        clientServiceMock = {
            receive: jest.fn().mockResolvedValue({ success: true }),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: ClientService,
                    useValue: clientServiceMock,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalFilters(new ZodExceptionFilter());
        await app.init();
    });

    afterEach(async () => { await app.close(); });

    it('POST /events - debe manejar eventos externos válidos', async () => {
        const validEvent = {
            "type": "booking_created",
            "clubId": 1,
            "courtId": 2,
            "slot": {
                "price": 20,
                "duration": 60,
                "datetime": "2024-12-18T10:00:00",
                "start": "2024-12-18T10:00:00",
                "end": "2024-12-18T11:00:00",
                "_priority": 1
            }
        };

        const response = await request(app.getHttpServer())
            .post('/events')
            .send(validEvent)
            .expect(201);

        expect(response.body).toEqual({ success: true });

        expect(clientServiceMock.receive).toHaveBeenCalledWith(validEvent);
    });

    it('POST /events - Envia un 400 si el body es invalido', async () => {
        const invalidEvent = {
            type: 'USER_SIGNUP',
            timestamp: 'invalid-timestamp',
            payload: {
                email: 'user@example.com',
            },
        };

        await request(app.getHttpServer())
            .post('/events')
            .send(invalidEvent)
            .expect(400);

    });
});
