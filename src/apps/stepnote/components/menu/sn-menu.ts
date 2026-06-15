// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";

// Lit Extensions (Decorators & Directives)
import { customElement, property, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Modules (Database, Models, Shared Components)
import { snDB } from "@sn/database/SnDB";

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";
import { HelpItem } from "@/common/help-viewer/help-viewer";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/menu/sn-menu.lit.scss?inline";

// Initializations
setBasePath("/");

// Configuration & Initialization ---
import mdIntroduction from "./help/introduction.md?raw";
import mdMenu from "./help/menu.md?raw";
import mdQuickAccess from "./help/quick-access.md?raw";
import mdLabels from "./help/labels.md?raw";
import mdLists from "./help/list.md?raw";
import mdTasks from "./help/task.md?raw";
import mdJournal from "./help/journal.md?raw";

// --- Types ---
export type features = "main" | "dashboard" | "config";

/**
 * メニューボタンの定義
 */
const MENU_BUTTONS = [
  {
    id: "btn-explore",
    tooltip: "Explore",
    iconName: "file-regular-full",
    key: "main",
    bottom: false,
  },
  {
    id: "btn-dashboard",
    tooltip: "Dashboard",
    iconName: "chart-column-solid-full",
    key: "dashboard",
    bottom: false,
  },
  {
    id: "btn-import",
    tooltip: "Import",
    iconName: "upload-solid-full",
    key: "import",
    bottom: false,
  },
  {
    id: "btn-export",
    tooltip: "Export",
    iconName: "download-solid-full",
    key: "export",
    bottom: false,
  },
  {
    id: "btn-help",
    tooltip: "Help",
    iconName: "circle-question-regular-full",
    key: "help",
    bottom: true,
  },
  {
    id: "btn-config",
    tooltip: "Config",
    iconName: "gear-solid-full",
    key: "config",
    bottom: false,
  },
] as const;
type MenuButtonKey = (typeof MENU_BUTTONS)[number]["key"];

/**
 * ヘルプ内容の定義
 */
const HELP_ITEMS: HelpItem[] = [
  {
    name: "introduction",
    title: "INTRODUCTION",
    markdown: mdIntroduction,
  },
  {
    name: "menu",
    title: "MENU",
    markdown: mdMenu,
  },
  {
    name: "quick-access",
    title: "QUICK ACCESS",
    markdown: mdQuickAccess,
  },
  {
    name: "labels",
    title: "LABELS",
    markdown: mdLabels,
  },
  {
    name: "list",
    title: "LIST",
    markdown: mdLists,
  },
  {
    name: "task",
    title: "TASK",
    markdown: mdTasks,
  },
  {
    name: "journal",
    title: "JOURNAL",
    markdown: mdJournal,
  },
] as const;

/**
 * メニュー
 *
 * @export
 * @class SnMenu
 * @extends {LitElement}
 */
@customElement("sn-menu")
export class SnMenu extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnMenu
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中の機能
   *
   * @type {features}
   * @memberof SnMenu
   */
  @property({ type: String }) selectedFeature: features = "main";

  /**
   * インポートダイアログの開閉制御
   *
   * @type {boolean}
   * @memberof SnMenu
   */
  @state() _isImportDialogOpen: boolean = false;

  /**
   * インポート完了ダイアログの開閉制御
   *
   * @type {boolean}
   * @memberof SnMenu
   */
  @state() _isImportFinishDialogOpen: boolean = false;

  /**
   * ヘルプダイアログの開閉制御
   *
   * @type {boolean}
   * @memberof SnMenu
   */
  @state() _isHelpDialogOpen: boolean = false;

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * メニューボタンクリック処理を統合する。
   *
   * @private
   * @param {Event} e
   * @param {MenuButtonKey} key
   * @memberof SnMenu
   */
  private _handleButtonClick = (e: Event, key: MenuButtonKey) => {
    e.preventDefault();
    e.stopPropagation();

    switch (key) {
      case "main":
        emit(this, "select-menu-main");
        break;
      case "dashboard":
        emit(this, "select-menu-dashboard");
        break;
      case "import":
        this._isImportDialogOpen = true;
        break;
      case "export":
        snDB.exportDatabase();
        break;
      case "help":
        this._isHelpDialogOpen = true;
        break;
      case "config":
        emit(this, "select-menu-config");
        break;
      default:
        break;
    }
  };

  /**
   * インポートダイアログを閉じた後の処理を制御します。
   *
   * @private
   * @memberof SnMenu
   */
  private _handleAfterHideImport = (e: CustomEvent) => {
    if (e.target !== e.currentTarget) return;
    this._isImportDialogOpen = false;
  };

  /**
   * インポート完了ダイアログを閉じた後の処理を制御します。
   *
   * @private
   * @memberof SnMenu
   */
  private _handleAfterHideImportFinish = (e: CustomEvent) => {
    if (e.target !== e.currentTarget) return;
    this._isImportFinishDialogOpen = false;
  };

  /**
   * 選択されたファイルをインポートします。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnMenu
   */
  private _handleUploadFile = async (e: CustomEvent) => {
    const file = e.detail.file as File;
    if (!file) return;
    await snDB.importDatabase(file);
    this._isImportDialogOpen = false;
    this._isImportFinishDialogOpen = true;
  };

  /**
   * ヘルプダイアログを閉じた後の処理を制御します。
   *
   * @private
   * @memberof SnMenu
   */
  private _handleAfterHideHelp = (e: CustomEvent) => {
    if (e.target !== e.currentTarget) return;
    this._isHelpDialogOpen = false;
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * メニューボタンをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnMenu
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
        ${map(MENU_BUTTONS, (button) => {
          return html`<div
            class=${classMap({
              field: true,
              active: this.selectedFeature === button.key,
              bottom: button.bottom,
            })}
          >
            <wa-tooltip for=${button.id} placement="right">
              ${button.tooltip}
            </wa-tooltip>
            <wa-button
              variant="neutral"
              appearance="accent"
              id=${button.id}
              @click=${(e: Event) => this._handleButtonClick(e, button.key)}
            >
              <wa-icon library="my-icons" name=${button.iconName}></wa-icon>
            </wa-button>
          </div>`;
        })}
      </div>
      ${this._renderImportDialog()} ${this._renderHelpDialog()}`;
  }

  /**
   * インポートダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnMenu
   */
  private _renderImportDialog(): HTMLTemplateResult {
    return html`<wa-dialog
        light-dismiss
        class="import-dialog"
        label="IMPORT"
        .open=${this._isImportDialogOpen}
        @upload-file=${this._handleUploadFile}
        @wa-after-hide=${this._handleAfterHideImport}
      >
        <file-uploader accept="application/json">
          ファイルを指定してください
        </file-uploader>
      </wa-dialog>
      <wa-dialog
        light-dismiss
        label="Complete"
        .open=${this._isImportFinishDialogOpen}
        @wa-after-hide=${this._handleAfterHideImportFinish}
      >
        インポート処理が完了しました。
        <wa-button
          appearance="filled"
          slot="footer"
          variant="brand"
          data-dialog="close"
        >
          OK
        </wa-button>
      </wa-dialog>`;
  }

  /**
   * ヘルプダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnMenu
   */
  private _renderHelpDialog(): HTMLTemplateResult {
    return html`<wa-dialog
      light-dismiss
      class="help-dialog"
      label="HOW TO USE"
      .open=${this._isHelpDialogOpen}
      @wa-after-hide=${this._handleAfterHideHelp}
    >
      ${this._isHelpDialogOpen
        ? html`<help-viewer .helpItems=${HELP_ITEMS}></help-viewer>`
        : nothing}
    </wa-dialog>`;
  }
}
