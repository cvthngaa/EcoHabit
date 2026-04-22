import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('send-otp')
    @ApiOperation({ summary: 'Gửi mã OTP để đăng ký' })
    @ApiBody({ type: SendOtpDto })
    sendOtp(@Body() body: SendOtpDto) {
        return this.authService.sendOtp(body.email);
    }

    @Post('verify-otp')
    @ApiOperation({ summary: 'Xác nhận mã OTP' })
    @ApiBody({ type: VerifyOtpDto })
    verifyOtp(@Body() body: VerifyOtpDto) {
        return this.authService.verifyOtp(body.email, body.otp);
    }

    @Post('register')
    @ApiBody({ type: RegisterDto })
    register(@Body() body: RegisterDto) {
        return this.authService.register(body.email, body.password, body.fullName);
    }

    @Post('login')
    @ApiBody({ type: LoginDto })
    login(@Body() body: LoginDto) {
        return this.authService.login(body.email, body.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async me(@Request() req) {
        // req.user.userId is populated by JwtStrategy
        return this.authService.getProfile(req.user.userId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get('admin-only')
    getAdminData() {
        return 'only admin';
    }
}