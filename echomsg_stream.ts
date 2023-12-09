import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { echomsg } from "./echomsg.ts";

export class EchomsgStream extends WritableStream<string> {
  constructor(denops: Denops, highlight?: string) {
    super({
      write: async (chunk, _controller) => {
        await echomsg(denops, chunk, highlight);
      },
    });
  }
}
