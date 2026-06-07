// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/list/sn-list-section.lit.scss?inline";

// Internal Shared (Database, Models, Codes)
import { emit } from "@/utils/EventUtils";

// Initializations
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

  /**
   * 開閉状態
   *
   * @memberof SnListSection
   */
  @property({ type: Boolean, reflect: true }) collapsed = false;

  /**
   * 年度
   *
   * @type {number}
   * @memberof SnListSection
   */
  @property({ type: Number }) year!: number;

  /**
   * 年度内のタスク件数
   *
   * @type {number}
   * @memberof SnListSection
   */
  @property({ type: Number }) count!: number;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * ヘッダークリック時の処理を制御します。
   *
   * @private
   * @memberof SnListSection
   */
  private _handleHeaderClick = () => {
    emit(this, "click-section", { detail: { year: this.year } });
  };

  // -------------------------------------------------------------
  // Rendering
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
      <header @click=${this._handleHeaderClick}>
        <span>
          <wa-icon
            library="my-icons"
            name="angle-down-solid-full"
            class=${this.collapsed ? "collapsed" : ""}
          ></wa-icon>
          ${this.year}年度
        </span>
        <wa-badge variant="brand" pill>${this.count}</wa-badge>
      </header>
    </div>`;
  }
}
