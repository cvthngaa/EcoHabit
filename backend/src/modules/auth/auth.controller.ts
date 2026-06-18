import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { UpdateUserProfileDto } from '../users/dto/update-user-profile.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendChangePasswordOtpDto } from './dto/send-change-password-otp.dto';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.type';

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

  @Post('register-partner')
  @ApiOperation({ summary: 'Đăng ký tài khoản đối tác' })
  @ApiBody({ type: RegisterPartnerDto })
  registerPartner(@Body() body: RegisterPartnerDto) {
    return this.authService.registerPartner(body);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Cấp lại access token bằng refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @ApiOperation({ summary: 'Đăng xuất và thu hồi refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  logout(@Body() body: RefreshTokenDto) {
    return this.authService.logout(body.refreshToken);
  }

  @Post('forgot-password/send-otp')
  @ApiOperation({ summary: 'Gửi mã OTP khôi phục mật khẩu' })
  @ApiBody({ type: SendOtpDto })
  sendPasswordResetOtp(@Body() body: SendOtpDto) {
    return this.authService.sendPasswordResetOtp(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới sau khi xác thực OTP' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.newPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password/send-otp')
  @ApiOperation({ summary: 'Gửi mã OTP đổi mật khẩu' })
  @ApiBody({ type: SendChangePasswordOtpDto })
  sendChangePasswordOtp(
    @Request() req: AuthenticatedRequest,
    @Body() body: SendChangePasswordOtpDto,
  ) {
    console.log('RECEIVED oldPassword:', body.oldPassword);
    return this.authService.sendChangePasswordOtp(req.user.userId, body.oldPassword);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiOperation({ summary: 'Đổi mật khẩu cho user đã đăng nhập' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      req.user.userId,
      body.oldPassword,
      body.newPassword,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async me(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  @ApiOperation({ summary: 'Cập nhật thông tin cá nhân' })
  @ApiBody({ type: UpdateUserProfileDto })
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() body: UpdateUserProfileDto,
  ) {
    return this.authService.updateProfile(req.user.userId, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me/qr')
  @ApiOperation({ summary: 'Lấy mã QR cá nhân của User (có thời hạn 5 phút)' })
  async getMyQr(@Request() req: AuthenticatedRequest) {
    return this.authService.generatePersonalQr(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  getAdminData() {
    return 'only admin';
  }
}
