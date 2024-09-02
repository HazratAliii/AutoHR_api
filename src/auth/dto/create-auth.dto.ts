import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  MinLength,
  IsNotEmpty,
  IsEmail,
} from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsNotEmpty()
  @IsString()
  last_name: string;
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'The email name of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  gmail: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;
}
