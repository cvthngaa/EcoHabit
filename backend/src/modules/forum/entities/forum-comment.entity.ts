import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { ForumPost } from './forum-post.entity';
import { CommentStatus } from '../enums/comment-status.enum';
import { ForumReport } from './forum-report.entity';

@Entity('forum_comments')
export class ForumComment extends BaseEntity {
  @ManyToOne(() => ForumPost, (post) => post.comments, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post?: ForumPost | null;

  @ManyToOne(() => User, (user) => user.forumComments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'author_id' })
  author?: User | null;

  @Column({
    name: 'content',
    type: 'text',
    nullable: true,
  })
  content?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: CommentStatus,
    enumName: 'comment_status',
    nullable: true,
  })
  status?: CommentStatus | null;

  @OneToMany(() => ForumReport, (report) => report.comment)
  reports: ForumReport[];
}
