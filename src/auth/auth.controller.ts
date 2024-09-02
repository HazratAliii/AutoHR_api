import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { SignInAuthDto } from './dto/signin.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { IsValid } from './auth.guard';

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
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    return this.authService.googleAuthRedirect(req, res);
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
  emailSignin(@Body() signinAuthDto: SignInAuthDto, @Res() res: Response) {
    return this.authService.emailSignin(signinAuthDto, res);
  }

  @ApiOperation({
    summary: 'Generate new access token',
    description: 'Allows a new user to sign in using their email and password',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'An error occured while refreshing the access token',
  })
  @Get('newtoken')
  getNewAccessToken(@Req() req: Request) {
    return this.authService.getNewAccessToken(req);
  }

  @ApiOperation({
    summary: 'Signout',
    description: 'Sign out current user',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Token not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Something wrong with the server',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  @Get('signout')
  signOut(@Req() req: Request) {
    return this.authService.signOut(req);
  }
}
