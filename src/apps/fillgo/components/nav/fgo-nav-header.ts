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

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@fgo/styles/nav/fgo-nav-header.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("fgo-nav-header")
export class FgoNavHeader extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof FgoNavHeader
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
   * 追加可否
   *
   * @type {boolean}
   * @memberof FgoNavHeader
   */
  @property({ type: Boolean }) addable: boolean = false;

  /**
   * 開閉可否
   *
   * @type {boolean}
   * @memberof FgoNavHeader
   */
  @property({ type: Boolean }) expandable: boolean = false;

  /**
   * 開閉の状態
   *
   * @type {boolean}
   * @memberof FgoNavHeader
   */
  @property({ type: Boolean }) open: boolean = false;

  /**
   * Creates an instance of FillGoApp.
   * @memberof FgoNavHeader
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof FgoNavHeader
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof FgoNavHeader
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
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof FgoNavHeader
   */
  protected render(): HTMLTemplateResult {
    const addButton = html`<wa-icon
      library="my-icons"
      name="plus-solid-full"
      @click=${this._addItem}
    ></wa-icon>`;

    const expandButton = html`<wa-icon
      library="my-icons"
      name="angle-down-solid-full"
      class="toggle-icon ${this.open ? "open" : ""} "
      @click=${this._toggleExpand}
    ></wa-icon>`;

    return html`<div id="contents-root">
      <span><slot></slot></span>
      <div class="buttons">
        ${this.addable ? addButton : html``}
        ${this.expandable ? expandButton : html``}
      </div>
    </div>`;
  }

  /**
   * アイテム追加イベントを発行します。
   *
   * @private
   * @memberof FgoNavHeader
   */
  private _addItem() {
    emit(this, "add-item");
  }

  /**
   * 開閉の状態通知イベントを発行します。
   *
   * @private
   * @memberof FgoNavHeader
   */
  private _toggleExpand() {
    this.open = !this.open;
    emit(this, "toggle-expand", { detail: { open: this.open } });
  }
}
