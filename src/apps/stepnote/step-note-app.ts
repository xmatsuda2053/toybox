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
import { customElement, state } from "lit/decorators.js";

// 3. Third-party Components & Utils
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
          <sn-menu @click-menu-explore=${this._toggleExploreNav}></sn-menu>
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
