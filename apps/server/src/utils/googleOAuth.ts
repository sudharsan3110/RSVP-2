import { OAuth2Client } from 'google-auth-library';
import config from '@/config/config';

/**
 * Google OAuth2Client instance.
 */

const googleClient = new OAuth2Client(
  config.GOOGLE_CLIENT_ID,
  config.GOOGLE_CLIENT_SECRET,
  config.GOOGLE_REDIRECT_URI
);

export default googleClient;
