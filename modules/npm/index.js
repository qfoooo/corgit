const path = require("path")

const pkg = pwd => require(path.resolve(pwd, "package.json"))

module.exports = pwd => ({
  pkg: pkg(pwd)
})