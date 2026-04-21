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
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs (WebAwesome)
import type WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)
import { emit } from "@/utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/task/sn-task-deletion.lit.scss?inline";

// 6. Initializations
setBasePath("/");

/**
 * タスク削除制御
 *
 * @export
 * @class SnTaskDeletion
 * @extends {LitElement}
 */
@customElement("sn-task-deletion")
export class SnTaskDeletion extends LitElement {
  /**
   * 削除可否
   *
   * @type {boolean}
   * @memberof SnTaskDeletion
   */
  @state() isDeletionAllowed: boolean = false;

  /**
   * 削除可否スイッチ
   *
   * @type {typeof WaSwitch}
   * @memberof SnTaskDeletion
   */
  @query("#deletionSwitch") deletionSwitch!: WaSwitch;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskDeletion
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
   * Creates an instance of PSTaskDeletion.
   * @memberof SnTaskDeletion
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnTaskDeletion
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * リファレンスをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnTaskDeletion
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="contents">
        <div class="switch">
          <wa-switch id="deletionSwitch" @change=${this._toggleDeletionAllowed}>
            このタスクを削除可能とする
          </wa-switch>
        </div>
        <div class="button">
          <wa-button
            appearance=${this.isDeletionAllowed ? "accent" : "outlined"}
            variant="danger"
            size="small"
            ?disabled=${!this.isDeletionAllowed}
            @click=${() => emit(this, "delete-task")}
          >
            <wa-icon
              slot="start"
              library="my-icons"
              name="trash-solid-full"
            ></wa-icon>
            Delete
          </wa-button>
        </div>
      </div>
    </div>`;
  }

  /**
   * 削除可否を切り替えます。
   *
   * @private
   * @memberof SnTaskDeletion
   */
  private _toggleDeletionAllowed() {
    this.isDeletionAllowed = this.deletionSwitch.checked;
  }
}
