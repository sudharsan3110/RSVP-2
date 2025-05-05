import { Request } from 'express';

export interface IAuthenticatedRequest<
  P = {},
  ResBody = {},
  ReqBody = { accessToken?: string; refreshToken?: string },
> extends Request<P, ResBody, ReqBody> {
  userId?: string;
  Role?: string;
}

export interface IEventIdRequest
  extends IAuthenticatedRequest<{ eventId?: string }, {}, { eventId?: string }> {}

export interface EmailData {
  id: number;
  subject: string;
  recipient?: string;
  body: Record<string, string>;
}
