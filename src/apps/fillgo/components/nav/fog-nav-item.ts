// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Decorators & Directives
import { customElement, property } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Utils, Database, Models, Shared Components)
import { emit } from "@/utils/EventUtils";
import { NavItem } from "../../models/NavItem";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@fgo/styles/nav/fgo-nav-item.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("fgo-nav-item")
export class FgoNavItem extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof FgoNavItem
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
   * アイテムデータ
   *
   * @type {NavItem}
   * @memberof FgoNavItem
   */
  @property({ type: Object }) item!: NavItem;

  /**
   * Creates an instance of FillGoApp.
   * @memberof FgoNavItem
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof FgoNavItem
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof FgoNavItem
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof FgoNavHeader
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof FgoNavItem
   */
  protected render(): HTMLTemplateResult {
    const selectedIcon = html`<wa-icon
      library="my-icons"
      name="caret-right-solid-full"
    ></wa-icon>`;

    const menuIcon = html`<wa-icon
      library="my-icons"
      name="bars-solid-full"
      id="menu"
    ></wa-icon>`;

    return html`<div
      id="contents-root"
      class=${this.item.selected ? "selected" : ""}
    >
      <slot name="start"></slot>
      ${this.item.selected ? selectedIcon : html``}
      <span @click=${this._clickItem}>${this.item.name}</span>
      ${menuIcon}
    </div>`;
  }

  /**
   * アイテムクリックのイベントを発行します。
   *
   * @private
   * @memberof FgoNavItem
   */
  private _clickItem() {
    emit(this, "click-item", { detail: { itemId: this.item.id } });
  }
}
