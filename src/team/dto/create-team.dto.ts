import { ApiProperty } from '@nestjs/swagger';

export class CreateTeamDto {
  @ApiProperty({
    example: '9b12d6bb-6034-4763-add9-21589b976095',
    description: 'The user id of the user',
  })
  user_id: string;

  @ApiProperty({ example: 'Team AST', description: 'Your team name' })
  name: string;

  @ApiProperty({
    example: ['9b12d6bb-32-4763-add9-21589b976095'],
    description: 'User id list of the users',
  })
  members: string[];
}
