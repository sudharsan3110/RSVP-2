import { generateJwtToken } from "@/utils/jwt";
import { prisma } from "../connection";

export class Users {
  static async findById(id: number) {
    const user = await prisma.users.findUnique({
      where: { id },
    });
    return user;
  }

  static async userExists(email: string) {
    const user = await prisma.users.findUnique({
      where: { primary_email: email },
    });
    return user; // Return true or false
  }

  static async createUser(email: string) {
    const userExists = await this.userExists(email);
    if (userExists) {
      throw new Error("User already exists");
    }

    const newUser = await prisma.users.create({
      data: {
        primary_email: email,
        full_name: "",
      },
    });

    return newUser;
  }

  static async createMagicLink(userId: number): Promise<string> {
    const tokenId = crypto.randomUUID();
    const token = generateJwtToken({ userId, tokenId }, "10m");

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
      data: { magicToken: "" },
    });

    return user;
  }

  static async completeProfile(id: number): Promise<void> {
    await prisma.users.update({
      where: { id },
      data: { is_completed: true },
    });
  }
}
