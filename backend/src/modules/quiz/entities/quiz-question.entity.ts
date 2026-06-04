import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuizDifficulty } from '../enums/quiz-difficulty.enum';
import { QuizQuestionSource } from '../enums/quiz-question-source.enum';
import { QuizQuestionStatus } from '../enums/quiz-question-status.enum';
import { QuizOption } from './quiz-option.entity';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  topic: string;

  @Column({
    type: 'enum',
    enum: QuizDifficulty,
    default: QuizDifficulty.MEDIUM,
  })
  difficulty: QuizDifficulty;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({
    type: 'enum',
    enum: QuizQuestionStatus,
    default: QuizQuestionStatus.PENDING_REVIEW,
  })
  status: QuizQuestionStatus;

  @Column({
    type: 'enum',
    enum: QuizQuestionSource,
    default: QuizQuestionSource.MANUAL,
  })
  source: QuizQuestionSource;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ name: 'created_by_id', nullable: true })
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User;

  @Column({ name: 'reviewed_by_id', nullable: true })
  reviewedById: string;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @OneToMany(() => QuizOption, (option) => option.question, {
    cascade: true,
  })
  options: QuizOption[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
