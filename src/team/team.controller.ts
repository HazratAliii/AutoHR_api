import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { IsValid } from 'src/auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Team')
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @UseGuards(IsValid)
  @Post()
  // create(@Body() createTeamDto: CreateTeamDto) {
  create(@Body() createTeamDto: any) {
    return this.teamService.create(createTeamDto);
  }

  @Get()
  @UseGuards(IsValid)
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  @UseGuards(IsValid)
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(id);
  }

  @Patch(':id')
  // update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
  update(@Param('id') id: string, @Body() updateTeamDto: any) {
    return this.teamService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(IsValid)
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
