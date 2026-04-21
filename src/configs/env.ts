import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  DB_HOST: process.env.DB_HOST,

  DB_PORT: Number(process.env.DB_PORT ?? 3306),

  DB_USER: process.env.DB_USER,

  DB_PASSWORD: process.env.DB_PASSWORD,

  DB_NAME: process.env.DB_NAME,
};
