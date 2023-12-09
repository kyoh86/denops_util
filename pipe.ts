import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.208.0/streams/text_line_stream.ts";
import { EchomsgStream } from "./echomsg_stream.ts";

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
  const stderrStream = new EchomsgStream(denops, "ErrorMsg");
  const stdoutStream = new EchomsgStream(denops);
  await Promise.all([
    status.then((stat) => {
      if (!stat.success) {
        stderr
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TextLineStream())
          .pipeTo(stderrStream);
      }
    }),
    stdout
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream())
      .pipeTo(stdoutStream),
  ]);

  await stdoutStream.finalize(denops);
  await stderrStream.finalize(denops);
}
