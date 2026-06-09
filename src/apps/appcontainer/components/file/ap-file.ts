// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Library Extensions & Third-party
import { customElement, query, property } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// Internal Assets & Logic
import { snDB } from "@/apps/stepnote/database/SnDB";
import { AppItem } from "@ap/models/AppItem";
import { DataExporter } from "@/common/data-exporter/data-exporter";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@ap/styles/_header-item.lit.scss?inline";
import styles from "@ap/styles/file/ap-file.lit.scss?inline";

// Initializations (Side Effects)
setBasePath("/");

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
   * SnDBのバックアップ
   *
   * @type {DataExporter}
   * @memberof ApFile
   */
  @query("#data-exporter-sndb") dataExporterSnDB!: DataExporter;

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
   * バックアップ設定画面を開きます。
   *
   * @private
   * @memberof ApFile
   */
  private _handleBackupClick = () => {
    this.dataExporterSnDB.open = true;
  };

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
          <span>File(F)</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>
        <wa-dropdown-item>
          バックアップ
          <wa-dropdown-item slot="submenu" @click=${this._handleBackupClick}>
            Step-Note
          </wa-dropdown-item>
        </wa-dropdown-item>
        <wa-dropdown-item @click=${this._handleVersionClick}>
          バージョン情報
        </wa-dropdown-item>
      </wa-dropdown>
      <!--データのバックアップ-->
      ${this._renderExporterSN()}
      <!--バージョン情報-->
      ${this._renderVersion()}`;
  }

  /**
   * Step-Noteのバックアップ画面をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ApFile
   */
  private _renderExporterSN(): HTMLTemplateResult {
    return html` <data-exporter
      id="data-exporter-sndb"
      label="Step-Note"
      storageKey="sndb"
      .onExport=${async () => await snDB.exportDatabase()}
    >
    </data-exporter>`;
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
        <span class="version">version : 0.3.4</span>
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
        <wa-badge class="oss-md">
          <wa-icon
            library="my-icons"
            name="markdown-brands-solid-full"
            slot="start"
          ></wa-icon>
          Markdown
        </wa-badge>
        <wa-badge class="oss-lit">
          <wa-icon library="my-icons" name="oss-lit" slot="start"></wa-icon>
          Lit
        </wa-badge>
        <wa-badge class="oss-wa">
          <wa-icon
            library="my-icons"
            name="web-awesome-solid-full"
            slot="start"
          ></wa-icon>
          Web Awesome
        </wa-badge>
        <wa-badge class="oss-fa">
          <wa-icon
            library="my-icons"
            name="font-awesome-solid-full"
            slot="start"
          ></wa-icon>
          Font Awesome
        </wa-badge>
        <wa-badge class="oss-idb">
          <wa-icon
            library="my-icons"
            name="database-solid-full"
            slot="start"
          ></wa-icon>
          IndexedDB
        </wa-badge>
        <wa-badge class="oss-dexie">
          <wa-icon
            library="my-icons"
            name="database-solid-full"
            slot="start"
          ></wa-icon>
          Dexie.js
        </wa-badge>
        <wa-badge class="oss-nodejs">
          <wa-icon library="my-icons" name="oss-nodejs" slot="start"></wa-icon>
          Node.js
        </wa-badge>
        <wa-badge class="oss-vite">
          <wa-icon library="my-icons" name="oss-vite" slot="start"></wa-icon>
          Vite
        </wa-badge>
      </div>
    </wa-dialog>`;
  }
}
