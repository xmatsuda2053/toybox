// 1. Core Libraries
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

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Common Components, Database, Models)
import { ThinMarkdownEditor } from "@common/thin-markdown-editor/thin-markdown-editor";
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";

// 5. Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";
import { formatDate } from "@/utils/DateUtils";
import { emit } from "@/utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/journal/sn-journal-log-item.lit.scss?inline";

// 7. Initializations
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
   * 編集モード制御
   *
   * @type {boolean}
   * @memberof SnJournalLogItem
   */
  @state() isEditMode: boolean = false;

  /**
   * ログ編集用エディタ
   *
   * @type {ThinMarkdownEditor}
   * @memberof SnJournalLogItem
   */
  @query("#log-editor") logEditor!: ThinMarkdownEditor;

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
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
    css`
      ${unsafeCSS(styles)}
    `,
  ];

  /**
   * 入力処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _debounceInput = debounce(async () => {
    const log = {
      ...this.log,
      value: this.logEditor.value,
    };
    snDB.putLog(log);
  }, 800);

  /**
   * Creates an instance of PsJournalLogItem.
   * @memberof SnJournalLogItem
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnJournalLogItem
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._debounceInput.cancel();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnJournalLogItem
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * ログアイテムをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnJournalLogItem
   */
  protected render(): HTMLTemplateResult {
    if (!this.log) {
      return html``;
    }

    return html`<div id="contents-root">
      <div class="header">
        <wa-icon library="my-icons" name="code-commit-solid-full"></wa-icon>
        <div class="text log-date">
          ${formatDate(this.log.createdAt, "yyyy-MM-dd HH:mm")}
        </div>
        <wa-relative-time
          .date=${this.log.createdAt!}
          class="text"
        ></wa-relative-time>
        <wa-dropdown>
          <wa-icon
            library="my-icons"
            name="bars-solid-full"
            slot="trigger"
            class="end"
          ></wa-icon>
          <wa-dropdown-item @click=${this._deleteLog}>削除</wa-dropdown-item>
        </wa-dropdown>
      </div>
      <div class="contents">
        <thin-markdown-editor
          id="log-editor"
          .value=${this.log.value}
          @input=${this._updateLog}
        ></thin-markdown-editor>
      </div>
    </div>`;
  }

  /**
   * 入力内容をDBに反映する。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _updateLog() {
    this._debounceInput();
  }

  /**
   * ログ削除イベントを実行する。
   *
   * @private
   * @memberof SnJournalLogItem
   */
  private _deleteLog() {
    emit(this, "delete-log");
  }
}
