import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
    @Get()
    @ApiOperation({ summary: 'Kiểm tra API đang chạy' })
    check() {
        return {
            success: true,
            message: 'Backend is running',
        };
    }
}