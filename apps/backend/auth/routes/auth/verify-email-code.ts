import { FastifyInstance } from "fastify";
import { z } from "zod";
import { verifyEmailVerificationCode } from "../../database/lib/emailVerificationService.ts";
import { verifyUserEmail } from "../../database/lib/userService.ts";
import { db } from "../../database/init";
import { createSession } from "../../database/lib/createSession.ts";

const verifyEmailCodeSchema = z.object({
  email: z.string().email("invalid email format"),
  code: z.string().length(6, "code must be 6 digits"),
});

export async function verifyEmailCodeRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/verify-email-code",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Verify email with 6-digit code",
        body: {
          type: "object",
          required: ["email", "code"],
          properties: {
            email: { type: "string", format: "email" },
            code: { type: "string", minLength: 6, maxLength: 6 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const validation = verifyEmailCodeSchema.safeParse(request.body);

        if (!validation.success) {
          return reply.status(400).send({
            error: validation.error.errors[0].message,
          });
        }

        const { email, code } = validation.data;

        const verificationResult = await verifyEmailVerificationCode(
          email,
          code
        );

        if (!verificationResult.success || !verificationResult.userId) {
          return reply.status(400).send({
            error: "invalid or expired verification code",
          });
        }

        await verifyUserEmail(verificationResult.userId);

        const user = db
                  .prepare("SELECT * FROM users WHERE email = ?")
                  .get(email) as any;
        
                if (!user) {
                  return reply.status(401).send({
                    error: "user not found",
                  });
                }
        
                const accessToken = fastify.jwt.sign(
                  {
                    userId: user.id,
                    email: user.email,
                    displayName: user.display_name,
                  },
                  { expiresIn: "7d" }
                );
        
                const session = await createSession(
                  user.id,
                  request.ip,
                  request.headers["user-agent"]
                );
        
                (reply as any).setCookie("refreshToken", session.refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  maxAge: 7 * 24 * 60 * 60 * 1000,
                  path: "/",
                });
        
                db.prepare(
                  "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
                ).run(user.id);

        reply.send({
          message: "email verified successfully",
          accessToken,
          user: {
            id: user.id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            is_verified: user.is_verified,
          },
        });
      } catch (error: any) {
        reply.status(400).send({ error: error.message });
      }
    }
  );
}
