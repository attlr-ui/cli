#!/usr/bin/env node
import minimist from "minimist";
import { doInitialization } from "./init";
import { fetchComponents } from "./helpers";
import { addComponent } from "./addcomponent";

const args = minimist(process.argv.slice(2), {
  alias: { h: "help", v: "version", c: "clean" },
});

switch (args._[0]) {
  case "add":
    addComponent(args._[1]);
    break;
  case "update":
    fetchComponents(args.c);
    break;
  case "init":
    doInitialization();
    break;
  default:
    console.log(
      "Usage: npx attlr <command> <componentName> \n\nCommands: \n\nadd: Add a new component \nupdate: Update the components list \ninit: Initialize the config file \n\nOptions: \n\n-c, --clean: Clear the components list cache \n-h, --help: Display help \n-v, --version: Display version \n\n",
    );
    break;
}
