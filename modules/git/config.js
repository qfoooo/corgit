const fs = require("fs")
const path = require("path")
let _cnf = null

const getConfigFile = (pwd, smStack = []) => {
  const stat = fs.statSync(path.resolve(pwd, ".git"))
  if (stat.isDirectory()) {
    if (smStack.length !== 0)
      return fs.readFileSync(path.resolve(pwd, ".git/modules", smStack.join("/modules/"), "config")).toString()
    return fs.readFileSync(path.resolve(pwd, ".git/config")).toString()
  }
  else {
    const parentName = pwd.split(path.sep).slice(-1)[0]
    return getConfigFile(path.resolve(pwd, ".."), [parentName, ...smStack])
  }
}

// Note: submodules have the core.worktree property set
const parseConfig = file => {
  const config = {}
  let key = null
  let nestedKey = null
  let nest = {}
  for (const line of file.split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "") continue

    if (trimmed[0] === "[") {
      if (nestedKey) {
        if (!config[key]) config[key] = {}
        config[key][nestedKey] = nest
        nest = {}
        nestedKey = null
      }
      else if (key) {
        config[key] = nest
        nest = {}
      }

      key = trimmed.slice(1,-1)
      if (key.includes(" ")) {
        key = key.split(" ").map(s => s.trim())
        nestedKey = key[1].slice(1,-1)
        key = key[0]
      }
      continue
    }

    const [ k, v ] = trimmed.split("=").map(s => s.trim())
    nest[k] = (() => {
      if (v === "true") return true
      if (v === "false") return false
      if (!isNaN(Number(v))) return Number(v)
      return v
    })()
  }

  if (nestedKey) {
    if (!config[key]) config[key] = {}
    config[key][nestedKey] = nest
    nest = {}
    nestedKey = null
  }
  else if (key) {
    config[key] = nest
    nest = {}
  }

  return config
}

module.exports = pwd => {
  if (_cnf) return _cnf

  const config = parseConfig(getConfigFile(pwd))
  _cnf = config

  return _cnf
}