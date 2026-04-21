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

// 3. Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Components, Database, Codes, Models)
import {
  FlexibleTabArea,
  type config,
} from "@common/flexible-tab-area/flexible-tab-area";
import { SnTaskProperty } from "../task/sn-task-property";
import { SnTaskSummary } from "@sn/components/task/sn-task-summary";
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Task } from "@sn/models/Task";

// 5. Internal Shared (Utils)
import { debounce } from "@utils/CommonUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";

// --- Configuration & Initialization ---
/**
 * タスクエリアに表示するコンテンツの設定
 */
const TASKS: config[] = [
  { id: "summary", label: "Summary" },
  { id: "property", label: "Property" },
];

setBasePath("/");

@customElement("sn-tab-task")
export class SnTabTask extends LitElement {
  /**
   * タスク一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnTabTask
   */
  @state() private _task!: Task;

  /**
   * タブエリア
   *
   * @type {FlexibleTabArea}
   * @memberof SnTabTask
   */
  @query("#tab-area") tabArea!: FlexibleTabArea;

  /**
   * サマリ
   *
   * @type {SnTaskSummary}
   * @memberof SnTabTask
   */
  @query("#summary") taskSummary!: SnTaskSummary;

  /**
   * プロパティ
   *
   * @type {SnTaskProperty}
   * @memberof SnTabTask
   */
  @query("#property") taskProperty!: SnTaskProperty;

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnTabTask
   */
  private _dbSubscription?: Subscription;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTabTask
   */
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
  ];

  /**
   * 入力処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnTabTask
   */
  private _debounceInput = debounce(async () => {
    const summary = this.taskSummary.task;
    const property = this.taskProperty.task;
    const updateTask: Task = {
      ...this._task,
      name: summary.name,
      dueDate: summary.dueDate,
      contacts: summary.contacts,
      description: summary.description,
      fiscalYear: property.fiscalYear,
      labelId: property.labelId,
    };
    await snDB.putTask(updateTask);
  }, 400);

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnTabTask
   */
  connectedCallback() {
    super.connectedCallback();

    const observable = liveQuery(() =>
      snDB.tasks.where("selected").equals(1).toArray(),
    );
    this._dbSubscription = observable.subscribe({
      next: (tasks) => {
        const selectedTask = tasks?.[0];

        if (selectedTask) {
          if (this._task?.id !== selectedTask.id) {
            this.tabArea?.initTab();
          }
        } else {
          this.tabArea?.initTab();
        }
        this._task = selectedTask;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnTabTask
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
    this._debounceInput.cancel();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTabTask
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * タスクタブをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTabTask
   */
  protected render(): HTMLTemplateResult {
    return html` <flexible-tab-area
      id="tab-area"
      .tabs=${TASKS}
      @input=${this._updateTask}
    >
      TASKS
      <sn-task-button
        slot="end"
        @change-status=${this._changeStatus}
      ></sn-task-button>
      <sn-task-summary
        id="summary"
        slot="summary"
        .task=${this._task}
      ></sn-task-summary>
      <sn-task-property
        id="property"
        slot="property"
        .task=${this._task}
      ></sn-task-property>
    </flexible-tab-area>`;
  }

  /**
   * タスクのステータス変更
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnTabTask
   */
  private async _changeStatus(e: CustomEvent) {
    if (this._task && this._task.id) {
      const id = this._task.id;
      const code = e.detail.code;
      const beforeStatus = TaskStatus.fromCode(this._task.statusCode);
      const afterStatus = TaskStatus.fromCode(code);

      await snDB.changeStatusCode(id, e.detail.code);
      await snDB.putLog({
        taskId: id,
        value: `#### 状態変更\n- ${beforeStatus.label} > ${afterStatus.label}`,
      });
    }
  }

  /**
   * 入力内容でDBの値を更新する
   *
   * @private
   * @memberof SnTabTask
   */
  private _updateTask() {
    this._debounceInput();
  }
}
