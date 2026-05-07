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
   * ショートカットキー
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof SnList
   */
  private _shortcutKey = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && (e.key === "E" || e.key === "e")) {
      this._toggleExploreNav();
    }
  };

  /**
   * Creates an instance of StepNoteApp.
   * @memberof StepNoteApp
   */
  constructor() {
    super();
    window.addEventListener("keydown", this._shortcutKey);
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._shortcutKey);
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
    return html`<div id="contents-root">
      <div
        class="content ${this.isThinMode ? "thin" : ""}"
        @id-click=${(e: CustomEvent) => this._taskSelect(e.detail.id)}
      >
        <div class="panel menu">
          <sn-menu
            @click-menu-explore=${this._toggleExploreNav}
            @click-menu-import=${this._importDataSelect}
            @click-menu-export=${this._exportData}
            @click-menu-config=${this._showConfig}
          ></sn-menu>
          <input type="file" id="importFile" @change=${this._importData} />
        </div>
        <div class="panel nav">
          <div class="quick">
            <sn-nav-section-quick></sn-nav-section-quick>
          </div>
          <div class="label">
            <sn-nav-section-label></sn-nav-section-label>
          </div>
        </div>
        <div class="panel list">
          <sn-list></sn-list>
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
    </div> `;
  }

  /**
   * タスクナビゲーションを表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _toggleExploreNav() {
    this.isThinMode = !this.isThinMode;
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
