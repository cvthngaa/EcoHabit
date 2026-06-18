import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }

  async create(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async updatePassword(id: string, passwordHash: string) {
    return this.userRepository.update(id, { passwordHash });
  }

  async updatePoints(id: string, pointsBalance: number) {
    return this.userRepository.update(id, { pointsBalance });
  }

  async updateProfile(id: string, dto: UpdateUserProfileDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.fullName !== undefined) {
      const fullName = dto.fullName.trim();
      if (!fullName) {
        throw new BadRequestException('Full name must not be empty');
      }
      user.fullName = fullName;
    }

    if (dto.avatarUrl !== undefined) {
      user.avatarUrl = dto.avatarUrl?.trim() || null;
    }

    if (dto.dateOfBirth !== undefined) {
      user.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    return this.userRepository.save(user);
  }
}
