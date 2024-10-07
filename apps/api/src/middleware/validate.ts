import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

export const validate = (schema: {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const reqSchema = z.object(schema);
    const result = reqSchema.safeParse(req);

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        message: err.message,
        path: err.path.join("."),
      }));

      return res.status(400).json({
        message: `Invalid Request`,
        errors: formattedErrors,
      });
    }
    next();
  };
};
