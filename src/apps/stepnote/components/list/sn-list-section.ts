// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list-section.lit.scss?inline";

// 5. Initializations
setBasePath("/");

/**
 * タスクリストセクション
 *
 * @export
 * @class PSListSection
 * @extends {LitElement}
 */
@customElement("sn-list-section")
export class SnListSection extends LitElement {
  /**
   * セクション開閉
   *
   * @type {boolean}
   * @memberof SnListSection
   */
  @property({ type: Boolean }) isExpanded: boolean = true;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnListSection
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
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnListSection
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * タスクリストのセクションをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnListSection
   */
  protected render(): HTMLTemplateResult {
    return html`<div
      id="contents-root"
      class="${this.isExpanded ? "open" : ""}"
    >
      <header @click=${this._toggleExpand}>
        <span><slot name="year"></slot></span>
        <wa-badge appearance="filled" variant="neutral" pill>
          <slot name="count"></slot>
        </wa-badge>
        <wa-icon library="my-icons" name="angle-down-solid-full"></wa-icon>
      </header>
      <div class="contents">
        <div class="contents-inner">
          <slot name="item"></slot>
        </div>
      </div>
    </div>`;
  }

  /**
   * コンテンツの開閉を切り替える
   *
   * @private
   * @memberof SnListSection
   */
  private _toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
