import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.stragety';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { IsValid } from './auth.guard';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      // signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, PrismaService, IsValid],
})
export class AuthModule {}
