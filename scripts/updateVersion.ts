// import readline from "readline";
import fsPromise from "fs/promises";
import { exec } from "child_process";
import inquirer from "inquirer";
import pkg from "../package.json";
import manifest from "../manifest.json";

async function syncManifest() {
  const info = {
    version: pkg.version,
    description: pkg.description,
    author: pkg.author,
  };

  const newManifest = {
    ...manifest,
    ...info,
  };

  fsPromise.writeFile(
    "./manifest.json",
    JSON.stringify(newManifest, null, 2) + "\n"
  );
}

async function main() {
  const data = await fsPromise.readFile("./package.json", "utf8");
  const pkg = JSON.parse(data);
  console.log(`当前的版本号为: ${pkg.version}`);

  const { answer } = await inquirer.prompt([
    {
      type: "list",
      name: "answer",
      message: "请选择要增加的版本号",
      choices: ["1", "0.1", "0.0.1"],
    },
  ]);

  let [major, minor, patch] = pkg.version.split(".");

  switch (answer) {
    case "1":
      major = parseInt(major) + 1;
      break;
    case "0.1":
      minor = parseInt(minor) + 1;
      break;
    case "0.0.1":
      patch = parseInt(patch) + 1;
      break;
    default:
      console.log("输入的版本号不正确");
      process.exit(1);
  }

  pkg.version = `${major}.${minor}.${patch}`;
  await fsPromise.writeFile(
    "./package.json",
    JSON.stringify(pkg, null, 2),
    "utf8"
  );
  console.log(`版本号已更新为: ${pkg.version}`);
  // 请问是否同步更新 manifest.json 的版本号
  const { isSync } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isSync",
      message: "请问是否同步更新 manifest.json 的版本号",
    },
  ]);
  if (isSync) {
    await syncManifest();
    console.log("manifest.json 已更新");
  }
  // 请问是否需要发布新的 git tag
  const { isTag } = await inquirer.prompt([
    {
      type: "confirm",
      name: "isTag",
      message: "请问是否需要发布新的 git tag",
    },
  ]);
  if (isTag) {
    exec(`git tag v${pkg.version}`, (err, stdout, stderr) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log(stdout);
      console.log(stderr);
    });
    console.log(`git tag v${pkg.version}`);
  }
}

main();
