import { pool } from "../../configs/db.js";

// 리포트 저장
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

// 리포트 삭제
export async function deleteReportById(id: number, user_id: number) {
  const [result]: any = await pool.query(
    `
    DELETE FROM reports
    WHERE id = ? AND user_id = ?
  `,
    [id, user_id],
  );

  return result.affectedRows;
}

// id 리포트 가져오기
export async function getReportById(id: number, user_id: number) {
  const [rows]: any = await pool.query(
    `
    SELECT * FROM reports
    WHERE id = ? AND user_id = ?

  `,
    [id, user_id],
  );

  return rows[0];
}

// 전체 리포트 가져오기
export async function getReports({
  user_id,
  offset,
  limit,
  sortBy,
  order,
  type,
}: {
  user_id: number;
  offset: number;
  limit: number;
  sortBy: string;
  order: string;
  type?: string;
}) {
  const allowedSort = ["created_at", "score"];
  const allowedOrder = ["asc", "desc"];
  const allowedType = ["daily", "weekly", "monthly"];

  const safeSort = allowedSort.includes(sortBy) ? sortBy : "created_at";
  const safeOrder = allowedOrder.includes(order.toLowerCase()) ? order : "desc";
  const safeType = allowedType.includes(type ?? "") ? type : null;

  //조건 누적 방식
  const conditions: string[] = [];
  const params: any[] = [];

  // user_id 필터
  conditions.push("user_id = ?");
  params.push(user_id);

  // type 필터 (옵셔널)
  if (safeType) {
    conditions.push("type = ?");
    params.push(safeType);
  }

  // WHERE 절 생성
  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // 데이터 조회
  const [rows]: any = await pool.query(
    `
    SELECT id, total_price, score, type, created_at
    FROM reports
    ${whereClause}
    ORDER BY ${safeSort} ${safeOrder}
    LIMIT ? OFFSET ?
  `,
    [...params, limit, offset],
  );

  // 전체 개수
  const [[countResult]]: any = await pool.query(
    `
    SELECT COUNT(*) as total
    FROM reports
    ${whereClause}
  `,
    params,
  );

  return {
    rows,
    total: countResult.total,
  };
}
