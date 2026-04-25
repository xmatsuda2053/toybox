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
import styles from "@ha/styles/viewer/ha-viewer-staff.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

/**
 * 職員情報ビューアー
 *
 * @export
 * @class HaViewerStaff
 * @extends {LitElement}
 */
@customElement("ha-viewer-staff")
export class HaViewerStaff extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaViewerStaff
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
   * @memberof HaViewerStaff
   */
  @property({ type: Boolean }) header: boolean = false;

  /**
   * アイテムレコード
   *
   * @type {boolean}
   * @memberof HaViewerStaff
   */
  @property({ type: Boolean }) item: boolean = false;

  /**
   * 奇数レコード
   *
   * @type {boolean}
   * @memberof HaViewerStaff
   */
  @property({ type: Boolean }) odd: boolean = false;

  /**
   * 偶数レコード
   *
   * @type {boolean}
   * @memberof HaViewerStaff
   */
  @property({ type: Boolean }) even: boolean = false;

  /**
   * Creates an instance of HaViewerStaff.
   * @memberof HaViewerStaff
   */
  constructor() {
    super();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaViewerStaff
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
   * @memberof HaViewerStaff
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
      <div class="id"><slot name="id"></slot></div>
      <div class="name-kj"><slot name="name-kj"></slot></div>
      <div class="name-kn"><slot name="name-kn"></slot></div>
      <div class="div"><slot name="div"></slot></div>
      <div class="post"><slot name="post"></slot></div>
      <div class="mail mail-1">
        <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
        <slot name="mail1"></slot>
      </div>
      <div class="mail mail-2">
        <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
        <slot name="mail2"></slot>
      </div>
    </div>`;
  }
}
