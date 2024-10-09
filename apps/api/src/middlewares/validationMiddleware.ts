import { ErrorHandler } from '@/helpers/response';
import { registerSchema } from '@/schemas/auth.schema';
import { NextFunction, Request, Response } from 'express';
import { Schema, ZodError, ZodObject, z } from 'zod';

export const validateData =
  (schema: z.infer<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body, 'ini req body di validationMiddleware');
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map((err) => err.message).join(', ');

        throw new ErrorHandler(message, 400);
      }
      throw new ErrorHandler('Invalid data', 400);
    }
  };
