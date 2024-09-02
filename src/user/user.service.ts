import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'prisma/prisma.service';
import { Request } from 'express';
import { MinioService } from 'src/minio/minio.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
  ) {}

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

  async update(id: string, updateUserDto: UpdateUserDto, request: Request) {
    try {
      const useExist = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (!useExist) throw new NotFoundException('User not found');
      // @ts-ignore
      if (request.user.id !== id)
        throw new UnauthorizedException('You can only modify your account');
      const updatedUser = {
        first_name: updateUserDto.fisrt_name || useExist.first_name,
        last_name: updateUserDto.last_name || useExist.last_name,
        picture: updateUserDto.picture || useExist.picture,
        gmail: updateUserDto.gmail || useExist.gmail,
        phone: updateUserDto.phone || useExist.phone,
        password: updateUserDto.password || useExist.password,
        employee_id: updateUserDto.employee_id || useExist.employee_id,
        join_date: updateUserDto.join_date || useExist.join_date,
        blood_group: updateUserDto.blood_group || useExist.blood_group,
      };
      await this.prisma.user.update({
        where: { id },
        data: updatedUser,
      });
      return {
        message: 'User updated successfully',
        statusCode: '200',
      };
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      else if (e instanceof UnauthorizedException) throw e;
      else
        throw new BadRequestException(
          'Something went wrong while updating user',
        );
    }
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

  async uploadFile(file: Express.Multer.File, req: Request) {
    try {
      // @ts-ignore
      const id = req.user.id;
      const filePath = await this.minioService.uploadFile(file, id);
      await this.prisma.user.update({
        where: { id },
        data: {
          picture: filePath,
        },
      });
      return {
        message: 'File uploaded successfully',
      };
    } catch (e) {
      throw new BadRequestException(
        'Something went wrong while uploading picture',
      );
    }
  }
}
