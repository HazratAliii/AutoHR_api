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
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleAuthRedirect(req);
  }

  @Post()
  saveTokens(
    @Param('id') id: string,
    @Body('accessToken') accessToken: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return this.authService.saveTokens(id, accessToken, refreshToken);
  }
  getTokens(@Param('id') id: string) {
    return this.authService.getTokens(id);
  }
  deleteTokens(@Param('id') id: string) {
    return this.authService.deleteTokens(id);
  }
}
