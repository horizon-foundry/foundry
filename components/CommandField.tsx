import { CopyButton } from "./CopyButton";
import { UnitBar } from "./brand/UnitBar";

// The one way a runnable command is set: a White field with a 2px Ink border,
// the command in Ink mono, and the copy control joined to its edge. The amber
// unit bar in front is the mark of a command you fire. Amber used to be the
// color of the command's text; it only ever fills a bar now, so the meaning
// moved to the bar and the text is Ink.
export function CommandField({
  command,
  surface,
  kind = "npx",
  className = "",
}: {
  command: string;
  // Where the copy came from, for install_copied.
  surface: string;
  kind?: string;
  className?: string;
}) {
  return (
    <div className={`cmd-field ${className}`.trim()}>
      <div className="cmd-field-line">
        <UnitBar fill="amber" className="cmd-field-bar" />
        <code>{command}</code>
      </div>
      <CopyButton
        joined
        text={command}
        label="the install command"
        analytics={{ command_kind: kind, surface }}
      />
    </div>
  );
}
