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
  return `U-${prefix}-${sequence}`;
}
export async function generatePatientId() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const prefix = `${year}-${month}${day}`;
  const usersCreatedToday = await sql`
        SELECT patient_id
        FROM patients
        WHERE DATE(created_at) = CURRENT_DATE
        ORDER BY patient_id DESC
      `;
  // V this is a better approch becaus eof timezone issue but lets just use the one that calculates the actual data now for simplified
  //   const usersCreatedToday = await sql`
  //   SELECT patient_id
  //   FROM patients
  //   WHERE patient_id LIKE ${prefix + "-%"}
  //   ORDER BY patient_id DESC
  //   LIMIT 1
  // `;
  let nextNumber = 1;

  if (usersCreatedToday.length > 0) {
    nextNumber = Number(usersCreatedToday[0].patient_id.slice(-4)) + 1;
  }
  const sequence = String(nextNumber).padStart(4, "0");
  return `P-${prefix}-${sequence}`;
}

export async function generateServiceId() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const prefix = `${year}-${month}`;
  const usersCreatedToday = await sql`
        SELECT service_id
        FROM services
        WHERE DATE(created_at) = CURRENT_DATE
        ORDER BY service_id DESC
      `;
  // V this is a better approch becaus eof timezone issue but lets just use the one that calculates the actual data now for simplified
  //   const usersCreatedToday = await sql`
  //   SELECT service_id
  //   FROM services
  //   WHERE service_id LIKE ${prefix + "-%"}
  //   ORDER BY service_id DESC
  //   LIMIT 1
  // `;
  let nextNumber = 1;

  if (usersCreatedToday.length > 0) {
    nextNumber = Number(usersCreatedToday[0].service_id.slice(-3)) + 1;
  }
  const sequence = String(nextNumber).padStart(3, "0");
  return `S-${prefix}-${sequence}`;
}

export async function generateActivityId() {
  const now = new Date();

  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  // military time (24-hour format)
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const time = `${hours}${minutes}`;

  const prefix = `${year}${month}${day}-${time}`;

  const result = await sql`
    SELECT activity_id
    FROM system_activity
    WHERE activity_id LIKE ${`S-${prefix}-%`}
    ORDER BY activity_id DESC
    LIMIT 1
  `;

  let nextNumber = 1;

  const last = result[0]?.activity_id;

  if (last) {
    nextNumber = Number(last.slice(-4)) + 1;
  }

  const sequence = String(nextNumber).padStart(4, "0");

  return `ACT-${prefix}-${sequence}`;
}


export async function generateConsultationQueueId() {
  const queue = await sql`
    SELECT queue_id 
    FROM queue_entries
    WHERE service_name = 'consultation'
    ORDER BY queue_id DESC
    LIMIT 1
  `;
  let nextNumber = 1;
  const last = queue[0]?.queue_id;

  if (last) {
    nextNumber = Number(last.slice(-4)) + 1;
  }
  const sequence = String(nextNumber).padStart(4, "0");
  return `CQ-${sequence}`;
}
export async function generateLaboratoryQueueId() {
  const queue = await sql`
    SELECT queue_id 
    FROM queue_entries
    WHERE service_name = 'laboratory'
    ORDER BY queue_id DESC
    LIMIT 1
  `;
  let nextNumber = 1;
  const last = queue[0]?.queue_id;

  if (last) {
    nextNumber = Number(last.slice(-4)) + 1;
  }
  const sequence = String(nextNumber).padStart(4, "0");
  return `LQ-${sequence}`;
}
//LAB-0017

export async function generateQueueNumberConsultation(){
  const queue = await sql`
    SELECT queue_number
    FROM queue_entries
    WHERE service_name = 'consultation'
    ORDER BY queue_number DESC
    LIMIT 1
    `
  let nextNumber = 1;
  const last = queue[0]?.queue_number;

  if (last) {
    nextNumber = Number(last) + 1;
  }

  return nextNumber;

}
export async function generateQueueNumberLaboratory(){
  const queue = await sql`
    SELECT queue_number
    FROM queue_entries
    WHERE service_name = 'laboratory'
    ORDER BY queue_number DESC
    LIMIT 1
    `
  let nextNumber = 1;
  const last = queue[0]?.queue_number;

  if (last) {
    nextNumber = Number(last) + 1;
  }

  return nextNumber;

}