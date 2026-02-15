import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { connectDB } from "../config/database";
import { UserModel } from "../models";

dotenv.config();

const seedUsers = async (): Promise<void> => {
  await connectDB();

  const rosterPath = path.resolve(
    __dirname,
    "../../../..",
    "apps/mobile/data/mock/sfsu_roster.txt"
  );

  const rosterLines = fs
    .readFileSync(rosterPath, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const seenEmails = new Map<string, number>();

  const users = rosterLines.map((name) => {
    const baseEmail = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "");

    const count = (seenEmails.get(baseEmail) ?? 0) + 1;
    seenEmails.set(baseEmail, count);

    const email =
      count === 1
        ? `${baseEmail}@sfsu.edu`
        : `${baseEmail}${count}@sfsu.edu`;

    return { name, email };
  });

  const results = await Promise.all(
    users.map((user) =>
      UserModel.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      )
    )
  );

  const upserted = results.filter((result) => result.upsertedCount > 0).length;
  const updated = results.length - upserted;

  console.log(`Seeded users. Added: ${upserted}, Updated: ${updated}`);
  process.exit(0);
};

seedUsers().catch((error) => {
  console.error("Failed to seed users:", error);
  process.exit(1);
});
