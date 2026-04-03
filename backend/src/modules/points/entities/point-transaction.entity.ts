import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  Index,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { PointTransactionType } from '../enums/point-transaction-type.enum';
import { PointSourceType } from '../enums/point-source-type.enum';

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => User, (user) => user.pointTransactions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'type',
    type: 'enum',
    enum: PointTransactionType,
  })
  type: PointTransactionType;

  @Column({
    name: 'points',
    type: 'int',
  })
  points: number;

  @Column({
    name: 'balance_after',
    type: 'int',
  })
  balanceAfter: number;

  @Column({
    name: 'reason_code',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  reasonCode?: string | null;

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: PointSourceType,
    nullable: true,
  })
  sourceType?: PointSourceType | null;

  @Column({
    name: 'source_id',
    type: 'uuid',
    nullable: true,
  })
  sourceId?: string | null;

  @Column({
    name: 'note',
    type: 'text',
    nullable: true,
  })
  note?: string | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;
}
