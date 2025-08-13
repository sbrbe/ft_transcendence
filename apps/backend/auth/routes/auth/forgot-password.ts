import { FastifyInstance } from "fastify";
import { z } from "zod";
import { sendPasswordResetEmail } from "../../database/lib/emailService.ts";
import { createToken } from "../../database/lib/tokenService.ts";
import { getUserByEmail } from "../../database/lib/userService.ts";

const forgotPasswordBodySchema = z.object({
  email: z.string().email("invalid email format"),
});

export async function forgotPasswordRoute(fastify: FastifyInstance) {
  fastify.post(
    "/auth/forgot-password",
    {
      schema: {
        tags: ["Authentication"],
        summary: "Request password reset",
        body: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
          },
        },
        response: {
          200: {
            description: "Password reset email sent",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                  },
                },
              },
            },
          },
          400: {
            description: "Request failed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const validation = forgotPasswordBodySchema.safeParse(request.body);

        if (!validation.success) {
          return reply.status(400).send({
            error: validation.error.errors[0].message,
          });
        }

        const { email } = validation.data;

        try {
          const user = await getUserByEmail(email);

          const tokenData = await createToken(user.id, "password_reset", 1);

          await sendPasswordResetEmail(email, tokenData.token);

          reply.send({
            message: "if email exists, password reset instructions have been sent"
          });
        } catch (error) {
          reply.send({
            message: "if email exists, password reset instructions have been sent"
          });
        }
      } catch (error: any) {
        reply.status(400).send({ error: error.message });
      }
    }
  );
}
