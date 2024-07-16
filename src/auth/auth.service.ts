import {
  BadRequestException,
  Injectable,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';
import { equal } from 'assert';
import { getMaxListeners } from 'events';
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

  // async googleAuthRedirect(req) {
  //   const { id, email, first_name, last_name, access_token } = req.user.email;
  //   const emailExist = await this.prisma.user.findFirst({
  //     where: {
  //       gmail: email,
  //     },
  //   });
  //   if (!emailExist) {
  //     // const { accessToken } = req.user;
  //     // console.log(accessToken);
  //     const newUser = {
  //       gmail: req.user.email,
  //       first_name: req.user.firstName,
  //       last_name: req.user.lastName,
  //       picture: req.user.picture,
  //     };
  //     await this.prisma.user.create({
  //       // @ts-ignore
  //       data: newUser,
  //     });
  //     return {
  //       message: 'User information from Google',
  //       user: req.user,
  //     };
  //   } else {
  //     console.log(access_token);
  //     throw new BadRequestException('Account already exists');
  //   }
  // }

  async googleAuthRedirect(req) {
    const { id, email, first_name, last_name, access_token } = req.user;

    // Check if the user already exists
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
      // User does not exist, signup scenario
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

  async signin(req) {
    console.log('Inside signin', req.user);

    try {
      const { email, access_token } = req.user;
      const emailExist = await this.prisma.user.findUnique({
        where: {
          gmail: email,
        },
      });
      console.log(emailExist);

      if (emailExist) {
        return access_token;
      } else {
        throw new UnauthorizedException('Create account first');
      }
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  findAll() {
    return this.prisma.user.findMany();
  }
  test() {
    return test;
  }
  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
