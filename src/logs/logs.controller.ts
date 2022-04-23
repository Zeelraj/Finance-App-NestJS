import { JwtService } from '@nestjs/jwt';
import {
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import LogsService from './logs.service';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { typeOfUsers } from '../utils/constants';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(
    private readonly logService: LogsService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @ApiOkResponse({
    description: 'Display All Logs',
    type: 'user',
  })
  @ApiNotFoundResponse({ description: 'No Logs Found' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Get('all')
  async allLogs(@Req() request: Request) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    const user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (user.role !== typeOfUsers.MANAGER) {
      throw new UnauthorizedException(
        'You are not Allowed to access this Page! Please Go Back, now.!!',
      );
    }

    const logs = await this.logService.allLogs();

    return {
      success: true,
      count: logs.length,
      logs,
    };
  }
}
