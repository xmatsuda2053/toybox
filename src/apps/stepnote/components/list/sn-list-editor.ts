// 1. Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { liveQuery, type Subscription } from "dexie";

// Lit Extensions (Decorators & Directives)
import { customElement, property, state } from "lit/decorators.js";

// Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Database, Models, Codes)
import { TaskStatus } from "@sn/code/TaskStatus";
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";
import { emit } from "@/utils/EventUtils";

// Internal Shared (Utils)
import {
  formatDate,
  getYearList,
  getCurrentFiscalYear,
} from "@/utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list-editor.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);
const currentFiscalYear = getCurrentFiscalYear();

/**
 * 入力データ
 *
 * @interface InputData
 */
interface InputData {
  name: string;
  dueDate: Date;
  fiscalYear: number;
  labelId: number;
}

setBasePath("/");

/**
 * 編集画面
 *
 * @export
 * @class SnListEditor
 * @extends {LitElement}
 */
@customElement("sn-list-editor")
export class SnListEditor extends LitElement {
  /**
   * 編集対象のタスク
   *
   * @type {Task}
   * @memberof SnListEditor
   */
  @property({ type: Object }) targetTask!: Task | undefined;

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnList
   */
  private _dbSubscription?: Subscription;

  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnList
   */
  @state() private _labelData: Label[] = [];

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnList
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

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
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnList
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
   * @memberof SnList
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    const observable = liveQuery(async () => {
      const [_labelData] = await Promise.all([
        snDB.labelRepo.getLabelsAscName(),
        ,
      ]);
      return {
        _labelData,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this._labelData = data._labelData;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * タスクデータを新規登録します。
   *
   * @private
   * @param {InputData} data
   * @memberof SnListEditor
   */
  private async _addTaskData(data: InputData) {
    await snDB.taskRepo.addTask({
      statusCode: TaskStatus.PENDING.code,
      name: data.name,
      dueDate: data.dueDate,
      contacts: [{ div: "", name: "", tel: "" }],
      description: "",
      fiscalYear: data.fiscalYear,
      labelId: data.labelId,
      bookmark: 0,
      selected: 0,
    });
  }

  /**
   * タスクデータを複製します。
   *
   * @private
   * @param {InputData} data
   * @memberof SnListEditor
   */
  private async _copyTaskData(data: InputData) {
    if (!this.targetTask) return;

    const task: Task = {
      statusCode: TaskStatus.PENDING.code,
      name: data.name,
      dueDate: data.dueDate,
      contacts: this.targetTask.contacts,
      description: this.targetTask.description,
      fiscalYear: data.fiscalYear,
      labelId: data.labelId,
      bookmark: 0,
      selected: 0,
    };

    await snDB.taskRepo.addTask(task);
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * Form送信イベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnListEditor
   */
  private _handleTaskSubmit = (e: Event) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const inputData: InputData = {
      name: String(formData.get("taskName") ?? ""),
      dueDate: new Date(String(formData.get("taskDueDate"))),
      fiscalYear: Number(formData.get("taskFiscalYear")),
      labelId: Number(formData.get("taskLabelId")),
    };

    if (this.targetTask) {
      this._copyTaskData(inputData);
    } else {
      this._addTaskData(inputData);
    }

    emit(this, "task-saved");
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * エディタをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnListEditor
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    return html`<form id="task-form" @submit=${this._handleTaskSubmit}>
        <!--タスク-->
        ${this._renderName()}
        <!--期限日-->
        ${this._renderDueDate()}
        <!--年度-->
        ${this._renderFiscalYear()}
        <!--ラベル-->
        ${this._renderLabel()}
      </form>
      <!--保存ボタン-->
      <div class="footer">
        <wa-button variant="brand" size="small" type="submit" form="task-form">
          保存
        </wa-button>
      </div>`;
  }

  /**
   * タスク名をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListEditor
   */
  private _renderName(): HTMLTemplateResult {
    return html`<div class="contents">
      <wa-tooltip for="task-name" placement="right">タスク名</wa-tooltip>
      <wa-input
        id="task-name"
        name="taskName"
        size="small"
        placeholder="新規タスク"
        .value=${this.targetTask?.name!}
      >
        <wa-icon
          slot="end"
          library="my-icons"
          name="note-sticky-solid-full"
        ></wa-icon>
      </wa-input>
    </div>`;
  }

  /**
   * 期限日をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListEditor
   */
  private _renderDueDate(): HTMLTemplateResult {
    const duDate = this.targetTask?.dueDate ?? new Date();

    return html`<div class="contents">
      <wa-tooltip for="task-due-date" placement="right">期限日</wa-tooltip>
      <datepicker-input
        id="task-due-date"
        name="taskDueDate"
        size="small"
        .value=${formatDate(duDate, "yyyy-MM-dd")}
      >
      </datepicker-input>
    </div>`;
  }

  /**
   * 年度をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListEditor
   */
  private _renderFiscalYear(): HTMLTemplateResult {
    const year = this.targetTask?.fiscalYear ?? currentFiscalYear;

    return html`<div class="contents">
      <wa-tooltip for="task-fiscal-year" placement="right">年度</wa-tooltip>
      <wa-select
        id="task-fiscal-year"
        name="taskFiscalYear"
        size="small"
        value=${year!}
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
    </div>`;
  }

  /**
   * ラベルをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListEditor
   */
  private _renderLabel(): HTMLTemplateResult {
    const selectedId =
      this._labelData.find((label) => label.isSelected)?.id?.toString() ?? "";
    const id = this.targetTask?.labelId ?? selectedId;

    return html` <div class="contents">
      <wa-tooltip for="task-label-id" placement="right">ラベル</wa-tooltip>
      <wa-select id="task-label-id" name="taskLabelId" size="small" value=${id}>
        <wa-icon library="my-icons" name="tag-solid-full" slot="end"></wa-icon>
        ${this._labelData.map((label) => {
          return html`<wa-option value=${label.id ? label.id : ""}>
            ${label.name}
          </wa-option>`;
        })}
      </wa-select>
    </div>`;
  }
}
