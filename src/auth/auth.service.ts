import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return `This action returns all auth`;
  }

  async googleAuthRedirect(req) {
    const { id, email, first_name, last_name, access_token } = req.user;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        gmail: email,
      },
    });

    if (existingUser) {
      const temp = {
        userinfo: req.user,
        id: existingUser.id,
      };
      return {
        access_token: await this.jwtService.signAsync(temp),
      };
    } else {
      const newUser = {
        gmail: req.user.email,
        first_name: req.user.firstName,
        last_name: req.user.lastName,
        picture: req.user.picture,
      };

      const createdUser = await this.prisma.user.create({
        // @ts-ignore
        data: newUser,
      });

      return {
        message: 'User signed up',
        user: req.user,
      };
    }
  }
  async saveTokens(id: string, accessToken: string, refreshToken: string) {
    try {
      return this.prisma.auth.upsert({
        where: { user_id: id },
        update: { access_token: accessToken, refresh_token: refreshToken },
        create: {
          user_id: id,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async getTokens(id: string) {
    try {
      const tokenExists = await this.prisma.auth.findUnique({
        where: { user_id: id },
      });
      if (tokenExists) {
        return tokenExists;
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async deleteTokens(id: string) {
    try {
      const tokenExists = await this.prisma.auth.findUnique({
        where: { user_id: id },
      });
      if (tokenExists) {
        return await this.prisma.auth.delete({
          where: {
            user_id: id,
          },
        });
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
