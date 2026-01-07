import { prisma } from '@/utils/connection';
import { Platform } from '@prisma/client';

/**
 * SocialLinkRepository class provides methods to interact with the SocialLink table in the database.
 * It includes methods for retrieving and updating the user's social links.
 */
export class SocialLinkRepository {
  /**
   * Retrieve a user's social links with the given data.
   * @param userId - The unique ID of the user.
   * @returns The array of user's social links.
   */
  static async findByUserId(userId: string) {
    const socials = await prisma.socialLink.findMany({
      where: { userId },
    });
    return socials;
  }

  /**
   * Updates a user's social links with the given data.
   * @param userId - The unique ID of the user.
   * @param data - The data to update in the user's social links.
   * @returns The updated social links object.
   */
  static async updateSocialLinks(userId: string, data: { type: Platform; handle: string }[]) {
    const updatedSocials = await prisma.$transaction(
      data.map((socialLink) =>
        prisma.socialLink.upsert({
          where: {
            userId_type: {
              userId,
              type: socialLink.type,
            },
          },
          update: {
            handle: socialLink.handle,
          },
          create: {
            userId,
            type: socialLink.type,
            handle: socialLink.handle,
          },
        })
      )
    );

    return updatedSocials;
  }
}
