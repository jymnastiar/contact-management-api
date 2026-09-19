export class ResponseError extends Error {
  constructor(
    public status: number,
    public override message: string,
  ) {
    super(message);
  }
}
