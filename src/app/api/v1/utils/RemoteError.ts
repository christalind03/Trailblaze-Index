export class RemoteError extends Error {
  public readonly code: string;
  public readonly status: number;

  public constructor(code: string, message: string, status: number) {
    super(message);

    this.code = code;
    this.status = status;
  }

  public constructResponse() {
    return new Response(
      JSON.stringify({
        error: {
          code: this.code,
          message: this.message,
          status: this.status,
        },
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: this.status,
      }
    );
  }
}
