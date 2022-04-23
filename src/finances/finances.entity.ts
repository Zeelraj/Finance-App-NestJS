import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Finance {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id?: number;

  @ApiProperty()
  @Column({ unique: true })
  transactionId: string;

  @ApiProperty()
  @Column()
  createdAt: string;

  @ApiProperty()
  @Column()
  senderAccountNo: string;

  @ApiProperty()
  @Column()
  senderUserId: string;

  @ApiProperty()
  @Column()
  receiverAccountNo: string;

  @ApiProperty()
  @Column()
  receiverUserId: string;

  @ApiProperty()
  @Column()
  amount: number;

  @ApiProperty()
  @Column()
  typeOfTransaction: string;

  @ApiProperty()
  @Column()
  managerId: string;

  @ApiProperty()
  @Column('boolean', { default: false })
  isApproved: boolean;
}
