import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // Public Methods

  async create(createAuthDto: CreateAuthDto) {
    return `This action returns all auth`;
  }

  async googleAuthRedirect(req) {
    const { id, email, firstName, lastName, picture } = req.user;

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
      const access_token = await this.generateAccessToken(existingUser.id);
      const refresh_token = await this.generateRefreshToken(existingUser.id);
      this.saveTokens(existingUser.id, access_token, refresh_token);
      return {
        access_token,
        refresh_token,
      };
    } else {
      const newUser = {
        gmail: req.user.email,
        first_name: req.user.firstName,
        last_name: req.user.lastName,
        picture: req.user.picture,
      };

      const createdUser = await this.prisma.user.create({
        data: newUser,
      });

      return {
        message: 'User signed up',
        // user: req.user,
      };
    }
  }

  async getNewAccessToken(id: string, refreshToken: string) {
    const tokenExist = await this.prisma.auth.findUnique({
      where: {
        user_id: id,
      },
    });
    if (tokenExist) {
      console.log(refreshToken, ' AND ', tokenExist.refresh_token);
      if (refreshToken == tokenExist.refresh_token) {
        const access_token = await this.generateAccessToken(tokenExist.id);
        const refresh_token = await this.generateRefreshToken(tokenExist.id);
        await this.saveTokens(id, access_token, refresh_token);
        return {
          access_token: access_token,
        };
      } else {
        console.log('Inside nested else');
        throw new BadRequestException();
      }
    } else {
      console.log('Inside else');
      throw new NotFoundException('Token not found');
    }
  }

  async getTokens(id: string) {
    try {
      const tokenExists = await this.prisma.auth.findUnique({
        where: { user_id: id },
      });
      if (tokenExists) {
        return {
          accessToken: tokenExists.access_token,
          refreshToken: tokenExists.refresh_token,
        };
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

  // Private Methods

  private async generateAccessToken(id: string) {
    return await this.jwtService.signAsync({ id });
  }

  private async generateRefreshToken(id: string) {
    const salt = await bcrypt.genSalt(10);
    const token = await bcrypt.hash(id, salt);
    return token;
  }

  private async saveTokens(
    id: string,
    accessToken: string,
    refreshToken: string,
  ) {
    try {
      return await this.prisma.auth.upsert({
        where: { user_id: id },
        update: { access_token: accessToken, refresh_token: refreshToken },
        create: {
          user_id: id,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
      });
      console.log('done saeing');
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
