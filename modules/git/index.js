const { exec: sysExec } = require('child_process')
const chalk = require("chalk")

const exec = (...args) => new Promise((resolve, reject) => {
  sysExec(...args, (err, stdout, stderr) =>
    err ? reject(err) : resolve({ stdout, stderr })
  )
})

const gitExec = async cmd => {
  console.log(chalk.italic.blue(`> git ${cmd}`))
  try {
    const { stdout, stderr } = await exec(`git ${cmd}`)
    if (stderr)
      console.error(chalk.yellow(stderr))
    return stdout
  } catch (e) {
    console.error(chalk.bgRed(e))
  }
  process.exit(-42)
}

const fetch = () => gitExec("fetch")
const checkout = branch => gitExec(`checkout ${branch}`)
const rebase = () => gitExec("rebase")

module.exports = path => ({
  /** Gets the config of the git module
   */
  config: require("./config")(path),
  fetch,
  checkout,
  rebase,
})