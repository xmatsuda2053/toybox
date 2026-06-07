// Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Components, Database, Models)
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";
import { Note } from "@sn/models/Note";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/tab/sn-tab.lit.scss?inline";

setBasePath("/");

/**
 * ジャーナルタブ制御
 *
 * @export
 * @class SnTabJournal
 * @extends {LitElement}
 */
@customElement("sn-tab-journal")
export class SnTabJournal extends LitElement {
  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnTabJournal
   */
  private _dbSubscription?: Subscription;

  /**
   * 選択したタスクのID
   *
   * @type {number}
   * @memberof SnTabJournal
   */
  @state() taskId: number = 0;

  /**
   * ログ一覧
   *
   * @type {Log[]}
   * @memberof SnTabJournal
   */
  @state() logs!: Log[];

  /**
   * ノート一覧
   *
   * @type {Note[]}
   * @memberof SnTabJournal
   */
  @state() notes!: Note[];

  /**
   * 選択中タブ
   *
   * @private
   * @type {string}
   * @memberof SnTabJournal
   */
  @state() private _activeTab: string = "log";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTabTask
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnTabJournal
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeTasks();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnTabJournal
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   *
   * @private
   * @memberof SnTabJournal
   */
  private _subscribeTasks() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(async () => {
      const tasks = await snDB.tasks.where("selected").equals(1).toArray();

      const task = tasks?.[0];
      if (!task) {
        return { task: null, logs: [], notes: [] };
      }

      const [logs, notes] = await Promise.all([
        await snDB.logRepo.getLogsAscId(task.id!),
        await snDB.noteRepo.getNotesAscId(task.id!),
      ]);

      return { task, logs, notes };
    });

    this._dbSubscription = observable.subscribe({
      next: async (result) => {
        if (result.task) {
          if (this.taskId !== result.task.id) {
            this._activeTab = "log";
          }
          this.taskId = result.task.id!;
          this.logs = result.logs;
          this.notes = result.notes;
        } else {
          this._activeTab = "log";
          this.taskId = 0;
          this.logs = [];
          this.notes = [];
        }
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * タブ切り替え時の処理を制御する。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnTabTask
   */
  private _handleTabChange(e: CustomEvent) {
    this._activeTab = e.detail.name;
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * ジャーナルタブをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTabJournal
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="header">${this._renderHeader()}</div>
      <div class="main">${this._renderMain()}</div>
    </div>`;
  }

  /**
   * ヘッダーをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTabJournal
   */
  private _renderHeader(): HTMLTemplateResult {
    return html` <div class="title">JOURNAL</div> `;
  }

  /**
   * メインをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTabJournal
   */
  private _renderMain(): HTMLTemplateResult {
    const hasNote = this.notes?.[0]?.value.trim() !== "";

    return html` <wa-tab-group
      .active=${this._activeTab}
      @wa-tab-show=${this._handleTabChange}
    >
      <wa-tab panel="log">Log</wa-tab>
      <wa-tab panel="note">
        ${hasNote
          ? html`<wa-icon
              class="tab-dot"
              library="my-icons"
              name="circle-solid-full"
            ></wa-icon>`
          : nothing}
        Note
      </wa-tab>
      <wa-tab-panel name="log">
        <sn-journal-log
          .taskId=${this.taskId}
          .logs=${this.logs}
        ></sn-journal-log>
      </wa-tab-panel>
      <wa-tab-panel name="note">
        <sn-journal-note
          .taskId=${this.taskId}
          .notes=${this.notes}
        ></sn-journal-note>
      </wa-tab-panel>
    </wa-tab-group>`;
  }
}
