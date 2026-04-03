import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    // ✅ REGISTER
    async register(email: string, password: string, fullName: string) {
        const hashed = await bcrypt.hash(password, 10);

        const user = await this.usersService.create({
            email,
            passwordHash: hashed,
            fullName,
        });

        return user;
    }

    // ✅ LOGIN
    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);

        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) throw new UnauthorizedException('Wrong password');

        const payload = {
            sub: user.id,
            role: user.role,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}