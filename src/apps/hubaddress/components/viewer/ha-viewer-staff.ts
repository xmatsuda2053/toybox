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
import { Staff } from "@ha/models/Staff";

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
   * 表示データ
   *
   * @type {Staff[]}
   * @memberof HaViewerStaff
   */
  @property({ type: Object }) staffData!: Staff;

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
      <div class="id">
        <span @click=${this.clickItem}>${this.staffData?.staffId}</span>
      </div>
      <div class="name-kj ellipsis">
        <span @click=${this.clickItem}>${this.staffData?.nameKj}</span>
      </div>
      <div class="name-kn ellipsis">
        <span @click=${this.clickItem}>${this.staffData?.nameKn}</span>
      </div>
      <div class="div ellipsis has-icon ">
        <span class="search" @click=${this.clickItem}>
          ${this.staffData?.div}
        </span>
        <wa-icon
          library="my-icons"
          name="magnifying-glass-solid-full"
        ></wa-icon>
      </div>
      <div class="post ellipsis">
        <span @click=${this.clickItem}>${this.staffData?.post}</span>
      </div>
      <div class="mail mail-1 has-icon">
        <wa-icon library="my-icons" name="envelope-solid-full"></wa-icon>
        <span @click=${this.clickItem}>${this.staffData?.mail1}</span>
      </div>
      <div class="mail mail-2 has-icon">
        <wa-icon library="my-icons" name="envelope-regular-full"></wa-icon>
        <span @click=${this.clickItem}>${this.staffData?.mail2}</span>
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
      detail: { text: text, search: hasSearch, category: "staff" },
    });
  }
}
