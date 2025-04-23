import { UserRepository } from '@/repositories/user.repository';
import { IAuthenticatedRequest } from '@/interface/middleware';
import catchAsync from '@/utils/catchAsync';
import { profilePayloadSchema, usernameSchema } from '@/validations/users.validation';
import z from 'zod';
import { Request } from 'express';
import logger from '@/utils/logger';

/**
 * Updates the profile of the authenticated user.
 * @param req - The HTTP request object containing the user's profile data in the body.
 * @param res - The HTTP response object.
 * @returns The updated user profile.
 */
export const updateUserProfileController = catchAsync(
  async (req: IAuthenticatedRequest<{}, {}, z.infer<typeof profilePayloadSchema>>, res) => {
    const userId = req.userId as unknown as string;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });

    let user = await UserRepository.updateProfile(userId, req.body);
    if (!user) return res.status(401).json({ message: 'Invalid or expired token' });
    const { fullName, location, contact } = user;

    logger.info('Checking if user profile is completed in updateUserProfileController ...');
    if (!!fullName && !!location && !!contact) {
      user = await UserRepository.updateProfile(userId, { isCompleted: true });
    }

    return res.status(200).json({ message: 'success', data: user });
  }
);

/**
 * Retrieves a user by their username.
 * @param req - The HTTP request object containing the username in the parameters.
 * @param res - The HTTP response object.
 * @returns The user's public profile data.
 */
export const getUserPublicController = catchAsync(
  async (req: Request<{}, {}, z.infer<typeof usernameSchema>>, res) => {
    const { username } = req.params as z.infer<typeof usernameSchema>;

    logger.info('Getting user by username in getUserPublicController ...');
    const user = await UserRepository.findByUserName(username);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { refreshToken, magicToken, ...publicUserProfile } = user;
    return res.status(200).json({ message: 'success', data: publicUserProfile });
  }
);

/**
 * Soft deletes a user by setting its `isDeleted` status to true.
 * @param req - The HTTP request object containing the user ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the user is deleted successfully.
 */
export const deleteUserController = catchAsync(
  async (req: IAuthenticatedRequest<{ userId?: string }, {}, {}>, res) => {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const deletedUser = await UserRepository.delete(userId);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({
      data: deletedUser,
      message: 'User deleted successfully',
      success: true,
    });
  }
);
