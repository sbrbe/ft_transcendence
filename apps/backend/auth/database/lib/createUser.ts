import bcrypt from "bcrypt";
import { z } from "zod";
import { db } from "../init";

const createUserSchema = z.object({
  email: z.string().email("invalid email format"),
  password: z.string().min(6, "password must be at least 6 characters"),
});

export const createUser = async (email: string, password: string) => {
  const validation = createUserSchema.safeParse({ email, password });

  if (!validation.success) {
    throw new Error(validation.error.errors[0].message);
  }

  const emailExists = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);
  if (emailExists) {
    throw new Error("email already exists");
  }

  const displayName = email.split("@")[0].slice(0, 5) + Math.floor(Math.random() * 100);

  const displayNameExists = db
    .prepare("SELECT * FROM users WHERE display_name = ?")
    .get(displayName);

  let finalDisplayName = displayName;
  if (displayNameExists) {
    finalDisplayName = `${displayName}${Date.now()}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = db
    .prepare(
      "INSERT INTO users (email, password_hash, display_name, avatar_url) VALUES (?, ?, ?, ?)"
    )
    .run(email, passwordHash, finalDisplayName, "");

  return user.lastInsertRowid;
};
