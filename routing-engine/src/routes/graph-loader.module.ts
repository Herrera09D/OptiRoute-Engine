import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphNode } from '../entities/graph-node.entity';
import { GraphEdge } from '../entities/graph-edge.entity';
import { GraphLoaderService } from './graph-loader.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([GraphNode, GraphEdge]),
  ],
  providers: [GraphLoaderService],
  exports: [GraphLoaderService],
})
export class GraphLoaderModule {}
