import type { Denops } from "https://deno.land/x/ddu_vim@v3.8.1/deps.ts";
import { TextLineStream } from "https://deno.land/std@0.208.0/streams/text_line_stream.ts";
import { EchoMsgStream } from "./echo_msg_stream.ts";

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
        .pipeTo(new EchoMsgStream(denops, "ErrorMsg"));
    }
  });
  await stdout
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeTo(new EchoMsgStream(denops));
}
