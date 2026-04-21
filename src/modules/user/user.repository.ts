import { pool } from "../../configs/db.js";

// 이메일 조회 (local)
export async function findUserByEmail(email: string) {
  const [rows]: any = await pool.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  return rows[0];
}

// 소셜 조회
export async function findUserByProvider(
  provider: string,
  provider_id: string,
) {
  const [rows]: any = await pool.query(
    `SELECT * FROM users WHERE provider = ? AND provider_id = ?`,
    [provider, provider_id],
  );
  return rows[0];
}

// 유저 생성 (local)
export async function createLocalUser({
  email,
  password,
  nickname,
}: {
  email: string;
  password: string;
  nickname: string;
}) {
  const [result]: any = await pool.query(
    `
    INSERT INTO users (email, password, nickname, provider)
    VALUES (?, ?, ?, 'local')
  `,
    [email, password, nickname],
  );
  return result.insertId;
}

// 유저 생성 (social)
export async function createSocialUser({
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
  const [result]: any = await pool.query(
    `
    INSERT INTO users (email, nickname, provider, provider_id)
    VALUES (?, ?, ?, ?)
  `,
    [email, nickname, provider, provider_id],
  );
  return result.insertId;
}
