import type { Denops } from "https://deno.land/x/ddu_vim@v3.9.0/deps.ts";
import { setreg } from "https://deno.land/x/denops_std@v5.2.0/function/mod.ts";
import { v } from "https://deno.land/x/denops_std@v5.2.0/variable/mod.ts";

/**
 * Yank text to the register.
 * @param denops Denops object
 * @param value Text to yank
 */
export async function yank(denops: Denops, value: string) {
  await setreg(denops, '"', value, "v");
  await setreg(denops, await v.get(denops, "register"), value, "v");
}
