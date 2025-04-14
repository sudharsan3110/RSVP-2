import config from '@/config/config';
import logger from '@/utils/logger';
import { createServer } from './server';
import cron from 'node-cron';
import processEventNotifications from './scripts/eventNotificationScript';

const port = config.PORT;
const server = createServer();

server.listen(port, () => {
  logger.info(`Api server running on ${port}`);
});

if(config.env==="production") {
  cron.schedule('0 * * * *', async () => {
    processEventNotifications()
      .then(() => {
        console.log(`Cron Job Triggered at ${new Date().toISOString()}`);
      })
      .catch((error) => {
        console.error('Cron Job Error:', error);
      });
  });
}