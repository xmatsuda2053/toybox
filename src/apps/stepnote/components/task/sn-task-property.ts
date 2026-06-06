// Core Libraries (Lit & Dexie)
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { repeat } from "lit/directives/repeat.js";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs (WebAwesome)
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Database, Models)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";

// Internal Shared (Utils)
import { formatDate, getYearList } from "@utils/DateUtils";
import { debounce } from "@utils/CommonUtils";

// Styles
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
  @property({ type: Array }) labels: Label[] = [];

  /**
   * タスクデータ
   *
   * @type {Task}
   * @memberof SnTaskProperty
   */
  @property({ type: Object }) task!: Task;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskProperty
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * タスクデータを更新します。
   *
   * @private
   * @memberof SnTaskProperty
   */
  private _update = debounce(
    async (updateData: Partial<Task>): Promise<void> => {
      await snDB.updateTask(updateData);
    },
    100,
  );

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * 年度変更時のイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskProperty
   */
  private _handleFiscalYearChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaSelect;
    this.task["fiscalYear"] = Number(target.value);

    this._update({
      id: this.task.id,
      fiscalYear: this.task.fiscalYear,
    });
  };

  /**
   * ラベル変更時のイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskProperty
   */
  private _handleLabelChange = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaSelect;
    this.task["labelId"] = Number(target.value);

    this._update({
      id: this.task.id,
      labelId: this.task.labelId,
    });
    await snDB.labelRepo.selectLabel(this.task.labelId);
  };

  /**
   * タスクを削除します。
   *
   * @private
   * @memberof SnTaskProperty
   */
  private async _handleDeleteTaskClick() {
    await snDB.deleteTask(this.task.id!);
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * プロパティをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskProperty
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.task) return nothing;

    return html`<div id="contents-root">
      <div class="property-item has-label">${this._renderId()}</div>
      <div class="property-item has-label">${this._renderCreatedAt()}</div>
      <div class="property-item has-label">${this._renderUpdatedAt()}</div>
      <div class="property-item has-label">${this._renderFiscalYear()}</div>
      <div class="property-item has-label">${this._renderLabel()}</div>
      <div class="property-item">${this._renderTaskDeletion()}</div>
    </div>`;
  }

  /**
   * IDをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderId(): HTMLTemplateResult {
    return html` <label class="label">ID</label>
      <wa-input
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
      </wa-input>`;
  }

  /**
   * 作成日をレンダリングし作成日
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderCreatedAt(): HTMLTemplateResult {
    return html` <label class="label">作成日</label>
      <wa-input
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
      </wa-input>`;
  }

  /**
   * 更新日をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderUpdatedAt(): HTMLTemplateResult {
    return html` <label class="label">更新日</label>
      <wa-input
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
      </wa-input>`;
  }

  /**
   * 年度をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderFiscalYear(): HTMLTemplateResult {
    return html` <label class="label">年度</label>
      <wa-select
        id="fiscal-year"
        size="small"
        class="item"
        value=${String(this.task.fiscalYear)}
        @change=${this._handleFiscalYearChange}
      >
        <wa-icon
          library="my-icons"
          name="calendar-regular-full"
          slot="end"
        ></wa-icon>
        ${repeat(
          yearList,
          (year) => year,
          (year) => {
            return html`<wa-option .value=${String(year)}>
              ${year}年度
            </wa-option>`;
          },
        )}
      </wa-select>`;
  }

  /**
   * ラベルをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderLabel(): HTMLTemplateResult {
    return html` <label class="label">ラベル</label>
      <wa-select
        id="task-label"
        size="small"
        class="item"
        value=${this.task.labelId}
        @change=${this._handleLabelChange}
      >
        <wa-icon library="my-icons" name="tag-solid-full" slot="end"></wa-icon>
        <wa-option value="0">未分類</wa-option>
        ${repeat(
          this.labels,
          (label) => label.id,
          (label) => {
            return html`<wa-option .value=${String(label.id)}>
              ${label.name}
            </wa-option>`;
          },
        )}
      </wa-select>`;
  }

  /**
   * タスク削除ボタンをレンダリングする
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnTaskProperty
   */
  private _renderTaskDeletion(): HTMLTemplateResult {
    return html` <sn-task-deletion @delete-task=${this._handleDeleteTaskClick}>
      このタスクを削除可能とする
    </sn-task-deletion>`;
  }
}
