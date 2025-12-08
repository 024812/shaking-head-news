/**
 * Error class for news API errors
 */
export class NewsAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public source?: string
  ) {
    super(message)
    this.name = 'NewsAPIError'
  }
}
