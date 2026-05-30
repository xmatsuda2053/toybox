// 1. Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement } from "lit/decorators.js";

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
   * スタイルシートを適用
   *
   * @static
   * @memberof SnListSection
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * タスクリストのセクションをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnListSection
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <header>
        <span><slot name="year"></slot>年度</span>
        <wa-badge variant="brand" pill>
          <slot name="count"></slot>
        </wa-badge>
      </header>
    </div>`;
  }
}
