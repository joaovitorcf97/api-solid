import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";
import { UserAlredyExistsError } from "@/use-cases/errors/user-alredy-exists-error";
import { RegisterUseCase } from "@/use-cases/register.usecase";
import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export async function RegisterController(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
  });

  const { name, email, password } = registerBodySchema.parse(request.body);

  try {
    const prismaUsersRepository = new PrismaUsersRepository();
    const registerUseCase = new RegisterUseCase(prismaUsersRepository);

    await registerUseCase.execute({ name, email, password });
  } catch (err) {
    if (err instanceof UserAlredyExistsError) {
      return reply.status(409).send({ message: err.message });
    }

    throw err;
  }

  return reply.status(201).send();
}