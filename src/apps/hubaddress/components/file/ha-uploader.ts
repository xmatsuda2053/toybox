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
import styles from "@ha/styles/file/ha-uploader.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("ha-uploader")
export class HaUploader extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaUploader
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
   * Creates an instance of HaUploader.
   * @memberof HaUploader
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaUploader
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
   * @memberof HaUploader
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <wa-button variant="neutral" appearance="accent" size="small">
        <wa-icon library="my-icons" name="upload-solid-full"></wa-icon>
      </wa-button>
    </div>`;
  }
}
