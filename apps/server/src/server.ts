import config from '@/config/config';
import { errorHandler, successHandler } from '@/config/morgan';
import { router } from '@/routes/v1/routes';
import cookieParser from 'cookie-parser';
import cors, { CorsOptions } from 'cors';
import express, { json, NextFunction, urlencoded, type Express } from 'express';

export const createServer = (): Express => {
  const app = express();

  const corsOptions: CorsOptions = {
    origin: [config.CLIENT_URL],
    credentials: true,
  };

  app
    .disable('x-powered-by')
    .use(urlencoded({ extended: true }))
    .use(json({ limit: '1mb' }))
    .use(cors(corsOptions))
    .use(successHandler)
    .use(errorHandler)
    .use(cookieParser())
    .use('/v1', router)
    .use((req, res) => {
      return res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
    })
    .use((err: Error, _req: any, res: any, _next: NextFunction) => {
      if (config.env === 'development') {
        console.log(err.stack);
      }
      return res.status(500).json({ message: `Something Went Wrong` });
    });

  return app;
};
