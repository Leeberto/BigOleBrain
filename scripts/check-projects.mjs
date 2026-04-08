import fs from "node:fs";
import path from "node:path";
import { projects } from "./projects.mjs";

const requiredReadmePhrases = ["Purpose", "Environment", "Run Locally"];
const projectArg = process.argv[2];
const selectedProjects = projectArg
  ? projects.filter((project) => project.key === projectArg)
  : projects;

if (projectArg && selectedProjects.length === 0) {
  console.error(`Unknown project key: ${projectArg}`);
  process.exit(1);
}

let failed = false;

for (const project of selectedProjects) {
  const packageJsonPath = path.join(project.path, "package.json");

  for (const requiredPath of [project.path, project.envExample, project.readme, packageJsonPath]) {
    if (!fs.existsSync(requiredPath)) {
      console.error(`Missing required project artifact: ${requiredPath}`);
      failed = true;
    }
  }

  if (!fs.existsSync(project.readme)) {
    continue;
  }

  const readme = fs.readFileSync(project.readme, "utf8");
  for (const phrase of requiredReadmePhrases) {
    if (!readme.includes(phrase)) {
      console.error(`${project.readme} is missing expected section text: ${phrase}`);
      failed = true;
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log("Project docs and required files look consistent.");
