import { App, Modal, Plugin, PluginSettingTab, TFile, TFolder } from "obsidian";
import { createApp, type App as VueApp } from "vue";
import SettingsPage from "./ui/settings.vue";
import PublishModal from "./ui/publishModal.vue";
import { useObsidianFrontmatter } from "./utils";

// Remember to rename these classes and interfaces!

// 核心
export default class SyncToXlogPlugin extends Plugin {
  async onload() {
    const settingTab = new SampleSettingTab(this.app, this);
    this.addSettingTab(settingTab);

    // 左侧 sidebar 具体文件单击右键
    {
      this.registerEvent(
        this.app.workspace.on("file-menu", (menu, file) => {
          if (file instanceof TFolder) {
            // 一定进不来，为了 ts 不报错
            console.log("It's a folder!", file);
            return;
          }

          if (file instanceof TFile) {
            // console.log("It's a file!");

            const isImg = ["png", "jpg", "jpeg", "gif"].includes(
              file.extension
            );

            if (isImg) {
              // menu.addItem((item) => {
              //     item.setTitle("3图片处理").onClick(async () => {
              //         console.log("是图片", file);
              //         const content = await file.vault.cachedRead(
              //             file
              //         );
              //         console.log(content);
              //     });
              // });
            } else {
              menu.addItem((item) => {
                item.setTitle("上传到文件到 xlog").onClick(async () => {
                  new MyPublishModal(this.app, this, file).open();
                });
              });
            }
          }
        })
      );
    }
  }

  onunload() {}
}

/**
 * 添加 设置面板
 */
class SampleSettingTab extends PluginSettingTab {
  plugin: SyncToXlogPlugin;
  _vueApp: VueApp | undefined;

  constructor(app: App, plugin: SyncToXlogPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    console.log("open设置面板", this.plugin);
    const _app = createApp(SettingsPage, {
      plugin: this.plugin,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }
  hide() {
    // 好像不能保留实例
    console.log("close设置面板");
    // this.containerEl
    if (this._vueApp) {
      console.log("un mount");
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

  onOpen() {
    const { addOrUpdateFrontMatter, currentFrontMatter } =
      useObsidianFrontmatter(this.file, this.app);

    //  console.log("open设置面板", this.plugin);
    const _app = createApp(PublishModal, {
      plugin: this.plugin,
      modal: this,
      file: this.file,
      addOrUpdateFrontMatter,
      currentFrontMatter,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }

  onClose() {
    // 好像不能保留实例
    // this.containerEl
    if (this._vueApp) {
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}
