import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PointsService } from './points.service';

@UseGuards(AuthGuard('jwt'))
@Controller('points')
export class PointsController {
    constructor(private readonly pointsService: PointsService) { }

    @Get('balance')
    async getBalance(@Req() req) {
        const balance = await this.pointsService.getBalanceByUserId(req.user.userId);
        return { balance };
    }

    @Get('history')
    getHistory(@Req() req) {
        return this.pointsService.getPoint(req.user.userId);
    }
}
