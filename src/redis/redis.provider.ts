import { Provider } from "@nestjs/common";
import Redis from "ioredis";

export const RedisProvider:Provider = {
    provide:'REDIS_CLIENT',
    useFactory() {
        const client = new Redis({
            host:'localhost',
            port:6379
        });
        return client;
    },
};