// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./generic-list.lit.scss?inline?inline";

// Initializations
setBasePath("/");

/**
 * 汎用リスト
 *
 * @export
 * @class GenericList
 * @extends {LitElement}
 */
@customElement("generic-list")
export class GenericList extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof GenericList
   */
  static styles = [unsafeCSS(styles)];

  /**
   * リストヘッダーのラベル
   *
   * @type {string}
   * @memberof GenericList
   */
  @property({ type: String }) headerLabel: string = "";

  /**
   * リストフッターのラベル
   *
   * @type {string}
   * @memberof GenericList
   */
  @property({ type: String }) footerLabel: string = "";

  /**
   * 追加可能フラグ
   *
   * @type {boolean}
   * @memberof GenericList
   */
  @property({ type: Boolean }) addable: boolean = false;

  /**
   * 検索可能フラグ
   *
   * @type {boolean}
   * @memberof GenericList
   */
  @property({ type: Boolean }) searchable: boolean = false;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * アイテム追加イベントを制御します。
   *
   * @private
   * @param {Event} e
   * @memberof GenericList
   */
  private _handleItemAdd = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    emit(this, "generic-item-add");
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  protected render(): HTMLTemplateResult {
    return html`<div class="contents-root">
      <header>
        <div class="header-top">
          <span class="label">${this.headerLabel}</span>
          ${this._renderAddButton()}
        </div>
        ${this._renderSearchArea()}
      </header>
      <main>
        <slot></slot>
      </main>
      <footer>${this._renderFooter()}</footer>
    </div>`;
  }

  /**
   * 追加ボタンをレンダリングする。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof GenericList
   */
  private _renderAddButton(): HTMLTemplateResult | typeof nothing {
    if (!this.addable) return nothing;

    return html`<wa-icon
      id="btn-add"
      library="my-icons"
      name="plus-solid-full"
      @click=${this._handleItemAdd}
    >
    </wa-icon>`;
  }

  /**
   * 検索エリアをレンダリングする。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof GenericList
   */
  private _renderSearchArea(): HTMLTemplateResult | typeof nothing {
    if (!this.searchable) return nothing;

    return html`<search-input></search-input>`;
  }

  /**
   * フッターをレンダリングする。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof GenericList
   */
  private _renderFooter(): HTMLTemplateResult | typeof nothing {
    if (!this.footerLabel) return nothing;

    return html`<div class="footer-label">${this.footerLabel}</div>`;
  }
}
