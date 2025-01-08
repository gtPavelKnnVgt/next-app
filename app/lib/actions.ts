'use server';

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export type TicketState = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
        code?: string[];
    };
    message?: string | null;
};

export type CustomerState = {
    errors?: {
        name?: string[];
        email?: string[];
    };
    message?: string | null;
};


const TicketFormSchema = z.object({
    id: z.string(),
    customerId: z.string({ invalid_type_error: 'Please select a customer.', }),
    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'resolved'], {
        invalid_type_error: 'Please select a ticket status.',
    }),
    code: z.enum(['ARB-2','CPR-2','CWQ-2'], {
        invalid_type_error: 'Please select correct code.',
    }),
    date: z.string(),
});

const CreateTicket = TicketFormSchema.omit({ id: true, date: true });

export async function createTicket(prevState: TicketState, formData: FormData) {
    const validatedFields = CreateTicket.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        code: formData.get('code')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Ticket.',
        };
    }
    
    const { customerId, amount, status, code } = validatedFields.data;
    const amountInCents = amount * 100;
    const createdAt = new Date().toISOString().split('T')[0];

    try {
        await sql`
          INSERT INTO tickets (customer_id, amount, status, created_at, code)
          VALUES (${customerId}, ${amountInCents}, ${status}, ${createdAt}, ${code})
        `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Ticket.',
        };
    }

    revalidatePath('/dashboard/tickets');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/tickets');
}

const UpdateTicket = TicketFormSchema.omit({ id: true, date: true });

export async function updateTicket(id: string, prevState: TicketState, formData: FormData) {
    const validatedFields = UpdateTicket.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
        code: formData.get('code')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Ticket.',
        };
    }

    const { customerId, amount, status, code } = validatedFields.data;
    const amountInCents = amount * 100;

    try {
        await sql`
            UPDATE tickets
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}, code = ${code}
            WHERE id = ${id}
          `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Ticket.' };
    }

    revalidatePath('/dashboard/tickets');
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/customers');
    redirect('/dashboard/tickets');
}

const CustomerFormSchema = z.object({
    id: z.string(),
    name: z.coerce.string().min(5, {message: 'Enter correct name'}),
    email: z.coerce.string().email().min(5)
});

const UpdateCustomer = CustomerFormSchema.omit({ id: true});

export async function updateCustomer(id: string, prevState: CustomerState, formData: FormData) {
    const validatedFields = UpdateCustomer.safeParse({
        name: formData.get('name'),
        email: formData.get('email')
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Customer.',
        };
    }

    const { name, email } = validatedFields.data;

    try {
        await sql`
            UPDATE customers
            SET name = ${name}, email = ${email}
            WHERE id = ${id}
          `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Customer.' };
    }

    revalidatePath('/dashboard/customers');
    revalidatePath('/dashboard');
    redirect('/dashboard/customers');
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', formData);
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return 'Invalid credentials.';
          default:
            return 'Something went wrong.';
        }
      }
      throw error;
    }
  }