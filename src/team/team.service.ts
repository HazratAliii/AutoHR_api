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

  async create(createTeamDto: CreateTeamDto, req: Request) {
    try {
      const user_id = req['user'].id;
      const { name, members } = createTeamDto;
      const newTeam = await this.prisma.team.create({
        data: {
          user_id,
          // @ts-ignore
          name,
          members,
        },
      });
      return newTeam;
    } catch (e) {
      console.log(e);
      throw new BadRequestException(e);
    }
  }

  async findAll() {
    try {
      const teams = await this.prisma.team.findMany();
      return teams;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async findOne(id: string) {
    try {
      const team = await this.prisma.team.findUnique({
        where: {
          id,
        },
      });
      if (team) return team;
      else throw new NotFoundException();
    } catch (e) {
      throw new BadRequestException();
    }
  }

  async yourTeams(req: Request) {
    try {
      const user_id = req['user'].id;
      return await this.prisma.team.findMany({
        where: {
          user_id,
        },
      });
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
  async update(id: string, updateTeamDto: UpdateTeamDto) {
    try {
      const teamExists = await this.prisma.team.findUnique({
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

  async remove(id: string) {
    try {
      const teamExists = await this.prisma.team.findUnique({
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
