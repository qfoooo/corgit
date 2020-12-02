const path = require('path')
const gitLoader = require("../git")

module.exports = args => {
  const git = gitLoader(path.resolve("."))
  console.log(git)
}