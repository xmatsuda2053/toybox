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

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/notebook/sn-notebook-nav-item.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ナビゲーションアイテム
 *
 * @export
 * @class SnNotebookNavItem
 * @extends {LitElement}
 */
@customElement("sn-notebook-nav-item")
export class SnNotebookNavItem extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNotebookNavItem
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択状態
   *
   * @type {boolean}
   * @memberof SnNotebookNavItem
   */
  @property({ type: Boolean }) selected: boolean = false;

  /**
   * ピン留め状態
   *
   * @type {boolean}
   * @memberof SnNotebookNavItem
   */
  @property({ type: Boolean }) pinned: boolean = false;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ナビゲーションアイテムのコンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNotebookNavItem
   */
  protected render(): HTMLTemplateResult {
    const baseClassMap = classMap({
      "contents-root": true,
      selected: this.selected,
      pinned: this.pinned,
    });
    return html`<div class=${baseClassMap}>
      <wa-icon
        library="my-icons"
        name="book-open-solid-full"
        class="bookmark"
      ></wa-icon>
      <span class="label">${this._renderCaret()}<slot></slot></span>
      <wa-icon
        library="my-icons"
        name="thumbtack-solid-full"
        class="pin"
      ></wa-icon>
    </div>`;
  }

  /**
   * キャレットアイコンをレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnNotebookNavItem
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
