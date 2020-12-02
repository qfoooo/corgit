const path = require('path')
const gitLoader = require("../git")

module.exports = async args => {
  const git = gitLoader(path.resolve("."))
  await git.checkout("develop") // TODO: change with something configurable
  await git.fetch()
  await git.rebase()
}