const path = require('path')
const gitLoader = require("../git")
const npmLoader = require("../npm")
const githubLoader = require("../github")

module.exports = async (args, config) => {
  const git = gitLoader(path.resolve("."))
  const gh = githubLoader(config.github)
  // const npm = npmLoader(path.resolve("."))
  // await git.checkout("develop") // TODO: change with something configurable
  // await git.fetch()
  // await git.rebase()
  // const latest = npm.pkg.version
  const latest = "3.8.0"
  // const latest = ""
  const changelog = await git.log(latest)
  // console.log(require("util").inspect(changelog, false, null, true))

  const pulls = await Promise.all(changelog.map(commit => gh(git.config).getPrFromCommit(commit.meta.hash)))
  console.log(require("util").inspect(pulls, false, null, true))

  // console.log(
  //   require("util").inspect(
  //     await gh(git.config).getPrFromCommit("2ddcd5eb9127e0711a05c62bddeb2a0cb12855a3")
  //     , false, null, true))
}