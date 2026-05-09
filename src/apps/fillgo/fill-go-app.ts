// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Decorators & Directives
import { customElement } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Modules (Utils, Database, Models, Shared Components)
import { NavItem } from "./models/NavItem";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@fgo/styles/fill-go-app.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("fill-go-app")
export class FillGoApp extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof FillGoApp
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
   * Creates an instance of FillGoApp.
   * @memberof FillGoApp
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof FillGoApp
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof FillGoApp
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof FillGoApp
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
   * @memberof FillGoApp
   */
  protected render(): HTMLTemplateResult {
    const dummyH: NavItem[] = [
      {
        id: 1,
        name: "label item1",
        selected: true,
      },
      {
        id: 2,
        name: "label item2",
        selected: false,
      },
    ];

    const dummyL: NavItem[] = [
      {
        id: 1,
        name: "list item1 list item1 list item1",
        selected: true,
      },
      {
        id: 2,
        name: "list item2",
        selected: false,
      },
    ];
    return html`<div id="contents-root">
      <div class="content">
        <div class="panel menu">
          <fgo-menu></fgo-menu>
        </div>
        <div class="panel nav">
          <fgo-nav
            .items=${dummyH}
            iconName="tag-solid-full"
            @add-item=${this._openAddLabel}
            @click-item=${this._selectLabel}
          >
            <fgo-nav-header slot="header" addable expandable open>
              LABEL
            </fgo-nav-header>
          </fgo-nav>
          <wa-divider></wa-divider>
          <div class="list">
            <fgo-nav
              .items=${dummyL}
              iconName="rectangle-list-solid-full"
              scrollable
              @add-item=${this._openAddItem}
              @click-item=${this._selectItem}
            >
              <fgo-nav-header slot="header" addable open>LIST</fgo-nav-header>
            </fgo-nav>
          </div>
        </div>
        <div class="panel input"></div>
        <div class="panel output"></div>
      </div>
    </div>`;
  }

  /**
   * ラベル追加画面を表示します。
   *
   * @private
   * @memberof FillGoApp
   */
  private _openAddLabel() {
    console.log("_openAddLabel"); //TODO
  }

  /**
   * クリックしたラベルを選択します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof FillGoApp
   */
  private _selectLabel(e: CustomEvent) {
    console.log("_selectLabel " + e.detail.itemId); //TODO
  }

  /**
   * アイテム追加画面を表示します。
   *
   * @private
   * @memberof FillGoApp
   */
  private _openAddItem() {
    console.log("_openAddItem"); //TODO
  }

  /**
   * クリックしたアイテムを選択します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof FillGoApp
   */
  private _selectItem(e: CustomEvent) {
    console.log("_selectItem " + e.detail.itemId); //TODO
  }
}
