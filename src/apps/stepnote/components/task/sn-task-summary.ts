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
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & SDKs (WebAwesome)
import WaInput from "@awesome.me/webawesome/dist/components/input/input.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Components, Codes, Models)
import { ThinMarkdownEditor } from "@common/thin-markdown-editor/thin-markdown-editor";
import { SnTaskContact } from "@sn/components/task/sn-task-contact.ts";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Task } from "@sn/models/Task";

// 5. Internal Shared (Utils)
import { formatDate } from "@/utils/DateUtils";
import { emit } from "@utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-summary.lit.scss?inline";

// 7. Initializations
setBasePath("/");

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
   * @private
   * @type {Label[]}
   * @memberof SnTaskSummary
   */
  @property({ type: Object }) task!: Task;

  /**
   * タスク名
   *
   * @private
   * @type {WaInput}
   * @memberof SnTaskSummary
   */
  @query("#name") private taskName!: WaInput;

  /**
   * 期限日
   *
   * @private
   * @type {WaInput}
   * @memberof SnTaskSummary
   */
  @query("#due-date") private dueDate!: WaInput;

  /**
   * 関係者
   *
   * @private
   * @type {SnTaskContact}
   * @memberof SnTaskSummary
   */
  @query("#task-contact") private taskContact!: SnTaskContact;

  /**
   * タスク説明
   *
   * @private
   * @type {ThinMarkdownEditor}
   * @memberof SnTaskSummary
   */
  @query("#task-description") private taskDescription!: ThinMarkdownEditor;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskSummary
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
   * Creates an instance of SnTaskSummary.
   * @memberof SnTaskSummary
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnTaskSummary
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTaskSummary
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * サマリをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskSummary
   */
  protected render(): HTMLTemplateResult {
    if (!this.task) {
      return html`<div></div>`;
    }
    const status = TaskStatus.fromCode(this.task.statusCode);
    const baseClassMap = classMap({
      pending: status.isPending(),
      progress: status.isProgress(),
      done: status.isDone(),
    });

    return html`<div
      id="contents-root"
      class=${baseClassMap}
      @input=${this._inputData}
    >
      <div class="task-item">
        <div class="has-label">
          <div class="label">タスク名</div>
          <wa-input id="name" class="item" size="small" value=${this.task.name}>
            <wa-icon
              library="my-icons"
              name=${status.iconNameSub}
              class="status-icon"
              slot="start"
            ></wa-icon>
            <wa-icon
              library="my-icons"
              name="note-sticky-solid-full"
              slot="end"
            ></wa-icon>
          </wa-input>
          <wa-tooltip for="btn-copy-id" placement="top">Copy ID</wa-tooltip>
          <copy-button
            id="btn-copy-id"
            @click=${this._copyIdAndName}
          ></copy-button>
        </div>
      </div>
      <div class="task-item">
        <div class="has-label">
          <div class="label">期限日</div>
          <wa-input
            id="due-date"
            class="item"
            size="small"
            type="date"
            .value=${formatDate(this.task.dueDate, "yyyy-MM-dd")}
          >
          </wa-input>
        </div>
      </div>
      <div class="task-item">
        <div class="has-label">
          <div class="label">関係者</div>
          <div class="item">
            <sn-task-contact
              id="task-contact"
              .contact=${this.task.contacts[0]}
            ></sn-task-contact>
          </div>
        </div>
      </div>
      <div class="task-item grow-item">
        <thin-markdown-editor
          id="task-description"
          .value=${this.task.description || "### タスク説明"}
        ></thin-markdown-editor>
      </div>
    </div>`;
  }

  /**
   * 入力のイベントを発生させる。
   *
   * @private
   * @memberof SnTaskSummary
   */
  private _inputData() {
    this.task.name = this.taskName.value!;
    this.task.dueDate = new Date(this.dueDate.value!);
    this.task.contacts = [this.taskContact.contact];
    this.task.description = this.taskDescription.value;
    emit(this, "input");
  }

  /**
   * Markdown用のIDとタスク名をクリップボードにコピーする。
   *
   * @private
   * @memberof SnTaskSummary
   */
  private async _copyIdAndName(e: Event) {
    e.preventDefault();

    try {
      const raw = `#{${this.task.id}}{${this.task.name}}`;
      await navigator.clipboard.writeText(raw);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }
}
