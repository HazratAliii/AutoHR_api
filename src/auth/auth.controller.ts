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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleAuthRedirect(req);
  }

  @Post('signup')
  emailSignup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.emailSignup(createAuthDto);
  }

  @Post('signin')
  emailSignin(@Body() signinAuthDto: SignInAuthDto) {
    return this.authService.emailSignin(signinAuthDto);
  }
  @Get('newtoken/:id')
  getNewAccessToken(
    @Param('id') id: string,
    // @Param('refreshToken') refreshToken: string,
  ) {
    // this.authService.getNewAccessToken(id, refreshToken);
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
