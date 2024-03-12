import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import https from 'https'
import { CONFIG_FILE_NAME } from './urls'
import { type IncomingMessage } from 'http'
import { type ConfigFile } from './types'

async function downloadFile (
  url: string | https.RequestOptions | URL,
  dest: fs.PathLike
): Promise<void> {
  await new Promise((resolve, reject) => {
    fs.mkdirSync(
      dest.toString().includes('.')
        ? path.join(dest.toString(), '..')
        : dest.toString(),
      { recursive: true }
    )
    const file = fs.createWriteStream(dest, { autoClose: true })
    https
      .get(url, (response: IncomingMessage): void => {
        response.pipe(file)
        file.on('finish', () => {
          file.close(resolve)
        })
      })
      .on('error', async (err: Error): void => {
        fs.unlink(dest, () => {
          reject(err.message)
        })
      })
  })
}

function readConfigFile (): ConfigFile | null {
  if (fs.existsSync(CONFIG_FILE_NAME)) {
    const configFile = fs.readFileSync(CONFIG_FILE_NAME, 'utf8')
    return JSON.parse(configFile)
  }
  process.stdout.write(
    chalk.red(
      "Error: Config file not found. Run 'npx attlr init' to create a config file."
    )
  )
  process.exit(1)
}

// function readJsonFile<T> (file_path: string): T {
//   try {
//     const configFile = fs.readFileSync(file_path, 'utf8')
//     return JSON.parse(configFile) as T
//   } catch (error) {
//     process.stdout.write(
//       chalk.red(`Error: ${(error as { message: string }).message}`)
//     )
//     process.exit(1)
//   }
// }

function checkIfConfigExist (): void {
  if (fs.existsSync(CONFIG_FILE_NAME)) {
    process.stdout.write(
      chalk.red(
        "Config file already exists. If you want to overwrite it, please delete the existing file and run 'npx attlr init' again."
      )
    )
    process.exit(1)
  }
}

export { downloadFile, readConfigFile, CONFIG_FILE_NAME, checkIfConfigExist }
