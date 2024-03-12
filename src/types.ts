export interface ConfigFile {
  directory: string
  utilsDirectory: string
  componentAlias: string
  utilsAlias: string
  version: string
}

export type ComponentList = Record<string, {
  path: string
  dependencies: string[]
}>
