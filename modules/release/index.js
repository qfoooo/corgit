const path = require('path')
const gitLoader = require("../git")
const npmLoader = require("../npm")

module.exports = async args => {
  const git = gitLoader(path.resolve("."))
  // const npm = npmLoader(path.resolve("."))
  // await git.checkout("develop") // TODO: change with something configurable
  // await git.fetch()
  // await git.rebase()
  // const latest = npm.pkg.version
  const latest = "3.8.0"
  // const latest = ""
  const changelog = await git.log(latest)
  console.log(require("util").inspect(changelog, false, null, true))
}