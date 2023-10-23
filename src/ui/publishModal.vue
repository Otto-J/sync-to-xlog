<template>
  <div class="modal-bg" style="opacity: 0.85"></div>
  <div class="modal">
    <div class="modal-close-button" @click="closeModal"></div>
    <div class="modal-title">文章上传设置</div>
    <div class="modal-content">
      <!-- title -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">标题 Title</div>
          <div class="setting-item-description">默认读取当前标题</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="config.title"
            placeholder="留空表示默认标题"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- slug -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">路径 Slug</div>
          <div class="setting-item-description">留空默认分配</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            v-model="config.slug"
            placeholder="留空表示默认"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- summary -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">摘要 Description</div>
          <div class="setting-item-description">留空默认分配</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            placeholder="留空表示默认"
            spellcheck="false"
            v-model="config.summary"
            tabindex="2"
          />
        </div>
      </div>
      <!-- tags -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">标签 Tags</div>
          <div class="setting-item-description">使用中英文逗号分割</div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            placeholder="留空表示默认"
            v-model="config.rawTags"
            spellcheck="false"
            tabindex="2"
          />
        </div>
      </div>
      <!-- image upload -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">
            图片是否上传到 IPFS Upload Image to IPFS
          </div>
          <div class="setting-item-description">
            将图片上传至 IPFS，不影响本地笔记，也会稍微增加上传的耗时。
          </div>
        </div>
        <div class="setting-item-control">
          <div
            class="checkbox-container"
            :class="config.uploadIPFS ? 'is-enabled' : ''"
          >
            <input
              type="checkbox"
              style="width: 100%; height: 100%"
              v-model="config.uploadIPFS"
              tabindex="2"
            />
          </div>
        </div>
      </div>
      <!-- 发布日期 -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">发布日期 Publish Time</div>
          <div class="setting-item-description">
            默认读取 publish_time，留空表示当前日期。
            <br />
            支持格式
            <b class="u-pop">YYYY/MM/DD HH:mm:ss</b>
          </div>
        </div>
        <div class="setting-item-control">
          <!-- checkbox -->
          <select v-model="config.publishTimeMode" class="dropdown">
            <option value="current">使用当前时间</option>
            <option value="create_time">使用 create_time</option>
            <option value="custom">自定义</option>
          </select>
          <input
            :disabled="config.publishTimeMode !== 'custom'"
            type="text"
            placeholder="留空表示当前时间"
            v-model="config.publish_time"
            spellcheck="false"
            tabindex="3"
          />
        </div>
      </div>
      <!-- noteId -->
      <div class="setting-item">
        <div class="setting-item-info">
          <div class="setting-item-name">关联 NoteID</div>
          <div class="setting-item-description">
            若填写视为更新文章，留空视为创建文章
          </div>
        </div>
        <div class="setting-item-control">
          <input
            type="text"
            placeholder="留空表示创建"
            spellcheck="false"
            tabindex="2"
            v-model="config.noteId"
          />
        </div>
      </div>
    </div>
    <div class="modal-button-container">
      <button class="mod-cta" @click="startUpload">
        {{ isLoading ? "正在上传" : "开始上传" }}
      </button>
      <button @click="closeModal">取消</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, onMounted, reactive, ref, watchEffect } from "vue";
import type SyncToXlogPlugin from "@/starterIndex";
import { Notice, Modal, TFile } from "obsidian";
import { defaultSettings, handleMarkdownImageToXlog, http } from "../model";

const props = withDefaults(
  defineProps<{
    plugin: SyncToXlogPlugin;
    modal: Modal;
    file: TFile;
    addOrUpdateFrontMatter: (frontMatter: any) => void;
    currentFrontMatter: any;
  }>(),
  {
    currentFrontMatter: () => ({}),
  }
);

const isLoading = ref(false);

