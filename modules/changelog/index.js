const path = require("path")
const fs = require("fs")

const getLogEntry = (issue, history) => {
  if (issue.associatedPullRequests.length === 0)
    return [issue.message, { kind: history.body.header.kind, msg: issue.message}]
  if (issue.associatedPullRequests[0].timelineItems.length === 0) {
    return [
      issue.associatedPullRequests[0].url,
      {
        kind: history.body.header.kind,
        msg: `${issue.associatedPullRequests[0].title} #${issue.associatedPullRequests[0].url.split("/").slice(-1)[0]}`
      }
    ]
  }
  return [
    issue.associatedPullRequests[0].timelineItems[0].url,
    {
      kind: history.body.header.kind,
      msg: `${issue.associatedPullRequests[0].timelineItems[0].title} #${issue.associatedPullRequests[0].timelineItems[0].url.split("/").slice(-1)[0]}`
    }
  ]
}

const significantChanges = (history, issues) => {
  const iss = new Map()
  for (const issueIdx in issues) {
    const [key, value] = getLogEntry(issues[issueIdx],history[issueIdx])
    iss.set(key, value)
  }
  const entries = { // TODO: configure
    feat: [],
    fix: [],
    refac: [],
    test: [],
    style: [],
    chore: [],
    doc: [],
    misc: []
  }

  for (const item of iss.values()) {
    if (item.msg.toLowerCase().startsWith("feature(version): ")) continue
    let ok = false
    for (const key in entries) {
      if ((new RegExp(`^${key}`, "ui")).test(item.kind)) {
        entries[key].push(item.msg)
        ok = true
        break
      }
    }
    if (!ok)
      entries.misc.push(item.msg)
  }

  const format = []
  for (const key in entries) {
    if (entries[key].length > 0) {
      format.push(`- **${key}**`)
      format.push(...entries[key].map(line => `  - ${line}`))
    }
  }
  return format
}

const getChangelog = pwd => () => {
  const changelogPath = path.resolve(pwd, "CHANGELOG.md")
  if (!fs.existsSync(changelogPath))
    return []
  const changelog = fs.readFileSync(changelogPath).toString()
  return changelog.split("\n")
}

const parse = (lines, lvl = 1) => {
  if (lines.length === 0) return null
  const doc = {}
  let section = null
  let sub = []
  const sw = (new Array(lvl)).fill("#").join("") + " "
  for (const line of lines) {
    if (line.startsWith(sw)) {
      if (section) {
        doc[section] = parse(sub, lvl + 1)
        sub = []
      }
      section = line.slice(sw.length)
      continue
    }
    sub.push(line)
  }
  if (section)
    doc[section] = parse(sub, lvl + 1)
  else
    return sub.filter(Boolean)
  return doc
}

const generate = (changelog, lvl = 1) => {
  const out = []
  for (const key in changelog) {
    out.push("", "", `${(new Array(lvl)).fill("#").join("")} ${key}`, "")
    if (Array.isArray(changelog[key]))
      out.push(...changelog[key])
    else
      out.push(...generate(changelog[key], lvl + 1))
  }
  return out.slice(2)
}

const update = pwd => (version, history, issues, gitconfig) => {
  const base = gitconfig.remote.origin.url.split(":")[1].slice(0,-4)

  // version = "4.1.1"
  let changelog = parse(getChangelog(pwd)())
  const [ major, minor, patch ] = version.split(".")
  if (!changelog[`Version ${major}`]) {
    changelog = {
      [`Version ${major}`]: {},
      ...changelog
    }
  }
  if (!changelog[`Version ${major}`][`v${minor}`]) {
    changelog[`Version ${major}`] = {
      [`v${major}.${minor}`]: {},
      ...changelog[`Version ${major}`]
    }
  }
  changelog[`Version ${major}`][`v${major}.${minor}`] = {
    [version]: {
      "Significant changes": significantChanges(history,issues),
      Commits: history.map(commit =>
        `- [[${commit.meta.short}](https://github.com/${base}/commit/${commit.meta.hash})]`
        + ` **${commit.body.header.kind}**(_${commit.body.header.scopes.join(", ")}_):`
        + ` ${commit.body.header.msg}`
        + ` (@[${commit.meta.author.username}](mailto:${commit.meta.author.email}))`
      )
    },
    ...changelog[`Version ${major}`][`v${major}.${minor}`]
  }

  const out = generate(changelog).join("\n")
  fs.writeFileSync(path.resolve(pwd, "CHANGELOG.md"), out + "\n")
}

module.exports = pwd => ({
  update: update(pwd)
})