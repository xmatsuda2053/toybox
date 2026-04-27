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
import { emit } from "@/utils/EventUtils";
import { Division } from "../../models/Division";

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
   * 表示データ
   *
   * @type {Division}
   * @memberof HaViewerDiv
   */
  @property({ type: Object }) divData!: Division;

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
      <div class="div has-icon">
        <span class="search" @click=${this.clickItem}>
          ${this.divData?.div1}
        </span>
        <span class="search" @click=${this.clickItem}>
          ${this.divData?.div2}
        </span>
        <span class="search" @click=${this.clickItem}>
          ${this.divData?.div3}
        </span>
        <wa-icon
          library="my-icons"
          name="magnifying-glass-solid-full"
        ></wa-icon>
      </div>
      <div class="other">
        <span @click=${this.clickItem}>${this.divData?.other}</span>
      </div>
      <div class="place">
        <span @click=${this.clickItem}>${this.divData?.place}</span>
      </div>
      <div class="post">
        <span @click=${this.clickItem}>${this.divData?.post}</span>
      </div>
      <div class="tel1 has-icon">
        <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
        <span @click=${this.clickItem}>${this.divData?.tel1}</span>
      </div>
      <div class="tel2 has-icon">
        <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
        <span @click=${this.clickItem}>${this.divData?.tel2}</span>
      </div>
      <div class="fax has-icon">
        <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
        <span @click=${this.clickItem}>${this.divData?.fax}</span>
      </div>
      <div class="remark">
        <span @click=${this.clickItem}>${this.divData?.remark}</span>
      </div>
    </div>`;
  }

  /**
   * クリックしたアイテムの情報でイベントを発行する。
   *
   * @private
   * @param {Event} e
   * @return {*}
   * @memberof HaViewerDiv
   */
  private clickItem(e: Event): void {
    if (this.header) return;
    const target = e.target as HTMLDivElement;
    const text = target.innerText;
    const hasSearch = target.classList.contains("search");
    emit(this, "click-item", {
      detail: { text: text, search: hasSearch, category: "div" },
    });
  }
}
