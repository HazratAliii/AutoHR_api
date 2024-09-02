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
import { last, noop } from 'rxjs';
import { error } from 'console';
import { SignInAuthDto } from './dto/signin.dto';
import { Response, Request } from 'express';

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

  async googleAuthRedirect(req, res) {
    const { email } = req.user;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        gmail: email,
      },
    });

    if (existingUser) {
      const access_token = await this.generateAccessToken(existingUser.id);
      const refresh_token = await this.generateRefreshToken(existingUser.id);
      this.saveTokens(existingUser.id, refresh_token);

      res.cookie('refresh_token', refresh_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });

      res.cookie('access_token', access_token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      const retObj = {
        acces_token: access_token,
        id: existingUser.id,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        image: existingUser.picture,
      };
      return res.json(retObj);
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

  async emailSignin(signinAuthDto: SignInAuthDto, res: Response) {
    try {
      const userExist = await this.prisma.user.findUnique({
        where: {
          gmail: signinAuthDto.gmail,
        },
      });
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
        this.saveTokens(userExist.id, refresh_token);
        res.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          domain: '.auto.hr.arisaftech.com',
          path: '/',
          maxAge: 24 * 7 * 60 * 60 * 1000,
        });
        res.cookie('access_token', access_token, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          domain: '.auto.hr.arisaftech.com',
          path: '/',
          maxAge: 60 * 60 * 1000,
        });

        const retObj = {
          access_token: access_token,
          id: userExist.id,
          first_name: userExist.first_name,
          last_name: userExist.last_name,
          image: userExist.picture,
        };
        return res.json(retObj);
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

  async getNewAccessToken(req: Request) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }

      const tokenExists = await this.prisma.auth.findUnique({
        // @ts-ignore
        where: {
          refresh_token: refreshToken,
        },
      });

      if (!tokenExists) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const isMatch = await bcrypt.compare(tokenExists.user_id, refreshToken);

      if (!isMatch) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = await this.generateAccessToken(tokenExists.id);

      return { accessToken };
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        throw e;
      } else {
        throw new BadRequestException(
          'An error occurred while refreshing the access token',
        );
      }
    }
  }

  async signOut(req: Request) {
    try {
      const id = req['user'].id;
      console.log('id ', id);
      const tokenExists = await this.prisma.auth.findUnique({
        where: { user_id: id },
      });
      console.log('Token ', tokenExists);
      if (tokenExists) {
        const temp = await this.jwtService.signAsync(
          { id },
          { expiresIn: '1s' },
        );
        console.log(temp);
        await this.prisma.auth.delete({
          where: {
            user_id: id,
          },
        });
        return 'User signed out';
      } else {
        throw new NotFoundException('Token not found');
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
    return await this.jwtService.signAsync({ id }, { expiresIn: '1h' });
  }

  private async generateRefreshToken(id: string) {
    const salt = await bcrypt.genSalt(10);
    const token = await bcrypt.hash(id, salt);
    return token;
  }

  private async saveTokens(id: string, refreshToken: string) {
    try {
      return await this.prisma.auth.upsert({
        where: { user_id: id },
        update: { refresh_token: refreshToken },
        create: {
          user_id: id,
          refresh_token: refreshToken,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
