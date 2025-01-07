// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Ticket = {
  id: string;
  customer_id: string;
  amount: number;
  created_at: string;
  updated_at: string;
  code: 'ARB-2'|'CPR-2'|'CWQ-2';
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'resolved'.
  status: 'pending' | 'resolved';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestTicket = {
  id: string;
  name: string;
  amount: number;
  image_url: string;
  email: string;
  code: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestTicketRaw = Omit<LatestTicket, 'amount'> & {
  amount: number;
};

export type TicketsTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  created_at: string;
  amount: number;
  status: 'pending' | 'resolved';
  code: 'ARB-2' | 'CPR-2' | 'CWQ-2';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_tickets: number;
  total_pending: number;
  total_resolved: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_tickets: number;
  total_pending: string;
  total_resolved: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type TicketForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'resolved';
  code: 'ARB-2'|'CPR-2'|'CWQ-2';
};

export type CustomerForm = {
  id: string;
  name: string;
  email: string;
};
