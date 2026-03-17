import { PostgrestError } from '@supabase/supabase-js';
import { InfoIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';

type Props = {
  errorObj: null | PostgrestError;
};

export function Error({ errorObj }: Props) {
  return (
    <Alert className="bg-red-950/10 border-destructive" variant="destructive">
      <InfoIcon />
      <AlertTitle>{errorObj?.code ?? 'Error!'}</AlertTitle>
      <AlertDescription>
        {errorObj?.message ??
          'An internal error occurred. Please try again later.'}
      </AlertDescription>
    </Alert>
  );
}
