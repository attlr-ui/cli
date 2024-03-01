#!/usr/bin/env node
import Configstore from "configstore";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import { readConfigFile } from "./helpers";
import { ComponentList, ConfigFile } from "./types";
import { COMPONENTS_LIST_URL, COMPONENTS_ROOT_URL, VERSION } from "./urls";
import https from "node:https";
import chalk from "chalk";
import { json } from "stream/consumers";

/**
 * Add the component to the project
 * @param {string} componentName - The name of the component to add
 * @param {boolean} overwrite - Whether to overwrite the component if it already exists
 * @returns {Promise<void>}
 **/
const addComponent = (componentName: string, overwrite = false) => {
  // 1. Read the config file
  const configFile = readConfigFile() as ConfigFile;

  const destination = path.join(
    configFile.directory,
    componentName,
    "index.tsx",
  );

  // 3. Check if the component exists in the project already
  if (!overwrite && fs.existsSync(destination)) {
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `The component ${componentName} already exists. Do you want to overwrite it?`,
        },
      ])
      .then((answers) => {
        if (answers.overwrite) {
          console.log("Downloading & overwriting component");
        }
      });

    return;
  }
  downloadComponent(componentName, configFile.directory);
  console.log("Downloading component");
};

export { addComponent };

function downloadComponent(componentName: string, directory: string) {
  // 2. Get the components list
  try {
    https.get(COMPONENTS_LIST_URL.replace("{version}", VERSION), (response) => {
      let data = "";
      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        // 4. Check if the component exists in the list
        const componentList = JSON.parse(data) as ComponentList;
        if (!Object.keys(componentList).includes(componentName)) {
          console.log(chalk.red(`Error: Component ${componentName} not found`));
          process.exit(1);
        }

        // 5. Download the component
        const destination = path.join(directory, componentName, "index.tsx");
        const destinationFolder = path.join(directory, componentName);

        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
        }

        const file = fs.createWriteStream(destination, { autoClose: true });
        https.get(
          `${COMPONENTS_ROOT_URL}${componentName}/index.tsx`,
          (response) => {
            // let data = "";
            // response.on("data", (chunk) => {
            //   data += chunk;
            // });

            // response.on("end", () => {
            //   // 6. Add the component to the project
            //   file.pipe(response);
            // });
            response.pipe(file);
          },
        );
      });
    });
  } catch (error) {
    console.log(
      chalk.red(
        `Error: ${
          (error as { message: string }).message
        }. If the error persist please reach out `,
        // terminalLink("here", ISSUES_URL),
      ),
    );
  }

  // 6. Add the component to the project
}
