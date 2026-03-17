import { Spinner } from '@/components/ui/Spinner';

export function Loading() {
  return (
    <div className="flex items-center justify-center p-5">
      <Spinner className="size-7.5" />
    </div>
  );
}
