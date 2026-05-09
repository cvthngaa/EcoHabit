import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionQrSession } from './entities/collection-qr-session.entity';
import * as crypto from 'crypto';

@Injectable()
export class QrService {
  constructor(
    @InjectRepository(CollectionQrSession)
    private readonly qrSessionRepo: Repository<CollectionQrSession>,
  ) {}

  async generateQr(locationId: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const session = this.qrSessionRepo.create({
      location: { id: locationId },
      qrToken: token,
      expiresAt,
    });

    await this.qrSessionRepo.save(session);
    return token;
  }

  async validateAndUseQr(locationId: string, qrToken: string): Promise<boolean> {
    const session = await this.qrSessionRepo.findOne({
      where: {
        location: { id: locationId },
        qrToken,
      },
    });

    if (!session) {
      throw new NotFoundException('QR session not found');
    }

    if (session.isUsed) {
      throw new BadRequestException('QR code already used');
    }

    if (new Date() > session.expiresAt) {
      throw new BadRequestException('QR code expired');
    }

    session.isUsed = true;
    await this.qrSessionRepo.save(session);
    return true;
  }
}
