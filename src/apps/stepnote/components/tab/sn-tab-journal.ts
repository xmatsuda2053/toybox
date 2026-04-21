// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Components, Database, Models)
import {
  FlexibleTabArea,
  type config,
} from "@common/flexible-tab-area/flexible-tab-area";
import { SnJournalLog } from "@sn/components/journal/sn-journal-log";
import { SnJournalNote } from "@sn/components/journal/sn-journal-note";
import { snDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";
import { Note } from "@sn/models/Note";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";

// --- Configuration & Initialization ---
/**
 * ジャーナルエリアに表示するコンテンツの設定
 */
const JOURNALS: config[] = [
  { id: "log", label: "Log" },
  { id: "note", label: "Note" },
];

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
  @state() selectedTaskId: number = 0;

  /**
   * タブエリア
   *
   * @type {FlexibleTabArea}
   * @memberof SnTabJournal
   */
  @query("#tab-area") tabArea!: FlexibleTabArea;

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
   * ログ
   *
   * @type {SnJournalLog}
   * @memberof SnTabJournal
   */
  @query("#journal-log") journalLog!: SnJournalLog;

  /**
   * ノート
   *
   * @type {SnJournalNote}
   * @memberof SnTabJournal
   */
  @query("#journal-note") journalNote!: SnJournalNote;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTabJournal
   */
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
  ];

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnTabJournal
   */
  connectedCallback() {
    super.connectedCallback();

    const observable = liveQuery(async () => {
      const tasks = await snDB.tasks.where("selected").equals(1).toArray();
      const task = tasks?.[0];
      if (!task) {
        return { task: null, logs: [], notes: [] };
      }

      const logs = await snDB.selectLogsAscId(task.id!);
      const notes = await snDB.selectNotesAscId(task.id!);
      return { task, logs, notes };
    });
    this._dbSubscription = observable.subscribe({
      next: async (result) => {
        if (result.task) {
          if (this.selectedTaskId !== result.task.id) {
            this.tabArea?.initTab();
            this.journalLog.initFilter();
          }
          this.selectedTaskId = result.task.id!;
          this.logs = result.logs;
          this.notes = result.notes;
        } else {
          this.selectedTaskId = 0;
          this.logs = [];
          this.notes = [];
        }
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
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

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTabJournal
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * ジャーナルタブをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTabJournal
   */
  protected render(): HTMLTemplateResult {
    return html`<flexible-tab-area id="tab-area" .tabs=${JOURNALS}>
      JOURNAL
      <sn-journal-log
        id="journal-log"
        slot="log"
        .taskId=${this.selectedTaskId}
        .logs=${this.logs}
      ></sn-journal-log>
      <sn-journal-note
        id="journal-note"
        slot="note"
        .taskId=${this.selectedTaskId}
        .notes=${this.notes}
      ></sn-journal-note>
    </flexible-tab-area>`;
  }
}
