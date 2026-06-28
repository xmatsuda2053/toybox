// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Library Extensions & Third-party
import { customElement, query, property } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// Internal Assets & Logic
import { AppItem } from "@ap/models/AppItem";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@ap/styles/_header-item.lit.scss?inline";
import styles from "@ap/styles/file/ap-file.lit.scss?inline";

// Initializations (Side Effects)
setBasePath("/");

/**
 * バージョン
 *
 * @type {string}
 */
const VERSION: string = "0.4.5";

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApFile
 * @extends {LitElement}
 */
@customElement("ap-file")
export class ApFile extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApFile
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中のアプリ情報
   *
   * @type {AppItem}
   * @memberof ApFile
   */
  @property({ type: Object }) selectedApp: AppItem = {
    code: "",
    icon: "",
    label: "",
    tag: html``,
    key: "F1",
  };

  /**
   * バージョン画面
   *
   * @type {WaDialog}
   * @memberof ApFile
   */
  @query("#version-dialog") versionDialog!: WaDialog;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * バージョン画面を開きます。
   *
   * @private
   * @memberof ApFile
   */
  private _handleVersionClick = () => {
    this.versionDialog.open = true;
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ApFile
   */
  protected render(): HTMLTemplateResult {
    return html`<wa-dropdown>
        <div class="menu-header" slot="trigger">
          <span>File</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>
        <wa-dropdown-item @click=${this._handleVersionClick}>
          バージョン情報
        </wa-dropdown-item>
      </wa-dropdown>
      <!--バージョン情報-->
      ${this._renderVersion()}`;
  }

  /**
   * バージョン画面をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ApFile
   */
  private _renderVersion(): HTMLTemplateResult {
    return html`<wa-dialog id="version-dialog" label=${this.selectedApp.label}>
      <div class="record">
        <span class="version">version : ${VERSION}</span>
      </div>
      <div class="record">
        <span class="motto">
          Always Standard, Forever Standalone, All in One.
        </span>
      </div>
      <wa-divider></wa-divider>
      <div class="record">
        <wa-badge class="oss-ts">
          <wa-icon library="my-icons" name="oss-ts" slot="start"></wa-icon>
          TypeScript
        </wa-badge>
        <wa-badge class="oss-sass">
          <wa-icon library="my-icons" name="oss-sass" slot="start"></wa-icon>
          Sass
        </wa-badge>
        <wa-badge class="oss-idb">
          <wa-icon
            library="my-icons"
            name="database-solid-full"
            slot="start"
          ></wa-icon>
          IndexedDB
        </wa-badge>
      </div>
    </wa-dialog>`;
  }
}
