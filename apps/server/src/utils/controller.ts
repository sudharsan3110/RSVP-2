import { IAuthenticatedRequest } from '@/interface/middleware';
import { NextFunction, Response } from 'express';
import { z } from 'zod';

export const controller = <Schema extends z.ZodObject<any>, ResBody = any>(
  schema: Schema,
  handler: (
    req: IAuthenticatedRequest<
      z.infer<Schema['shape']['params']>,
      ResBody,
      z.infer<Schema['shape']['body']>,
      z.infer<Schema['shape']['query']>
    >,
    res: Response,
    next: NextFunction
  ) => Promise<Response>
) => {
  return async (req: IAuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Runtime validation
      const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (!result.success) {
        const errors = result.error.errors.map((err) => ({
          message: err.message,
          path: err.path.join('.'),
        }));
        return res.status(400).json({
          message: 'Invalid request',
          errors,
        });
      }

      req.body = result.data.body;
      req.query = result.data.query;
      req.params = result.data.params;

      // Strong typing & execution
      return await handler(
        req as IAuthenticatedRequest<
          z.infer<Schema['shape']['params']>,
          ResBody,
          z.infer<Schema['shape']['body']>,
          z.infer<Schema['shape']['query']>
        >,
        res,
        next
      );
    } catch (err) {
      next(err);
    }
  };
};
