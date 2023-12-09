import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.208.0/streams/text_line_stream.ts";
import {
  echo,
  echoerr,
} from "https://deno.land/x/denops_std@v5.1.0/helper/mod.ts";

class MessageStream extends WritableStream<string> {
  constructor(denops: Denops) {
    super({
      write: async (chunk, _controller) => {
        await echo(denops, chunk);
      },
    });
  }
}

class WarnStream extends WritableStream<string> {
  constructor(denops: Denops) {
    super({
      write: async (chunk, _controller) => {
        await echoerr(denops, chunk);
      },
    });
  }
}

/**
 * Pipe the output of the external command to the message window.
 * @param denops Denops object
 * @param command Command to execute
 * @param options Options for Deno.Command
 */
export async function pipe(
  denops: Denops,
  command: string | URL,
  options?: Omit<Deno.CommandOptions, "stdin" | "stderr" | "stdout">,
) {
  const { status, stderr, stdout } = new Deno.Command(command, {
    ...options,
    stdin: "null",
    stderr: "piped",
    stdout: "piped",
  }).spawn();
  status.then((stat) => {
    if (!stat.success) {
      stderr
        .pipeThrough(new TextDecoderStream())
        .pipeThrough(new TextLineStream())
        .pipeTo(new WarnStream(denops));
    }
  });
  await stdout
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(new MessageStream(denops));
}
