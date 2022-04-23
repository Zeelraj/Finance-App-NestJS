import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import {
  Controller,
  Post,
  HttpCode,
  Body,
  Req,
  UnauthorizedException,
  Put,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { FinancesService } from './finances.service';
import { Finance } from './finances.entity';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { v4 as uuid } from 'uuid';
import { typeOfTransactions, typeOfUsers } from '../utils/constants';

@ApiTags('finance')
@Controller('finance')
export class FinancesController {
  constructor(
    private readonly financeService: FinancesService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {}

  @Post('deposit')
  @HttpCode(201)
  async depositTransaction(
    @Body() financeDTO: Finance,
    @Req() request: Request,
  ) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (Number(financeDTO.amount) <= 0) {
      throw new BadRequestException('Please, Specify Correct Amount..!!');
    }

    const payload = {
      transactionId: uuid(),
      createdAt: Date.now,
      senderAccountNo: '',
      senderUserId: '',
      receiverAccountNo: user.account_no,
      receiverUserId: user.userId,
      amount: financeDTO.amount,
      typeOfTransaction: typeOfTransactions.DEPOSIT,
      managerId: '',
    };

    const transaction = await this.financeService.addTransaction(payload);

    return {
      success: true,
      transactionId: transaction.transactionId,
    };
  }

  @Post('withdraw')
  @HttpCode(201)
  async withdrawTransaction(
    @Body() financeDTO: Finance,
    @Req() request: Request,
  ) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (Number(financeDTO.amount) <= 0) {
      throw new BadRequestException('Please, Specify Correct Amount..!!');
    }

    if (Number(financeDTO.amount) > Number(user.balance)) {
      throw new BadRequestException("Sorry, You don't have enough balance..!!");
    }

    if (Number(user.balance) - Number(financeDTO.amount) <= 1000) {
      throw new BadRequestException(
        "Sorry, You don't have enough balance. Account Balance less than is 1000 is not allowed..!!",
      );
    }

    const payload = {
      transactionId: uuid(),
      createdAt: Date.now,
      senderAccountNo: user.account_no,
      senderUserId: user.userId,
      receiverAccountNo: '',
      receiverUserId: '',
      amount: financeDTO.amount,
      typeOfTransaction: typeOfTransactions.WITHDRAW,
      managerId: '',
    };

    const transaction = await this.financeService.addTransaction(payload);

    return {
      success: true,
      transactionId: transaction.transactionId,
    };
  }

  @Post('transfer')
  @HttpCode(201)
  async transferTransaction(
    @Body() financeDTO: Finance,
    @Req() request: Request,
  ) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (!financeDTO.receiverAccountNo) {
      throw new BadRequestException(
        'Please, Provide Necessary Information of the Receiver..!!',
      );
    }

    const rU = await this.userService.getUserAccount(
      financeDTO.receiverAccountNo,
    );

    if (!rU) {
      throw new BadRequestException(
        "Receiver Account Doesn't Exists. Please Check..!!",
      );
    }

    if (Number(financeDTO.amount) <= 0) {
      throw new BadRequestException('Please, Specify Correct Amount..!!');
    }

    if (Number(financeDTO.amount) > Number(user.balance)) {
      throw new BadRequestException("Sorry, You don't have enough balance..!!");
    }

    if (Number(user.balance) - Number(financeDTO.amount) <= 1000) {
      throw new BadRequestException(
        "Sorry, You don't have enough balance. Account Balance less than is 1000 is not allowed..!!",
      );
    }

    const payload = {
      transactionId: uuid(),
      createdAt: Date.now,
      senderAccountNo: user.account_no,
      senderUserId: user.userId,
      receiverAccountNo: financeDTO.receiverAccountNo,
      receiverUserId: rU.userId,
      amount: financeDTO.amount,
      typeOfTransaction: typeOfTransactions.TRANSFER,
      managerId: '',
    };

    const transaction = await this.financeService.addTransaction(payload);

    return {
      success: true,
      transactionId: transaction.transactionId,
    };
  }

  // Manager Routes
  @Get('manager/fetch/transactions')
  @HttpCode(200)
  async allTransaction(@Req() request: Request) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    const user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (user.role !== typeOfUsers.MANAGER) {
      throw new UnauthorizedException(
        'You are not Allowed to access this Page! Please Go Back, now.!!',
      );
    }

    const transactions = await this.financeService.getAllTransactions();

    return {
      success: true,
      count: transactions.length,
      transactions:
        transactions.length > 0 ? transactions : 'No Transactions Yet',
    };
  }

  @Put('manager/approve')
  @HttpCode(200)
  async approveTransaction(
    @Body() financeDTO: Finance,
    @Req() request: Request,
  ) {
    const token = this.jwtService.decode(request.cookies['token'], {
      json: true,
    });

    if (!token) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    let user = await this.userService.getUser(token['contact']);

    if (!user) {
      throw new UnauthorizedException('Please, Login First..!!');
    }

    if (user.role !== typeOfUsers.MANAGER) {
      throw new UnauthorizedException(
        'You are not Allowed to access this Page! Please Go Back, now.!!',
      );
    }

    const transactionDetails = await this.financeService.getTransaction(
      financeDTO.transactionId,
    );

    if (transactionDetails.typeOfTransaction === typeOfTransactions.DEPOSIT) {
      const customer = await this.userService.getUserAccount(
        transactionDetails.receiverAccountNo,
      );

      customer.balance =
        Number(customer.balance) + Number(transactionDetails.amount);

      await this.userService.updateUser(customer);
    }

    if (transactionDetails.typeOfTransaction === typeOfTransactions.WITHDRAW) {
      const customer = await this.userService.getUserAccount(
        transactionDetails.senderAccountNo,
      );

      if (Number(transactionDetails.amount) > Number(customer.balance)) {
        throw new BadRequestException(
          "Sorry, You don't have enough balance..!!",
        );
      }

      if (
        Number(customer.balance) - Number(transactionDetails.amount) <=
        1000
      ) {
        throw new BadRequestException(
          "Sorry, You don't have enough balance. Account Balance less than is 1000 is not allowed..!!",
        );
      }

      customer.balance =
        Number(customer.balance) - Number(transactionDetails.amount);

      await this.userService.updateUser(customer);
    }

    if (transactionDetails.typeOfTransaction === typeOfTransactions.TRANSFER) {
      const customer1 = await this.userService.getUserAccount(
        transactionDetails.senderAccountNo,
      );

      const customer2 = await this.userService.getUserAccount(
        transactionDetails.receiverAccountNo,
      );

      if (Number(transactionDetails.amount) > Number(customer1.balance)) {
        throw new BadRequestException(
          "Sorry, You don't have enough balance..!!",
        );
      }

      if (
        Number(customer1.balance) - Number(transactionDetails.amount) <=
        1000
      ) {
        throw new BadRequestException(
          "Sorry, You don't have enough balance. Account Balance less than is 1000 is not allowed..!!",
        );
      }

      customer1.balance =
        Number(customer1.balance) - Number(transactionDetails.amount);
      customer2.balance =
        Number(customer2.balance) + Number(transactionDetails.amount);

      await this.userService.updateUser(customer1);
      await this.userService.updateUser(customer2);

      user = await this.userService.getUser(token['contact']);

      const commission = Number(transactionDetails.amount) * 0.02;

      user.commission = Number(user.commission) + Number(commission);

      await this.userService.updateUser(user);
    }

    const payload = {
      transactionId: financeDTO.transactionId,
      managerId: user.userId,
      isApproved: true,
    };

    const transaction = await this.financeService.updateTransaction(payload);

    return {
      success: true,
      transactionId: transaction.transactionId,
    };
  }
}
