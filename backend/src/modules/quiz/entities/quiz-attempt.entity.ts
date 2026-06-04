import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { QuizAttemptAnswer } from './quiz-attempt-answer.entity';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'topic_id', type: 'varchar', length: 100 })
  topicId: string;

  @Column({ name: 'quiz_date', type: 'varchar', length: 10 })
  quizDate: string; // YYYY-MM-DD

  @Column({ type: 'int', default: 0 })
  score: number;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'points_earned', type: 'int', default: 0 })
  pointsEarned: number;

  @Column({ name: 'is_rewarded', type: 'boolean', default: false })
  isRewarded: boolean;

  @OneToMany(() => QuizAttemptAnswer, (answer: QuizAttemptAnswer) => answer.attempt, {
    cascade: true,
  })
  answers: QuizAttemptAnswer[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
