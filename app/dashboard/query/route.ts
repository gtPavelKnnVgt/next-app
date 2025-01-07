import { db } from "@vercel/postgres";

const client = await db.connect();

async function listTickets() {
	const data = await client.sql`
    SELECT tickets.amount, tickets.status, tickets.code, customers.name
    FROM tickets
    JOIN customers ON tickets.customer_id = customers.id
    WHERE tickets.amount = 666;
  `;

	return data.rows;
}

export async function GET() {
  try {
  	return Response.json(await listTickets());
  } catch (error) {
  	return Response.json({ error }, { status: 500 });
  }
}
