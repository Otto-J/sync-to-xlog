export const defaultConfig = () => ({
  title: "",
  noteId: "",
  summary: "",
  rawTags: "",
  slug: "",
  publish_time: "",
  create_time: "",
  publishTimeMode: "current" as "current" | "create_time" | "custom",
  uploadIPFS: true,
});

// export const useHandlePost = () => {
//   const handleUpload = async (content: string, plugin: Plugin) => {
//     const finalContent = await handleMarkdownImageToXlog(content, plugin);

//     return finalContent;
//   };
//   // 创建文章
//   const handleCreatePost = async ({
//     token = "",
//     title = "",
//     content = "",
//     summary = "",
//     tags = [] as string[],
//     slug = "",
//     charactorID = "",
//     config = {} as any,
//   }) => {
//     console.log("handle create post");
//     const url = `/v1/siwe/contract/characters/${charactorID}/notes`;

//     if (config.value.uploadIPFS) {
//       // 上传图片到 ipfs
//       content = await handleUpload(baseInfo.content);
//     }
//     // return false;

//     return requestUrl({
//       method: "put",
//       url: url,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         metadata: {
//           tags: tags,
//           type: "note",
//           title: title,
//           content: content,
//           summary: summary,
//           sources: ["xlog"],
//           // 发布日期
//           date_published: new Date(config.value.publish_time).toISOString(),
//           attributes: [
//             {
//               value: slug,
//               trait_type: "xlog_slug",
//             },
//           ],
//           attachments: [
//             {
//               name: "cover",
//               address: "",
//               mime_type: "",
//             },
//           ],
//         },
//         locked: false,
//         linkItemType: null,
//       }),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((res) => {
//         console.log(4, res);
//         new Notice("上传成功");
//         return res;
//       })
//       .catch((err) => {
//         console.log(3, err);
//         new Notice("上传失败");
//         return null;
//       });
//   };
//   const handleUpdatePost = async ({
//     token = "",
//     title = "",
//     content = "",
//     summary = "",
//     tags = [] as string[],
//     slug = "",
//     charactor = "",
//     noteId = "",
//   }) => {
//     console.log("handle update post");
//     const url = `/v1/siwe/contract/characters/${charactor}/notes/${noteId}/metadata`;
//     const mode = "replace"; //'merge'

//     if (config.value.uploadIPFS) {
//       // 上传图片到 ipfs
//       content = await handleUpload(baseInfo.content);
//     }

//     // return false;

//     return requestUrl({
//       method: "post",
//       url: url,
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         metadata: {
//           tags: tags,
//           type: "note",
//           title: title,
//           content: content,
//           summary: summary,
//           sources: ["xlog"],
//           date_published: new Date(config.value.publish_time).toISOString(),
//           attributes: [
//             {
//               value: slug,
//               trait_type: "xlog_slug",
//             },
//           ],
//           attachments: [
//             {
//               name: "cover",
//               address: "",
//               mime_type: "",
//             },
//           ],
//         },
//         mode,
//       }),
//     })
//       .then((res) => {
//         return res.json();
//       })
//       .then((res) => {
//         new Notice("更新成功");
//         console.log(4, res);
//         // return res.data;
//       })
//       .catch((err) => {
//         console.log(3, err);
//         new Notice("更新失败");
//         return null;
//       });
//   };
// };
