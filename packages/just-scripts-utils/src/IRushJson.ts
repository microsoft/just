export interface IRushProject {
  packageName: string;
  projectFolder: string;
  shouldPublish?: boolean;
  versionPolicyName?: string;
}

export interface IRushJson {
  projects: IRushProject[];
  rushVersion: string;
  // more properties can be added as needed
}
