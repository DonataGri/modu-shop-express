import type { Request, Response } from "express";
import type { AuthService } from "./auth.service";
import type { CredentialsDto } from "./dto/credentials.dto";

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request<object, object, CredentialsDto>, res: Response) {
    const { email, password } = req.body;
    const user = await this.authService.register(email, password);
    res.status(201).json(user);
  }

  async login(req: Request<object, object, CredentialsDto>, res: Response) {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);
    res.status(200).json(result);
  }
}
