const { DateTime } = require("luxon")
const commitParser = require("./commit")

const parseCommitLine = (line) => {
  const commit = {}
  const [, hash, ...tags ] = line.split(" ")
  commit.hash = hash
  commit.short = hash.slice(0, 7)
  const decorate = tags.join(" ").slice(1, -1).split(',').map(d => {
    d = d.trim()
    if (d === "") return
    if (d.startsWith("tag: "))
      return { tag: d.slice(5) }
    return { branch: d }
  }).filter(Boolean)
  commit.context = decorate
  return commit
}

const parseAuthorLine = (line) => {
  const authorRaw = line.slice(8).split(" ")
  const author = { email: authorRaw.pop().slice(1, -1) }
  author.username = authorRaw.join(" ")
  return author
}

module.exports.parse = logs => {
  const lines = logs.split("\n")
  const history = []
  let commit = { body: [] }

  for (const line of lines) {
    if (line.startsWith("commit ")) {
      commit.body = commitParser.parse(commit.body)
      history.push(commit)
      commit = { body: [] }
      commit.meta = parseCommitLine(line)
    }
    else if (line.startsWith("Author: "))
      commit.meta.author = parseAuthorLine(line)
    else if (line.startsWith("Date: "))
      commit.meta.date = DateTime.fromFormat(line.slice(5).trim(), "ccc LLL d HH:mm:ss yyyy ZZZ").toISO()
    else if (line.startsWith("Merge: "))
      commit.parents = line.slice(7).split(" ")
    else if (line.startsWith("    "))
      commit.body.push(line.slice(4))
    else
      console.log(line)
  }
  commit.body = commitParser.parse(commit.body)
  history.push(commit)
  return history.slice(1)
}