import { generateAccessToken } from '@/utils/jwt';
import { prisma } from '@/utils/connection';
import { randomUUID } from 'crypto';
import { generateUsernameByEmail } from '@/utils/function';

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
    const user = await prisma.users.findUnique({
      where: { id, isDeleted: false },
    });
    return user;
  }

  /**
   * Finds a user by their username.
   * @param userName - The username of the user.
   * @returns The user object if found, otherwise null.
   */
  static async findByUserName(userName: string) {
    const user = await prisma.users.findUnique({
      where: { userName, isDeleted: false },
    });
    return user;
  }

  /**
   * Finds a user by their primary email address.
   * @param primaryEmail - The primary email of the user.
   * @returns The user object if found, otherwise null.
   */
  static async findbyEmail(primaryEmail: string) {
    const user = await prisma.users.findFirst({
      where: { primaryEmail, isDeleted: false },
    });
    return user;
  }

  /**
   * Finds multiple users by their IDs.
   * @param ids - An array of user IDs.
   * @returns An array of user objects.
   */
  static async findAllByIds(ids: string[]) {
    const users = await prisma.users.findMany({
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
    const userName = generateUsernameByEmail(primaryEmail);
    const newUser = await prisma.users.create({
      data: {
        primaryEmail,
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

    await prisma.users.update({
      where: { id: userId, isDeleted: false },
      data: { magicToken: tokenId },
    });

    return token;
  }

  /**
   * Verifies a magic token and clears it from the database.
   * @param tokenId - The magic token to verify.
   * @returns The user object if the token is valid, otherwise null.
   */
  static async verifyToken(tokenId: string) {
    const user = await prisma.users.update({
      where: { magicToken: tokenId, isDeleted: false },
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
    return await prisma.users.update({
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
    await prisma.users.update({
      where: { id: userId, isDeleted: false },
      data: { refreshToken },
    });
  }

  /**
   * Soft deletes a user by setting its `isDeleted` status to true.
   * @param userId - The unique ID of the user.
   * @returns The updated user object.
   */
  static async delete(userId: string) {
    return await prisma.users.update({
      where: { id: userId },
      data: { isDeleted: true },
    });
  }
}
