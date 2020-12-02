module.exports = path => ({
  /** Gets the config of the git module
   */
  config: require("./config")(path)
})