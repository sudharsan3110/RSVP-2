import { UserRepository } from '@/repositories/user.repository';
import { BadRequestError, NotFoundError, TokenExpiredError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import logger from '@/utils/logger';
import { emptySchema } from '@/validations/common';
import { updateProfileSchema, usernameSchema } from '@/validations/users.validation';

/**
 * Updates the profile of the authenticated user.
 * @param req - The HTTP request object containing the user's profile data in the body.
 * @param res - The HTTP response object.
 * @returns The updated user profile.
 */
export const updateUserProfileController = controller(updateProfileSchema, async (req, res) => {
  const userId = req.userId;
  if (!userId) throw new TokenExpiredError();

  let user = await UserRepository.updateProfile(userId, req.body);
  if (!user) throw new TokenExpiredError();
  const { fullName, location, contact } = user;

  logger.info('Checking if user profile is completed in updateUserProfileController ...');
  if (!!fullName && !!location && !!contact) {
    user = await UserRepository.updateProfile(userId, { isCompleted: true });
  }
  return new SuccessResponse('success', user).send(res);
});

/**
 * Retrieves a user by their username.
 * @param req - The HTTP request object containing the username in the parameters.
 * @param res - The HTTP response object.
 * @returns The user's public profile data.
 */
export const getUserPublicController = controller(usernameSchema, async (req, res) => {
  const { username } = req.params;

  logger.info('Getting user by username in getUserPublicController ...');
  const user = await UserRepository.findByUserName(username);
  if (!user) throw new NotFoundError('User not found');

  const { refreshToken, magicToken, ...publicUserProfile } = user;
  return new SuccessResponse('success', publicUserProfile).send(res);
});

/**
 * Soft deletes a user by setting its `isDeleted` status to true.
 * @param req - The HTTP request object containing the user ID in the parameters.
 * @param res - The HTTP response object.
 * @returns A success message if the user is deleted successfully.
 */
export const deleteUserController = controller(emptySchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new BadRequestError('User ID is required');

  const deletedUser = await UserRepository.delete(userId);
  if (!deletedUser) throw new NotFoundError('User not found');

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return new SuccessResponse('success', deletedUser).send(res);
});
