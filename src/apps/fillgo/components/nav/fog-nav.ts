// 1. Core Libraries (Lit & Dexie)
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { repeat } from "lit/directives/repeat.js";

// 2. Decorators & Directives
import { customElement, state, property } from "lit/decorators.js";

// 3. Third-party Components & Utils
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { classMap } from "lit/directives/class-map.js";

// 4. Internal Modules (Utils, Database, Models, Shared Components)
import { NavItem } from "../../models/NavItem";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@fgo/styles/nav/fgo-nav.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

@customElement("fgo-nav")
export class FgoNav extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof FgoNav
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
   * スクロール可否
   *
   * @type {boolean}
   * @memberof FgoNav
   */
  @property({ type: Boolean }) scrollable: boolean = false;

  /**
   * アイテムに表示するアイコンの種類
   *
   * @type {string}
   * @memberof FgoNav
   */
  @property({ type: String }) iconName: string = "tag-solid-full";

  /**
   * ナビに表示するアイテムデータ
   *
   * @type {NavItem[]}
   * @memberof FgoNav
   */
  @property({ type: Array }) items: NavItem[] = [];

  /**
   * エリアの開閉状態
   *
   * @type {boolean}
   * @memberof FgoNav
   */
  @state() open: boolean = true;

  /**
   * Creates an instance of FillGoApp.
   * @memberof FgoNav
   */
  constructor() {
    super();
  }

  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof FgoNav
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof FgoNav
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof FgoNav
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
   * @memberof FgoNav
   */
  protected render(): HTMLTemplateResult {
    const rootClassMap = classMap({
      open: this.open,
      scrollable: this.scrollable,
    });

    return html`<div id="contents-root" class=${rootClassMap}>
      <header @toggle-expand=${this._expandArea}>
        <slot name="header"></slot>
      </header>
      <main>
        <div class="inner">
          ${repeat(
            this.items,
            (item) => item.id,
            (item) => {
              return html` <fgo-nav-item .item=${item}>
                <wa-icon
                  slot="start"
                  library="my-icons"
                  name=${this.iconName}
                ></wa-icon>
              </fgo-nav-item>`;
            },
          )}
        </div>
      </main>
    </div>`;
  }

  /**
   * ラベルエリアの開閉を制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof FgoNav
   */
  private _expandArea(e: CustomEvent) {
    this.open = e.detail.open;
  }
}
