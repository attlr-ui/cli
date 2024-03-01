#!/usr/bin/env node
// import minimist from "minimist";
// import { doInitialization } from "./init";
// import { fetchComponents } from "./helpers";
// import { addComponent } from "./addcomponent";
import chalk from "chalk";

// const args = minimist(process.argv.slice(2), {
//   alias: { h: "help", v: "version", c: "clean" },
// });

// switch (args._[0]) {
//   case "add":
//     addComponent(args._[1]);
//     break;
//   case "update":
//     fetchComponents(args.c);
//     break;
//   case "init":
//     doInitialization();
//     break;
//   default:
//     console.log(
//       "Usage: npx attlr <command> <componentName> \n\nCommands: \n\nadd: Add a new component \nupdate: Update the components list \ninit: Initialize the config file \n\nOptions: \n\n-c, --clean: Clear the components list cache \n-h, --help: Display help \n-v, --version: Display version \n\n",
//     );
//     break;
// }
import { Command } from "commander";
const program = new Command();

program
  .version("0.0.1", "-v, --version")
  .description("Attlr CLI tool to add components to your project")
  .usage("<command> [options]")
  .helpOption("-h, --help", "Display help");

program
  .command("add <componentName>")
  .aliases(["a", "i", "install"])
  .description("Add a new component")
  .action((args) => {
    console.log(`Adding ${args} component`);
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
  .action((args) => {
    console.log("Initializing config file");
  });

program.parse(process.argv);
