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
import { customElement, property, query, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";

// 5. Internal Shared (Utils)
import { formatDate, getYearList } from "@utils/DateUtils";
import { emit } from "@utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-property.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);

setBasePath("/");

/**
 * タスクプロパティ
 *
 * @export
 * @class SnTaskProperty
 * @extends {LitElement}
 */
@customElement("sn-task-property")
export class SnTaskProperty extends LitElement {
  /**
   * ラベル一覧
   *
   * @private
   * @type {Label[]}
   * @memberof SnTaskProperty
   */
  @state() private _labels: Label[] = [];

  /**
   * タスクデータ
   *
   * @private
   * @type {Label[]}
   * @memberof SnTaskProperty
   */
  @property({ type: Object }) task!: Task;

  /**
   * 年度
   *
   * @type {WaSelect}
   * @memberof SnTaskProperty
   */
  @query("#fiscal-year") fiscalYear!: WaSelect;

  /**
   * ラベル
   *
   * @type {WaSelect}
   * @memberof SnTaskProperty
   */
  @query("#task-label") taskLabel!: WaSelect;

  /**
   * 削除ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnTaskProperty
   */
  @query("#delete-task-overview") private _deleteDialog!: WaDialog;

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnTaskProperty
   */
  private _dbSubscription?: Subscription;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskProperty
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
   * Creates an instance of SnTaskProperty.
   * @memberof SnTaskProperty
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnTaskProperty
   */
  connectedCallback() {
    super.connectedCallback();

    const observable = liveQuery(() => snDB.selectLabelsAscName());
    this._dbSubscription = observable.subscribe({
      next: (labels) => {
        this._labels = labels;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnTaskProperty
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
   * @memberof SnTaskProperty
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * プロパティをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskProperty
   */
  protected render(): HTMLTemplateResult {
    if (!this.task) {
      return html`<div></div>`;
    }

    return html`<div id="contents-root" @change=${this._inputData}>
      <div class="property-item has-label">
        <label class="label">ID</label>
        <wa-input
          id="id"
          class="item"
          size="small"
          .value=${String(this.task.id)}
          disabled
        >
          <wa-icon
            library="my-icons"
            name="hashtag-solid-full"
            slot="end"
          ></wa-icon>
        </wa-input>
      </div>
      <div class="property-item has-label">
        <label class="label">作成日</label>
        <wa-input
          id="createdAt"
          class="item"
          size="small"
          .value=${formatDate(this.task.createdAt)}
          disabled
        >
          <wa-icon
            library="my-icons"
            name="calendar-day-solid-full"
            slot="end"
          ></wa-icon>
        </wa-input>
      </div>
      <div class="property-item has-label">
        <label class="label">更新日</label>
        <wa-input
          id="createdAt"
          class="item"
          size="small"
          .value=${formatDate(this.task.updatedAt)}
          disabled
        >
          <wa-icon
            library="my-icons"
            name="calendar-days-solid-full"
            slot="end"
          ></wa-icon>
        </wa-input>
      </div>
      <div class="property-item has-label">
        <label class="label">年度</label>
        <wa-select
          id="fiscal-year"
          size="small"
          id="fiscal-year"
          class="item"
          value=${String(this.task.fiscalYear)}
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
      <div class="property-item has-label">
        <label class="label">ラベル</label>
        <wa-select
          id="task-label"
          size="small"
          id="task-label"
          class="item"
          value=${this.task.labelId}
        >
          <wa-icon
            library="my-icons"
            name="tag-solid-full"
            slot="end"
          ></wa-icon>
          <wa-option value="0">未分類</wa-option>
          ${this._labels.map((label) => {
            return html`<wa-option value=${label.id ? label.id : ""}>
              ${label.name}
            </wa-option>`;
          })}
        </wa-select>
      </div>
      <div class="property-item">
        <sn-task-deletion
          @delete-task=${this._OpenDeleteDialog}
        ></sn-task-deletion>
      </div>
      <wa-dialog label="Confirm Delete" id="delete-task-overview">
        <div class="delete-confirmation">
          選択したタスクを削除します。<br />
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
          @click=${this._deleteTask}
        >
          削除
        </wa-button>
      </wa-dialog>
    </div>`;
  }

  /**
   * 入力のイベントを発生させる。
   *
   * @private
   * @memberof SnTaskProperty
   */
  private async _inputData() {
    this.task.fiscalYear = Number(this.fiscalYear.value!);
    this.task.labelId = Number(this.taskLabel.value!);
    await snDB.updateLabelSelection(this.task.labelId, 1);
    emit(this, "input");
  }

  /**
   * タスク削除ダイアログを開きます。
   *
   * @private
   * @param {Log} log
   * @memberof SnTaskProperty
   */
  private _OpenDeleteDialog() {
    this._deleteDialog.label = `Delete "${this.task.name}" ?`;
    this._deleteDialog.open = true;
  }

  /**
   * タスクを削除
   *
   * @private
   * @memberof SnTaskProperty
   */
  private async _deleteTask() {
    await snDB.tasks.delete(this.task.id);
  }
}
