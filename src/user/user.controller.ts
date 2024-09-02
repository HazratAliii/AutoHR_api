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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IsValid } from 'src/auth/auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Users list',
    description: 'Displays all users',
  })
  @ApiResponse({ status: 201, description: 'Displayes all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Users information',
    description: 'Displays single user based on id',
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({ status: 201, description: 'User information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(IsValid)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    return this.userService.update(id, updateUserDto, request);
  }
  @Post('/uploadfile')
  @ApiOperation({
    summary: 'Upload picture',
    description:
      'Uploads an image with validation constraints. Accepts images with JPEG or PNG formats and size up to 10MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to be uploaded',
    type: 'multipart/form-data',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    examples: {
      'application/json': {
        value: {
          file: 'example.png',
        },
      },
    },
  })
  @ApiBearerAuth('access_token')
  @ApiResponse({
    status: 200,
    description: 'File successfully uploaded.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request. The file may be too large, or the file type is not allowed.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @UseGuards(IsValid)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10000000 }),
          new FileTypeValidator({
            fileType: 'image/jpeg|image/png|image/jpg',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    return this.userService.uploadFile(file, req);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Remove a user',
    description: 'Deletes user based on id',
  })
  @ApiResponse({
    status: 200,
    description: 'User delete successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth('access_token')
  @UseGuards(IsValid)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
