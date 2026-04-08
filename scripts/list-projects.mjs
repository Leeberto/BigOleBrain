import { projects } from "./projects.mjs";

console.log("Runnable projects:\n");

for (const project of projects) {
  console.log(`- ${project.key} [${project.type}]`);
  console.log(`  path: ${project.path}`);
  console.log(`  purpose: ${project.purpose}`);
  console.log(`  env example: ${project.envExample}`);
}
