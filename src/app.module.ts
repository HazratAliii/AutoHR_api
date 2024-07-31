import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import { MinioService } from './minio/minio.service';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    TeamModule,
    UserModule,
    MinioModule,
  ],
  controllers: [AppController],
  providers: [AppService, MinioService],
})
export class AppModule {}
