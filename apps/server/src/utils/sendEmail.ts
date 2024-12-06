import axios from 'axios';
import config from '@/config/config';
import logger from './logger';

interface EmailData {
  id: number;
  subject: string;
  recipient: string;
  body: Record<string, string>;
}

class EmailService {
  private static emailUrl = 'https://tsp-emailservice.vercel.app/email';

  static async send(emailData: EmailData): Promise<any> {
    try {
      const response = await axios.post(this.emailUrl, emailData, {
        headers: {
          Authorization: `Bearer ${config.EMAIL_TOKEN}`,
        },
      });
      return response.data;
    } catch (error) {
      logger.error(`Error sending email: ${JSON.stringify(error)}`);
      // throw new Error(`Error sending email: ${error.message}`);
    }
  }
}

export default EmailService;
