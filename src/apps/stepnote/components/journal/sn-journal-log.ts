// 1. Lit Core & Statics
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// 3. Third-party UI Components & Utils (WebAwesome)
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Business Logic & Models
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";

// 5. Utilities
import { debounce } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/DateUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-log.lit.scss?inline";

// --- Side Effects ---
setBasePath("/");

/**
 * ログ操作
 *
 * @export
 * @class SnJournalLog
 * @extends {LitElement}
 */
@customElement("sn-journal-log")
export class SnJournalLog extends LitElement {
  /**
   * タスクID
   *
   * @type {number}
   * @memberof SnJournalLog
   */
  @property({ type: Number }) taskId!: number;

  /**
   * ログ一覧
   *
   * @type {Log[]}
   * @memberof SnJournalLog
   */
  @property({ type: Array }) logs!: Log[];

  /**
   * 検索時ローディング制御
   *
   * @private
   * @memberof SnJournalLog
   */
  @state() private _loading = false;

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnJournalLog
   */
  @state() private _filterKeyword: string = "";

  /**
   * ログ表示エリア
   *
   * @type {HTMLDivElement}
   * @memberof SnJournalLog
   */
  @query("#contents-root") scrollContainer!: HTMLDivElement;

  /**
   * 削除ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnJournalLog
   */
  @query("#delete-log-overview") private _deleteDialog!: WaDialog;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnJournalLog
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
   * 検索処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnJournalLog
   */
  private _debouncedSearch = debounce(async (keyword: string) => {
    this._filterKeyword = keyword.toLowerCase();
    this._loading = false;
  }, 300);

  /**
   * ログ一覧にフィルタをかける。
   *
   * @private
   * @param {Event} e
   * @memberof SnJournalLog
   */
  private async _filterLogs(e: Event) {
    const keyword = (e.target as WaInput).value ?? "";
    if (keyword) this._loading = true;
    this._debouncedSearch(keyword);
  }

  /**
   * ショートカットキー
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof SnJournalLog
   */
  private _shortcutKey = (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && (e.key === "L" || e.key === "l")) {
      this._addLog();
    }
  };

  /**
   * Creates an instance of PsJournalLog.
   * @memberof SnJournalLog
   */
  constructor() {
    super();
    window.addEventListener("keydown", this._shortcutKey);
  }
  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnJournalLog
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
   * @memberof SnJournalLog
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * フィルタを解除します。
   *
   * @memberof SnJournalLog
   */
  initFilter(): void {
    this._filterKeyword = "";
  }

  /**
   * ログをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalLog
   */
  protected render(): HTMLTemplateResult {
    if (!this.logs || this.logs.length === 0) {
      return html``;
    }

    return html`<div id="contents-root">
      <div class="search-area">
        <wa-input
          id="search-keyword"
          size="small"
          placeholder="filter inquiries..."
          @input=${this._filterLogs}
          value=${this._filterKeyword}
          with-clear
        >
          ${this._loading ? html`<wa-spinner slot="end"></wa-spinner>` : ""}
          <wa-icon
            slot="end"
            library="my-icons"
            name="magnifying-glass-solid-full"
          ></wa-icon
        ></wa-input>
      </div>
      <div class="log-area">
        ${repeat(
          this.logs,
          (log) => log.id,
          (log) => {
            const filterResult = this._containsFilterKeyword(log.value);
            return html`<sn-journal-log-item
              .log=${log}
              class=${filterResult ? "" : "hidden"}
              @delete-log=${() => this._OpenDeleteDialog(log)}
            ></sn-journal-log-item>`;
          },
        )}
      </div>
      <div class="footer-area">
        <div class="area">
          <wa-tooltip for="btn-scroll-up" placement="top">Scroll Up</wa-tooltip>
          <wa-button
            id="btn-scroll-up"
            size="small"
            appearance="accent"
            variant="neutral"
            @click=${this._scrollToTop}
          >
            <wa-icon library="my-icons" name="arrow-up-solid-full"></wa-icon>
          </wa-button>
        </div>
        <div class="area">
          <wa-tooltip for="btn-add" placement="top">Add</wa-tooltip>
          <wa-button
            id="btn-add"
            class="large"
            appearance="accent"
            variant="success"
            size="small"
            @click=${this._addLog}
          >
            <wa-icon library="my-icons" name="plus-solid-full"></wa-icon>
          </wa-button>
        </div>
        <div class="area">
          <wa-tooltip for="btn-scroll-down" placement="top">
            Scroll Down
          </wa-tooltip>
          <wa-button
            id="btn-scroll-down"
            size="small"
            appearance="accent"
            variant="neutral"
            @click=${this._scrollToBottom}
          >
            <wa-icon library="my-icons" name="arrow-down-solid-full"></wa-icon>
          </wa-button>
        </div>
      </div>
      <wa-dialog label="Confirm Delete" id="delete-log-overview">
        <div class="delete-confirmation">
          選択したログを削除します。<br />
          この操作は取り消せません。
        </div>
        <wa-button
          slot="footer"
          variant="neutral"
          appearance="filled-outlined"
          size="small"
          data-dialog="close"
        >
          キャンセル
        </wa-button>
        <wa-button
          slot="footer"
          variant="danger"
          appearance="accent"
          size="small"
          @click=${this._deleteLog}
        >
          削除
        </wa-button>
      </wa-dialog>
    </div>`;
  }

  /**
   * フィルタ用キーワードに一致するか判定します。
   * キーワード未設定の場合は、常に一致したものとして結果を返します。
   *
   * @private
   * @param {string} value
   * @return {*}
   * @memberof SnJournalLog
   */
  private _containsFilterKeyword(value: string) {
    if (!this._filterKeyword) return true;
    return value.toLowerCase().includes(this._filterKeyword);
  }

  /**
   * ログエリアを一番上までスクロール
   *
   * @private
   * @memberof SnJournalLog
   */
  private _scrollToTop() {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  /**
   * ログエリアを一番下までスクロール
   *
   * @private
   * @memberof SnJournalLog
   */
  private _scrollToBottom() {
    if (this.scrollContainer) {
      this.scrollContainer.scrollTo({
        top: this.scrollContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  /**
   * ログを追加
   *
   * @private
   * @memberof SnJournalLog
   */
  private async _addLog() {
    const log: Log = {
      taskId: this.taskId,
      value: "",
    };
    await snDB.putLog(log);
    this._scrollToBottom();
  }

  /**
   * ログのタスク削除ダイアログを開きます。
   *
   * @private
   * @param {Log} log
   * @memberof SnJournalLog
   */
  private _OpenDeleteDialog(log: Log) {
    this._deleteDialog.label = `Delete Log "${formatDate(log.createdAt, "yyyy-MM-dd HH:mm")}" ?`;
    this._deleteDialog.dataset.logId = log.id?.toString() || "";
    this._deleteDialog.open = true;
  }

  /**
   * ログを削除
   *
   * @private
   * @memberof SnJournalLog
   */
  private async _deleteLog() {
    const logId = this._deleteDialog.dataset.logId;
    if (!logId) {
      console.error("Invalid log ID for deletion");
      return;
    }

    await snDB.logs.delete(Number(logId));
    this._deleteDialog.dataset.logId = "";
    this._deleteDialog.open = false;
  }
}
