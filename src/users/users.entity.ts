import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { typeOfUsers } from '../utils/constants';

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty()
  @Column()
  created: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty()
  @Column({ unique: true })
  contact: string;

  @ApiProperty()
  @Column()
  age: number;

  @ApiProperty()
  @Column()
  gender: string;

  @ApiProperty()
  @Column()
  account_no: string;

  @ApiProperty()
  @Column({ default: 0 })
  balance: number;

  @ApiProperty()
  @Column({ default: 0 })
  commission: number;

  @ApiProperty()
  @Column({ default: null })
  loginOTP: number;

  @ApiProperty()
  @Column('boolean', { default: false })
  isVerified: boolean;

  @ApiProperty()
  @Column({ default: typeOfUsers.CUSTOMER })
  role: string;

  @ApiProperty()
  @Column()
  userId: string;
}
