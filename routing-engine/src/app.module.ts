import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphNode } from './entities/graph-node.entity';
import { GraphEdge } from './entities/graph-edge.entity';
import { GraphLoaderModule } from './routes/graph-loader.module';
import { RedisModule } from './redis/redis.service';
import { RoutesController } from './routes/routes.controller';
import { RoutesService } from './routes/routes.service';
import { AStarService } from './algorithms/astar.service';
import { NearestNeighborService } from './algorithms/nearest-neighbor.service';
import { DijkstraService } from './algorithms/dijkstra.service';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeORM para PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'optiroute_routing'),
        entities: [GraphNode, GraphEdge],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    // Módulos de características
    GraphLoaderModule,
    RedisModule,
  ],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    AStarService,
    NearestNeighborService,
    DijkstraService,
  ],
})
export class AppModule {}
