import { ApiProperty } from '@nestjs/swagger';

export class SignInAuthDto {
  @ApiProperty({
    example: 'test@gmail.com',
    description: 'The email of the user',
  })
  gmail: string;
  @ApiProperty({
    example: 'password',
    description: 'The password of the user',
  })
  password: string;
}
