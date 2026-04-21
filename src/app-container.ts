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
import { classMap } from "lit/directives/class-map.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import { registerIconLibrary } from "@awesome.me/webawesome/dist/webawesome.js";

// 3. Internal Assets & Logic
import { icons } from "@assets/icons";
import "@/library";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./app-container.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");
@customElement("app-container")
export class AppContainer extends LitElement {
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
      <header></header>
      <main>
        <step-note-app></step-note-app>
      </main>
      <footer></footer>
    </div>`;
  }

  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof AppContainer
   */
  static styles = css`
    ${unsafeCSS(styles)}
  `;
}
