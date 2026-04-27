import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import * as nodemailer from 'nodemailer';
import { UserStatus } from '../users/enums/user-status.enum';

@Injectable()
export class AuthService {
  private redisClient: Redis;
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    // Fix EPERM error by trimming the URL and checking if it starts with rediss://
    const redisUrl = process.env.REDIS_URL?.trim();
    if (redisUrl && redisUrl.startsWith('redis')) {
      this.redisClient = new Redis(redisUrl);
    } else {
      console.warn(
        '[REDIS] REDIS_URL is invalid or missing. Falling back to localhost.',
      );
      this.redisClient = new Redis(); // localhost:6379
    }

    // Setup Nodemailer
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  // ✅ SEND OTP
  async sendOtp(email: string) {
    // 1. Kiểm tra xem email đã tồn tại trong DB chưa
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException(
        'Email này đã được đăng ký. Vui lòng đăng nhập.',
      );
    }

    // 2. Sinh 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Lưu vào Redis
    const key = `otp:email:${email}`;
    await this.redisClient.set(key, hashedOtp, 'EX', 300); // 300 giây = 5 phút

    console.log(`[DEBUG OTP] Gửi mã OTP ${otp} đến email ${email}`);

    this.transporter
      .sendMail({
        from: `"EcoHabit" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Mã xác thực OTP của bạn - EcoHabit',
        text: `Mã OTP của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2E5D3A;">Xin chào!</h2>
                    <p>Bạn đã yêu cầu một mã xác thực (OTP) để đăng ký tài khoản EcoHabit.</p>
                    <h3 style="background: #F3F8F4; padding: 10px; text-align: center; color: #1B3A1E; border-radius: 8px;">
                        Mã OTP của bạn là: <strong style="font-size: 24px;">${otp}</strong>
                    </h3>
                    <p style="color: #8FA892; font-size: 12px;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                </div>
            `,
      })
      .catch((error) => {
        console.error('[EMAIL ERROR] Failed to send OTP email:', error);
      });

    return { message: 'Mã OTP đã được gửi đến email của bạn' };
  }

  // ✅ VERIFY OTP
  async verifyOtp(email: string, otp: string) {
    const attemptKey = `otp:attempts:${email}`;
    const attemptsStr = await this.redisClient.get(attemptKey);
    const attempts = attemptsStr ? parseInt(attemptsStr) : 0;

    if (attempts >= 5) {
      // Xoá OTP nếu quá số lần thử
      await this.redisClient.del(`otp:email:${email}`);
      throw new UnauthorizedException(
        'Bạn đã nhập sai quá số lần quy định. Vui lòng gửi lại mã OTP.',
      );
    }

    const otpKey = `otp:email:${email}`;
    const hashedOtp = await this.redisClient.get(otpKey);

    if (!hashedOtp) {
      throw new UnauthorizedException('Mã OTP đã hết hạn hoặc không tồn tại.');
    }

    const isMatch = await bcrypt.compare(otp, hashedOtp);
    if (!isMatch) {
      // Tăng số lần thử
      await this.redisClient.incr(attemptKey);
      if (attempts === 0) {
        await this.redisClient.expire(attemptKey, 300); // 5 phút
      }
      throw new UnauthorizedException('Mã OTP không chính xác.');
    }

    // Nếu đúng, xoá OTP và attempts
    await this.redisClient.del(otpKey, attemptKey);

    // Lưu giấy phép "đã xác thực" với thời hạn 5 phút (300s)
    await this.redisClient.set(`verified:email:${email}`, 'true', 'EX', 300);

    return { message: 'Xác thực OTP thành công.' };
  }

  // ✅ REGISTER
  async register(email: string, password: string, fullName: string) {
    // Kiểm tra xem email đã được xác minh chưa
    const verifiedKey = `verified:email:${email}`;
    const isVerified = await this.redisClient.get(verifiedKey);

    if (!isVerified) {
      throw new BadRequestException(
        'Vui lòng xác minh email trước khi tạo tài khoản.',
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      passwordHash: hashed,
      fullName,
    });

    // Xoá giấy phép sau khi đăng ký thành công
    await this.redisClient.del(verifiedKey);

    return user;
  }

  // ✅ LOGIN
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException('User not found');

    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khoá.');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) throw new UnauthorizedException('Wrong password');

    const payload = {
      sub: user.id,
      role: user.role,
      fullName: user.fullName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        pointsBalance: user.pointsBalance,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
      },
    };
  }

  // ✅ SEND OTP FOR PASSWORD RESET
  async sendPasswordResetOtp(email: string) {
    // 1. Kiểm tra xem email có tồn tại không
    const existingUser = await this.usersService.findByEmail(email);
    if (!existingUser) {
      throw new BadRequestException(
        'Email này chưa được đăng ký trong hệ thống.',
      );
    }

    // 2. Sinh 6 số ngẫu nhiên
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Lưu vào Redis (dùng chung prefix để có thể dùng chung hàm verifyOtp)
    const key = `otp:email:${email}`;
    await this.redisClient.set(key, hashedOtp, 'EX', 300); // 300 giây = 5 phút

    console.log(
      `[DEBUG OTP] Gửi mã OTP khôi phục mật khẩu ${otp} đến email ${email}`,
    );

    this.transporter
      .sendMail({
        from: `"EcoHabit" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Khôi phục mật khẩu - EcoHabit',
        text: `Mã OTP khôi phục mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong 5 phút.`,
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #2E5D3A;">Khôi phục mật khẩu</h2>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản EcoHabit.</p>
                    <h3 style="background: #F3F8F4; padding: 10px; text-align: center; color: #1B3A1E; border-radius: 8px;">
                        Mã OTP của bạn là: <strong style="font-size: 24px;">${otp}</strong>
                    </h3>
                    <p style="color: #8FA892; font-size: 12px;">Mã này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                </div>
            `,
      })
      .catch((error) => {
        console.error(
          '[EMAIL ERROR] Failed to send reset password OTP email:',
          error,
        );
      });

    return {
      message: 'Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn',
    };
  }

  // ✅ RESET PASSWORD
  async resetPassword(email: string, newPassword: string) {
    // Kiểm tra xem email đã được xác minh chưa
    const verifiedKey = `verified:email:${email}`;
    const isVerified = await this.redisClient.get(verifiedKey);

    if (!isVerified) {
      throw new BadRequestException(
        'Vui lòng xác minh OTP trước khi đặt lại mật khẩu.',
      );
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Không tìm thấy người dùng.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashed);

    // Xoá giấy phép sau khi đổi mật khẩu thành công
    await this.redisClient.del(verifiedKey);

    return { message: 'Mật khẩu đã được đặt lại thành công.' };
  }

  // ✅ GET PROFILE
  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      pointsBalance: user.pointsBalance,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
    };
  }

  // ✅ CHANGE PASSWORD (Logged-in User)
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(user.id, hashed);

    return { message: 'Đổi mật khẩu thành công.' };
  }
}
