import { PassThrough } from 'stream';

/** Stream that collects its output for testing */
export class MockOutputStream extends PassThrough {
  private chunks: Buffer[] = [];

  constructor() {
    super();
    this.on('data', chunk => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      this.chunks.push(chunk);
    });
  }

  public getOutput(): string {
    return Buffer.concat(this.chunks).toString();
  }
}
