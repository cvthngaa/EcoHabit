import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BadgesService } from './badges.service';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  /** GET /badges — public list of all active badges */
  @Get()
  getAllBadges() {
    return this.badgesService.getAllBadges();
  }

  /** GET /badges/me — authenticated user's badges with earned status + progress */
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMyBadges(@Req() req: AuthenticatedRequest) {
    return this.badgesService.getMyBadges(req.user.userId);
  }
}
