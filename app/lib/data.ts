import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  TicketForm,
  TicketsTable,
  LatestTicketRaw,
  Revenue,
  CustomerForm,
} from './definitions';
import { formatCurrency } from './utils';

export async function fetchRevenue() {
  try {

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestTickets() {
  try {
    const data = await sql<LatestTicketRaw>`
      SELECT tickets.code, tickets.amount, customers.name, customers.image_url, customers.email, tickets.id
      FROM tickets
      JOIN customers ON tickets.customer_id = customers.id
      ORDER BY tickets.created_at DESC
      LIMIT 5`;

    const latestTickets = data.rows.map((ticket) => ({
      ...ticket,
      amount: formatCurrency(ticket.amount),
    }));
    return latestTickets;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest tickets.');
  }
}

export async function fetchCardData() {
  try {
    const ticketCountPromise = sql`SELECT COUNT(*) FROM tickets`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const ticketStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS "resolved",
         SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS "pending"
         FROM tickets`;

    const data = await Promise.all([
      ticketCountPromise,
      customerCountPromise,
      ticketStatusPromise,
    ]);

    const numberOfTickets = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalResolvedTickets = Number(data[2].rows[0].resolved ?? '0');
    const conversationTicketsRate =  numberOfTickets > 0 ? (totalResolvedTickets / numberOfTickets).toFixed(3) : 0;

    return {
      numberOfCustomers: numberOfCustomers,
      numberOfTickets: numberOfTickets,
      totalResolvedTickets: totalResolvedTickets,
      conversationTicketsRate: conversationTicketsRate
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredTickets(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const tickets = await sql<TicketsTable>`
      SELECT
        tickets.id,
        tickets.amount,
        tickets.created_at,
        tickets.status,
        tickets.code,
        customers.name,
        customers.email,
        customers.image_url
      FROM tickets
      JOIN customers ON tickets.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        tickets.amount::text ILIKE ${`%${query}%`} OR
        tickets.created_at::text ILIKE ${`%${query}%`} OR
        tickets.status ILIKE ${`%${query}%`} OR
        tickets.code ILIKE ${`%${query}%`}
      ORDER BY tickets.created_at DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return tickets.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch tickets.');
  }
}

export async function fetchTicketsPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM tickets
    JOIN customers ON tickets.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      tickets.amount::text ILIKE ${`%${query}%`} OR
      tickets.created_at::text ILIKE ${`%${query}%`} OR
      tickets.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of tickets.');
  }
}

export async function fetchTicketById(id: string) {
  try {
    const data = await sql<TicketForm>`
      SELECT
        tickets.id,
        tickets.customer_id,
        tickets.amount,
        tickets.status,
        tickets.code
      FROM tickets
      WHERE tickets.id = ${id};
    `;

    const ticket = data.rows.map((ticket) => ({
      ...ticket,
      // Convert amount from cents to dollars
      amount: ticket.amount / 100,
    }));

    return ticket[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch ticket.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(tickets.id) AS total_tickets,
		  SUM(CASE WHEN tickets.status = 'pending' THEN 1 ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN tickets.status = 'resolved' THEN 1 ELSE 0 END) AS total_resolved
		FROM customers
		LEFT JOIN tickets ON customers.id = tickets.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchCustomerById(id: string) {
  try {
    const data = await sql<CustomerForm>`
      SELECT
        customers.id,
        customers.name,
        customers.email
      FROM customers
      WHERE customers.id = ${id};
    `;

    const customer = data.rows.map((customer) => ({
      ...customer
    }));

    return customer[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer.');
  }
}

export async function fetchCustomerPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
		FROM customers
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of customers.');
  }
}
