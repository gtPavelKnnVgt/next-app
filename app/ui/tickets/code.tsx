import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function TicketCode({ code }: { code: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs',
        {
          'bg-gray-100 text-gray-500': code === 'ARB-2',
          'bg-gray-199 text-gray-500': code === 'CPR-2',
          'bg-gray-200 text-gray-500': code === 'CWQ-2'
        },
      )}
    >
      {code === 'CWQ-2' ? (
        <>
          CWQ-2
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {code === 'ARB-2' ? (
        <>
          ARB-2
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
      {code === 'CPR-2' ? (
        <>
          CPR-2
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </span>
  );
}
