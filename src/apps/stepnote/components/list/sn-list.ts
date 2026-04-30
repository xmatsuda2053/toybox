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
import { ifDefined } from "lit/directives/if-defined.js";
import "@lit-labs/virtualizer";

// 3. Third-party UI & SDKs (WebAwesome)
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";

// 5. Internal Shared (Utils)
import { debounce } from "@/utils/CommonUtils";
import {
  formatDate,
  getCurrentFiscalYear,
  getYearList,
} from "@/utils/DateUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);
const currentFiscalYear = getCurrentFiscalYear();

/**
 * 年度またはタスクアイテムを描画するための型定義
 */
type RenderItem =
  | { type: "year"; year: number; count: number }
  | { type: "task"; task: Task; labelId: number };

setBasePath("/");

/**
 * タスクリスト
 *
 * @export
 * @class SnList
 * @extends {LitElement}
 */
@customElement("sn-list")
export class SnList extends LitElement {
  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnList
   */
  @state() private _labels: Label[] = [];

  /**
   * タスク一覧
   *
   * @private
   * @type {Task[]}
   * @memberof SnList
   */
  @state() private _tasks: Task[] = [];

  /**
   * 使用中の年度一覧
   *
   * @private
   * @type {number[]}
   * @memberof SnList
   */
  @state() private _activeFiscalYears: number[] = [];

  /**
   * 検索入力欄
   *
   * @private
   * @type {HTMLInputElement}
   * @memberof SnList
   */
  @query("#input-search") private _inputSearch!: HTMLInputElement;

  /**
   * 新規タスクダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnList
   */
  @query("#task-dialog-overview") private _addDialog!: WaDialog;

  /**
   * 編集フォーム
   *
   * @private
   * @type {HTMLFormElement}
   * @memberof SnList
   */
  @query("#task-form") private taskForm!: HTMLFormElement;

  /**
   * 新規タスク名
   *
   * @private
   * @type {WaInput}
   * @memberof SnList
   */
  @query("#task-name") private taskName!: WaInput;

  /**
   * 新規タスク期限日
   *
   * @private
   * @type {WaInput}
   * @memberof SnList
   */
  @query("#task-due-date") private taskDueDate!: WaInput;

  /**
   * 新規タスク年度
   *
   * @private
   * @type {WaSelect}
   * @memberof SnList
   */
  @query("#task-fiscal-year") private taskFiscalYear!: WaSelect;

  /**
   * 新規タスクラベルID
   *
   * @private
   * @type {WaSelect}
   * @memberof SnList
   */
  @query("#task-label-id") private taskLabelId!: WaSelect;

  /**
   * 検索フィルタのキーワード
   *
   * @private
   * @type {string}
   * @memberof SnList
   */
  @state() private _filterKeyword: string = "";

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnList
   */
  private _dbSubscription?: Subscription;

  /**
   * 検索時ローディング制御
   *
   * @private
   * @memberof SnList
   */
  @state() private _loading = false;

  /**
   * 期限切れタスクの有無
   *
   * @private
   * @memberof SnList
   */
  @state() private _hasOverdue = false;

  /**
   * 期限切れのアラートアニメーションを停止する。
   *
   * @private
   * @memberof SnList
   */
  @state() private _overdueAlertStop = false;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnList
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
   * ショートカットキー
   *
   * @private
   * @param {KeyboardEvent} e
   * @memberof SnList
   */
  private _shortcutKey = async (e: KeyboardEvent) => {
    if (e.altKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
      this._openAddTaskEditor();
    }
    if (e.altKey && e.shiftKey && (e.key === "F" || e.key === "f")) {
      await snDB.resetQuickAccessSelected();
      await snDB.resetLabelSelected();
      await this.updateComplete;
      this._inputSearch.focus();
    }
  };

