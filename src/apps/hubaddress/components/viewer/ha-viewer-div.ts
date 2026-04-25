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
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Database, Models, Shared Components)

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/viewer/ha-viewer-div.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

/**
 * 職員情報ビューアー
 *
 * @export
 * @class HaViewerDiv
 * @extends {LitElement}
 */
@customElement("ha-viewer-div")
export class HaViewerDiv extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaViewerDiv
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
   * ヘッダレコード
   *
   * @type {boolean}
   * @memberof HaViewerDiv
   */
  @property({ type: Boolean }) header: boolean = false;

  /**
   * アイテムレコード
   *
   * @type {boolean}
   * @memberof HaViewerDiv
   */
  @property({ type: Boolean }) item: boolean = false;

  /**
   * 奇数レコード
   *
   * @type {boolean}
   * @memberof HaViewerDiv
   */
  @property({ type: Boolean }) odd: boolean = false;

  /**
   * 偶数レコード
   *
   * @type {boolean}
   * @memberof HaViewerDiv
   */
  @property({ type: Boolean }) even: boolean = false;

  /**
   * Creates an instance of HaViewerDiv.
   * @memberof HaViewerDiv
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaViewerDiv
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
   * @memberof HaViewerDiv
   */
  protected render(): HTMLTemplateResult {
    const classes = classMap({
      card: true,
      header: this.header,
      item: this.item,
      odd: this.odd,
      even: this.even,
    });
    return html`<div class=${classes}>
      <div class="div"><slot name="div"></slot></div>
      <div class="other"><slot name="other"></slot></div>
      <div class="place"><slot name="place"></slot></div>
      <div class="post"><slot name="post"></slot></div>
      <div class="tel1">
        <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
        <slot name="tel1"></slot>
      </div>
      <div class="tel2">
        <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
        <slot name="tel2"></slot>
      </div>
      <div class="fax">
        <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
        <slot name="fax"></slot>
      </div>
      <div class="remark"><slot name="remark"></slot></div>
    </div>`;
  }
}
