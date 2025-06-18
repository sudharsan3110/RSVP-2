import config from '@/config/config';
import logger from '@/utils/logger';
import { createServer } from './server';
import cron from 'node-cron';
import processEventNotifications from '@/scripts/eventNotificationScript';

const port = config.PORT;
const server = createServer();

/**
 * Starts the server and listens on the specified port.
 * Logs a message indicating the server is running.
 */
server.listen(port, () => {
  logger.info(`server running on http://localhost:${port}`);
});

/**
 * Sets up a cron job to process event notifications every hour.
 * This is only enabled in the production environment.
 */
if (config.NODE_ENV === 'production') {
  cron.schedule('*/15 * * * *', async () => {
    processEventNotifications()
      .then(() => {
        logger.info(`Cron Job Triggered at ${new Date().toISOString()}`);
      })
      .catch((error) => {
        logger.error('Cron Job Error:', error);
      });
  });
}
