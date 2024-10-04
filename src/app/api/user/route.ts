import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3),
  password: z.string().min(8),
  provider: z.enum(["Github", "Google", "Credential"]),
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const result = CreateUserSchema.safeParse(data);

  if (!result.success) {
    return NextResponse.json(
      {
        status: "Invalid input",
        message: `All fields ${result.error.errors
          .map((err) => err.path[0])
          .join(", ")} is required and must be valid`,
      },
      { status: 400 }
    );
  }

  const { email, name, password, provider } = result.data;

  try {
    const isUserAlreadyThere = await prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (isUserAlreadyThere) {
      if (isUserAlreadyThere.provider !== provider) {
        return NextResponse.json(
          {
            status: "Error",
            message: `User with email is already exits with ${isUserAlreadyThere.provider} provider`,
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { status: "Error", message: "User with email is already exits" },
        { status: 401 }
      );
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await prismaClient.user.create({
      data: { email, name, password: hashPassword, provider },
    });

    if (!user) {
      return NextResponse.json(
        { status: "Error", message: "Something went wrong try again" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "User have been created successfully",
        data: user,
      },
      { status: 201 }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      console.log(e.issues);
    }
    return NextResponse.json(
      { status: "Error", message: `Error while creating the user ${e}` },
      { status: 411 }
    );
  }
}
