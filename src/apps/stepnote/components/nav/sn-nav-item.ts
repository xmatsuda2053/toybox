// 1. Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
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
 * アイコンカラー
 */
export type navVariants =
  | "neutral"
  | "danger"
  | "warning"
  | "info"
  | "success"
  | "brand";

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
   * アイコンカラー
   *
   * @type {navVariants}
   * @memberof SnNavItem
   */
  @property({ type: String }) variants: navVariants = "neutral";

  /**
   * 選択状態
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) selected: boolean = false;

  /**
   * ドット表示有無
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) dot: boolean = false;

  /**
   * 要素の表示非表示制御であることを示す。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) viewable: boolean = false;

  /**
   * アニメーションの実行有無を制御する。
   *
   * @type {boolean}
   * @memberof SnNavItem
   */
  @property({ type: Boolean }) animation: boolean = false;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNavItem
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * アイテムクリックのイベントを制御します。
   *
   * @private
   * @memberof SnNavItem
   */
  private _handleItemClick = (): void => {
    emit(this, this.eventName);
  };

  /**
   * プロパティクリックのイベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnNavItem
   */
  private _handlePropertyClick = (e: Event): void => {
    e.stopPropagation();
    emit(this, "click-property");
  };

  /**
   * 削除クリックのイベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof SnNavItem
   */
  private _handleDeleteClick = (e: Event): void => {
    e.stopPropagation();
    emit(this, "click-delete");
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

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
      [this.variants]: true,
      selected: this.selected,
      viewable: this.viewable,
    });

    return html`<div id="contents-root" class=${baseClassMap}>
      <div class="button-area" @click=${this._handleItemClick}>
        <div class="icon">${this._renderIcon()}</div>
        <div class="label">${this._renderCaret()}<slot></slot></div>
      </div>
      <div class="end">${this._renderDot()} ${this._renderEyeIcon()}</div>
      ${this._renderMenu()}
    </div>`;
  }

  /**
   * アイコンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNavItem
   */
  private _renderIcon(): HTMLTemplateResult {
    const animation = !this.selected && this.animation ? "bounce" : undefined;
    return html`<wa-icon
      class="start-icon"
      library="my-icons"
      .name=${this.icon}
      .animation=${animation}
    ></wa-icon>`;
  }

  /**
   * キャレットアイコンをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNavItem
   */
  private _renderCaret(): HTMLTemplateResult | typeof nothing {
    if (!this.selected) return nothing;
    return html`
      <wa-icon library="my-icons" name="caret-right-solid-full"></wa-icon>
    `;
  }

  /**
   * ドットアイコンをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNavItem
   */
  private _renderDot(): HTMLTemplateResult | typeof nothing {
    if (!this.dot) return nothing;
    return html`
      <wa-icon
        class="target-task-dot"
        library="my-icons"
        name="circle-dot-regular-full"
      ></wa-icon>
    `;
  }

  /**
   * 表示／非表示アイコンをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNavItem
   */
  private _renderEyeIcon(): HTMLTemplateResult | typeof nothing {
    if (!this.viewable) return nothing;
    return html`
      <wa-icon
        library="my-icons"
        name=${this.selected ? "eye-solid-full" : "eye-slash-solid-full"}
      ></wa-icon>
    `;
  }

  /**
   * ドロップダウンメニューをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNavItem
   */
  private _renderMenu(): HTMLTemplateResult | typeof nothing {
    if (!this.editable) return nothing;
    return html` <wa-dropdown>
      <wa-icon
        library="my-icons"
        name="bars-solid-full"
        slot="trigger"
      ></wa-icon>
      <wa-dropdown-item @click=${this._handlePropertyClick}>
        <wa-icon
          slot="icon"
          library="my-icons"
          name="sliders-solid-full"
        ></wa-icon>
        Property
      </wa-dropdown-item>
      <wa-dropdown-item @click=${this._handleDeleteClick} class="danger">
        <wa-icon
          slot="icon"
          library="my-icons"
          name="trash-solid-full"
        ></wa-icon>
        Delete
      </wa-dropdown-item>
    </wa-dropdown>`;
  }
}
