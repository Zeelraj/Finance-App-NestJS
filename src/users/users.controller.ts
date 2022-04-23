import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  BadRequestException,
  Put,
  InternalServerErrorException,
  Res,
  Req,
  UnauthorizedException,
  Delete,
} from '@nestjs/common';
import { User } from './users.entity';
import { UsersService } from './users.service';
import { generateAccountNo } from '../utils/generateAccountNo';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import * as axios from 'axios';
import { typeOfUsers } from '../utils/constants';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @ApiOkResponse({
    description: 'Display the Trial Sentence',
    type: 'user',
  })
  @ApiNotFoundResponse({ description: 'No Working' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Get()
  index(): string {
    return this.userService.index();
  }

  @ApiOkResponse({
    status: 200,
    description: 'Register the User',
    type: User,
  })
  @ApiNotFoundResponse({ description: 'User not Registered' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Post('register')
  @HttpCode(201)
  async register(@Body() userDTO: User) {
    if (!userDTO.contact || !userDTO.email) {
      return 'Please, Provide Valid Contact and Email';
    }

    const userExistsContact = await this.userService.userExistsByContact(
      userDTO.contact,
    );

    const userExistsEmail = await this.userService.userExistsByEmail(
      userDTO.email,
    );

    if (userExistsContact) {
      throw new BadRequestException(
        'User already exists! Please, use different contact!!',
      );
    }

    if (userExistsEmail) {
      throw new BadRequestException(
        'User already exists! Please, use different email!!',
      );
    }

    const userPayload = {
      name: userDTO.name,
      email: userDTO.email,
      contact: userDTO.contact,
      age: userDTO.age,
      gender: userDTO.gender,
      account_no: generateAccountNo(userDTO.contact),
      balance: 0,
      userId: Math.random().toString(36).slice(2),
      created: Date.now(),
    };

    const user = await this.userService.addUser(userPayload);

    return {
      success: true,
      user,
    };
  }

  @ApiOkResponse({
    description: 'Send Login OTP',
    type: 'user',
  })
  @ApiNotFoundResponse({ description: 'OTP not Send' })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error',
  })
  @Put('loginotp')
  @HttpCode(203)
  async sendContactOTP(@Body() userDTO: User) {
    if (!userDTO.contact) {
      return 'Please, Provide Valid Contact Number!!';
    }

    const userExistsContact = await this.userService.userExistsByContact(
      userDTO.contact,
    );

    if (!userExistsContact) {
      throw new BadRequestException("User Doesn't Exists");
    }

    const user = await this.userService.getUser(userDTO.contact);

    const OTP = ('' + Math.random()).substring(2, 8);

    const options = {
      authorization: process.env.FTS_API_KEY,
      message: `Finance App. Login OTP: ${OTP}. Please, do not share this with Others.`,
      numbers: userDTO.contact,
    };

    const result = { otp: null, isOTPSent: false };

    // SMS Done
    await axios.default
      .get(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${options.authorization}&sender_id=FAIND&message=${options.message}&route=v3&numbers=${options.numbers}`,
      )
      .then(() => {
        result.isOTPSent = true;
        result.otp = OTP;
      });

    if (!result.isOTPSent) {
      throw new InternalServerErrorException(
        'Something went wrong. Please, Try again after some time..!!',
      );
    }

    const payload = user;

    payload.loginOTP = result.otp;

    await this.userService.updateUser(payload);

    return {
      success: true,
      isOTPSent: result.isOTPSent,
    };
  }

  @Post('login')
  @HttpCode(201)
  async loginUser(
    @Body() userDTO: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (!userDTO.contact && !userDTO.loginOTP) {
      return 'Please, Provide Valid Credentials!!';
    }

    const userExistsContact = await this.userService.userExistsByContact(
      userDTO.contact,
    );

    if (!userExistsContact) {
      throw new BadRequestException("User Doesn't Exists");
    }

    const user = await this.userService.getUser(userDTO.contact);

    if (Number(userDTO.loginOTP) !== Number(user.loginOTP)) {
      throw new BadRequestException('Please, Provide Valid Credentials');
    }

    // LoginOTP Removed from the Database
    const payload0 = user;
    payload0.loginOTP = null;
    await this.userService.updateUser(payload0);

    const payload = { contact: user.contact, id: user.id };

    const token = this.jwtService.sign(payload);

    response.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRY),
    });

    return {
      success: true,
      user,
      token,
    };
  }

  @Get('fetch')
  @HttpCode(200)
  async getUser(@Req() request: Request) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    return {
      success: true,
      user,
    };
  }

  @Put('update')
  @HttpCode(200)
  async updateUser(@Req() request: Request, @Body() userUpdateDTO: User) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    const payload = Object.assign(
      {
        contact: user.contact,
      },
      userUpdateDTO,
    );

    const updatedUser = await this.userService.updateUser(payload);

    return {
      success: true,
      isUpdated: true,
      user: updatedUser,
    };
  }

  // Trial Remaining
  @Delete('delete')
  @HttpCode(200)
  async deleteUser(@Req() request: Request) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    const isUserDeleted = await this.userService.deleteUser(user.contact);

    return {
      success: true,
      isUserDeleted,
    };
  }

  // Manager Routes
  @Put('/manager/update')
  @HttpCode(200)
  async managerUpdateUser(
    @Req() request: Request,
    @Body() userUpdateDTO: User,
  ) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (user.role !== typeOfUsers.MANAGER) {
      throw new UnauthorizedException(
        'You are not Allowed to access this Page! Please Go Back, now.!!',
      );
    }

    const updatedUser = await this.userService.updateUser(userUpdateDTO);

    return {
      success: true,
      isUpdated: true,
      user: updatedUser,
    };
  }

  @Get('all')
  @HttpCode(200)
  async getUsers(@Req() request: Request) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (user.role !== typeOfUsers.MANAGER) {
      throw new UnauthorizedException(
        'You are not Allowed to access this Path',
      );
    }

    const users = await this.userService.getUsers();

    return {
      success: true,
      users,
      count: users.length,
    };
  }
}
