import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { IsValid } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Team')
@Controller('api/team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}
  @ApiOperation({
    summary: 'Create team',
    description: 'Create new team',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Req() req: Request) {
    return this.teamService.create(createTeamDto, req);
  }
  @ApiOperation({
    summary: 'Get your teams',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Your teams',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  @Get('yourteams')
  yourTeams(@Req() req: Request) {
    return this.teamService.yourTeams(req);
  }

  @ApiOperation({
    summary: 'Teams list',
    description: 'Lists all teams',
  })
  @ApiResponse({
    status: 200,
    description: 'Teams list',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
  })
  @ApiResponse({
    status: 404,
    description: 'Not found',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @ApiOperation({
    summary: 'Find team by id',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'single team',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiBearerAuth('access_token')
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
  @ApiOperation({
    summary: 'Delete team',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Team deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Team not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request',
  })
  @ApiBearerAuth('access_token')
  @Delete(':id')
  @UseGuards(IsValid)
  remove(@Param('id') id: string) {
    return this.teamService.remove(id);
  }
}
