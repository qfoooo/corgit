const HEADER_RE = /^(?:(?:(?:(?<kind>[^():]+):)|(?:(?<kinda>[^(]+)\((?<scopes>[^)]*)\):?))\s*)?(?<msg>[^#\n]*)(?:#(?<ticket>.*))?$/ui
const ISSUES_RE = /^(?<action>[a-z]+):? (?<issues>#?[a-z0-9_-]+(?: #?[a-z0-9_-]+)*)$/ui
const parseHeader = head => {
  const h = HEADER_RE.exec(head).groups
  return {
    kind:     h.kind || h.kinda || null,
    scopes:   h.scopes && h.scopes.split(",").map(s => s.trim()) || [],
    msg:      h.msg,
    issue:    h.ticket,
    original: head,
  }
}

module.exports.parse = commitLines => {
  const raw = commitLines.join("\n")
  const header = parseHeader(commitLines.shift())
  const issues = []
  const breaking = []
  const body = []

  let mode = "content"
  for (const line of commitLines) {
    if (line.match(/breaking changes?:?/iu)) {
      mode = "breaking"
      continue
    }
    if (line.match(ISSUES_RE)) {
      const { action, issues: iss } = ISSUES_RE.exec(line).groups
      issues.push(...iss.split(" ").map(i => ({ issue: i, action })))
      continue
    }
    if (line === "" && mode === "breaking")
      mode = "content"
    else if (mode === "breaking")
      breaking.push(line)
    else
      body.push(line)
  }

  return {
    header,
    body,
    breaking,
    issues,
    raw,
  }
}
