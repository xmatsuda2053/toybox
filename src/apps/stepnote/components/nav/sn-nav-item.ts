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
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/nav/sn-nav-item.lit.scss?inline";

// 6. Initializations
setBasePath("/");

/**
 * ナビゲーションアイテム
 *
 * @export
 * @class SnNavItem
 * @extends {LitElement}
 */
@customElement("sn-nav-item")
export class SnNavItem extends LitElement {
  /**
   * アイコン名
   *
   * @type {string}
   * @memberof SnNavItem
   */
  @property({ type: String }) icon: string = "tag-solid-full";

  /**
   * イベント名
   *
   * @type {string}
   * @memberof SnNavItem
   */
  @property({ type: String }) eventName: string = "click-nav-item";

  /**
   * 編集可否
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) editable: boolean = false;

  /**
   * 警告ラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isDanger: boolean = false;

  /**
   * 注意ラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isWarning: boolean = false;

  /**
   * 情報ラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isInfo: boolean = false;

  /**
   * 開始待ちラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isPending: boolean = false;

  /**
   * 対応中ラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isProgress: boolean = false;

  /**
   * 完了ラベルであることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isDone: boolean = false;

  /**
   * 選択状態
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isSelected: boolean = false;

  /**
   * 要素の表示非表示制御であることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) isViewable: boolean = false;

  /**
   * 条件に該当するタスクを持つことを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) hasTargetTask: boolean = false;

  /**
   * アイテムの種類
   *
   * @type {string}
   * @memberof SnNavItem
   */
  @property({ type: String }) type:
    | "danger"
    | "brand"
    | "neutral"
    | "success"
    | "warning" = "neutral";

  /**
   * アニメーションの状態を制御する
   *
   * @private
   * @memberof SnNavItem
   */
  @state() private _animation = true;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNavItem
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
   * @memberof SnNavItem
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * ナビゲーションのアイテムをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnNavItem
   */
  protected render(): HTMLTemplateResult {
    const baseClassMap = classMap({
      danger: this.isDanger,
      warning: this.isWarning,
      info: this.isInfo,
      pending: this.isPending,
      progress: this.isProgress,
      done: this.isDone,
      selected: this.isSelected,
      viewable: this.isViewable,
    });
    return html`<div id="contents-root" class=${baseClassMap}>
      <div class="button-area" @click=${this._handleClick}>
        <div class="icon">
          <wa-icon
            class="start-icon"
            library="my-icons"
            name="${this.icon}"
            .animation=${this._animation && this.hasTargetTask
              ? "bounce"
              : undefined}
          ></wa-icon>
        </div>
        <div class="label">
          ${this._getSelectedIcon()}
          <slot></slot>
        </div>
      </div>
      <div class="end">
        ${this._getTargetIcon()} ${this._getViewableIcon()}
        ${this._renderDropdown()}
      </div>
    </div>`;
  }

  /**
   * クリックイベント
   *
   * @private
   * @memberof SnNavItem
   */
  private _handleClick() {
    this._animation = false;
    emit(this, this.eventName);
  }

  /**
   * 該当タスクありのアイコンを返します。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavItem
   */
  private _getTargetIcon(): HTMLTemplateResult {
    if (!this.hasTargetTask) return html``;
    return html` <wa-icon
      class="target-task-dot"
      library="my-icons"
      name="circle-dot-regular-full"
    ></wa-icon>`;
  }

  /**
   * 項目表示制御のアイコンを返します。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavItem
   */
  private _getViewableIcon(): HTMLTemplateResult {
    if (!this.isViewable) return html``;

    const iconName = this.isSelected
      ? "eye-solid-full"
      : "eye-slash-solid-full";

    return html` <wa-icon library="my-icons" name=${iconName}></wa-icon>`;
  }

  /**
   * 選択中の場合に表示するアイコンを返します。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavItem
   */
  private _getSelectedIcon(): HTMLTemplateResult {
    if (!this.isSelected) return html``;

    return html` <wa-icon
      library="my-icons"
      name="caret-right-solid-full"
    ></wa-icon>`;
  }

  /**
   * ドロップダウンメニューを作成する
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavItem
   */
  private _renderDropdown(): HTMLTemplateResult {
    if (!this.editable) return html``;
    return html`
      <wa-dropdown>
        <wa-icon
          library="my-icons"
          name="bars-solid-full"
          slot="trigger"
        ></wa-icon>
        <wa-dropdown-item @click=${() => emit(this, "click-property")}>
          <wa-icon
            slot="icon"
            library="my-icons"
            name="sliders-solid-full"
          ></wa-icon>
          Property
        </wa-dropdown-item>
        <wa-dropdown-item
          @click=${() => emit(this, "click-delete")}
          class="danger"
        >
          <wa-icon
            slot="icon"
            library="my-icons"
            name="trash-solid-full"
          ></wa-icon>
          Delete
        </wa-dropdown-item>
      </wa-dropdown>
    `;
  }
}
