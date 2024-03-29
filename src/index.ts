#!/usr/bin/env node

import { doInitialization } from './init'
import { addComponent } from './addcomponent'
import chalk from 'chalk'

import { Command } from 'commander'
import { available } from './available'
const program = new Command()

program
  .version('0.0.1', '-v, --version')
  .description('Attlr CLI tool to add components to your project')
  .usage('<command> [options]')
  .helpOption('-h, --help', 'Display help')

// ---------------------------------------------------------------------------------------
//                              ADD COMPONENT
// ---------------------------------------------------------------------------------------
program
  .command('add')
  .aliases(['a', 'i', 'install'])
  .argument('<componentName>', 'The name of the component to add')
  .option(
    '-o, --overwrite, --o',
    'Overwrite the component if it already exists',
    false
  )
  .description('Add a new component')
  .action((args: string, { overwrite }: { overwrite: boolean }) => {
    addComponent(args, overwrite)
  })
  .exitOverride((error) => {
    process.stdout.write(chalk.red(error.message))
  })

program
  .command('update')
  .aliases(['u'])
  .description('Update the components list')
  .option('-c, --clean', 'Clear the components list cache')
  .action((args) => {
    process.stdout.write('Updating components list')
    if (args.clean) {
      process.stdout.write('Clearing cache')
    }
  })

program
  .command('init')
  .aliases(['create', 'setup'])
  .description('Initialize the config file')
  .action(() => {
    doInitialization()
  })

program
  .command('list')
  .aliases(['ls', 'l'])
  .description('List all the available components')
  .action(() => {
    available()
  })

program.parse()
