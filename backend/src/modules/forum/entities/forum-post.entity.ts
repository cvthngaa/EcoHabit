import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from 'src/common/database/base.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { PostStatus } from '../enums/post-status.enum';
import { ForumComment } from './forum-comment.entity';
import { ForumReport } from './forum-report.entity';

@Entity('forum_posts')
export class ForumPost extends BaseEntity {
  @ManyToOne(() => User, (user) => user.forumPosts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'author_id' })
  author?: User | null;

  @Column({
    name: 'title',
    type: 'text',
    nullable: true,
  })
  title?: string | null;

  @Column({
    name: 'content',
    type: 'text',
    nullable: true,
  })
  content?: string | null;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PostStatus,
    enumName: 'post_status',
    nullable: true,
  })
  status?: PostStatus | null;

  @OneToMany(() => ForumComment, (comment) => comment.post)
  comments: ForumComment[];

  @OneToMany(() => ForumReport, (report) => report.post)
  reports: ForumReport[];
}
