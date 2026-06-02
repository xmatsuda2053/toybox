// 1. Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state, query } from "lit/decorators.js";

// 3. Third-party UI & SDKs (WebAwesome)
import type WaSwitch from "@awesome.me/webawesome/dist/components/switch/switch.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
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
  @state() _isDeletionAllowed: boolean = false;

  /**
   * 削除ダイアログ
   *
   * @private
   * @type {WaDialog}
   * @memberof SnTaskProperty
   */
  @query("#delete-task-overview") private _deleteDialog!: WaDialog;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskDeletion
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * 削除制御スイッチのONOFF処理を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnTaskDeletion
   */
  private _handleDeletionSwitchChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this._isDeletionAllowed = (e.target as WaSwitch).checked;
  };

  /**
   * 削除ボタンクリック時のイベントを制御します。
   *
   * @private
   * @memberof SnTaskDeletion
   */
  private _handleDeleteClick = () => {
    this._deleteDialog.label = `このタスクを削除しますか?`;
    this._deleteDialog.open = true;
  };

  /**
   * タスク削除実行時のイベントを制御します。
   *
   * @private
   * @memberof SnTaskDeletion
   */
  private _handleDeleteTaskClick = () => {
    emit(this, "delete-task");
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------
  /**
   * 削除機能をレンダリングします。
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
          <wa-switch
            id="deletionSwitch"
            @change=${this._handleDeletionSwitchChange}
          >
            <slot></slot>
          </wa-switch>
        </div>
        <div class="button">
          <wa-button
            appearance=${this._isDeletionAllowed ? "accent" : "outlined"}
            variant="danger"
            size="small"
            ?disabled=${!this._isDeletionAllowed}
            @click=${this._handleDeleteClick}
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
      <wa-dialog label="Confirm Delete" id="delete-task-overview">
        <div class="delete-confirmation">
          対象データを削除します。<br />
          この操作は取り消せません。
        </div>
        <wa-button
          slot="footer"
          variant="danger"
          appearance="accent"
          size="small"
          @click=${this._handleDeleteTaskClick}
        >
          Delete Task
        </wa-button>
        <wa-button
          slot="footer"
          variant="neutral"
          appearance="filled-outlined"
          size="small"
          data-dialog="close"
        >
          Cancel
        </wa-button>
      </wa-dialog>
    </div>`;
  }
}
