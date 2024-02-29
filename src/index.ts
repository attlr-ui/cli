#!/usr/bin/env node
import { fetchComponents } from "./helpers";
import { addComponent } from "./addcomponent";
import minimist from "minimist";
import { doInitialization } from "./init";

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
    console.log("Usage: npx attlr <command> <componentName>");
    break;
}

// const configFile = readConfigFile() as ConfigFile;

// console.log(configFile);
// fetchComponents(); //Update components list
// addComponent("AButton".toLowerCase());
// if (process.argv.length < 4 || process.argv[2] !== "add") {
//   console.log("Usage: npx attlr-ui add <componentName>");
// } else {
//   addComponent(process.argv[3]);
// }

// fetchComponents(); //Update components list
