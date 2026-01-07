import {
  getSocialLinksByUserId,
  getSocialLinksOfSignedInUser,
  updateSocialLinks,
} from '@/controllers/socialLinks.controller';
import authMiddleware from '@/middleware/authMiddleware';
import { Router } from 'express';

const socialLinksRouter: Router = Router();

socialLinksRouter.get('/', authMiddleware, getSocialLinksOfSignedInUser);
socialLinksRouter.get('/:userId', getSocialLinksByUserId);
socialLinksRouter.put('/update', authMiddleware, updateSocialLinks);

export { socialLinksRouter };
