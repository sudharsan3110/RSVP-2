import { IAuthenticatedRequest } from '@/interface/middleware';
import { UserRepository } from '@/repositories/user.repository';
import { TokenExpiredError } from '@/utils/apiError';
import catchAsync from '@/utils/catchAsync';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

/**
 * Middleware to authorize users based on their assigned roles.
 * @param allowedRoles - An array of roles that are permitted to access the resource.
 * @returns A middleware function that verifies the user's role permissions.
 */
export const roleMiddleware = (allowedRoles: UserRole) => {
  return catchAsync(async (req: IAuthenticatedRequest, res, next) => {
    const { userId } = req;

    if (!userId) throw new TokenExpiredError();

    const hasAllowedRolesAccess = await UserRepository.findRoleByUserId(userId, allowedRoles);

    if (!hasAllowedRolesAccess) return res.status(403).json({ message: 'Unauthorized access' });

    req.userRole = hasAllowedRolesAccess.role as UserRole;

    return next();
  });
};
