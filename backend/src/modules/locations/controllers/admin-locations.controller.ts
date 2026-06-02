import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { UserRole } from '../../users/enums/user-role.enum';
import { LocationsService } from '../locations.service';
import type { AuthenticatedRequest } from '../../../common/types/authenticated-request.type';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/collection-points')
export class AdminLocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async getAdminCollectionPoints(@Request() req: AuthenticatedRequest) {
    const locations = await this.locationsService.getMyCollectionPoints(
      req.user.userId,
      req.user.role,
    );

    // Calculate stats
    const totalLocations = locations.length;
    const activeLocations = locations.filter(l => l.status === 'APPROVED').length;
    const pendingLocations = locations.filter(l => l.status === 'PENDING').length;
    
    // Group by location type (assuming location.type exists, fallback to empty array)
    const locationsByType = locations.reduce((acc, loc) => {
      if (loc.type) {
        acc[loc.type] = (acc[loc.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      locations,
      stats: {
        totalLocations,
        activeLocations,
        pendingLocations,
        locationsByType,
      },
    };
  }
}
