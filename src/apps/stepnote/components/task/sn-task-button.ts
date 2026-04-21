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

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Codes, Models, Database)
import { TaskStatus, type TaskStatusCode } from "@sn/code/TaskStatus";

// 5. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-button.lit.scss?inline";

// 7. Initializations
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
   * @type {Contact}
   * @memberof SnTaskButton
   */
  @property({ type: String }) status: TaskStatusCode = "0";

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskButton
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
   * @memberof SnTaskButton
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * タスク制御ボタンをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskButton
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <wa-dropdown>
        <div slot="trigger" class="label">
          <wa-icon
            library="my-icons"
            name="circle-check-solid-full"
            slot="trigger"
          ></wa-icon>
          <span>Mark as</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>

        ${TaskStatus.getAll().map((status) => {
          return html` <wa-dropdown-item
            @click=${() => {
              emit(this, "change-status", {
                detail: { code: status.code },
              });
            }}
          >
            <wa-icon
              library="my-icons"
              name=${status.iconNameSub}
              class=${status.name}
            ></wa-icon>
            <span>${status.label}</span>
          </wa-dropdown-item>`;
        })}
      </wa-dropdown>
    </div>`;
  }
}
