#!/usr/bin/env node

import { doInitialization } from "./init";
import { addComponent } from "./addcomponent";
import chalk from "chalk";

import { Command } from "commander";
const program = new Command();

program
  .version("0.0.1", "-v, --version")
  .description("Attlr CLI tool to add components to your project")
  .usage("<command> [options]")
  .helpOption("-h, --help", "Display help");

//---------------------------------------------------------------------------------------
//                              ADD COMPONENT
//---------------------------------------------------------------------------------------
program
  .command("add")
  .aliases(["a", "i", "install"])
  .argument("<componentName>", "The name of the component to add")
  .option(
    "-o, --overwrite, --o",
    "Overwrite the component if it already exists",
    false,
  )
  .description("Add a new component")
  .action((args, { overwrite }) => {
    addComponent(args, overwrite);
  })
  .exitOverride((error) => {
    console.log(chalk.red(error.message));
  });

program
  .command("update")
  .aliases(["u"])
  .description("Update the components list")
  .option("-c, --clean", "Clear the components list cache")
  .action((args) => {
    console.log("Updating components list");
    if (args.clean) {
      console.log("Clearing cache");
    }
  });

program
  .command("init")
  .aliases(["create", "setup"])
  .description("Initialize the config file")
  .action(() => {
    doInitialization();
  });

program.parse();
