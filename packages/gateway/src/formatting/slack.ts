export const SLACK_CAPABILITIES = "thread replies, mentions, reactions, plain text messages";

export const SLACK_FORMATTING_GUIDE = [
  "- Keep responses concise and thread-aware.",
  "- Inter-agent protocol (MANDATORY): one turn only, then wait for the next inbound message.",
  "- If you hand off, assign exactly one next owner and one concrete action.",
  "- Never send echo-only or acknowledgment-only repeats of prior messages.",
  "- If blocked, ask one explicit unblock question instead of restating context.",
  "- Do not role-play both sides of a conversation.",
].join("\\n");
