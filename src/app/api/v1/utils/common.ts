import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';

import { Database } from '@/../supabase/database.types';
import { RemoteError } from '@/app/api/v1/utils/RemoteError';

export function assertSupabaseResponse<T>(
  supabaseResponse: PostgrestSingleResponse<T>
) {
  if (supabaseResponse.error) {
    throw new RemoteError(
      supabaseResponse.error.code,
      supabaseResponse.error.message,
      500
    );
  }

  return supabaseResponse.data;
}

export function createSupabaseClient() {
  return createClient<Database>(
    fetchSecret('NEXT_PUBLIC_SUPABASE_URL'),
    fetchSecret('SUPABASE_SECRET_KEY')
  );
}

// eslint-disable-next-line
export function catchError(errorData: any) {
  return errorData instanceof RemoteError
    ? errorData.constructResponse()
    : new Response(
        JSON.stringify({
          error: 'Internal Server Error',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
          status: 500,
        }
      );
}

export function fetchSecret(secretKey: string) {
  return process.env[secretKey] ?? '';
}

export function verifyAccess(httpRequest: Request) {
  const authHeader = httpRequest.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_KEY!}`) {
    throw new RemoteError('UNAUTHORIZED', 'Unauthorized', 401);
  }
}
