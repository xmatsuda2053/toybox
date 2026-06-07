// 1. Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  PropertyValues,
  nothing,
} from "lit";
import { live } from "lit/directives/live.js";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Components, Codes, Models)
import { snDB } from "@sn/database/SnDB";
import { ThinMarkdownEditor } from "@common/thin-markdown-editor/thin-markdown-editor";
import { SnTaskContact } from "@sn/components/task/sn-task-contact.ts";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Task } from "@sn/models/Task";
import { DatePickerInput } from "@/common/datepicker-input/datepicker-input";

// 5. Internal Shared (Utils)
import { formatDate } from "@/utils/DateUtils";
import { debounce } from "@utils/CommonUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-summary.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * タスク説明の初期値
 */
const DEFAULT_DESCRIPTION: string = "## タスク説明\n\n### 概要";

/**
 * タスク概要
 *
 * @export
 * @class PSTaskSummary
 * @extends {LitElement}
 */
@customElement("sn-task-summary")
export class SnTaskSummary extends LitElement {
  /**
   * タスクデータ
   *
   * @type {Task}
   * @memberof SnTaskSummary
   */
  @property({ type: Object }) task!: Task;

  /**
   * タスクステータス
   *
   * @type {TaskStatus}
   * @memberof SnTaskSummary
   */
  @state() _status: TaskStatus = TaskStatus.PENDING;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskSummary
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTaskProperty
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has("task")) {
      if (this.task) {
        this._status = TaskStatus.fromCode(this.task.statusCode);
      }
    }
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * タスクデータを更新します。
   *
   * @private
   * @memberof SnTaskSummary
   */
  private _update = debounce(
    async (updateData: Partial<Task>): Promise<void> => {
      await snDB.taskRepo.updateTask(updateData);
    },
    500,
  );

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * タスク名の入力イベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskSummary
   */
  private _handleNameInput = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaInput;
    this.task["name"] = target.value ?? "";

    this._update({
      id: this.task.id,
      name: this.task.name,
    });
  };

  /**
   * 期限日の変更イベントを制御します。
   */
  private _handleDueDateChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as DatePickerInput;
    this.task["dueDate"] = target.value ? new Date(target.value) : new Date();

    this._update({
      id: this.task.id,
      dueDate: this.task.dueDate,
    });
  };

  /**
   * 関係者（連絡先）の入力イベントを制御します。
   */
  private _handleContactInput = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as SnTaskContact;
    this.task["contacts"] = [target.contact];

    this._update({
      id: this.task.id,
      contacts: this.task.contacts,
    });
  };

  /**
   * タスク説明（エディタ）の入力イベントを制御します。
   */
  private _handleDescriptionInput = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as ThinMarkdownEditor;
    this.task["description"] = target.value;

    this._update({
      id: this.task.id,
      description: this.task.description,
    });
  };

  /**
   * IDコピーボタンのクリック時処理を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskSummary
   */
  private _handleCopyIdClick = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const raw = `#{${this.task.id}}{${this.task.name}}`;
      await navigator.clipboard.writeText(raw);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * サマリをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskSummary
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.task) return nothing;

    const baseClassMap = classMap({
      [this._status.name]: true,
    });

    return html`<div id="contents-root" class=${baseClassMap}>
      <div class="task-item">
        <div class="has-label">
          ${this._renderTaskName()} ${this._renderIdCopyButton()}
        </div>
      </div>
      <div class="task-item">
        <div class="has-label">${this._renderDueDate()}</div>
      </div>
      <div class="task-item">
        <div class="has-label">${this._renderContact()}</div>
      </div>
      <div class="task-item grow-item">${this._renderDescription()}</div>
    </div>`;
  }

  /**
   * タスク名をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskSummary
   */
  private _renderTaskName(): HTMLTemplateResult {
    return html` <div class="label">タスク名</div>
      <wa-input
        id="name"
        class="item"
        size="small"
        .value=${live(this.task.name)}
        @input=${this._handleNameInput}
      >
        <wa-icon
          library="my-icons"
          name=${this._status.iconName}
          class="status-icon"
          slot="start"
        ></wa-icon>
        <wa-icon
          library="my-icons"
          name="note-sticky-solid-full"
          slot="end"
        ></wa-icon>
      </wa-input>`;
  }

  /**
   * IDコピーボタンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskSummary
   */
  private _renderIdCopyButton(): HTMLTemplateResult {
    return html` <copy-button @click=${this._handleCopyIdClick}>
      Copy ID
    </copy-button>`;
  }

  /**
   * 期限日をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskSummary
   */
  private _renderDueDate(): HTMLTemplateResult {
    return html`<div class="label">期限日</div>
      <datepicker-input
        id="due-date"
        size="small"
        .value=${live(formatDate(this.task.dueDate, "yyyy-MM-dd"))}
        @input=${this._handleDueDateChange}
      >
      </datepicker-input>`;
  }

  /**
   * 関係者をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskSummary
   */
  private _renderContact(): HTMLTemplateResult {
    return html`<div class="label">関係者</div>
      <div class="item">
        <sn-task-contact
          id="contact"
          .contact=${live(this.task.contacts[0])}
          @input=${this._handleContactInput}
        ></sn-task-contact>
      </div>`;
  }

  /**
   * タスク説明をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskSummary
   */
  private _renderDescription(): HTMLTemplateResult {
    return html`<thin-markdown-editor
      id="description"
      .value=${this.task.description || DEFAULT_DESCRIPTION}
      @input=${this._handleDescriptionInput}
    ></thin-markdown-editor>`;
  }
}
