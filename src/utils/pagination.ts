import { FastifyRequest } from "fastify";

export type LimitOffsetPaginationQuery = {
  offset: number;
  limit: number;
};

export class LimitOffsetPagination {
  constructor(
    private readonly url: string,
    readonly limit: number,
    private readonly offset: number
  ) {}

  nextURL() {
    const q = new URLSearchParams();
    q.append("limit", this.limit.toString());
    q.append("offset", (this.getOffset() + this.limit).toString());

    return new URL(this.url).href + "?" + q;
  }

  previousURL() {
    const q = new URLSearchParams();
    q.append("limit", this.limit.toString());
    q.append("offset", this.getOffset().toString());

    return new URL(this.url).href + "?" + q;
  }

  getResponse<T>(results: T[]) {
    return {
      next: results.length > this.limit ? this.nextURL() : null,
      previous: this.offset > 0 ? this.previousURL() : null,
      results,
    };
  }

  getOffset() {
    return this.offset % this.limit > 0
      ? this.offset - (this.offset % this.limit)
      : this.offset;
  }
}

export const buildURLFromRequest = (req: FastifyRequest) =>
  req.protocol + "://" + req.hostname + req.originalUrl;
