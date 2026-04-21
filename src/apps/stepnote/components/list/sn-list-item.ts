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
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Database, Models, Codes)
import { snDB } from "@sn/database/SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { Task } from "@sn/models/Task";

// 5. Internal Shared (Utils)
import { formatDate, isOverdue, isWithinAnyDaysBefore } from "@utils/DateUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list-item.lit.scss?inline";

// 7. Initializations
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
  @property({ type: String }) labelName: String = "";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnListItem
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
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnListItem
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * タスクアイテムをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnListItem
   */
  protected render(): HTMLTemplateResult {
    const taskStatus = TaskStatus.fromCode(this.task.statusCode);
    const isDone: boolean = taskStatus.isDone();

    const dueDate = new Date(this.task.dueDate);
    const dispDue = formatDate(dueDate, "yyyy-MM-dd");
    const baseClassMap = classMap({
      overdue: isOverdue(isDone, dueDate),
      upcoming: isWithinAnyDaysBefore(isDone, dueDate, 3),
      selected: this.task.selected,
    });
    const dueIcon = isOverdue(isDone, dueDate)
      ? "fire-solid-full"
      : "calendar-solid-full";

    const bookmarkIcon = this.task.bookmark
      ? "bookmark-solid-full"
      : "bookmark-regular-full";
    const bookmarkClasses = classMap({
      bookmark: true,
      active: this.task.bookmark,
    });

    return html`<div
      id="contents-root"
      class="${baseClassMap}"
      @click=${this._selected}
    >
      <div class="status-icon ${taskStatus.name}">
        <wa-icon library="my-icons" name=${taskStatus.iconNameSub}></wa-icon>
      </div>
      <div class="task-data">
        <div class="name">
          ${this.task.selected
            ? html` <wa-icon
                library="my-icons"
                name="caret-right-solid-full"
              ></wa-icon>`
            : ``}
          ${this.task.name}
        </div>
        <div class="footer">
          <div class=${bookmarkClasses}>
            <wa-icon
              library="my-icons"
              name=${bookmarkIcon}
              @click=${this._toggleBookmark}
            ></wa-icon>
          </div>
          <wa-divider orientation="vertical"></wa-divider>
          <div class="due">
            ${dispDue}
            <wa-icon library="my-icons" name=${dueIcon}></wa-icon>
          </div>
          <wa-divider orientation="vertical"></wa-divider>
          <div class="label">${this.labelName}</div>
        </div>
      </div>
    </div>`;
  }

  /**
   * 指定したタスクを選択状態にします。
   *
   * @private
   * @memberof SnListItem
   */
  private async _selected() {
    await snDB.selectSingleTask(this.task.id);
  }
  /**
   * 指定したタスクのブックマーク状態をトグル（反転）させます。
   *
   * @private
   * @memberof SnListItem
   */
  private async _toggleBookmark() {
    await snDB.toggleBookmark(this.task);
  }
}
