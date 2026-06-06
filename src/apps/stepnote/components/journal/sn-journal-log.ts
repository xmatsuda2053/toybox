// Lit Core & Statics
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// Third-party UI Components & Utils (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";

// Business Logic & Models
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";

// Utilities
import { formatDate } from "@/utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-log.lit.scss?inline";

// --- Side Effects ---
setBasePath("/");

/**
 * スクロールの方向
 */
type ScrollDirection = "up" | "down";

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
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * 画面更新後の処理を実行します。
   *
   * @protected
   * @param {PropertyValues} changedProperties
   * @memberof SnJournalLog
   */
  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // タスクが切り替わった場合、フィルタをクリア
    if (changedProperties.has("taskId")) {
      this._filterKeyword = "";
    }
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * ログ一覧にフィルタをかける。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnJournalLog
   */
  private _handleFilterKeywordInput = (e: CustomEvent) => {
    const keyword = e.detail.keyword ?? "";
    this._filterKeyword = keyword.toLowerCase();
  };

  /**
   * ログ削除ボタンクリック時のイベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnJournalLog
   */
  private _handleDeleteLogClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const logId = target.dataset.logId;
    const log = this.logs.find((log) => log.id === Number(logId));
    if (!log) return;

    this._deleteDialog.label = `Delete Log "${formatDate(log.createdAt, "yyyy-MM-dd (EEE) HH:mm")}" ?`;
    this._deleteDialog.dataset.logId = logId?.toString() || "";
    this._deleteDialog.open = true;
  };

  /**
   * 指定した方向にコンテンツ内容をスクロールします。
   *
   * @private
   * @param {ScrollDirection} scroll
   * @return {*}  {void}
   * @memberof SnJournalLog
   */
  private _scroll = (scroll: ScrollDirection): void => {
    if (!scroll) return;
    if (!this.scrollContainer) return;
    this.scrollContainer.scrollTo({
      top: scroll === "up" ? 0 : this.scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  };

  /**
   * スクロールボタンクリック時のイベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnJournalLog
   */
  private _handleScrollClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement;
    const scroll: ScrollDirection = target.dataset.scroll as ScrollDirection;
    this._scroll(scroll);
  };

  /**
   * ログ追加ボタンクリック時のイベントを制御します。
   *
   * @private
   * @memberof SnJournalLog
   */
  private _handleAddClick = async () => {
    await snDB.putLog({
      taskId: this.taskId,
      value: "",
    });
    this.updateComplete;
    this._scroll("down");
  };

  /**
   * ログ削除ボタンクリック時のイベントを制御します。
   *
   * @private
   * @memberof SnJournalLog
   */
  private _handleDeleteLogAllowClick = async () => {
    const logId = this._deleteDialog.dataset.logId;
    if (!logId) {
      console.error("Invalid log ID for deletion");
      return;
    }

    await snDB.logs.delete(Number(logId));
    this._deleteDialog.dataset.logId = "";
    this._deleteDialog.open = false;
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * ログをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalLog
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.logs || this.logs.length === 0) return nothing;

    return html`<div id="contents-root">
      <div class="search-area">
        <search-input
          .searchKeyword=${this._filterKeyword}
          @input-keyword=${this._handleFilterKeywordInput}
        ></search-input>
      </div>
      <div class="log-area">${this._renderLogs()}</div>
      <div class="footer-area">
        <div class="area">${this._renderScrollButton("up")}</div>
        <div class="area">${this._renderAddButton()}</div>
        <div class="area">${this._renderScrollButton("down")}</div>
      </div>
      ${this._renderDeleteDialog()}
    </div>`;
  }

  /**
   * ログをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLog
   */
  private _renderLogs(): HTMLTemplateResult {
    const filteredLogs = this._filterKeyword
      ? this.logs.filter((log) =>
          log.value.toLowerCase().includes(this._filterKeyword),
        )
      : this.logs;

    return html` ${repeat(
      filteredLogs,
      (log) => log.id,
      (log) => {
        return html`<sn-journal-log-item
          .log=${log}
          data-log-id=${log.id!}
          @delete-log=${this._handleDeleteLogClick}
        ></sn-journal-log-item>`;
      },
    )}`;
  }

  /**
   * スクロールボタンをレンダリングします。
   *
   * @private
   * @param {ScrollDirection} [scroll="up"]
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLog
   */
  private _renderScrollButton(
    scroll: ScrollDirection = "up",
  ): HTMLTemplateResult {
    return html` <wa-button
      size="small"
      appearance="accent"
      variant="neutral"
      data-scroll=${scroll}
      @click=${this._handleScrollClick}
    >
      <wa-icon library="my-icons" name="arrow-${scroll}-solid-full"></wa-icon>
    </wa-button>`;
  }

  /**
   * ログ追加ボタンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLog
   */
  private _renderAddButton(): HTMLTemplateResult {
    return html` <wa-button
      class="large"
      appearance="accent"
      variant="success"
      size="small"
      @click=${this._handleAddClick}
    >
      <wa-icon library="my-icons" name="plus-solid-full"></wa-icon>
    </wa-button>`;
  }

  /**
   * 削除ダイアログをレンダリングしまsう。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnJournalLog
   */
  private _renderDeleteDialog(): HTMLTemplateResult {
    return html` <wa-dialog label="Confirm Delete" id="delete-log-overview">
      <div class="delete-confirmation">
        選択したログを削除します。<br />
        この操作は取り消せません。
      </div>
      <wa-button
        slot="footer"
        variant="danger"
        appearance="accent"
        size="small"
        @click=${this._handleDeleteLogAllowClick}
      >
        削除
      </wa-button>
      <wa-button
        slot="footer"
        variant="neutral"
        appearance="filled-outlined"
        size="small"
        data-dialog="close"
      >
        キャンセル
      </wa-button>
    </wa-dialog>`;
  }
}
