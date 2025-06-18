import axios from 'axios';
import config from '@/config/config';
import logger from './logger';
import { EmailData } from '@/interface/middleware';

/**
 * EmailService class provides methods to send emails using an external email service.
 * It uses Axios to make HTTP requests to the email service API.
 * In dev/test it only logs; in production it calls the real service.
 */
class EmailService {
  static async send(emailData: EmailData): Promise<any> {
    const isProd = config.NODE_ENV === 'production';

    if (!isProd) {
      // Logs, no API call
      logger.debug('[dev] mock-email ↓\n' + JSON.stringify(emailData, null, 2));
      return { mocked: true };
    }

    // Make real API call in prod
    try {
      const response = await axios.post(config.EMAIL_API_URL, emailData, {
        headers: {
          Authorization: `${config.EMAIL_TOKEN}`,
        },
        timeout: 10_000,
      });
      logger.info('email sent', { id: emailData.id, to: emailData?.bcc?.length ?? 0 });
      return response.data;
    } catch (error: any) {
      logger.error('Error sending email', {
        id: emailData.id,
        msg: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export default EmailService;
