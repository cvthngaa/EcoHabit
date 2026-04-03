import {
  Entity,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { Location } from './location.entity';
import { WasteType } from 'src/modules/ai/enums/waste-type.enum';

@Entity('accepted_waste_types')
export class AcceptedWasteType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Location, (location) => location.acceptedWasteTypes, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'location_id' })
  location?: Location | null;

  @Column({
    name: 'waste_type',
    type: 'enum',
    enum: WasteType,
    enumName: 'waste_type',
    nullable: true,
  })
  wasteType?: WasteType | null;
}
