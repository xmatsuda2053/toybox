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
import styles from "@ha/styles/menu/ha-menu.lit.scss?inline";

// 6. Initializations
setBasePath("/");

// 7. Configuration & Initialization ---
import mdIntroduction from "./help/introduction.md?raw";
import mdMenu from "./help/menu.md?raw";
import mdSearch from "./help/search.md?raw";
import mdUploader from "./help/uploader.md?raw";
import mdViewer from "./help/viewer.md?raw";

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
    name: "upload",
    title: "UPLOAD",
    markdown: mdUploader,
  },
  {
    name: "search",
    title: "SEARCH",
    markdown: mdSearch,
  },
  {
    name: "viewer",
    title: "VIEWER",
    markdown: mdViewer,
  },
];
/**
 * メニュー
 *
 * @export
 * @class HaMenu
 * @extends {LitElement}
 */
@customElement("ha-menu")
export class HaMenu extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaMenu
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
   * 削除ダイアログ
   *
   * @type {WaDialog}
   * @memberof HaMenu
   */
  @query("#dialog-delete") dialogDelete!: WaDialog;

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaMenu
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
   * @memberof HaMenu
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
        <!--削除ダイアログ-->
        <wa-dialog label="登録データ削除" id="dialog-delete">
          登録データをすべてを削除します。<br />
          この操作は取り消せません。
          <wa-button
            slot="footer"
            appearance="accent"
            variant="danger"
            @click=${() => {
              emit(this, "delete-data");
              this.dialogDelete.open = false;
            }}
          >
            削除
          </wa-button>
          <wa-button
            slot="footer"
            appearance="filled-outlined"
            variant="neutral"
            data-dialog="close"
          >
            キャンセル
          </wa-button>
        </wa-dialog>

        <!-- クリアボタン-->
        <div class="field">
          <wa-tooltip for="btn-clear" placement="right">Clear</wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-clear"
            @click=${() => emit(this, "clear")}
          >
            <wa-icon library="my-icons" name="eraser-solid-full"></wa-icon>
          </wa-button>
        </div>

        <!--削除ボタン-->
        <div class="field bottom">
          <wa-tooltip for="btn-delete" placement="right">Delete All</wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-delete"
            @click=${() => (this.dialogDelete.open = true)}
          >
            <wa-icon library="my-icons" name="border-none-solid-full"></wa-icon>
          </wa-button>
        </div>

        <!--ヘルプボタン-->
        <div class="field">
          <wa-tooltip for="btn-help" placement="right">Help</wa-tooltip>
          <wa-button
            variant="neutral"
            appearance="accent"
            id="btn-help"
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
      <wa-dialog label="HOW TO USE" id="dialog-help">
        <help-viewer .helpItems=${helpItems}></help-viewer>
      </wa-dialog>`;
  }
}
