import Form from '@/app/ui/tickets/edit-form';
import Breadcrumbs from '@/app/ui/tickets/breadcrumbs';
import { fetchTicketById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = params.id;
    const [ticket, customers] = await Promise.all([
        fetchTicketById(id),
        fetchCustomers(),
    ]);
    if (!ticket) {
        notFound();
    }
    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: 'Tickets', href: '/dashboard/tickets' },
                    {
                        label: 'Edit Ticket',
                        href: `/dashboard/tickets/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form ticket={ticket} customers={customers} />
        </main>
    );
}