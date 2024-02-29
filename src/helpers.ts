import fs from "fs";
import clui from "clui";
import path from "path";
import chalk from "chalk";
import https from "https";
import Configstore from "configstore";

const CONFIG_FILE_NAME = "attlr.config.json";
const COMPONENTS_LIST_URL =
  "https://raw.githubusercontent.com/attlr-ui/ui-components/main/assets/components/{version}.json";
const ISSUES_URL =
  "https://github.com/attlr-ui/cli/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=%5BBUG%5D%3A+";

const Spinner = clui.Spinner;

const load = new Spinner("Adding component...", [
  "⣾",
  "⣽",
  "⣻",
  "⢿",
  "⡿",
  "⣟",
  "⣯",
  "⣷",
]);

function downloadFile(
  url: string | https.RequestOptions | URL,
  dest: fs.PathLike,
) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(
      dest.toString().includes(".")
        ? path.join(dest.toString(), "..")
        : dest.toString(),
      { recursive: true },
    );
    const file = fs.createWriteStream(dest, { autoClose: true });
    load.start();
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          load.stop();
          file.close(resolve);
        });
      })
      .on("error", async (err) => {
        fs.unlink(dest, () => {
          load.stop();
          reject(err.message);
        });
      });
  });
}

function readConfigFile() {
  if (fs.existsSync(CONFIG_FILE_NAME)) {
    const configFile = fs.readFileSync(CONFIG_FILE_NAME, "utf8");
    return JSON.parse(configFile);
  }
  console.log(
    chalk.red(
      `Error: Config file not found. Run 'npx attlr init' to create a config file.`,
    ),
  );
  process.exit(1);
}

function checkIfConfigExist() {
  if (fs.existsSync(CONFIG_FILE_NAME)) {
    console.log(
      chalk.red(
        `Config file already exists. If you want to overwrite it, please delete the existing file and run 'npx attlr init' again.`,
      ),
    );
    process.exit(1);
  }
}

function fetchComponents(clearCache = false) {
  const configJson = readConfigFile();

  if (!configJson.version) {
    console.log(
      chalk.red(
        `Error: Version not found in the config file. Please add a version to the config file ${CONFIG_FILE_NAME}.`,
      ),
    );
    process.exit(1);
  }

  if (clearCache) {
    new Configstore("components").clear();
  }

  try {
    https.get(
      COMPONENTS_LIST_URL.replace("{version}", configJson.version),
      (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          new Configstore("components", JSON.parse(data));
        });
      },
    );
  } catch (error) {
    console.log(
      chalk.red(
        `Error: ${
          (error as { message: string }).message
        }. If the error persist please reach out `,
        // terminalLink("here", ISSUES_URL),
      ),
    );
    process.exit(1);
  }
}

type ConfigFile = {
  directory: string;
  utilsDirectory: string;
  componentAlias: string;
  utilsAlias: string;
};

export {
  downloadFile,
  readConfigFile,
  CONFIG_FILE_NAME,
  ConfigFile,
  checkIfConfigExist,
  fetchComponents,
};
