import type { Request } from 'express';
import type { UserRole } from '../../modules/users/enums/user-role.enum';

export type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    sub?: string;
    role: UserRole;
    fullName?: string;
  };
};
