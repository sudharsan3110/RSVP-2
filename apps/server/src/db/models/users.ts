import { generateAccessToken } from '@/utils/jwt';
import { prisma } from '../connection';
import { randomUUID } from 'crypto';
import { generateUsernameByEmail } from '@/utils/function';

export class Users {
  static async findById(id: string) {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return user;
  }
  static async userExists(email: string) {
    const user = await prisma.users.findUnique({
      where: { primary_email: email },
    });
    return user;
  }

  static async createUser(email: string) {
    const userExists = await this.userExists(email);
    if (userExists) {
      throw new Error('User already exists');
    }
    const username = generateUsernameByEmail(email);
    const newUser = await prisma.users.create({
      data: {
        primary_email: email,
        username,
      },
    });

    return newUser;
  }

  static async createMagicLink(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const token = generateAccessToken({ userId, tokenId });

    await prisma.users.update({
      where: { id: userId },
      data: { magicToken: tokenId },
    });

    return token;
  }

  static async checkMagicLink(tokenId: string) {
    const user = await prisma.users.findUnique({
      where: { magicToken: tokenId },
    });

    if (!user) {
      return null;
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { magicToken: null },
    });

    return user;
  }

  static async completeProfile(id: string): Promise<void> {
    await prisma.users.update({
      where: { id },
      data: { is_completed: true },
    });
  }

  static async updateProfile(id: string, data: any) {
    return await prisma.users.update({
      where: { id },
      data: data,
    });
  }

  static async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    await prisma.users.update({
      where: { id: userId },
      data: { refreshToken },
    });
  }

  static async findByUserName(username: string) {
    const user = await prisma.users.findUnique({
      where: { username },
    });
    return user;
  }
}
