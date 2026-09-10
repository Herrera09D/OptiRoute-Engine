import { Injectable, Logger, OnModuleInit, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Redis from 'ioredis';

/**
 * Servicio de caché con Redis
 * 
 * Casos de uso en Routing Engine:
 * - Caché de rutas calculadas (evita recálculos costosos)
 * - Almacenamiento temporal de resultados de algoritmos
 * - Rate limiting de peticiones a la API
 * 
 * TTL por defecto: 24 horas para rutas calculadas
 */
@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis.Redis | null = null;

  constructor(private configService: ConfigService) {}

  /**
   * Inicializa conexión con Redis al arrancar el módulo
   */
  async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * Establece conexión con Redis
   */
  private async connect(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          if (times > 3) return null; // Dejar de reintentar después de 3 intentos
          return Math.min(times * 200, 2000); // Backoff exponencial
        },
      });

      this.client.on('connect', () => {
        this.logger.log('✅ Connected to Redis');
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis error:', err);
      });

      // Test de conexión
      await this.client.ping();
      this.logger.log('📍 Redis ping successful');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      // Reintentar en 5 segundos
      setTimeout(() => this.connect(), 5000);
    }
  }

  /**
   * Guarda un valor en Redis con TTL opcional
   * @param key - Clave del valor
   * @param value - Valor a guardar (string o JSON serializable)
   * @param ttlSeconds - Tiempo de vida en segundos (opcional)
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.client) {
      this.logger.warn('Redis not connected');
      return false;
    }

    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Obtiene un valor desde Redis
   * @param key - Clave del valor
   * @returns El valor o null si no existe
   */
  async get(key: string): Promise<string | null> {
    if (!this.client) {
      this.logger.warn('Redis not connected');
      return null;
    }

    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Elimina una clave de Redis
   * @param key - Clave a eliminar
   */
  async delete(key: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Verifica si una clave existe
   * @param key - Clave a verificar
   */
  async exists(key: string): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking key ${key}:`, error);
      return false;
    }
  }

  /**
   * Limpia todas las claves que coinciden con un patrón
   * @param pattern - Patrón (ej: 'route:*')
   */
  async deleteByPattern(pattern: string): Promise<void> {
    if (!this.client) return;

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Deleted ${keys.length} keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Error deleting keys by pattern ${pattern}:`, error);
    }
  }

  /**
   * Obtiene estadísticas básicas de Redis
   */
  async getInfo(): Promise<{ connected: boolean; dbSize?: number }> {
    if (!this.client) {
      return { connected: false };
    }

    try {
      const dbSize = await this.client.dbsize();
      return {
        connected: true,
        dbSize,
      };
    } catch (error) {
      return { connected: false };
    }
  }

  /**
   * Cierra la conexión con Redis
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.logger.log('Disconnected from Redis');
    }
  }
}

@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
