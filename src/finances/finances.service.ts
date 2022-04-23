import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Finance } from './finances.entity';

@Injectable()
export class FinancesService {
  logger: Logger;

  constructor(
    @InjectRepository(Finance)
    private financesRepository: Repository<Finance>,
  ) {
    this.logger = new Logger(FinancesService.name);
  }

  async addTransaction(transactionDTO: any): Promise<Finance> {
    await this.financesRepository.insert(transactionDTO);
    const transaction = await this.financesRepository.findOne({
      transactionId: transactionDTO.transactionId,
    });

    return transaction;
  }

  async updateTransaction(transactionDTO: any): Promise<Finance> {
    await this.financesRepository.update(
      { transactionId: transactionDTO.transactionId },
      transactionDTO,
    );
    const transaction = await this.financesRepository.findOne({
      transactionId: transactionDTO.transactionId,
    });

    return transaction;
  }

  getAllTransactions(): Promise<Finance[]> {
    return this.financesRepository.find();
  }

  async getTransaction(id: string): Promise<Finance> {
    const transaction = await this.financesRepository.findOne({
      where: {
        transactionId: id,
      },
    });

    return transaction;
  }
}
