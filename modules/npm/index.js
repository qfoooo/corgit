const path = require("path")
const fs = require("fs")
const semInc = require("semver/functions/inc")

const pkg = pwd => require(path.resolve(pwd, "package.json"))

const bump = pwd => level => {
  const packagePath = path.resolve(pwd, "package.json")
  const lockPath = path.resolve(pwd, "package-lock.json")

  const package = require(packagePath)
  const newVer = semInc(package.version, level)
  package.version = newVer
  fs.writeFileSync(packagePath, JSON.stringify(package, null, 2) + "\n")

  if (fs.existsSync(lockPath)) {
    const lock = require(lockPath)
    lock.version = newVer
    fs.writeFileSync(lockPath, JSON.stringify(lock, null, 2) + "\n")
  }
  return newVer
}

const autobump = pwd => history => {
  const levels = ["major","minor","patch"]
  let level = 2
  for (const commit of history) {
    if (commit.body.header.scopes.find(s => /^version$/ui.test(s))) // TODO: configure
      continue
    if (commit.body.breaking.length > 0) {
      level = 0
      break
    }
    if (commit.body.header.kind?.toLowerCase().startsWith("feat")) // TODO: allow customization
      level = 1
  }
  return bump(pwd)(levels[level])
}

module.exports = pwd => ({
  pkg: pkg(pwd),
  bump: bump(pwd),
  autobump: autobump(pwd)
})