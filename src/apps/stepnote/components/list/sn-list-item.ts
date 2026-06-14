// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";
import { when } from "lit/directives/when.js";
import { choose } from "lit/directives/choose.js";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Task } from "@sn/models/Task";
import { emit } from "@/utils/EventUtils";

// Internal Shared (Utils)
import {
  formatDate,
  isOverdue,
  isAsap,
  isWithinAnyDaysBefore,
} from "@utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list-item.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * タスクリストアイテム
 *
 * @export
 * @class SnListItem
 * @extends {LitElement}
 */
@customElement("sn-list-item")
export class SnListItem extends LitElement {
  /**
   * タスク情報
   *
   * @type {Task}
   * @memberof SnListItem
   */
  @property({ type: Object }) task!: Task;

  /**
   * 対象タスクが属するラベル名
   *
   * @type {String}
   * @memberof SnListItem
   */
  @property({ type: String }) label: String = "";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnListItem
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // メンバ
  // -------------------------------------------------------------

  /**
   * タスクの状態を取得する。
   *
   * @readonly
   * @type {TaskStatus}
   * @memberof SnListItem
   */
  get taskStatus(): TaskStatus {
    return TaskStatus.fromCode(this.task.statusCode);
  }

  /**
   * 期限状態を取得する。
   *
   * @readonly
   * @type {("overdue" | "asap" | "upcoming" | "none")}
   * @memberof SnListItem
   */
  get dueStatus(): "overdue" | "asap" | "upcoming" | "normal" {
    const isDone: boolean = this.taskStatus.isDone();
    const dueDate = new Date(this.task.dueDate);

    if (isOverdue(isDone, dueDate)) return "overdue";
    if (isAsap(isDone, dueDate)) return "asap";
    if (isWithinAnyDaysBefore(isDone, dueDate)) return "upcoming";
    return "normal";
  }

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * 指定したタスクを選択状態にします。
   *
   * @private
   * @memberof SnListItem
   */
  private _handleTaskClick = async () => {
    await snDB.taskRepo.changeTaskSelection(this.task.id);
  };

  /**
   * 指定したタスクのブックマーク状態を反転させます。
   * @param e
   */
  private _handleBookmarkClick = async (e: Event) => {
    e.stopPropagation();
    await snDB.taskRepo.toggleBookmark(this.task.id!);
  };

  /**
   * タスクの複製イベントを発行します。
   *
   * @private
   * @memberof SnListItem
   */
  private _handleTaskCopy = () => {
    emit(this, "copy-task", { detail: { task: this.task } });
  };

  /**
   * タスクIDをクリップボードにコピーします。
   *
   * @private
   * @memberof SnListItem
   */
  private _handleTaskIdCopyToClipboard = async () => {
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
   * タスクアイテムをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnListItem
   */
  protected render(): HTMLTemplateResult {
    const baseClassMap = classMap({
      [this.dueStatus]: true,
      selected: this.task.selected,
    });

    return html`<div id="contents-root" class="${baseClassMap}">
      <div class="task-area" @click=${this._handleTaskClick}>
        ${this._renderStatusIcon()}
        <div class="task-data">
          ${this._renderTaskName()}
          <div class="footer">
            ${this._renderTaskBookmark()}
            <wa-divider orientation="vertical"></wa-divider>
            ${this._renderDueDate()}
            <wa-divider orientation="vertical"></wa-divider>
            <div class="label">${this.label}</div>
          </div>
        </div>
      </div>

      <div class="menu-button">
        <wa-dropdown>
          <wa-icon
            library="my-icons"
            name="bars-solid-full"
            slot="trigger"
            class="trigger-button"
          ></wa-icon>
          <wa-dropdown-item @click=${this._handleTaskCopy}>
            <wa-icon
              slot="icon"
              library="my-icons"
              name="clone-regular-full"
            ></wa-icon>
            Copy Task
          </wa-dropdown-item>
          <wa-divider></wa-divider>
          <wa-dropdown-item @click=${this._handleTaskIdCopyToClipboard}>
            <wa-icon
              slot="icon"
              library="my-icons"
              name="hashtag-solid-full"
            ></wa-icon>
            Copy Task ID
          </wa-dropdown-item>
        </wa-dropdown>
      </div>
    </div>`;
  }

  /**
   * ステータスアイコンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListItem
   */
  private _renderStatusIcon(): HTMLTemplateResult {
    const status = this.taskStatus;
    return html` <div class="status-icon ${status.name}">
      <wa-icon library="my-icons" name=${status.iconName}></wa-icon>
    </div>`;
  }

  /**
   * タスク名をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListItem
   */
  private _renderTaskName(): HTMLTemplateResult {
    return html` <div class="name">
      ${when(
        this.task.selected,
        () =>
          html`<wa-icon
            library="my-icons"
            name="caret-right-solid-full"
          ></wa-icon>`,
      )}
      ${this.task.name}
    </div>`;
  }

  /**
   * タスクブックマークをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListItem
   */
  private _renderTaskBookmark(): HTMLTemplateResult {
    const classes = {
      bookmark: true,
      active: this.task.bookmark,
    };

    const iconName = this.task.bookmark
      ? "bookmark-solid-full"
      : "bookmark-regular-full";

    return html` <div class=${classMap(classes)}>
      <wa-icon
        library="my-icons"
        name=${iconName}
        @click=${this._handleBookmarkClick}
      ></wa-icon>
    </div>`;
  }

  /**
   * 期限日をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnListItem
   */
  private _renderDueDate(): HTMLTemplateResult {
    const iconName: string | undefined = choose(
      this.dueStatus,
      [
        ["overdue", () => "fire-solid-full"],
        ["asap", () => "triangle-exclamation-solid-full"],
        ["upcoming", () => "calendar-solid-full"],
      ],
      () => "calendar-solid-full",
    );

    return html`<div class="due">
      ${formatDate(new Date(this.task.dueDate), "yy-MM-dd")}
      <wa-icon library="my-icons" name=${iconName!}></wa-icon>
    </div>`;
  }
}
