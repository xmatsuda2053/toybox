// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Decorators & Directives
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Database, Models, Shared Components)

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/search/ha-search-input.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("ha-search-input")
export class HaSearchInput extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaSearchInput
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
   * Creates an instance of HaSearchInput.
   * @memberof HaSearchInput
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaSearchInput
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
   * @memberof HaSearchInput
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <wa-input placeholder="filter inquiries..." size="small" with-clear>
        <wa-icon
          slot="start"
          library="my-icons"
          name="magnifying-glass-solid-full"
        ></wa-icon>
      </wa-input>
    </div>`;
  }
}
