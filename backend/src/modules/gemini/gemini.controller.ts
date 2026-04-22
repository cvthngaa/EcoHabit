import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';

@ApiTags('Gemini')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Get('daily-tip')
  @ApiOperation({ summary: 'Mẹo vặt hôm nay từ Gemini cho trang chủ' })
  async getDailyTip() {
    return this.geminiService.getDailyTip();
  }
}
