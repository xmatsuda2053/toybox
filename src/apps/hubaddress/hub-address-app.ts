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
import styles from "@tx/styles/hub-address-app.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("hub-address-app")
export class HubAddressApp extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HubAddressApp
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  /**
   * Creates an instance of HubAddressApp.
   * @memberof HubAddressApp
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HubAddressApp
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
   * @memberof HubAddressApp
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <div class="base staff">
        <div class="title">title</div>
        <div class="search">search</div>
        <div class="viewer">
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewer</p>
          <p>viewerviewerviewer</p>
        </div>
      </div>
      <div class="base div">
        <div class="title">title</div>
        <div class="search">search</div>
        <div class="viewer">viewer</div>
      </div>
    </div>`;
  }
}
