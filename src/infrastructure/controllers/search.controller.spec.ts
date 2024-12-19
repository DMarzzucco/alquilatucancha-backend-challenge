import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { SearchController } from './search.controller';
import { ClientService } from '../services/client.service';
import { ZodValidationPipe } from 'nestjs-zod';

describe('SearchController (integration)', () => {
    let app: INestApplication;
    let clientServiceMock: Partial<ClientService>;

    beforeEach(async () => {
        clientServiceMock = {
            searchQuery: jest.fn().mockResolvedValue([
                {
                    clubName: 'Test Club',
                    availability: ['2024-12-20'],
                },
            ]),
        };

        const moduleFixture: TestingModule = await Test.createTestingModule({
            controllers: [SearchController],
            providers: [
                {
                    provide: ClientService,
                    useValue: clientServiceMock,
                },
            ],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ZodValidationPipe());
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('GET /search - debe retornar los clubs disponibles', async () => {

        const query = {
            placeId: 'ChIJW9fXNZNTtpURV6VYAumGQOw',
            date: new Date('2022-08-25T03:00:00.000Z')
        };
        
        await request(app.getHttpServer())
            .get('/search')
            .query({
                    placeId: query.placeId,
                    date: query.date,
            })
            .expect(400);
    });

    it('GET /search - envia un error 400 si el query es invalido', async () => {
        const invalidQuery = {
            placeId: '',
            date: ''
        };
        await request(app.getHttpServer())
            .get('/search')
            .query(invalidQuery)
            .expect(400);
    });
});