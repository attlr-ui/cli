#!/usr/bin/env node
import {
  VERSION,
  ISSUES_URL,
  COMPONENTS_ROOT_URL,
  COMPONENTS_LIST_URL
} from './urls'

import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import https from 'node:https'
import inquirer from 'inquirer'
// import { execSync } from 'child_process'
import { readConfigFile } from './helpers'
import { type ComponentList } from './types'
import { type IncomingMessage } from 'http'

const addComponent = (componentName: string, overwrite = false): void => {
  // 1. Read the config file
  const configFile = readConfigFile()!

  const destination = path.join(
    configFile.directory,
    componentName,
    'index.tsx'
  )

  // 3. Check if the component exists in the project already
  if (!overwrite && fs.existsSync(destination)) {
    inquirer
      .prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `The component ${componentName} already exists. Do you want to overwrite it?`
        }
      ])
      .then((answers): void => {
        if (answers.overwrite) {
          process.stdout.write(
            chalk.yellow(`Overwriting component ${componentName} \n`)
          )
          downloadComponent(componentName, configFile.directory)
        }
      })
      .catch((error): void => {
        process.stdout.write(
          chalk.red(`Error: ${(error as { message: string }).message}`)
        )
        process.exit(1)
      })
    return
  }
  downloadComponent(componentName, configFile.directory)
}

export { addComponent }

function downloadComponent (componentName: string, directory: string): void {
  // 2. Get the components list
  try {
    https.get(
      COMPONENTS_LIST_URL.replace('{version}', VERSION),
      (response: IncomingMessage): void => {
        let data = ''
        response.on('data', (chunk): void => {
          data += chunk
        })

        response.on('end', (): void => {
          // 4. Check if the component exists in the list
          const componentList = JSON.parse(data) as ComponentList
          if (!Object.keys(componentList).includes(componentName)) {
            process.stdout.write(
              chalk.red(`Error: Component ${componentName} not found \n`)
            )
            process.exit(1)
          }

          // 5. Download the component
          process.stdout.write(
            chalk.yellow(`Downloading component ${componentName} \n`)
          )
          const destination = path.join(directory, componentName, 'index.tsx')
          const destinationFolder = path.join(directory, componentName)

          if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true })
          }

          const file = fs.createWriteStream(destination, { autoClose: true })
          https.get(
            `${COMPONENTS_ROOT_URL}${componentName}/index.tsx`,
            (response: IncomingMessage): void => {
              response.pipe(file)
              file.on('finish', () => {
                file.close()

                const toInstall =
                  componentList[componentName].dependencies.join(' ')

                if (toInstall.length > 3) {
                  // Install the component dependencies
                  process.stdout.write(
                    chalk.blue(
                      `Installing dependencies for ${componentName} (${toInstall})\n`
                    )
                  )

                  // execSync(`npm install ${toInstall}`, { stdio: "inherit" });
                  // Print to the console the components needs to be installed
                  process.stdout.write(
                    chalk.blue(
                      `To install the dependencies run: npx expo install ${toInstall}\n`
                    )
                  )

                  process.stdout.write(
                    chalk.green(
                      `Component ${componentName} downloaded successfully\n`
                    )
                  )
                  process.exit(0)
                }
                process.stdout.write(
                  chalk.green(
                    `Component ${componentName} downloaded successfully\n`
                  )
                )
                process.exit(0)
              })
            }
          )
        })
      }
    )
  } catch (error) {
    process.stdout.write(
      chalk.red(
        `Error: ${
          (error as { message: string }).message
        }. If the error persist please reach out on GitHub: ${ISSUES_URL} \n`
      )
    )
  }
}
