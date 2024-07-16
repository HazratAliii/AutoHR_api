import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TeamService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeamDto: CreateTeamDto) {
    try {
      // @ts-ignore
      const { user_id, members } = createTeamDto;
      const newTeam = await this.prisma.team.create({
        data: {
          user_id,
          members,
        },
      });
      return newTeam;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findAll() {
    try {
      const teams = this.prisma.team.findMany();
      return teams;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  findOne(id: string) {
    try {
      const team = this.prisma.team.findUnique({
        where: {
          id,
        },
      });
      // return team ? team : throw new NotFoundException()
      if (team) return team;
      else throw new NotFoundException();
    } catch (e) {
      throw new BadRequestException();
    }
  }

  update(id: string, updateTeamDto: UpdateTeamDto) {
    try {
      const teamExists = this.prisma.team.findUnique({
        where: {
          id,
        },
      });
      if (teamExists) {
      } else {
        throw new NotFoundException();
      }
    } catch (e) {}
  }

  remove(id: string) {
    try {
      const teamExists = this.prisma.team.findUnique({
        where: {
          id,
        },
      });
      if (teamExists) {
        return this.prisma.team.delete({
          where: {
            id,
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
