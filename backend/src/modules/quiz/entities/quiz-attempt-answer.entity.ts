import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { QuizAttempt } from './quiz-attempt.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity('quiz_attempt_answers')
export class QuizAttemptAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => QuizAttempt, (attempt) => attempt.answers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'attempt_id' })
  attempt: QuizAttempt;

  @Column({ name: 'attempt_id' })
  attemptId: string;

  @ManyToOne(() => QuizQuestion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @Column({ name: 'question_id', nullable: true })
  questionId: string;

  @Column({ name: 'question_snapshot', type: 'jsonb', nullable: true })
  questionSnapshot: any;

  @Column({ name: 'selected_option_index', type: 'int' })
  selectedOptionIndex: number;

  @Column({ name: 'correct_option_index', type: 'int' })
  correctOptionIndex: number;

  @Column({ name: 'is_correct', type: 'boolean' })
  isCorrect: boolean;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
