import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../shared/config/env";
import type { PrismaClient } from "../../../generated/prisma/client";
import { HttpError } from "../../shared/errors/http-error";
import type { User, UserWithoutPassword } from "../user/user.types";

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      email,
      passwordHash: hashedPassword,
    };

    const createdUser = await this.prisma.user.create({
      data: user,
    });

    return this.excludePassword(createdUser);
  }

  private findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private excludePassword(user: User): UserWithoutPassword {
    const { passwordHash: _passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email },
      env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    return { user: this.excludePassword(user), token };
  }
}
