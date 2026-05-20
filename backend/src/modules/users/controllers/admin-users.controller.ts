import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  /** GET /admin/users?role=&status=&search=&page=&limit= */
  @Get()
  listUsers(
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    query: ListUsersQueryDto,
  ) {
    return this.adminUsersService.listUsers(query);
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
      req.user.fullName ?? req.user.userId,
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
      req.user.fullName ?? req.user.userId,
    );
  }

  /** GET /admin/users/:id/activity */
  @Get(':id/activity')
  getUserActivity(@Param('id') id: string) {
    return this.adminUsersService.getUserActivity(id);
  }
}
