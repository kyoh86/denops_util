import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { echo } from "https://deno.land/x/denops_std@v5.1.0/helper/mod.ts";
import { echomsg } from "./echomsg.ts";

export class EchomsgStream extends WritableStream<string> {
  private lines: string[] = [];
  constructor(denops: Denops, highlight?: string) {
    super({
      write: async (chunk, _controller) => {
        await echomsg(denops, chunk, highlight);
        this.lines.push(chunk);
      },
    });
  }
  public getLines(): string[] {
    return this.lines;
  }
  public clearLines(): void {
    this.lines = [];
  }
  public async finalize(denops: Denops) {
    await echo(denops, this.lines.join().trim());
    this.clearLines();
  }
}
