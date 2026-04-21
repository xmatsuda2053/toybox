// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Decorators & Directives
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party Components & Utils
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaDrawer from "@awesome.me/webawesome/dist/components/drawer/drawer.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Database, Models, Shared Components)
import { snDB } from "@sn/database/SnDB";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@sn/styles/step-note-app.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("step-note-app")
export class StepNoteApp extends LitElement {
  /**
   * 小表示モードの制御
   *
   * @type {boolean}
   * @memberof StepNoteApp
   */
  @state() isThinMode: boolean = false;

  /**
   * 小表示モード時のドロワー
   *
   * @private
   * @type {WaDrawer}
   * @memberof StepNoteApp
   */
  @query("#drawer-overview") private _drawerOverview!: WaDrawer;

  /**
   * ファイル選択
   *
   * @private
   * @type {HTMLInputElement}
   * @memberof StepNoteApp
   */
  @query("#importFile") private _inputFile!: HTMLInputElement;

  /**
   * インポート完了ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof StepNoteApp
   */
  @query("#dialog-import-complete-overview")
  private _dialogImportCompleat!: WaDialog;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof StepNoteApp
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  /**
   * Creates an instance of StepNoteApp.
   * @memberof StepNoteApp
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof StepNoteApp
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof StepNoteApp
   */
  protected render(): HTMLTemplateResult {
    return html`<wa-resize-observer @wa-resize=${this._responsive}>
      <wa-drawer id="drawer-overview" placement="start" without-header="false">
        <div class="drawer-contents">
          ${this.isThinMode
            ? html`<div class="nav">${this._renderNav()}</div>
                <div class="list"><sn-list></sn-list></div> `
            : ``}
        </div>
      </wa-drawer>
      <div
        class="content ${this.isThinMode ? "thin" : ""}"
        @id-click=${(e: CustomEvent) => this._taskSelect(e.detail.id)}
      >
        <div class="panel menu">
          <sn-menu
            @click-menu-explore=${this._showExploreNav}
            @click-menu-import=${this._importDataSelect}
            @click-menu-export=${this._exportData}
            @click-menu-config=${this._showConfig}
          ></sn-menu>
          <input type="file" id="importFile" @change=${this._importData} />
        </div>
        <div class="panel nav">${this.isThinMode ? "" : this._renderNav()}</div>
        <div class="panel list">
          ${this.isThinMode ? "" : html`<sn-list></sn-list>`}
        </div>
        <div class="panel task">
          <sn-tab-task></sn-tab-task>
        </div>
        <div class="panel journal">
          <sn-tab-journal></sn-tab-journal>
        </div>
      </div>
      <wa-dialog label="Complete" id="dialog-import-complete-overview">
        インポート処理が完了しました。
        <wa-button
          appearance="filled"
          slot="footer"
          variant="brand"
          data-dialog="close"
          >Close</wa-button
        >
      </wa-dialog>
    </wa-resize-observer> `;
  }

  /**
   * レスポンシブデザインの制御を行う。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof StepNoteApp
   */
  private _responsive(e: CustomEvent) {
    const width = e.detail.entries[0].contentRect.width;

    if (width > 0) {
      this.isThinMode = width <= 1500;
    }
  }

  /**
   * ナビゲーションをレンダリングする。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderNav(): HTMLTemplateResult {
    return html`<div class="quick">
        <sn-nav-section-quick></sn-nav-section-quick>
      </div>
      <div class="label">
        <sn-nav-section-label></sn-nav-section-label>
      </div>`;
  }

  /**
   * タスクナビゲーションを表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _showExploreNav() {
    if (this.isThinMode && this._drawerOverview) {
      this._drawerOverview.open = true;
    }
  }

  /**
   * インポート対象のファイル選択画面を起動する。
   *
   * @private
   * @memberof StepNoteApp
   */
  private _importDataSelect() {
    this._inputFile.click();
  }

  /**
   * インポート処理を実行する。
   *
   * @private
   * @memberof StepNoteApp
   */
  private async _importData() {
    const file = this._inputFile?.files?.[0];
    if (!file) return;
    await snDB.importDatabase(file);
    this._dialogImportCompleat.open = true;
  }

  /**
   * データをエクスポートする
   *
   * @private
   * @memberof StepNoteApp
   */
  private async _exportData() {
    await snDB.exportDatabase();
  }

  /**
   * 設定画面を表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _showConfig() {
    console.log("Showing configuration...");
  }

  /**
   * 指定されたタスクを選択状態とする。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof StepNoteApp
   */
  private async _taskSelect(id: number) {
    await snDB.selectSingleTask(Number(id), true);
  }
}
