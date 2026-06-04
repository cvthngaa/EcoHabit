import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Unique, Index } from 'typeorm';
import { DailyQuizSetQuestion } from './daily-quiz-set-question.entity';

@Entity('daily_quiz_sets')
@Unique(['quizDate', 'topicId'])
export class DailyQuizSet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'quiz_date', type: 'varchar', length: 20 })
  quizDate: string;

  @Index()
  @Column({ name: 'topic_id', type: 'varchar', length: 100 })
  topicId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  difficulty: string;

  @OneToMany(() => DailyQuizSetQuestion, (setQuestion: DailyQuizSetQuestion) => setQuestion.dailyQuizSet, {
    cascade: true,
  })
  questions: DailyQuizSetQuestion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
