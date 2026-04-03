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
import { TrashClassification } from './trash-classification.entity';
import { WasteType } from '../enums/waste-type.enum';
import { BinType } from '../enums/bin-type.enum';

@Entity('ai_feedbacks')
export class AiFeedback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(
    () => TrashClassification,
    (trashClassification) => trashClassification.feedbacks,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'classification_id' })
  classification: TrashClassification;

  @Index()
  @ManyToOne(() => User, (user) => user.aiFeedbacks, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'is_correct',
    type: 'boolean',
  })
  isCorrect: boolean;

  @Column({
    name: 'corrected_label',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  correctedLabel?: string | null;

  @Column({
    name: 'corrected_waste_type',
    type: 'enum',
    enum: WasteType,
    enumName: 'waste_type',
    nullable: true,
  })
  correctedWasteType?: WasteType | null;

  @Column({
    name: 'corrected_bin',
    type: 'enum',
    enum: BinType,
    enumName: 'bin_type',
    nullable: true,
  })
  correctedBin?: BinType | null;

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
