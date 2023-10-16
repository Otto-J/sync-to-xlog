import { App, Notice, TFile, stringifyYaml } from "obsidian";

export const useObsidianFrontmatter = (file: TFile, app: App) => {
  // 使用更具语义化的函数名
  const doesFileExist = () => !!app.metadataCache.getFileCache(file);

  const currentFrontMatter = () =>
    app.metadataCache.getFileCache(file)?.frontmatter ?? {};
  const addOrUpdateFrontMatter = async (obj: Record<string, string>) => {
    const fileCache = app.metadataCache.getFileCache(file);
    // 如果文件不存在，直接返回
    if (!fileCache) {
      new Notice("文件不存在");
      return;
    }

    const currentFrontMatter = fileCache?.frontmatter ?? {};
    const newFrontMatter = `---\n${stringifyYaml({
      ...currentFrontMatter,
      ...obj,
    })}\n---`;

    const { frontmatterPosition } = fileCache;
    const fileContents = await app.vault.read(file);

    // 如果文件没有 Frontmatter，直接返回
    if (!frontmatterPosition) {
      new Notice("文件匹配 frontMatter 失败");
      return;
    }

    // 这里逻辑比较绕，目的是重写文件内容，后面如果有 api 可能就一行代码解决了，类似 metadataCache.update
    const {
      start: { offset: deleteFrom },
      end: { offset: deleteTo },
    } = frontmatterPosition;

    const newFileContents =
      fileContents.slice(0, deleteFrom) +
      newFrontMatter +
      fileContents.slice(deleteTo);

    await app.vault.modify(file, newFileContents);
  };

  return {
    doesFileExist,
    addOrUpdateFrontMatter,
    currentFrontMatter,
  };
};
