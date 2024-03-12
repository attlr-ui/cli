#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import inquirer from 'inquirer'
import { CONFIG_FILE_NAME, checkIfConfigExist } from './helpers'
import { VERSION } from './urls'
import { execSync } from 'child_process'

function doInitialization (): void {
  checkIfConfigExist()

  inquirer
    .prompt([
      {
        type: 'input',
        default: 'components/',
        name: 'directory',
        message:
          'Enter your components directory, or press enter to use the default:'
      },
      {
        type: 'input',
        name: 'utilsDirectory',
        message:
          'Enter your utils directory, or press enter to use the default:',
        default: 'utils/'
      },
      {
        type: 'input',
        name: 'componentAlias',
        message: 'Enter your component alias:'
      },
      {
        type: 'input',
        name: 'utilsAlias',
        message: 'Enter your utils alias:'
      }
    ])
    .then((answers: Record<string, string>) => {
      const { directory, utilsDirectory, componentAlias, utilsAlias } = answers

      const componentDirectoryFull = path.join(process.cwd(), answers.directory)
      const utilsDirectoryFull = path.join(process.cwd(), utilsDirectory)

      try {
        if (!fs.existsSync(componentDirectoryFull)) {
          // Make the component directory and all parent directories if they don't exist
          fs.mkdirSync(componentDirectoryFull, { recursive: true })
        }

        if (!fs.existsSync(utilsDirectoryFull)) {
          // Make the utils directory and all parent directories if they don't exist
          fs.mkdirSync(utilsDirectoryFull, { recursive: true })
        }

        // Create the config file and save it to the current directory
        fs.writeFileSync(
          CONFIG_FILE_NAME,
          JSON.stringify({
            directory,
            utilsDirectory,
            componentAlias,
            utilsAlias,
            version: VERSION
          })
        )

        process.stdout.write(
          chalk.green(
            'Config file created successfully. \n\n You can now run \'npx attlr add <componentName>\' to add a new component. \n'
          )
        )

        process.stdout.write(
          chalk.blue('Adding lucide-react-native to your project\n\n')
        )

        execSync('npx expo install lucide-react-native', { stdio: 'inherit' })

        process.stdout.write(
          chalk.green(
            '\n\nYou can now run \'npx attlr add <componentName>\' to add a new component. \n'
          )
        )

        //   process.stdout.write(
        //     chalk.gray(
        //       "You can also run 'npx attlr add:utils <utilName>' to add a new util function. \n",
        //     ),
        //   );

        process.stdout.write(
          chalk.gray(
            'Visit the documentation for more information https://github.com/attlr-ui/cli/tree/main#readme'
          )
        )
      } catch (error) {
        console.error(`Error creating component directory: ${error as string}`)
      }
    })
    .catch((error) => {
      process.stdout.write(
        chalk.red(
          `Error: ${
            error.message as string
          }. If the error persist please reach out https://github.com/attlr-ui/cli/issues/new?assignees=&labels=&projects=&template=bug_report.md&title=%5BBUG%5D%3A+`
        )
      )
    })
}

export { doInitialization }
