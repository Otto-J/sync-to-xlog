import { TFile, type App, type RequestUrlParam, Plugin } from "obsidian";

export const getFrontMatterByFile = async (file: TFile, app: App) => {
  let frontmatter = {} as Record<string, any>;
  await app.fileManager.processFrontMatter(file, (fm) => {
    frontmatter = fm;
  });
  return frontmatter;
};

export const updateFrontMatterByFile = async (
  file: TFile,
  app: App,
  finalData: any
) => {
  await app.fileManager.processFrontMatter(file, (fm) => {
    Object.keys(finalData).forEach((key) => {
      fm[key] = finalData[key];
    });
  });
};

export const getToken = async (plugin: Plugin) => {
  const settings = await plugin.loadData();
  console.log("settings", settings);
  return settings.token;
};

export const commonGet = (url: string, token: string): RequestUrlParam => {
  return {
    url,
    method: "GET",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
