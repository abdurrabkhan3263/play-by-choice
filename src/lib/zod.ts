import { z } from "zod";

export const CreateStreamUrl = z
  .string()
  .regex(
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|spotify\.com|open\.spotify\.com)\/.+$/,
    {
      message: "URL must be from YouTube or Spotify",
    }
  );
const email = z.string().email({ message: "Email must be valid" });
const password = z
  .string()
  .min(8, { message: "Password must be more than 8 character" });

export const CreateStreamSchema = z.object({
  spaceName: z.string().nonempty(),
});

export const CreateUser = z.object({
  name: z.string().min(3, { message: "Name should more that 3 character" }),
  email,
  password,
});
