import z from "zod";

export const SigninSchema = z.object({
  email: z.string().min(1, { message: "email is required" }).email(),
});
