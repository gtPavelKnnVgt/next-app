import Image from 'next/image';
import { UpdateTicket } from '@/app/ui/tickets/buttons';
import TicketStatus from '@/app/ui/tickets/status';
import TicketCode from '@/app/ui/tickets/code';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredTickets } from '@/app/lib/data';

export default async function TicketsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const tickets = await fetchFilteredTickets(query, currentPage);
  console.log(tickets);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {tickets?.map((ticket) => (
              <div
                key={ticket.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <div className="mb-2 flex items-center">
                      <Image
                        src={ticket.image_url}
                        className="mr-2 rounded-full"
                        width={28}
                        height={28}
                        alt={`${ticket.name}'s profile picture`}
                      />
                      <p>{ticket.name}</p>
                    </div>
                    <p className="text-sm text-gray-500">{ticket.email}</p>
                  </div>
                  <TicketStatus status={ticket.status} />
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xl font-medium">
                      {formatCurrency(ticket.amount)}
                    </p>
                    <p>{formatDateToLocal(ticket.created_at)}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <UpdateTicket id={ticket.id} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Customer
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Email
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Amount
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Date
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Status
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Code
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {tickets?.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={ticket.image_url}
                        className="rounded-full"
                        width={28}
                        height={28}
                        alt={`${ticket.name}'s profile picture`}
                      />
                      <p>{ticket.name}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {ticket.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatCurrency(ticket.amount)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {formatDateToLocal(ticket.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <TicketStatus status={ticket.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <TicketCode code={ticket.code} />
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <UpdateTicket id={ticket.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
