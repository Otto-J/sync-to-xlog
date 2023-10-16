import {
    App,
    ItemView,
    Platform,
    Plugin,
    PluginSettingTab,
    Setting,
    WorkspaceLeaf,
} from "obsidian";
import { createApp, type ComponentPublicInstance } from "vue";

import DemoVue from "./ui/test.vue";

const VIEW_TYPE = "vue-view";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
    mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: "这是默认值",
};

class MyVueView extends ItemView {
    view!: ComponentPublicInstance;

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Dice Roller";
    }

    getIcon(): string {
        return "dice";
    }

    async onOpen(): Promise<void> {
        const app = createApp(DemoVue).mount(this.contentEl);
        this.view = app;
    }
}

// 核心
export default class MyPlugin extends Plugin {
    private view!: MyVueView;
    settings!: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new MyVueView(leaf))
        );

        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

        // This creates an icon in the left ribbon.
        this.addRibbonIcon("dice", "悬浮展示1", (evt: MouseEvent) =>
            this.openMapView()
        );

        // 在这里注册命令 This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: "xxx-id",
            name: "注册命令中文名",
            callback: () => this.openMapView(),
        });
        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    onLayoutReady(): void {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE,
        });
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async openMapView() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(VIEW_TYPE);
        const leaf = workspace.getLeaf(
            // @ts-ignore
            !Platform.isMobile
        );
        await leaf.setViewState({ type: VIEW_TYPE });
        workspace.revealLeaf(leaf);
    }
}

class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", { text: "这是一个 h2 标题" });

        new Setting(containerEl)
            .setName("label1")
            .setDesc("desc1")
            .addText((text) =>
                text
                    .setPlaceholder("默认暗文")
                    .setValue(this.plugin.settings.mySetting)
                    .onChange(async (value) => {
                        this.plugin.settings.mySetting = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}
