import { prisma } from '@/utils/connection';
import { generateUniqueUsername } from '@/utils/function';
import { generateAccessToken } from '@/utils/jwt';
import { randomUUID } from 'crypto';
import { BadRequestError } from '@/utils/apiError';

/**
 * UserRepository class provides methods to interact with the Users table in the database.
 * It includes methods for CRUD operations, token management, and user-specific queries.
 */
export class UserRepository {
  /**
   * Finds a user by their unique ID.
   * @param id - The unique ID of the user.
   * @returns The user object if found, otherwise null.
   */
  static async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id, isDeleted: false },
      include: {
        socialLinks: true,
      },
    });
    return user;
  }

  /**
   * Finds a user by their username.
   * @param userName - The username of the user.
   * @returns The user object if found, otherwise null.
   */
  static async findByUserName(userName: string) {
    const user = await prisma.user.findUnique({
      where: { userName, isDeleted: false },
      select: {
        socialLinks: {
          select: {
            handle: true,
            type: true,
          },
        },
        bio: true,
        createdAt: true,
        fullName: true,
        location: true,
        userName: true,
        profileIcon: true,
        isDeleted: true,
      },
    });
    return user;
  }

  /**
   * Finds a user by their primary email address.
   * @param primaryEmail - The primary email of the user.
   * @param isDeleted - Filter by isDeleted status. Pass null to ignore this filter.
   * @returns The user object if found, otherwise null.
   */
  static async findbyEmail(primaryEmail: string, isDeleted: boolean | null = false) {
    const user = await prisma.user.findFirst({
      where: {
        primaryEmail,
        isDeleted: isDeleted !== null ? isDeleted : undefined,
      },
    });
    return user;
  }

  /**
   * Finds Many users by their primary email address.
   * @param primaryEmail - The array of primary emails of the users.
   * @param isDeleted - Filter by isDeleted. Pass null to ignore this filter.
   * @returns Array of User records. Returns an empty array when no matches are found.
   */

  static async findManyByEmails(emails: string[], isDeleted: boolean | null = false) {
    return prisma.user.findMany({
      where: {
        primaryEmail: { in: emails },
        isDeleted: isDeleted !== null ? isDeleted : undefined,
      },
    });
  }

  /**
   * Finds multiple users by their IDs.
   * @param ids - An array of user IDs.
   * @returns An array of user objects.
   */
  static async findAllByIds(ids: string[]) {
    const users = await prisma.user.findMany({
      where: { id: { in: ids }, isDeleted: false },
    });
    return users;
  }

  /**
   * Creates a new user with the given primary email.
   * @param primaryEmail - The primary email of the new user.
   * @returns The newly created user object.
   */
  static async create(primaryEmail: string) {
    const userName = generateUniqueUsername();
    const newUser = await prisma.user.create({
      data: {
        primaryEmail,
        userName,
      },
    });
    return newUser;
  }

  /**
   * Creates multiple users in a single database transaction.
   * @param emails - Array of primary emails to create users for.
   * @returns A list of the newly created user records.
   */

  static async createMany(emails: string[]) {
    return prisma.$transaction(async (tx) => {
      return Promise.all(
        emails.map((email) => {
          const userName = generateUniqueUsername();
          return tx.user.create({
            data: {
              primaryEmail: email,
              userName,
            },
          });
        })
      );
    });
  }

  /**
   * Creates a new user through Google Oauth.
   * @param primaryEmail - The primary email of the new user.
   * @param fullName - The full name of the new user.
   * @returns The newly created user object.
   */
  static async createUserByGoogleOAuth(primaryEmail: string, fullName?: string) {
    const userName = generateUniqueUsername();
    const newUser = await prisma.user.create({
      data: {
        primaryEmail,
        fullName,
        userName,
      },
    });
    return newUser;
  }

  /**
   * Creates a magic token for a user.
   * @param userId - The unique ID of the user.
   * @returns The generated magic token.
   */
  static async createToken(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const token = generateAccessToken({ userId, tokenId });

    let auth = await prisma.auth.findFirst({
      where: { userId, provider: 'MAGIC_LINK' },
    });

    if (!auth) {
      auth = await prisma.auth.create({
        data: {
          userId,
          magicToken: tokenId,
          provider: 'MAGIC_LINK',
        },
      });
    }

    await prisma.auth.update({
      where: { id: auth.id },
      data: { magicToken: tokenId },
    });

    return token;
  }

  /**
   * Verifies a magic token and clears it from the database.
   * @param tokenId - The magic token to verify.
   * @returns The user object if the token is valid, otherwise null.
   */
  static async verifyToken(userId: string, tokenId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;
    if (user.isDeleted) return null;

    const auth = await prisma.auth.findFirst({
      where: {
        userId: userId,
        provider: 'MAGIC_LINK',
      },
    });

    if (!auth) return null;

    if (auth.magicToken !== tokenId) return null;

    await prisma.auth.update({
      where: { id: auth.id },
      data: { magicToken: null },
    });
    return user;
  }

  /**
   * Updates a user's profile with the given data.
   * @param id - The unique ID of the user.
   * @param data - The data to update in the user's profile.
   * @returns The updated user object.
   */
  static async updateProfile(id: string, data: any) {
    return await prisma.user.update({
      where: { id, isDeleted: false },
      data: data,
    });
  }

  /**
   * Updates the refresh token for a user.
   * @param userId - The unique ID of the user.
   * @param refreshToken - The new refresh token, or null to clear it.
   */
  static async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const auth = await prisma.auth.findFirst({
      where: { userId, provider: 'MAGIC_LINK' }, // `provider` is needed to by taken as param but it will be updated later.
    });

    if (!auth) return;

    await prisma.auth.update({
      where: { id: auth.id },
      data: { refreshToken },
    });
  }

  /**
   * Soft deletes a user by setting its `isDeleted` status to true
   * and cascades the deletion to all related entities.
   * @param userId - The unique ID of the user.
   * @returns The updated user object.
   */
  static async delete(userId: string) {
    const currentDate = new Date();

    const upcomingEvents = await prisma.event.findMany({
      where: {
        creatorId: userId,
        startTime: {
          gte: currentDate,
        },
        isDeleted: false,
        isActive: true,
      },
    });

    if (upcomingEvents.length > 0) {
      throw new BadRequestError(
        'You have upcoming events. Please cancel them before deleting your account.'
      );
    }

    return await prisma.$transaction(async (tx) => {
      await tx.attendee.updateMany({
        where: { userId, isDeleted: false },
        data: { isDeleted: true, status: 'CANCELLED', allowedStatus: false },
      });

      await tx.host.updateMany({
        where: { userId, isDeleted: false },
        data: { isDeleted: true },
      });

      await tx.chat.updateMany({
        where: { userId, isDeleted: false },
        data: { isDeleted: true },
      });

      await tx.auth.updateMany({
        where: { userId },
        data: { magicToken: null, refreshToken: null },
      });

      const deletedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isDeleted: true,
        },
      });

      return deletedUser;
    });
  }
}
