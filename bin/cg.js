#!/usr/bin/env node
const path = require("path")
const config = require(path.resolve(process.env.HOME, ".corgit", "config.json"))

// parses the arguments in a corgit object
const args = require("../modules/argv")(process.argv)

const usage = () => {
  console.log("Usage: cg [command] [args]")
  console.log("")
  console.log("Commands:")
  console.log("release  Creates a release for the current git repository")
}

// command definitions
const commands = {
  _: usage,
  usage,
  help: usage,
  release: require("../modules/release")
}

const run = commands[args.command] || commands._
run(args, config)