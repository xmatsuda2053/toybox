// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, query } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// 4. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";
import { HelpItem } from "@/common/help-viewer/help-viewer";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/menu/sn-menu.lit.scss?inline";

// 6. Initializations
setBasePath("/");

// 7. Configuration & Initialization ---
import mdIntroduction from "./help/introduction.md?raw";

import mdMenu from "./help/menu.md?raw";
import mdQuickAccess from "./help/quick-access.md?raw";
import mdLabels from "./help/labels.md?raw";
import mdLists from "./help/list.md?raw";
import mdTasks from "./help/task.md?raw";
import mdJournal from "./help/journal.md?raw";

const helpItems: HelpItem[] = [
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
];

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
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
    css`
      ${unsafeCSS(styles)}
    `,
  ];

  /**
   * ヘルプダイアログ
   *
   * @type {WaDialog}
   * @memberof HaMenu
   */
  @query("#dialog-help") dialogHelp!: WaDialog;

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnMenu
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

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
        <!--エクスプローラーボタン-->
        <div class="field active">
          <wa-tooltip for="btn-explore" placement="right"> Explore </wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-explore"
            @click=${() => emit(this, "click-menu-explore")}
          >
            <wa-icon library="my-icons" name="file-regular-full"></wa-icon>
          </wa-button>
        </div>

        <!--インポートボタン-->
        <div class="field bottom">
          <wa-tooltip for="btn-import" placement="right">Import</wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-import"
            @click=${() => emit(this, "click-menu-import")}
          >
            <wa-icon library="my-icons" name="upload-solid-full"></wa-icon>
          </wa-button>
        </div>

        <!--エクスポートボタン-->
        <div class="field">
          <wa-tooltip for="btn-export" placement="right">Export</wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-export"
            @click=${() => emit(this, "click-menu-export")}
          >
            <wa-icon library="my-icons" name="download-solid-full"></wa-icon>
          </wa-button>
        </div>

        <!--ヘルプボタン-->
        <div class="field ">
          <wa-button
            variant="neutral"
            appearance="accent"
            id="help-button"
            @click=${() => (this.dialogHelp.open = true)}
          >
            <wa-icon
              library="my-icons"
              name="circle-question-regular-full"
            ></wa-icon>
          </wa-button>
        </div>
      </div>
      <!--ヘルプダイアログ-->
      <wa-dialog light-dismiss label="HOW TO USE" id="dialog-help">
        <help-viewer .helpItems=${helpItems}></help-viewer>
      </wa-dialog>`;
  }
}
