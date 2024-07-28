import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      const users = await this.prisma.user.findMany();
      return users;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findOne(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        return user;
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      if (e instanceof NotFoundException) throw NotFoundException;
      else throw new BadRequestException(e);
    }
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        return await this.prisma.user.delete({
          where: {
            id,
          },
        });
      } else {
        throw new NotFoundException();
      }
    } catch (e) {
      if (e instanceof NotFoundException) throw NotFoundException;
      else throw new BadRequestException(e);
    }
  }
}
