// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Library Extensions & Third-party
import { customElement } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 3. Internal Assets & Logic

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@ap/styles/_header-item.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApFile
 * @extends {LitElement}
 */
@customElement("ap-file")
export class ApFile extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApFile
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  /**
   * Creates an instance of ApFile.
   * @memberof ApFile
   */
  constructor() {
    super();
  }

  /**
   * コンポーネント追加時
   *
   * @memberof ApFile
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネント破棄時にリスナーを削除（メモリリーク防止）
   *
   * @memberof ApFile
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ApFile
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンポーネントのDOM追加後、1度だけ実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof ApFile
   */
  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ApFile
   */
  protected render(): HTMLTemplateResult {
    return html`<wa-dropdown>
      <div class="menu-header" slot="trigger">
        <span>File(F)</span>
        <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
      </div>
      <wa-dropdown-item>設定</wa-dropdown-item>
    </wa-dropdown>`;
  }
}
