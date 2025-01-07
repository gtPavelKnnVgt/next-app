import Form from '@/app/ui/tickets/create-form';
import Breadcrumbs from '@/app/ui/tickets/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Tickets', href: '/dashboard/tickets' },
          {
            label: 'Create Ticket',
            href: '/dashboard/tickets/create',
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}