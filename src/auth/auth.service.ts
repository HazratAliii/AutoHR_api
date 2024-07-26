import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { last } from 'rxjs';
import { error } from 'console';
import { SignInAuthDto } from './dto/signin.dto';

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
        message: 'user created successfully',
        data: {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          gmail: newUser.gmail,
        },
      };
    }
  }

  async emailSignup(createAuthDto: CreateAuthDto) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: {
          gmail: createAuthDto.gmail,
        },
      });
      if (userExist) {
        throw new ConflictException('User already exists');
      } else {
        const hash = await bcrypt.hash(createAuthDto.password, 10);
        const newUserObj = {
          first_name: createAuthDto.first_name,
          last_name: createAuthDto.last_name,
          gmail: createAuthDto.gmail,
          password: hash,
        };
        const newUser = await this.prisma.user.create({ data: newUserObj });
        return {
          message: 'user created successfully',
          data: {
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            gmail: newUser.gmail,
          },
        };
      }
    } catch (e) {
      if (e instanceof ConflictException) {
        throw e;
      } else {
        throw new BadRequestException('An error occured while creating user');
      }
    }
  }

  async emailSignin(signinAuthDto: SignInAuthDto) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: {
          gmail: signinAuthDto.gmail,
        },
      });
      console.log('user exist ', userExist);
      if (!userExist) {
        throw new NotFoundException('User not found');
      } else {
        const isMatch = await bcrypt.compare(
          signinAuthDto.password,
          userExist.password,
        );
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        const access_token = await this.generateAccessToken(userExist.id);
        const refresh_token = await this.generateRefreshToken(userExist.id);
        this.saveTokens(userExist.id, access_token, refresh_token);
        return {
          access_token,
          refresh_token,
        };
      }
    } catch (e) {
      if (e instanceof NotFoundException) {
        throw e;
      } else if (e instanceof UnauthorizedException) {
        throw e;
      } else {
        throw new BadRequestException('An error occured while signing in');
      }
    }
  }

  async getNewAccessToken(id: string) {
    const tokenExist = await this.prisma.auth.findUnique({
      where: {
        user_id: id,
      },
    });
    if (tokenExist) {
      const access_token = await this.generateAccessToken(tokenExist.id);
      const refresh_token = await this.generateRefreshToken(tokenExist.id);
      await this.saveTokens(id, access_token, refresh_token);
      return {
        access_token,
      };
    } else {
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
      if (e instanceof NotFoundException) {
        throw e;
      } else {
        throw new BadRequestException(e);
      }
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
