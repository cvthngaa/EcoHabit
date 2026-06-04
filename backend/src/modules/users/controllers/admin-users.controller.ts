import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';
import { UserRole } from '../enums/user-role.enum';
import { AdminUsersService } from '../services/admin-users.service';
import { ListUsersQueryDto } from '../dto/list-users-query.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { AdjustPointsDto } from '../dto/adjust-points.dto';
import { ListUserPointsQueryDto } from '../dto/list-user-points-query.dto';
import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { ListUserDropoffsQueryDto } from '../dto/list-user-dropoffs-query.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /** GET /admin/users?role=&status=&search=&sortBy=&sortOrder=&page=&limit= */
  @Get()
  listUsers(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListUsersQueryDto,
  ) {
    return this.adminUsersService.listUsers(query);
  }

  /**
   * GET /admin/users/stats
   * PHẢI đứng trước /:id để tránh NestJS hiểu "stats" là id
   */
  @Get('stats')
  getUserStats() {
    return this.adminUsersService.getUserStats();
  }

  /** GET /admin/users/:id */
  @Get(':id')
  getUserDetail(@Param('id') id: string) {
    return this.adminUsersService.getUserDetail(id);
  }

  /** PATCH /admin/users/:id/status */
  @Patch(':id/status')
  updateUserStatus(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserStatusDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminUsersService.updateUserStatus(
      id,
      dto,
      req.user.userId,
      req.user.email,
    );
  }

  /** PATCH /admin/users/:id/profile */
  @Patch(':id/profile')
  updateUserProfile(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateUserProfileDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminUsersService.updateUserProfile(
      id,
      dto,
      req.user.userId,
      req.user.email,
    );
  }

  /** GET /admin/users/:id/activity */
  @Get(':id/activity')
  getUserActivity(@Param('id') id: string) {
    return this.adminUsersService.getUserActivity(id);
  }

  /** GET /admin/users/:id/points?type=&sourceType=&from=&to=&page=&limit= */
  @Get(':id/points')
  getUserPoints(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListUserPointsQueryDto,
  ) {
    return this.adminUsersService.getUserPoints(id, query);
  }

  /** POST /admin/users/:id/points/adjust */
  @Post(':id/points/adjust')
  adjustUserPoints(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: AdjustPointsDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.adminUsersService.adjustUserPoints(
      id,
      dto,
      req.user.userId,
      req.user.email,
    );
  }

  /** GET /admin/users/:id/redemptions?page=&limit= */
  @Get(':id/redemptions')
  getUserRedemptions(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PaginationQueryDto,
  ) {
    return this.adminUsersService.getUserRedemptions(id, query);
  }

  /** GET /admin/users/:id/dropoffs?status=&page=&limit= */
  @Get(':id/dropoffs')
  getUserDropoffs(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListUserDropoffsQueryDto,
  ) {
    return this.adminUsersService.getUserDropoffs(id, query);
  }

  /** GET /admin/users/:id/ai-classifications?page=&limit= */
  @Get(':id/ai-classifications')
  getUserAiClassifications(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: PaginationQueryDto,
  ) {
    return this.adminUsersService.getUserAiClassifications(id, query);
  }
}
