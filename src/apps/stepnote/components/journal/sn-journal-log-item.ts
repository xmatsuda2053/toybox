// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Common Components, Database, Models)
import { ThinMarkdownEditor } from "@common/thin-markdown-editor/thin-markdown-editor";
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";

// Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/DateUtils";
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-log-item.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ログ要素
 *
 * @export
 * @class SnJournalLogItem
 * @extends {LitElement}
 */
@customElement("sn-journal-log-item")
export class SnJournalLogItem extends LitElement {
  /**
   * ログデータ
   *
   * @type {Log}
   * @memberof SnJournalLogItem
   */
  @property({ type: Object }) log!: Log;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnJournalLogItem
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnJournalLogItem
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._updateLogDatabase.cancel();
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * ログ更新処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _updateLogDatabase = debounce(async (newLog: Partial<Log>) => {
    await snDB.updateLog(newLog);
  }, 600);

  /**
   * ログ入力時のイベントを制御します。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _handleLogInput = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    if (!target) return;
    if (!this.log) return;

    this.log["value"] = target.value;
    this._updateLogDatabase({
      id: this.log.id,
      value: target.value,
    });
  };

  /**
   * ログ削除クリック時のイベントを制御します。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _handleDeleteLogClick = () => {
    emit(this, "delete-log");
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ログアイテムをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalLogItem
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.log) return nothing;

    return html`<div id="contents-root">
      <div class="header">
        ${this._renderCreatedAtLabel()} ${this._renderHeaderDropdown()}
      </div>
      ${this._renderContents()}
    </div>`;
  }

  /**
   * ログ作成日の表示ラベルをレンダリングします。
   *
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLogItem
   */
  _renderCreatedAtLabel(): HTMLTemplateResult {
    return html`<div class="label-area">
      <wa-icon library="my-icons" name="code-commit-solid-full"></wa-icon>
      <div class="label log-date">
        ${formatDate(this.log.createdAt, "yyyy-MM-dd (EEE) HH:mm")}
      </div>
      <wa-relative-time
        .date=${this.log.createdAt!}
        class="label"
      ></wa-relative-time>
    </div>`;
  }

  /**
   * ドロップダウンをレンダリングします。
   *
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLogItem
   */
  _renderHeaderDropdown(): HTMLTemplateResult {
    return html` <wa-dropdown>
      <wa-icon
        library="my-icons"
        name="bars-solid-full"
        slot="trigger"
      ></wa-icon>
      <wa-dropdown-item @click=${this._handleDeleteLogClick} class="danger">
        <wa-icon
          slot="icon"
          library="my-icons"
          name="trash-solid-full"
        ></wa-icon>
        Delete
      </wa-dropdown-item>
    </wa-dropdown>`;
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLogItem
   */
  _renderContents(): HTMLTemplateResult {
    return html` <div class="contents">
      <thin-markdown-editor
        id="log-editor"
        .value=${this.log.value}
        @input=${this._handleLogInput}
      ></thin-markdown-editor>
    </div>`;
  }
}
