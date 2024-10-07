import catchAsync from "@/utils/catchAsync";
import { Request } from "express";
import { SigninSchema } from "@/validations/auth.validation";
import z from "zod";
import { Users } from "@/db/models/users";

type RequestBody = z.infer<typeof SigninSchema>;
export const signin = catchAsync(
  async (req: Request<{}, {}, RequestBody>, res, next) => {
    return res.status(200).json({ message: "success" });
  },
);

export const verifySignin = catchAsync(async (req, res, next) => {
  return res.status(200).json({ message: "success" });
});

export const me = catchAsync(async (req, res, next) => {
  return res.status(200).json({ message: "success" });
});