  /**
   * Creates an instance of SnList.
   * @memberof SnList
   */
  constructor() {
    super();
    window.addEventListener("keydown", this._shortcutKey);
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

  /**
   * テーブル状態が更新された場合に最新データを取得します。
   * フィルタ用のキーワードが変更された場合にも実行します。
   *
   * @private
   * @memberof SnList
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(async () => {
      const [quickAccess, labels, tasks, activeFiscalYears, hasOverdue] =
        await Promise.all([
          snDB.getQuickAccess(),
          snDB.selectLabelsAscName(),
          snDB.selectTaskAscSortKey(this._filterKeyword),
          snDB.getActiveFiscalYears(this._filterKeyword),
          snDB.hasOverdueTasks(),
        ]);

      return { quickAccess, labels, tasks, activeFiscalYears, hasOverdue };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._labels = data.labels;
        this._tasks = data.tasks;
        this._activeFiscalYears = data.activeFiscalYears;
        this._loading = false;
        this._hasOverdue = data.hasOverdue;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * 検索処理にデバウンスを設定します。
   *
   * @private
   * @memberof SnList
   */
  private _debouncedSearch = debounce(async (keyword: string) => {
    this._filterKeyword = keyword;
    this._subscribeLabels();
  }, 300);

  /**
   * タスク一覧にフィルタをかける。
   *
   * @private
   * @param {Event} e
   * @memberof SnList
   */
  private async _filterTasks(e: Event) {
    const keyword = (e.target as WaInput).value ?? "";
    if (keyword) this._loading = true;
    this._debouncedSearch(keyword);
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
    this._debouncedSearch.cancel();
    window.removeEventListener("keydown", this._shortcutKey);
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnList
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * 描画するアイテムデータの一覧を取得します。
   * virtualizerを使用するために、年度とタスクを一つの配列に統合しています。
   *
   * @readonly
   * @private
   * @type {RenderItem[]}
   * @memberof SnList
   */
  private get _getRenderItems(): RenderItem[] {
    const items: RenderItem[] = [];

    this._activeFiscalYears.forEach((year) => {
      const tasks = this._filterTasksByFiscalYear(year);
      items.push({ type: "year", year, count: tasks.length });
      tasks.forEach((task) => {
        items.push({
          type: "task",
          task,
          labelId: task.labelId,
        });
      });
    });

    return items;
  }
  /**
   * タスクリストをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnList
   */
  protected render(): HTMLTemplateResult {
    if (!this._tasks) {
      return html``;
    }

    const hasLabel = this._labels.length !== 0;

    return html`<div id="contents-root">
      <div class="header">
        LIST
        <span class="end"></span>
        ${this._hasOverdue
          ? html`<wa-icon
              id="btn-alert"
              library="my-icons"
              name="fire-solid-full"
              animation=${ifDefined(
                this._overdueAlertStop ? undefined : "bounce",
              )}
              @click=${this._viewOverdueTasks}
            ></wa-icon>`
          : html``}
        ${hasLabel
          ? html` <wa-tooltip for="btn-add" placement="top">Add</wa-tooltip>
              <wa-icon
                id="btn-add"
                library="my-icons"
                name="plus-solid-full"
                @click=${this._openAddTaskEditor}
              ></wa-icon>`
          : html``}
      </div>
      <div class="search">
        <wa-input
          id="input-search"
          size="small"
          placeholder="filter inquiries..."
          @input=${this._filterTasks}
          with-clear
        >
          ${this._loading ? html`<wa-spinner slot="end"></wa-spinner>` : ""}
          <wa-icon
            slot="end"
            library="my-icons"
            name="magnifying-glass-solid-full"
          ></wa-icon>
        </wa-input>
      </div>
      <div class="items">
        <lit-virtualizer
          .items=${this._getRenderItems}
          .renderItem=${((item: RenderItem) => {
            if (item.type === "year") {
              return html`<sn-list-section>
                ${html`<span slot="year">${item.year}</span>`}
                ${html`<span slot="count">${item.count}</span>`}
              </sn-list-section>`;
            } else {
              return html`<sn-list-item
                .task=${item.task}
                .labelName=${this._getLabelName(item.labelId)}
                slot="item"
              ></sn-list-item>`;
            }
          }) as any}
        >
        </lit-virtualizer>
      </div>
      <wa-dialog label="Add Task" id="task-dialog-overview">
        <form id="task-form" @submit=${this._addTask}>
          <div class="dialog-item">
            <div class="label">タスク名</div>
            <wa-input
              id="task-name"
              class="item"
              name="taskName"
              size="small"
              placeholder="新規タスク"
            >
              <wa-icon
                slot="end"
                library="my-icons"
                name="note-sticky-solid-full"
              ></wa-icon>
            </wa-input>
          </div>

          <div class="dialog-item">
            <div class="label">期限日</div>
            <wa-input
              id="task-due-date"
              name="taskDueDate"
              class="item"
              size="small"
              type="text"
              onfocus="this.type='date'"
              onblur="this.type='text'"
              value=${formatDate(new Date(), "yyyy-MM-dd")}
            >
            </wa-input>
          </div>

          <div class="dialog-item">
            <div class="label">年度</div>
            <wa-select
              id="task-fiscal-year"
              size="small"
              class="item"
              value=${currentFiscalYear}
            >
              <wa-icon
                library="my-icons"
                name="calendar-regular-full"
                slot="end"
              ></wa-icon>
              ${yearList.map((year) => {
                return html`<wa-option value=${year}>${year}年度</wa-option>`;
              })}
            </wa-select>
          </div>

          <div class="dialog-item">
            <div class="label">ラベル</div>
            <wa-select
              id="task-label-id"
              class="item"
              size="small"
              value=${hasLabel
                ? String(this._labels.find((label) => label.isSelected)?.id)
                : ""}
            >
              <wa-icon
                library="my-icons"
                name="tag-solid-full"
                slot="end"
              ></wa-icon>
              ${this._labels.map((label) => {
                return html`<wa-option value=${label.id ? label.id : ""}>
                  ${label.name}
                </wa-option>`;
              })}
            </wa-select>
          </div>
        </form>
        <wa-button
          slot="footer"
          variant="brand"
          size="small"
          type="submit"
          form="task-form"
        >
          追加
        </wa-button>
      </wa-dialog>
    </div>`;
  }

  /**
   * idからラベル名を取得する
   *
   * @private
   * @param {number} id
   * @return {*}  {string}
   * @memberof SnList
   */
  private _getLabelName(id: number): string {
    const label = this._labels.find((label) => label.id === id);
    return label ? label.name : "未分類";
  }

  /**
   * タスク追加エディタを起動する。
   *
   * @private
   * @memberof SnList
   */
  private _openAddTaskEditor() {
    this.taskForm.reset();
    this._addDialog.open = true;

    // 表示アニメーションが終わるのを待ってからフォーカスを当てる
    this._addDialog.addEventListener(
      "wa-after-show",
      () => this.taskName.focus(),
      { once: true },
    );
  }

  /**
   * タスクを新規追加する。
   *
   * @private
   * @param {Event} e
   * @memberof SnList
   */
  private async _addTask(e: Event) {
    e.preventDefault();

    const name = this.taskName.value as string;
    const dueDate = new Date(this.taskDueDate.value as string);
    const fiscalYear = Number(this.taskFiscalYear.value);
    const labelId = Number(this.taskLabelId.value);

    const task: Task = {
      statusCode: TaskStatus.PENDING.code,
      name: name,
      dueDate: dueDate,
      contacts: [{ div: "", name: "", tel: "" }],
      description: "",
      fiscalYear: fiscalYear,
      labelId: labelId,
      bookmark: 0,
      selected: 0,
    };

    const id = await snDB.putTask(task);
    await snDB.putLog({
      taskId: id,
      value: "#### 新規追加",
    });
    await snDB.putNote({
      taskId: id,
      value: "",
    });

    await snDB.selectSingleTask(id);
    await snDB.updateLabelSelection(labelId, 1);

    this._addDialog.open = false;
    this.taskForm.reset();
  }

  /**
   * 指定した年度（fiscalYear）に合致するタスクのみを抽出します。
   * @param {number} targetYear 抽出したい年度
   * @returns {Task[]} フィルタリングされたタスク配列
   * @memberof SnList
   */
  private _filterTasksByFiscalYear(targetYear: number): Task[] {
    return this._tasks.filter((task) => task.fiscalYear === targetYear);
  }

  /**
   * 期限切れタスクを表示します。
   *
   * @private
   * @memberof SnList
   */
  private async _viewOverdueTasks() {
    this._overdueAlertStop = true;
    await snDB.viewOverdueTasks();
  }
}
