// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./generic-list-item.lit.scss?inline?inline";

// Initializations
setBasePath("/");

/**
 * ナビゲーションアイテム
 *
 * @export
 * @class GenericListItem
 * @extends {LitElement}
 */
@customElement("generic-list-item")
export class GenericListItem extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof GenericListItem
   */
  static styles = [unsafeCSS(styles)];

  /**
   * アイテムID
   *
   * @type {string}
   * @memberof GenericListItem
   */
  @property({ type: String }) itemId!: string;

  /**
   * 選択状態
   *
   * @type {boolean}
   * @memberof GenericListItem
   */
  @property({ type: Boolean }) selected: boolean = false;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * アイテムクリックイベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof GenericListItem
   */
  private _handleGenericItemClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    emit(this, "generic-item-click", { detail: { id: this.itemId } });
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ナビゲーションアイテムのコンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof GenericListItem
   */
  protected render(): HTMLTemplateResult {
    const baseClassMap = classMap({
      "contents-root": true,
      selected: this.selected,
    });
    return html`<div class=${baseClassMap}>
      <slot name="icon"></slot>
      <span class="label" @click=${this._handleGenericItemClick}>
        ${this._renderCaret()}
        <slot name="label"></slot>
      </span>
      <slot name="end"></slot>
    </div>`;
  }

  /**
   * キャレットアイコンをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof GenericListItem
   */
  private _renderCaret(): HTMLTemplateResult | typeof nothing {
    if (!this.selected) return nothing;
    return html`
      <wa-icon
        library="my-icons"
        name="caret-right-solid-full"
        class="caret"
      ></wa-icon>
    `;
  }
}
