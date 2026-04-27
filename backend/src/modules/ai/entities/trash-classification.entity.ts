import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { BaseEntity } from '../../../common/database/base.entity';
import { User } from '../../users/entities/user.entity';
import { WasteType } from '../enums/waste-type.enum';
import { BinType } from '../enums/bin-type.enum';
import { ClassificationStatus } from '../enums/classification-status.enum';
import { AiFeedback } from './ai-feedback.entity';

@Entity('trash_classifications')
export class TrashClassification extends BaseEntity {
  @Index()
  @ManyToOne(() => User, (user) => user.trashClassifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'image_url',
    type: 'text',
  })
  imageUrl: string;

  @Column({
    name: 'predicted_label',
    type: 'varchar',
    length: 100,
  })
  predictedLabel: string;

  @Column({
    name: 'predicted_waste_type',
    type: 'enum',
    enum: WasteType,
    enumName: 'waste_type',
    nullable: true,
  })
  predictedWasteType?: WasteType | null;

  @Column({
    name: 'confidence',
    type: 'decimal',
    precision: 5,
    scale: 4,
  })
  confidence: number;

  @Column({
    name: 'suggested_bin',
    type: 'enum',
    enum: BinType,
    enumName: 'bin_type',
    nullable: true,
  })
  suggestedBin?: BinType | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ClassificationStatus,
    enumName: 'classification_status',
    default: ClassificationStatus.SUCCESS,
  })
  status: ClassificationStatus;

  @Column({
    name: 'model_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  modelName?: string | null;

  @Column({
    name: 'model_version',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  modelVersion?: string | null;

  @Column({
    name: 'result_json',
    type: 'json',
    nullable: true,
  })
  resultJson?: Record<string, any> | null;

  @OneToMany(() => AiFeedback, (aiFeedback) => aiFeedback.classification)
  feedbacks: AiFeedback[];
}
