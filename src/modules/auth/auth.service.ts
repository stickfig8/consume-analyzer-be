import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "../../errors/AppError.js";
import {
  createSocialUser,
  findUserByEmail,
  findUserByProvider,
} from "../user/user.repository.js";

function generateToken(email: string, nickname: string, provider: string) {
  return jwt.sign(
    { email: email, nickname: nickname, provider: provider },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1h",
    },
  );
}

// local 로그인
export async function localLoginService(email: string, password: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404);
  }

  if (user.provider !== "local") {
    throw new AppError("소셜 로그인 계정입니다.", 400);
  }

  const isVaild = await bcrypt.compare(password, user.password);

  if (!isVaild) {
    throw new AppError("비밀번호가 올바르지 않습니다.", 401);
  }

  const token = generateToken(user.email, user.nickname, user.provider);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    },
  };
}

// social 로그인 & 회원가입
export async function socialLoginService({
  email,
  nickname,
  provider,
  provider_id,
}: {
  email: string;
  nickname: string;
  provider: string;
  provider_id: string;
}) {
  let user = await findUserByProvider(provider, provider_id);

  // 신규 유저
  if (!user) {
    const userId = await createSocialUser({
      email,
      nickname,
      provider,
      provider_id,
    });

    user = {
      id: userId,
      email,
      nickname,
    };
  }

  const token = generateToken(user.id, user.nickname, user.provider);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    },
  };
}