const defaultConfig = () => ({
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

const config = ref(defaultConfig());

const closeModal = () => {
  config.value = defaultConfig();
  props.modal?.close();
};

// 弹窗表单
const baseInfo = reactive({
  title: "",
  content: "",
  frontMatter: {} as any,
});

// 系统设置
let settings: Partial<ReturnType<typeof defaultSettings>> = {};

// 检查插件设置是否正确
const checkSettingValidate = (settings: any) => {
  let validate = false;

  if (!settings.enable) {
    new Notice("xlog 上传插件未启用");

    return validate;
  }
  if (!settings.token || !settings.charactorID) {
    new Notice("xlog 上传插件未配置用户信息");
    return validate;
  }

  validate = true;
  return validate;
};

// 处理 baseInfo 和 config
const handleCurrentInfo = async () => {
  baseInfo.title = props.file.basename;
  baseInfo.content = await props.file.vault.cachedRead(props.file);
  baseInfo.frontMatter = props.currentFrontMatter();

  config.value.rawTags = baseInfo.frontMatter?.tags?.join(",") || "";
  config.value.slug = baseInfo.frontMatter?.slug || "";
  config.value.summary = baseInfo.frontMatter?.description || "";
  config.value.title = baseInfo.frontMatter?.title || baseInfo.title || "";

  // noteID
  config.value.noteId = baseInfo.frontMatter?.noteId_x || "";
};

// 兼容不填写 create_time 的情况
const ctime = computed(
  () => baseInfo.frontMatter?.create_time ?? props.file?.stat?.ctime
);

onMounted(async () => {
  // 读取配置
  settings = await props.plugin?.loadData();
  const validate = checkSettingValidate(settings);
  if (!validate) {
    return;
  }
  config.value.uploadIPFS = settings.autoUpload || false;

  // 读取文章内容和相关信息
  await handleCurrentInfo();

  // 如果当前 fm 中有 publish_time 设置 timeMode=custom,并设置
  if (baseInfo.frontMatter?.publish_time) {
    config.value.publishTimeMode = "custom";
    nextTick(() => {
      config.value.publish_time = baseInfo.frontMatter.publish_time;
    });
  }
});

// 监听发布时间模式
watchEffect(() => {
  if (config.value.publishTimeMode === "create_time") {
    const current = new Date(ctime.value).toLocaleString();
    config.value.publish_time = current;
  } else if (config.value.publishTimeMode === "current") {
    config.value.publish_time = new Date().toLocaleString();
  } else if (config.value.publishTimeMode === "custom") {
    config.value.publish_time = "";
  } else {
    console.log("未尽事宜", config.value.publishTimeMode);
  }
});

// 创建文章
const handleCreatePost = async ({
  token = "",
  title = "",
  content = "",
  summary = "",
  tags = [] as string[],
  slug = "",
  charactorID = "",
}) => {
  console.log("handle create post");
  const url = `/v1/siwe/contract/characters/${charactorID}/notes`;

  if (config.value.uploadIPFS) {
    // 上传图片到 ipfs
    content = await handleUpload(baseInfo.content);
  }
  // return false;

  return http
    .request({
      method: "put",
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        metadata: {
          tags: tags,
          type: "note",
          title: title,
          content: content,
          summary: summary,
          sources: ["xlog"],
          // 发布日期
          date_published: new Date(config.value.publish_time).toISOString(),
          attributes: [
            {
              value: slug,
              trait_type: "xlog_slug",
            },
          ],
          attachments: [
            {
              name: "cover",
              address: "",
              mime_type: "",
            },
          ],
        },
        locked: false,
        linkItemType: null,
      },
    })
    .then((res) => {
      console.log(2, res.data);
      new Notice("上传成功");
      return res.data;
    })
    .catch((err) => {
      console.log(3, err);
      new Notice("上传失败");
      return null;
    });
};
const handleUpdatePost = async ({
  token = "",
  title = "",
  content = "",
  summary = "",
  tags = [] as string[],
  slug = "",
  charactor = "",
  noteId = "",
}) => {
  console.log("handle update post");
  const url = `/v1/siwe/contract/characters/${charactor}/notes/${noteId}/metadata`;
  const mode = "replace"; //'merge'

  if (config.value.uploadIPFS) {
    // 上传图片到 ipfs
    content = await handleUpload(baseInfo.content);
  }

  // return false;

  return http
    .request({
      method: "post",
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        metadata: {
          tags: tags,
          type: "note",
          title: title,
          content: content,
          summary: summary,
          sources: ["xlog"],
          date_published: new Date(config.value.publish_time).toISOString(),
          attributes: [
            {
              value: slug,
              trait_type: "xlog_slug",
            },
          ],
          attachments: [
            {
              name: "cover",
              address: "",
              mime_type: "",
            },
          ],
        },
        mode,
      },
    })
    .then((res) => {
      new Notice("更新成功");
      return res.data;
    })
    .catch((err) => {
      console.log(3, err);
      new Notice("更新失败");
      return null;
    });
};

const handleSubmit = async ({
  charactorID = "",
  token = "",
  content = "",
  title = "",
  summary = "",
  tags = [] as string[],
  slug = "",
  noteID = "",
}) => {
  let numberNoteID = Number(noteID);
  const hasNoteID = !Number.isNaN(numberNoteID);
  const isUpdate = hasNoteID && numberNoteID > 0;

  // 如果发布时间是自定义，但是内容为空，设置当前时间
  if (config.value.publishTimeMode === "custom" && !config.value.publish_time) {
    config.value.publish_time = new Date().toLocaleString();
  }

  if (isUpdate) {
    // 走更新
    const res = await handleUpdatePost({
      charactor: charactorID,
      token,
      content,
      title,
      summary,
      tags,
      slug,
      noteId: noteID,
    });
    if (!res) {
      return;
    }
  } else {
    // 走创建
    const res = await handleCreatePost({
      charactorID,
      token,
      content,
      title,
      summary,
      tags,
      slug,
    });
    if (!res) {
      return;
    }
    console.log("创建的 noteID 是", res.data.noteId);
    numberNoteID = res.data.noteId;
  }

  await props.addOrUpdateFrontMatter({
    slug: slug,
    description: summary,
    // tags 要去掉 post
    tags: tags.filter((i) => i !== "post"),
    noteId_x: numberNoteID,

    create_time: new Date(ctime.value).toLocaleString(),
    update_time: new Date().toLocaleString(),
    publish_time: config.value.publish_time,
  });

  closeModal();
};

const handleUpload = async (content: string) => {
  const finalContent = await handleMarkdownImageToXlog(content, props.plugin);

  return finalContent;
};

const startUpload = async () => {
  if (isLoading.value) {
    new Notice("正在上传中");
    return;
  }
  isLoading.value = true;
  let tags = config.value.rawTags.split(/[,，]/);
  // 转 set 去重
  tags = Array.from(new Set(tags)).filter((i) => i);
  if (!tags.some((i) => i === "post")) {
    tags.unshift("post");
  }

  const currentConfig = {
    charactorID: settings.charactorID as string,
    token: settings.token as string,
    content: baseInfo.content,
    title: config.value.title || baseInfo.title,
    summary: config.value.summary,
    tags: tags,
    slug: config.value.slug,
    noteID: config.value.noteId,
  };
  // 1. 上传
  await handleSubmit(currentConfig);
  isLoading.value = false;
};
</script>
