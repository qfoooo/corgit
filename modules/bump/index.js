const path = require('path')
const gitLoader = require("../git")
const npmLoader = require("../npm")
const githubLoader = require("../github")
const changelogLoader = require("../changelog")

module.exports = async (args, config) => {
  const git = gitLoader(path.resolve("."))
  const gh = githubLoader(config.github)
  const npm = npmLoader(path.resolve("."))
  const changelog = changelogLoader(path.resolve("."))

  // await git.checkout("develop") // TODO: change with something configurable
  // await git.fetch()
  // await git.rebase()
  const latest = npm.pkg.version
  const history = await git.log(latest)
  const issues = await Promise.all(history.map(commit => gh(git.config).getPrFromCommit(commit.meta.hash)))
  const version = npm.autobump(history)
  changelog.update(version, history, issues, git.config)
}