import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumPost } from './entities/forum-post.entity';
import { ForumComment } from './entities/forum-comment.entity';
import { ForumReport } from './entities/forum-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ForumPost, ForumComment, ForumReport])],
  exports: [TypeOrmModule],
})
export class ForumModule {}
