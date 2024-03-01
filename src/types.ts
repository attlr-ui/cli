export type ConfigFile = {
  directory: string;
  utilsDirectory: string;
  componentAlias: string;
  utilsAlias: string;
};

export type ComponentList = {
  [key: string]: {
    path: string;
    dependencies: string[];
  };
};
