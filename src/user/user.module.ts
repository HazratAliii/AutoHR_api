import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'prisma/prisma.service';
import { MinioService } from 'src/minio/minio.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, MinioService],
})
export class UserModule {}
