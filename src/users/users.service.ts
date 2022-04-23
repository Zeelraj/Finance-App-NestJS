import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UsersService {
  logger: Logger;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.logger = new Logger(UsersService.name);
  }

  index(): string {
    return 'Users Page';
  }

  getUsers(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        contact: id,
      },
    });

    return user;
  }

  async getUserAccount(account_no: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        account_no,
      },
    });

    return user;
  }

  async userExistsByContact(contact: string) {
    const users = await this.usersRepository.find({ contact: contact });

    return users.length > 0 ? true : false;
  }

  async userExistsByEmail(email: string) {
    const users = await this.usersRepository.find({ email: email });

    return users.length > 0 ? true : false;
  }

  async addUser(user): Promise<User> {
    await this.usersRepository.insert(user);
    return user;
  }

  async updateUser(userDTO): Promise<User> {
    await this.usersRepository.update({ contact: userDTO.contact }, userDTO);
    const user = this.usersRepository.findOne({ contact: userDTO.contact });

    return user;
  }

  async deleteUser(contact: string): Promise<boolean> {
    await this.usersRepository.delete({ contact: contact });

    return true;
  }
}
