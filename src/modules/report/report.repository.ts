import { pool } from "../../configs/db.js";

type SaveReportParams = {
  user_id: number;
  total_price: number;
  score: number;
  type: string;
  insight: any;
  expenses: any[];
};

export async function insertReport(params: SaveReportParams) {
  const { user_id, total_price, score, type, insight, expenses } = params;

  const [result]: any = await pool.query(
    `
    INSERT INTO reports (
      user_id,
      total_price,
      score,
      type,
      insight_json,
      expenses_json
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
    [
      user_id,
      total_price,
      score,
      type,
      JSON.stringify(insight),
      JSON.stringify(expenses),
    ],
  );

  return result.insertId;
}
