export interface RushProject {
  packageName: string;
  projectFolder: string;
  shouldPublish?: boolean;
  versionPolicyName?: string;
}

export interface RushJson {
  projects: RushProject[];
  rushVersion: string;
  // more properties can be added as needed
}
