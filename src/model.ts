import { Notice, Plugin, requestUrl } from "obsidian";

export const handleFileToXlog = () => {};

export const defaultSettings = () => ({
  enable: true,
  token: "",
  charactorID: "",
  autoUpload: true,
  debugger: false,
  isMultiCharactor: false,
  charactorList: [] as Array<{ name: string; value: string }>,
});

export const baseUrl = "https://indexer.crossbell.io";

const uploadImageToIPFS = async (blob: Blob) => {
  // 后续如果上传图片失败，需要关注原始代码是否变化，目前没有鉴权还是需要注意的
  //github.com/Crossbell-Box/xLog/blob/dev/src/lib/upload-file.ts#L1
  // form xlog source src/lib/upload-file.ts
  const formData = new FormData();
  formData.append("file", blob);

  const url = "https://ipfs-relay.crossbell.io/upload?gnfd=t";

  const response = await requestUrl({
    method: "POST",
    url: url,
    body: formData as any,
    contentType: "multipart/form-data",
  });
  console.log(1, await response.json());

  // 接口默认读缓存，多次上传返回相同结果
  // const response = await fetch(
  //   "https://ipfs-relay.crossbell.io/upload?gnfd=t",
  //   { method: "POST", body: formData }
  // );
  // return {
  //   ipfs: (await response.json()).url as string,
  // };
};

const handleRemoteUrl = async (alt: string, url: string) => {
  console.log("handleRemoteUrl", url, alt);
  try {
    // 这里可能遇到 cors ，所以用内置的 api 无视安全策略
    const response = await requestUrl({
      url: url,
      method: "GET",
    });
    const buf = await response.arrayBuffer;
    const type = response.headers["content-type"];

    const blob = new Blob([buf], {
      type,
    });
    // const ipfs = (await uploadImageToIPFS(blob)).ipfs;
    // 上传成功 toast

    // return {
    //   originalMarkdown: `![${alt}](${url})`,
    //   newMarkdown: `![${alt}](${ipfs})`,
    // };
  } catch (error) {
    if (error instanceof Error) {
      new Notice(`Failed upload ${alt || url}, ${error.message}`);
    }
    console.error(error);
    return undefined;
  }
};
const handleLocalUrl = async (obUrl: string, plugin: Plugin) => {
  console.log("handleLocalUrl--", obUrl);
  // 这里需要调用 obsidian 的 api 来读取文件
  try {
    const obInnerFile = await plugin.app.metadataCache.getFirstLinkpathDest(
      obUrl,
      ""
    );
    if (!obInnerFile) {
      new Notice(`Failed upload ${obUrl}, 文件不存在`);
      return;
    }
    console.log("find ob local file");

    const conArrayBuffer = await plugin.app.vault.readBinary(obInnerFile);
    // 转成二进制，通过 post 上传
    const blob = new Blob([conArrayBuffer], {
      type: "image/" + obInnerFile.extension,
    });
    // 测试上传一个图片
    // const ipfs = (await uploadImageToIPFS(blob)).ipfs;
    // console.log("upload ipfs", ipfs);
    // return {
    //   originalMarkdown: `![[${obUrl}]]`,
    //   newMarkdown: `![${obInnerFile.basename}](${ipfs})`,
    // };
  } catch (error: any) {
    new Notice(`Failed upload ${obUrl}, ${error.message}`);
  }

  return;
};

// 后续这部分可以抽离为独立逻辑
export const handleMarkdownImageToXlog = async (
  content: string,
  plugin: Plugin
) => {
  /**
   * 需要处理的图片有几种格式：
   * - ![]() http 路径 需要代理读取
   * - ![]() 本地路径 可以直接
   * - ![[]] ob 内部路径，可以直接图读取到图片content
   */
  // 匹配 ![]() 图片 和 ![[]] 图片
  const mdImageReg = /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)|!\[\[([^\]]*)\]\]/g;
  const mdImageRegSingle =
    /!\[([^\]]*)\]\((https?:\/\/[^)]+)\)|!\[\[([^\]]*)\]\]/;

  // 匹配得到的图片列表
  const imagesList = content.match(mdImageReg);
  if (imagesList) {
    const mdReplaceList = await Promise.all(
      imagesList.map(async (image) => {
        const match = image.match(mdImageRegSingle);
        // 通过 match 来判断符合标准
        if (match) {
          const [, alt, url, obUrl] = match;
          if (url) {
            // http 图片
            return await handleRemoteUrl(alt, url);
          } else if (obUrl) {
            // ob 图片
            return await handleLocalUrl(obUrl, plugin);
          } else {
            console.log("匹配失败", match);
          }
        }
      })
    );

    const newContent = content;
    // mdReplaceList 包含带替换的内容
    // 开始替换图片
    // mdReplaceList.forEach((item) => {
    //   if (item) {
    //     newContent = newContent.replace(
    //       item.originalMarkdown,
    //       item.newMarkdown
    //     );
    //   }
    // });
    // 替换完成
    return newContent;
  } else {
    return content;
  }
};
