import { IsString, IsInt } from 'class-validator';

export class CreateAuthDto {
  first_name: string;
  last_name: string;
  gmail: string;
  password: string;
}
