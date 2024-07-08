import { Injectable, Req } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private prisma: PrismaService,
  ) {}

  create(createAuthDto: CreateAuthDto) {
    return `This action returns all auth`;
  }

  async googleAuthRedirect(req) {
    console.log(req.user.email);
    const newUser = {
      gmail: req.user.email,
      first_name: req.user.firstName,
      last_name: req.user.lastName,
      picture: req.user.picture,
    };
    await this.prisma.user.create({
      // @ts-ignore
      data: newUser,
    });
    return {
      message: 'User information from Google',
      user: req.user,
    };
  }

  findAll() {
    return 'Hello';
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
