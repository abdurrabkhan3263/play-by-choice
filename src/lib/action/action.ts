import { prismaClient } from "../db";

export async function insertStream(spaceId: string) {
  try {
    const insertedStream = await prismaClient.space.create;
  } catch (error) {
    throw new Error("Something went wrong");
  }
}
