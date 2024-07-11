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

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return `This action returns all auth`;
  }

  // async googleAuthRedirect(req) {
  //   const { email } = req.user.email;
  //   const emailExist = await this.prisma.user.findFirst({
  //     where: {
  //       gmail: email,
  //     },
  //   });
  //   if (!emailExist) {
  //     const { accessToken } = req.user;
  //     console.log(accessToken);
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
  //     throw new BadRequestException('Account already exists');
  //   }
  // }

  async googleAuthRedirect(req) {
    const { email } = req.user.email;

    try {
      const emailExist = await this.prisma.user.findFirst({
        where: {
          gmail: email,
        },
      });

      if (!emailExist) {
        const { id, first_name, last_name, picture } = req.user;
        const newUser = {
          gmail: email,
          first_name,
          last_name,
          picture,
        };

        await this.prisma.user.create({
          data: newUser,
        });

        return {
          message: 'User information from Google',
          user: req.user,
        };
      } else {
        const { id, first_name, last_name, picture } = req.user;
        // const payload = { id, access_token };
        console.log('This is access token', first_name);

        return 'Testing';
      }
    } catch (error) {
      // Check if the error is due to a uniqueness constraint violation
      if (error.code === 'P2002' && error.meta?.target?.includes('gmail')) {
        throw new BadRequestException('Account with this email already exists');
      } else {
        // Handle other types of errors or re-throw if necessary
        throw error;
      }
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
