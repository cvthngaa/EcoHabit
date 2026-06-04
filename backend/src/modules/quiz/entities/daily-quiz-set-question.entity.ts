import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, Index } from 'typeorm';
import { DailyQuizSet } from './daily-quiz-set.entity';
import { QuizQuestion } from './quiz-question.entity';

@Entity('daily_quiz_set_questions')
@Unique(['dailyQuizSetId', 'questionId'])
export class DailyQuizSetQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'daily_quiz_set_id' })
  dailyQuizSetId: string;

  @Index()
  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ManyToOne(() => DailyQuizSet, (set) => set.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'daily_quiz_set_id' })
  dailyQuizSet: DailyQuizSet;

  @ManyToOne(() => QuizQuestion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: QuizQuestion;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
