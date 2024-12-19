import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    /**
     * Crea una instancia de RedisService.
     * @param redis 
     */
    constructor(
        @Inject('REDIS_CLIENT') private readonly redis: Redis
    ) { }

    /**
     * Establece un valor en Redis con un tiempo de vida (TTL).
     * 
     * @param key - La clave bajo la cual se almacenará el valor.
     * @param value - El valor que se almacenará.
     * @param ttl - Tiempo de vida en segundos (por defecto 3600 segundos).
     * @returns Una promesa que se resuelve cuando el valor se ha establecido correctamente.
     */
    async set(key: string, value: string, ttl: number = 3600): Promise<void> {
        await this.redis.setex(key, ttl, value);
    }

    /**
     * Obtiene un valor de Redis utilizando una clave específica.
     * 
     * @param key - La clave del valor a recuperar.
     * @returns Una promesa que se resuelve con el valor almacenado o `null` si la clave no existe.
     */
    async get(key: string): Promise<string | null> {
        const result = await this.redis.get(key);
        return result ? result : null;
    }

    /**
     * Elimina una clave y su valor asociado de Redis.
     * 
     * @param key - La clave del valor a eliminar.
     * @returns Una promesa que se resuelve cuando la clave se ha eliminado correctamente.
     */
    async del(key: string): Promise<void> {
        await this.redis.del(key);
    }
}