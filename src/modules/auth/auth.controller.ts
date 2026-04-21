import type { Request, Response } from "express";
import { localLoginService, socialLoginService } from "../auth/auth.service.js";

// local 로그인
export async function localLoginController(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await localLoginService(email, password);

  return res.status(200).json({
    success: true,
    message: "로그인 성공",
    data: result,
  });
}

// social 로그인
export async function socialLoginController(req: Request, res: Response) {
  const { email, nickname, provider, provider_id } = req.body;

  const result = await socialLoginService({
    email,
    nickname,
    provider,
    provider_id,
  });

  return res.status(200).json({
    success: true,
    message: "소셜 로그인 성공",
    data: result,
  });
}
