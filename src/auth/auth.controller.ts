import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { IsValid } from './auth.guard';
import { SignInAuthDto } from './dto/signin.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Google OAuth2 callback',
    description: 'Handles Google OAuth callback, log in or create a user.',
  })
  @ApiResponse({
    status: 200,
    description: 'User succcessfully authenticated and logged in.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. User could not be authenticated.',
  })
  googleAuthRedirect(@Req() req) {
    return this.authService.googleAuthRedirect(req);
  }

  @ApiOperation({
    summary: 'User signup',
    description: 'Allows a new user to sign up using their email and password',
  })
  @Post('signup')
  @ApiResponse({
    status: 200,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  emailSignup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.emailSignup(createAuthDto);
  }

  @ApiOperation({
    summary: 'User signin',
    description: 'Allows a new user to sign in using their email and password',
  })
  @ApiResponse({
    status: 200,
    description: 'Signed in successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @Post('signin')
  emailSignin(@Body() signinAuthDto: SignInAuthDto) {
    return this.authService.emailSignin(signinAuthDto);
  }

  @ApiOperation({
    summary: 'Generate new acc',
    description: 'Allows a new user to sign in using their email and password',
  })
  @Get('newtoken/:id')
  getNewAccessToken(@Param('id') id: string) {
    return this.authService.getNewAccessToken(id);
  }
  @Get('token/:id')
  getTokens(@Param('id') id: string) {
    return this.authService.getTokens(id);
  }
  deleteTokens(@Param('id') id: string) {
    return this.authService.deleteTokens(id);
  }
}
