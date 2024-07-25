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
    // return this.authService.saveTokens(id, accessToken, refreshToken);
  }
  // @UseGuards(IsValid)
  @Get('newtoken/:id/:refreshToken')
  getNewAccessToken(
    @Param('id') id: string,
    @Param('refreshToken') refreshToken: string,
  ) {
    this.authService.getNewAccessToken(id, refreshToken);
  }
  @Get('token/:id')
  getTokens(@Param('id') id: string) {
    return this.authService.getTokens(id);
  }
  deleteTokens(@Param('id') id: string) {
    return this.authService.deleteTokens(id);
  }
}
