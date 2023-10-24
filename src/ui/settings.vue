<template>
  <h1 class="H1">Obsidian Sync Xlog</h1>
  <h2>这里配置 xlog 基本信息</h2>
  <div v-if="settings.debugger">{{ settings }}</div>
  <!-- enable -->
  <div class="setting-item mod-toggle">
    <div class="setting-item-info">
      <div class="setting-item-name">启用状态</div>
      <div class="setting-item-description">若关闭插件不生效</div>
    </div>

    <div class="setting-item-control">
      <div
        class="checkbox-container"
        :class="settings.enable ? 'is-enabled' : ''"
      >
        <input type="checkbox" v-model="settings.enable" tabindex="0" />
      </div>
    </div>
  </div>
  <!-- username -->
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">XLOG SIWE Token</div>
      <div class="setting-item-description">
        如不清楚 Token 请访问
        <a tabindex="1" href="https://blog.ijust.cc/play-xlog-02">获取帮助</a>
      </div>
    </div>
    <div class="setting-item-control">
      <input
        v-model="settings.token"
        type="password"
        placeholder="请输入 token"
        spellcheck="false"
        tabindex="2"
      />
      <button class="mod-cta" tabindex="3" @click="connectTest">
        连接测试
      </button>
    </div>
  </div>
  <!-- charactor ID -->
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Charactor ID</div>
      <!-- <div class="setting-item-description">Github Repo</div> -->
    </div>
    <div class="setting-item-control">
      <select
        v-if="settings.isMultiCharactor"
        class="dropdown"
        v-model="settings.charactorID"
      >
        <option
          :value="item.value"
          v-for="item of settings.charactorList"
          :key="item.value"
          :label="item.name"
        ></option>
      </select>
      <input
        v-else
        v-model="settings.charactorID"
        type="text"
        placeholder="建议通过连接测试自动填写"
        spellcheck="false"
        tabindex="4"
      />
    </div>
  </div>
  <!-- need ipfs auto upload -->
  <div class="setting-item mod-toggle">
    <div class="setting-item-info">
      <div class="setting-item-name">上传是否修改图片为 IPFS</div>
      <div class="setting-item-description">
        在 XLOG 上是否使用 IPFS 协议展示图片等资源，上传时可单独设置
      </div>
    </div>
    <div class="setting-item-control">
      <div
        class="checkbox-container"
        :class="settings.autoUpload ? 'is-enabled' : ''"
      >
        <input type="checkbox" v-model="settings.autoUpload" tabindex="5" />
      </div>
    </div>
  </div>
  <!-- debugger -->
  <div class="setting-item mod-toggle">
    <div class="setting-item-info">
      <div class="setting-item-name">启用 debugger</div>
      <div class="setting-item-description">开发问题排查</div>
    </div>
    <div class="setting-item-control">
      <div
        class="checkbox-container"
        :class="settings.debugger ? 'is-enabled' : ''"
      >
        <input type="checkbox" v-model="settings.debugger" tabindex="6" />
      </div>
    </div>
  </div>

  <div class="setting-item-control" style="margin-top: 18px">
    <button @click="settings = defaultSettings()">重置配置</button>
    <button class="mod-cta" @click="save">保存配置</button>
  </div>
</template>
<script lang="ts" setup>
import { Notice, requestUrl, type RequestUrlParam } from "obsidian";
import { onMounted, ref, watchEffect } from "vue";
import type SyncToXlogPlugin from "@/starterIndex";
import { baseUrl, defaultSettings } from "../model";

const props = withDefaults(
  defineProps<{
    plugin: SyncToXlogPlugin | undefined;
  }>(),
  {
    plugin: undefined,
  }
);

const settings = ref(defaultSettings());

watchEffect(() => {
  settings.value.token = settings.value.token.replace(/^['"]|['"]$/g, "");
});

const save = async () => {
  const newSeeting = {
    // ...currentSetting.value,
    ...settings.value,
  };
  // currentSetting.value = newSeeting;
  await props.plugin?.saveData(newSeeting);
  console.log("save");
  new Notice("保存成功");
};

const commonGet = (url: string, token: string): RequestUrlParam => {
  return {
    url,
    method: "GET",
    contentType: "application/json",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};
const commonPost = {};

// const characterList = z

const connectTest = () => {
  const token = settings.value.token;
  if (!token) {
    new Notice("token 不能为空");
    return;
  }

  const url = baseUrl + "/v1/siwe/account";

  requestUrl(commonGet(url, token))
    .then(({ json }) => {
      return json;
    })
    .then(({ address }) => {
      return address;
    })
    .then((address) => {
      console.log("1,address", address);
      const url = `${baseUrl}/v1/addresses/${address}/characters`;
      return requestUrl(commonGet(url, token));
    })
    .then(({ json }) => {
      return json;
    })
    .then((data) => {
      // console.log(3, data);
      if (data.count > 1) {
        new Notice("连接成功，请在下方 Charactor ID 中进行角色选择");
      } else {
        settings.value.charactorID = data.list[0].characterId;
      }

      settings.value.isMultiCharactor = data.count > 1;
      settings.value.charactorList = data.list.map((item: any) => {
        return {
          name: `${item.handle}(${item.characterId})`,
          value: item.characterId,
        };
      });
    })
    .catch((err) => {
      console.log("err", err);
      new Notice("连接失败" + err.message);
    });
};

onMounted(async () => {
  if (props.plugin) {
    const _currentSetting =
      (await props.plugin.loadData()) ?? defaultSettings();
    settings.value = _currentSetting;
  }
});
</script>

<style scoped>
input[type="checkbox"] {
  width: 100%;
  height: 100%;
}
</style>
