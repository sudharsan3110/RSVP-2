import { Users } from '@/db/models/users';
import { AuthenticatedRequest } from '@/middleware/authMiddleware';
import catchAsync from '@/utils/catchAsync';
import { profilePayloadSchema } from '@/validations/users.validation';
import z from 'zod';

type UpdateProfileBody = z.infer<typeof profilePayloadSchema>;
export const updateProfile = catchAsync(
  async (req: AuthenticatedRequest<{}, {}, UpdateProfileBody>, res) => {
    const userId = req.userId;
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
