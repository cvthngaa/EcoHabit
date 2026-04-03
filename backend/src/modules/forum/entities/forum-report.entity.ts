import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ForumPost } from './forum-post.entity';
import { ForumComment } from './forum-comment.entity';
import { ReportStatus } from '../enums/report-status.enum';

@Entity('forum_reports')
export class ForumReport extends BaseEntity {
  @ManyToOne(() => User, (user) => user.forumReports, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'reporter_id' })
  reporter?: User | null;

  @ManyToOne(() => ForumPost, (post) => post.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post?: ForumPost | null;

  @ManyToOne(() => ForumComment, (comment) => comment.reports, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'comment_id' })
  comment?: ForumComment | null;

  @Column({
    name: 'reason',
    type: 'text',
    nullable: true,
  })
  reason?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: ReportStatus,
    enumName: 'report_status',
    nullable: true,
  })
  status?: ReportStatus | null;
}
