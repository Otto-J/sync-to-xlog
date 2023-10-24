import { App, Modal, Plugin, PluginSettingTab, TFile, TFolder } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import SettingsPage from "./ui/settings.vue";
import PublishModal from "./ui/publishModal.vue";

// 核心
export default class SyncToXlogPlugin extends Plugin {
  async onload() {
    const settingTab = new SettingTab(this.app, this);
    this.addSettingTab(settingTab);

    // 左侧 sidebar 具体文件单击右键
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file instanceof TFolder) {
          // 一定进不来，为了 ts 不报错
          return;
        }

        if (file instanceof TFile) {
          const isImg = ["png", "jpg", "jpeg", "gif", "webp"].includes(
            file.extension
          );

          if (isImg) {
            // 暂不处理
          } else {
            menu.addItem((item) => {
              item.setTitle("上传此文件到 xlog").onClick(async () => {
                new MyPublishModal(this.app, this, file).open();
              });
            });
          }
        }
      })
    );
  }

  onunload() {}
}

/**
 * 添加 设置面板
 */
class SettingTab extends PluginSettingTab {
  plugin: SyncToXlogPlugin;
  _vueApp: VueApp | undefined;

  constructor(app: App, plugin: SyncToXlogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const _app = createApp(SettingsPage, {
      plugin: this.plugin,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }
  hide() {
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}

/**
 * 第一次上传需要添加默认值
 */
export class MyPublishModal extends Modal {
  _vueApp: VueApp | undefined;
  plugin: SyncToXlogPlugin;

  file: TFile;

  constructor(app: App, plugin: SyncToXlogPlugin, file: TFile) {
    super(app);
    this.plugin = plugin;
    this.file = file;
  }

  async onOpen() {
    const _app = createApp(PublishModal, {
      plugin: this.plugin,
      modal: this,
      file: this.file,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }

  onClose() {
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}
