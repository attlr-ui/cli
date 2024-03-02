#!/usr/bin/env node
import {
  VERSION,
  ISSUES_URL,
  COMPONENTS_ROOT_URL,
  COMPONENTS_LIST_URL,
} from "./urls";

import fs from "fs";
import path from "path";
import chalk from "chalk";
import https from "node:https";
import inquirer from "inquirer";
import { exec } from "child_process";
import { readConfigFile } from "./helpers";
import { ComponentList, ConfigFile } from "./types";

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
          process.stdout.write(
            chalk.yellow(`Overwriting component ${componentName} \n`),
          );
          downloadComponent(componentName, configFile.directory);
          return;
        }
        return;
      });
    return;
  }
  downloadComponent(componentName, configFile.directory);
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
          process.stdout.write(
            chalk.red(`Error: Component ${componentName} not found \n`),
          );
          process.exit(1);
        }

        // 5. Download the component
        process.stdout.write(
          chalk.yellow(
            `Downloading component ${componentName} to ${directory} \n`,
          ),
        );
        const destination = path.join(directory, componentName, "index.tsx");
        const destinationFolder = path.join(directory, componentName);

        if (!fs.existsSync(destinationFolder)) {
          fs.mkdirSync(destinationFolder, { recursive: true });
        }

        const file = fs.createWriteStream(destination, { autoClose: true });
        https.get(
          `${COMPONENTS_ROOT_URL}${componentName}/index.tsx`,
          (response) => {
            response.pipe(file);
            file.on("finish", () => {
              file.close();

              const toInstall =
                componentList[componentName].dependencies.join(" ");

              if (toInstall.length > 3) {
                // Install the component dependencies
                process.stdout.write(
                  chalk.yellow(
                    `Installing dependencies for ${componentName}\n`,
                  ),
                );
                exec(`npm install ${toInstall}`, (error) => {
                  if (error) {
                    process.stdout.write(
                      chalk.red(
                        `Error: ${error.message}. If the error persist please reach out on GitHub: ${ISSUES_URL}\n`,
                      ),
                    );
                    process.exit(1);
                  }

                  process.stdout.write(
                    chalk.green(
                      `Component ${componentName} downloaded successfully\n`,
                    ),
                  );
                  process.exit(0);
                });
              }
            });
          },
        );
      });
    });
  } catch (error) {
    process.stdout.write(
      chalk.red(
        `Error: ${
          (error as { message: string }).message
        }. If the error persist please reach out on GitHub: ${ISSUES_URL} \n`,
      ),
    );
  }
}
