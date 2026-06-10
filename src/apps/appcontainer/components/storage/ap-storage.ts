// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Library Extensions & Third-party
import { customElement, query } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// Internal Assets & Logic
import { snDB } from "@/apps/stepnote/database/SnDB";
import { DataExporter } from "@/common/data-exporter/data-exporter";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@ap/styles/_header-item.lit.scss?inline";

// Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApStorage
 * @extends {LitElement}
 */
@customElement("ap-storage")
export class ApStorage extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApStorage
   */
  static styles = [unsafeCSS(sharedStyles)];

  /**
   * SnDBのバックアップ
   *
   * @type {DataExporter}
   * @memberof ApStorage
   */
  @query("#data-exporter-sndb") dataExporterSnDB!: DataExporter;

  /**
   * バージョン画面
   *
   * @type {WaDialog}
   * @memberof ApStorage
   */
  @query("#version-dialog") versionDialog!: WaDialog;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * バックアップ設定画面を開きます。
   *
   * @private
   * @memberof ApStorage
   */
  private _handleBackupClick = () => {
    this.dataExporterSnDB.open = true;
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
   * @memberof ApStorage
   */
  protected render(): HTMLTemplateResult {
    return html`<wa-dropdown>
        <div class="menu-header" slot="trigger">
          <span>Storage</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>
        <wa-dropdown-item>
          バックアップ設定
          <wa-dropdown-item slot="submenu" @click=${this._handleBackupClick}>
            Step-Note
          </wa-dropdown-item>
        </wa-dropdown-item>
      </wa-dropdown>
      <!--データのバックアップ-->
      ${this._renderExporterSN()}`;
  }

  /**
   * Step-Noteのバックアップ画面をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof ApStorage
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
}
