import type { Denops } from "https://deno.land/x/ddu_vim@v3.9.0/deps.ts";
import { batch } from "https://deno.land/x/denops_std@v5.2.0/batch/mod.ts";
import {
  getreginfo,
  setreg,
} from "https://deno.land/x/denops_std@v5.2.0/function/mod.ts";

/**
 * Put text to the current cursor position.
 * @param denops Denops object
 * @param text Text to put
 * @param after If true, put text after the cursor
 */
export async function put(denops: Denops, text: string, after: boolean) {
  await batch(denops, async (denops) => {
    const oldReg = await getreginfo(denops, '"');

    await setreg(denops, '"', text, "v");
    try {
      await denops.cmd(`normal! ""${after ? "p" : "P"}`);
    } finally {
      if (oldReg) {
        await setreg(denops, '"', oldReg);
      }
    }
  });
}
