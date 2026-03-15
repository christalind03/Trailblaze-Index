import axios from 'axios';
import * as cheerio from 'cheerio';

import { catchError, verifyAccess } from '@/app/api/v1/utils/common';
import { PRYDWEN_URL } from '@/app/api/v1/utils/constants';
import { RemoteError } from '@/app/api/v1/utils/RemoteError';

export async function POST(httpRequest: Request) {
  try {
    verifyAccess(httpRequest);

    const { data: axiosData } = await axios.get(
      `${PRYDWEN_URL}/star-rail/characters`
    );

    if (!axiosData) {
      throw new RemoteError(
        'NOT_FOUND',
        'No data returned from upstream service',
        404
      );
    }

    const $ = cheerio.load(axiosData);
    const avatarURLs = $('.avatar-card a')
      .map((_, cheerioElement) => $(cheerioElement).attr('href'))
      .get();

    if (avatarURLs) {
      const apiBaseURL = process.env.BASE_URL ?? 'http://localhost:3000';

      // TODO: We may need to batch this in order to prevent hitting the rate limit for the target site
      for (const avatarURL of avatarURLs) {
        // Since this API route is to scrape data in bulk, simply fire-and-forget to prevent timeouts
        fetch(`${apiBaseURL}/api/v1/scrape-character`, {
          body: JSON.stringify({
            avatarURL,
          }),
          headers: {
            Authorization: httpRequest.headers.get('Authorization') ?? '',
            'Content-Type': 'application/json',
          },
          method: 'POST',
        }).finally(() => {});
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Action Successful',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      }
    );
  } catch (errorData) {
    return catchError(errorData);
  }
}
