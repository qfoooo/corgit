module.exports = argv => {
  const args = argv.slice(2)

  const command = args[0]

  return {
    command
  }
}