import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { profilePayloadSchema, usernameSchema } from '@/validations/users.validation';
import z from 'zod';
import { Request } from 'express';

type UpdateProfileBody = z.infer<typeof profilePayloadSchema>;
type usernameParams = z.infer<typeof usernameSchema>;
export const updateProfile = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, UpdateProfileBody>, res) => {
    const userId = req.userId as unknown as string;
    if (!userId) return res.status(401).json({ message: 'Invalid or expired token' });
    let user;
    user = await Users.updateProfile(userId, req.body);

    if (!user) return res.status(401).json({ message: 'Invalid or expired token' });

    const { full_name, location, contact, is_completed } = user;

    const isProfileCompleted = !!full_name && !!location && !!contact;

    if (!is_completed && isProfileCompleted)
      user = await Users.updateProfile(userId, { is_completed: true });

    return res.status(200).json({ message: 'success', data: user });
  }
);

export const getUserByUserName = catchAsync(async (req: Request<{}, {}, usernameParams>, res) => {
  const { username } = req.params as usernameParams;

  const user = await Users.findByUserName(username);

  if (!user) return res.status(404).json({ message: 'User not found' });

  const userDataToDisplay = {
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    location: user.location,
    contact: user.contact,
    instagram: user.instagram,
    twitter: user.twitter,
    created_at: user.created_at,
    email: user.primary_email,
    bio: user.bio,
  };
  return res.status(200).json({ message: 'success', data: userDataToDisplay });
});
