// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { classMap } from "lit/directives/class-map.js";

// Decorators & Directives
import { customElement, state } from "lit/decorators.js";

// Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Modules (Database, Models, Shared Components)
import { snDB } from "@sn/database/SnDB";
import { features } from "./components/menu/sn-menu";

// Internal Shared (Utils)
import { configUtils } from "@/utils/ConfigUtils";

// Styles
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
   * 選択中の機能
   *
   * @type {features}
   * @memberof StepNoteApp
   */
  @state() selectedFeature: features = "main";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof StepNoteApp
   */
  static styles = [unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------
  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof StepNoteApp
   */
  connectedCallback() {
    super.connectedCallback();
    configUtils.initialize();
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * タスクナビゲーションを表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _handleMainClick = () => {
    if (this.selectedFeature === "main") {
      this.isThinMode = !this.isThinMode;
    } else {
      this.selectedFeature = "main";
      this.isThinMode = false;
    }
  };

  /**
   * ダッシュボード画面を表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _handleDashboardClick = () => {
    this.selectedFeature = "dashboard";
    this.isThinMode = true;
  };

  /**
   * 設定画面を表示する
   *
   * @private
   * @memberof StepNoteApp
   */
  private _handleConfigClick = () => {
    this.selectedFeature = "config";
    this.isThinMode = true;
  };

  /**
   * 指定されたタスクを選択状態とする。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof StepNoteApp
   */
  private _handleTaskClick = async (e: CustomEvent) => {
    await snDB.taskRepo.changeTaskAndNavSelection(Number(e.detail.id));
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------
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
    return html`<div id="contents-root">${this._renderContents()}</div>
      ${this._renderImportCompleteDialog()}`;
  }

  /**
   * メニューバーをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderMenu(): HTMLTemplateResult {
    return html` <div class="panel menu">
      <sn-menu
        .selectedFeature=${this.selectedFeature}
        @click-menu-main=${this._handleMainClick}
        @click-menu-dashboard=${this._handleDashboardClick}
        @click-menu-config=${this._handleConfigClick}
      ></sn-menu>
    </div>`;
  }

  /**
   * インポート完了ダイアログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderImportCompleteDialog(): HTMLTemplateResult {
    return html`<wa-dialog
      label="Complete"
      id="dialog-import-complete-overview"
    >
      インポート処理が完了しました。
      <wa-button
        appearance="filled"
        slot="footer"
        variant="brand"
        data-dialog="close"
      >
        Close
      </wa-button>
    </wa-dialog>`;
  }

  /**
   * コンテンツのレンダリングを制御します。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderContents(): HTMLTemplateResult | typeof nothing {
    switch (this.selectedFeature) {
      case "main":
        return this._renderMain();
      case "dashboard":
        return this._renderDashboard();
      case "config":
        return this._renderConfig();
      default:
        return nothing;
    }
  }

  /**
   * メイン機能をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderMain(): HTMLTemplateResult {
    const baseClassMap = classMap({
      base: true,
      "main-content": true,
      thin: this.isThinMode,
    });

    return html` <div class=${baseClassMap} @id-click=${this._handleTaskClick}>
      ${this._renderMenu()}
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
    </div>`;
  }

  /**
   * ダッシュボード画面をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderDashboard(): HTMLTemplateResult {
    const baseClassMap = classMap({
      base: true,
      "dashboard-content": true,
    });

    return html` <div class=${baseClassMap}>
      ${this._renderMenu()}
      <sn-dashboard-container></sn-dashboard-container>
    </div>`;
  }

  /**
   * 設定画面をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof StepNoteApp
   */
  private _renderConfig(): HTMLTemplateResult {
    const baseClassMap = classMap({
      base: true,
      "config-content": true,
    });

    return html` <div class=${baseClassMap}>
      ${this._renderMenu()}
      <sn-config-container></sn-config-container>
    </div>`;
  }
}
