import { SocialLinkRepository } from '@/repositories/socialLinks.repository';
import { BadRequestError } from '@/utils/apiError';
import { SuccessResponse } from '@/utils/apiResponse';
import { controller } from '@/utils/controller';
import {
  getSocialLinksByUserIdSchema,
  getSocialLinksSchema,
  updateSocialLinksSchema,
} from '@/validations/socialLinks.validation';

/**
 * Retrieves all the social links of the current signed in user.
 * @param req - The HTTP request object containing the userId from JWT.
 * @param res - The HTTP response object.
 * @returns The array of social links of the user.
 */
export const getSocialLinksOfSignedInUser = controller(getSocialLinksSchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new BadRequestError('User ID is required');

  const socialLinks = await SocialLinkRepository.findByUserId(userId);

  return new SuccessResponse('success', socialLinks).send(res);
});

/**
 * Retrieves all the social links of a user by their userId.
 * @param req - The HTTP request object containing the userId in the path parameters.
 * @param res - The HTTP response object.
 * @returns The array of social links of the user.
 */
export const getSocialLinksByUserId = controller(getSocialLinksByUserIdSchema, async (req, res) => {
  const { userId } = req.params;
  if (!userId) throw new BadRequestError('User ID is required');

  const socialLinks = await SocialLinkRepository.findByUserId(userId);

  return new SuccessResponse('success', socialLinks).send(res);
});

/**
 * Update or Creates (if not exists) social links in the database.
 * @param req - The HTTP request object containing the userId and data in the body.
 * @param res - The HTTP response object.
 * @returns The array of social links of the user.
 */
export const updateSocialLinks = controller(updateSocialLinksSchema, async (req, res) => {
  const { userId } = req;
  if (!userId) throw new BadRequestError('User ID is required');

  const data = req.body;

  const updatedSocialLinks = await SocialLinkRepository.updateSocialLinks(userId, data);

  return new SuccessResponse('Social links updated successfully', updatedSocialLinks).send(res);
});
