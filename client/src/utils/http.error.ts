export class HttpError extends Error {
  public status: number;
  public statusText: string;
  constructor(status: number, statusText: string) {
    super(`HTTP Error: ${status}`);
    this.status = status;
    this.statusText = statusText;
  }
}
