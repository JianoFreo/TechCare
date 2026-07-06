import { sql } from "../config/db.js";

export async function generateUserId() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `${year}-${month}${day}`;
  const usersCreatedToday = await sql`
        SELECT user_id
        FROM users
        WHERE DATE(created_at) = CURRENT_DATE
        ORDER BY user_id DESC
      `;
// V this is a better approch becaus eof timezone issue but lets just use the one that calculates the actual data now for simplified
//   const usersCreatedToday = await sql`
//   SELECT user_id
//   FROM users
//   WHERE user_id LIKE ${prefix + "-%"}
//   ORDER BY user_id DESC
//   LIMIT 1
// `;
  let nextNumber = 1;

  if (usersCreatedToday.length > 0) {
    nextNumber = Number(usersCreatedToday[0].user_id.slice(-4)) + 1;
  }
  const sequence = String(nextNumber).padStart(4, "0");
  return `${prefix}-${sequence}`;
}
