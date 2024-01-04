import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.208.0/streams/text_line_stream.ts";
import { EchomsgStream } from "./echomsg_stream.ts";

/**
 * Pipe the output (stdout and stderr) of the external command to the message window.
 * @param denops Denops object
 * @param command Command to execute
 * @param options Options for Deno.Command
 */
export async function echoallCommand(
  denops: Denops,
  command: string | URL,
  options?: Omit<Deno.CommandOptions, "stdin" | "stderr" | "stdout">,
) {
  const { stdout, wait } = echoerrCommand(denops, command, options);
  const stdoutStream = new EchomsgStream(denops);
  await Promise.all([
    wait,
    stdout.pipeTo(stdoutStream),
  ]);
  await stdoutStream.finalize(denops);
}

/**
 * Pipe the error output (stderr) of the external command to the message window.
 * @param denops Denops object
 * @param command Command to execute
 * @param options Options for Deno.Command
 * @returns Object has stdout pipe and wait promise
 */
export function echoerrCommand(
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

  return {
    stdout: stdout
      .pipeThrough(new TextDecoderStream())
      .pipeThrough(new TextLineStream()),
    wait: status.then((stat) => {
      if (!stat.success) {
        stderr
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TextLineStream())
          .pipeTo(stderrStream);
      }
    }).then(() => stderrStream.finalize(denops)),
  };
}
