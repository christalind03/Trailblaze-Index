export async function POST() {
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
}
