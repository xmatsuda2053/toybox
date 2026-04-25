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
    return html`<div class=${classes} @click=${this.clickItem}>
      <div class="div search" data-name="div">
        ${this.divData?.div1} ${this.divData?.div2} ${this.divData?.div3}
        <wa-icon
          library="my-icons"
          name="magnifying-glass-solid-full"
        ></wa-icon>
      </div>
      <div class="other">${this.divData?.other}</div>
      <div class="place">${this.divData?.place}</div>
      <div class="post">${this.divData?.post}</div>
      <div class="tel1">
        <wa-icon library="my-icons" name="phone-flip-solid-full"></wa-icon>
        ${this.divData?.tel1}
      </div>
      <div class="tel2">
        <wa-icon library="my-icons" name="phone-solid-full"></wa-icon>
        ${this.divData?.tel2}
      </div>
      <div class="fax">
        <wa-icon library="my-icons" name="fax-solid-full"></wa-icon>
        ${this.divData?.fax}
      </div>
      <div class="remark">${this.divData?.remark}</div>
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
    const name = target.dataset.name ?? "";
    emit(this, "click-item", {
      detail: { text: text, name: name, category: "div" },
    });
  }
}
