// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { TaskStatus, type TaskStatusCode } from "@sn/code/TaskStatus";

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-button.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * タスク制御ボタン
 *
 * @export
 * @class SnTaskButton
 * @extends {LitElement}
 */
@customElement("sn-task-button")
export class SnTaskButton extends LitElement {
  /**
   * 状態コード
   *
   * @type {TaskStatusCode}
   * @memberof SnTaskButton
   */
  @property({ type: String }) status: TaskStatusCode = "0";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskButton
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * ステータス選択時のイベントハンドラ
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskButton
   */
  private _handleItemClick(e: Event) {
    // クリックされた要素（またはその親要素）から、埋め込んだ data-code を取得
    const currentTarget = e.currentTarget as HTMLElement;
    const code = currentTarget.dataset.code as TaskStatusCode;

    if (code) {
      emit(this, "change-status", {
        detail: { code },
      });
    }
  }

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * タスク制御ボタンをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskButton
   */
  protected render(): HTMLTemplateResult {
    const statuses = TaskStatus.getAll();

    return html`<div id="contents-root">
      <wa-dropdown>
        <div slot="trigger" class="label">
          <wa-icon library="my-icons" name="circle-check-solid-full"></wa-icon>
          <span>Mark as</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>

        ${repeat(
          statuses,
          (status) => status.code,
          (status) => {
            return html` <wa-dropdown-item
              data-code=${status.code}
              @click=${this._handleItemClick}
            >
              <wa-icon
                library="my-icons"
                name=${status.iconName}
                class=${status.name}
              ></wa-icon>
              <span>${status.label}</span>
            </wa-dropdown-item>`;
          },
        )}
      </wa-dropdown>
    </div>`;
  }
}
