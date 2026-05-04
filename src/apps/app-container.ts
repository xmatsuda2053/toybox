// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Library Extensions & Third-party
import { customElement, state } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { registerIconLibrary } from "@awesome.me/webawesome/dist/webawesome.js";

// 3. Internal Assets & Logic
import "@/library";
import { icons } from "@assets/icons";
import { AppItem } from "@ap/models/AppItem";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@apps/app-container.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class AppContainer
 * @extends {LitElement}
 */
@customElement("app-container")
export class AppContainer extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof AppContainer
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;

  /**
   * 選択中のアプリ
   *
   * @type {App}
   * @memberof AppContainer
   */
  @state() selectedApp: AppItem = {
    code: "",
    label: "",
    tag: html``,
    key: "F1",
  };

  /**
   * Creates an instance of AppContainer.
   * @memberof AppContainer
   */
  constructor() {
    super();

    // 独自アイコンを登録
    registerIconLibrary("my-icons", {
      resolver: (name: string) => {
        if (name in icons) {
          return `data:image/svg+xml;utf8,${encodeURIComponent(icons[name])}`;
        }
        return "";
      },
      mutator: (svg) => svg.setAttribute("fill", "currentColor"),
    });
  }

  /**
   * コンポーネント追加時
   *
   * @memberof SnMenu
   */
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * コンポーネント破棄時にリスナーを削除（メモリリーク防止）
   *
   * @memberof AppContainer
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof AppContainer
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof AppContainer
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <header>
        <div class="app-icon">
          <wa-icon library="my-icons" name="cubes-stacked-solid-full"></wa-icon>
        </div>
        <ap-file></ap-file>
        <ap-selector @set-app=${this._setApp}></ap-selector>
        <wa-dropdown>
          <div class="menu-header" slot="trigger">
            <span>Tool(T)</span>
            <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
          </div>
          <wa-dropdown-item>xxx</wa-dropdown-item>
        </wa-dropdown>
      </header>
      <main>${this.selectedApp.tag}</main>
      <footer>
        <div class="footer"></div>
        <div class="footer"></div>
        <div class="footer app-name">
          <wa-icon library="my-icons" name="caret-right-solid-full"></wa-icon>
          ${this.selectedApp.label}
          <wa-icon library="my-icons" name="caret-left-solid-full"></wa-icon>
        </div>
        <div class="footer"></div>
        <div class="footer"></div>
      </footer>
    </div>`;
  }

  /**
   * メニュー選択したアプリをセットします。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof AppContainer
   */
  private _setApp(e: CustomEvent) {
    this.selectedApp = e.detail.app;
  }
}
