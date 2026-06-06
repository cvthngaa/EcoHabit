import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '../users/enums/user-role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/settings')
export class AdminSettingsController {
  @Get()
  getSettings() {
    return [
      { key: 'Giới hạn giao dịch/ngày', value: '8 giao dịch', scope: 'Chống gian lận' },
      { key: 'Bán kính GPS hợp lệ', value: '150 mét', scope: 'Xác thực thu gom' },
      { key: 'Confidence AI cần duyệt', value: '< 70%', scope: 'AI Review' },
      { key: 'Thời hạn OTP', value: '5 phút', scope: 'Bảo mật' },
    ];
  }
}
