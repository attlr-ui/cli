import chalk from "chalk";
import https from "node:https";
import { readConfigFile } from "./helpers";
import { COMPONENTS_LIST_URL } from "./urls";
import { ComponentList, ConfigFile } from "./types";

function available() {
  const { version } = readConfigFile() as ConfigFile;

  https.get(COMPONENTS_LIST_URL.replace("{version}", version), (response) => {
    let data = "";
    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      const componentList = JSON.parse(data) as ComponentList;

      process.stdout.write(chalk.green("Available components:\n"));

      let count = 1;
      Object.keys(componentList).forEach((component) => {
        process.stdout.write(chalk.blue(`${count}. ${component}\n`));
        count++;
      });

      process.stdout.write(
        `\nTotal components: ${Object.keys(componentList).length}\n`,
      );

      process.stdout.write(
        chalk.yellow(
          "\nTo add a component to your project, run `npx attlr add <componentName>`\n",
        ),
      );

      // Show the version of the components list
      process.stdout.write(
        chalk.yellow(`\nComponents version: ${componentList.version}\n`),
      );

      process.exit(0);
    });
  });
}
export { available };
