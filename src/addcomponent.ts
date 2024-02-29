#!/usr/bin/env node
import Configstore from "configstore";
import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import {
  ConfigFile,
  downloadFile,
  fetchComponents,
  readConfigFile,
} from "./helpers";

const configFile = readConfigFile() as ConfigFile;
// const COMPONENTS_URL =
//   "https://raw.githubusercontent.com/MsingathiMat/aphrica/main/src/aphricaComponents/{componentName}/{fileName}";
const COMPONENTS_URL =
  "https://raw.githubusercontent.com/MsingathiMat/aphrica/main/src/aphricaComponents/{fileName}";

async function addComponent(componentName: string) {
  const componentDirectory = path.join(
    process.cwd(),
    configFile.directory,
    componentName,
  );

  if (fs.existsSync(componentDirectory)) {
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `Component '${componentName}' already exists. Do you want to overwrite it?`,
        },
      ])
      .then(async (answers) => {
        if (answers.overwrite) {
          //TODO: Overwrite the component
          await fetchAndSaveComponents(componentName, componentDirectory);
        }
      });
  } else {
    await fetchAndSaveComponents(componentName, componentDirectory);
  }
}

async function fetchAndSaveComponents(
  componentName: string,
  componentDirectory: string,
) {
  //* This can be fetched from the repo directly
  const components = new Configstore("components");

  if (!components.has(componentName)) {
    fetchComponents();
  }

  return await Promise.allSettled(
    (components.get(componentName) as string[]).map((file) => {
      const dest = path.join(componentDirectory, file);
      return downloadFile(
        COMPONENTS_URL.replace("{componentName}", componentName).replace(
          "{fileName}",
          file,
        ),
        dest,
      );
    }),
  );
}

export { addComponent };
