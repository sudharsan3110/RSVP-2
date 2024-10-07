import config from "@/config/config";
import { JwtPayload, sign, verify } from "jsonwebtoken";

export function generateJwtToken(
  payload: Record<string, any>,
  expiresIn: string = "1h",
): string {
  return sign(payload, config.JWT_SECRET_KEY, { expiresIn });
}

export function verifyJwtToken(token: string): JwtPayload | null {
  try {
    const decoded = verify(token, config.JWT_SECRET_KEY) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
