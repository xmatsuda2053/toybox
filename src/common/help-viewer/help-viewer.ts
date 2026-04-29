// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

import { marked } from "marked";
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  breaks: false,
  async: false,
});

// 2. Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import githubMarkdownStyles from "github-markdown-css/github-markdown-light.css?inline";

// 6. Initializations
setBasePath("/");

// 7. Configuration & Initialization ---
export type HelpItem = {
  name: string;
  title: string;
  markdown: string;
};

/**
 * ヘルプ
 *
 * @export
 * @class SnMenu
 * @extends {LitElement}
 */
@customElement("help-viewer")
export class HelpViewer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnMenu
   */
  static styles = [
    css`
      ${unsafeCSS(githubMarkdownStyles)}
    `,
  ];

  /**
   * ヘルプに表示する内容です
   *
   * @type {helpItem[]}
   * @memberof SnMenuHelp
   */
  @property({ type: Array }) helpItems: HelpItem[] = [];

  /**
   * Markdownのレンダリング部品を準備
   *
   * @private
   * @memberof PSTaskReference
   */
  private renderer = new marked.Renderer();

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnMenu
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
   * @memberof SnMenu
   */
  protected render(): HTMLTemplateResult {
    if (this.helpItems.length === 0) return html``;

    return html` <wa-tab-group placement="start">
      ${this.helpItems.map(
        (item) => html` <wa-tab panel="${item.name}">${item.title}</wa-tab>`,
      )}
      ${this.helpItems.map(
        (item) =>
          html` <wa-tab-panel name="${item.name}"
            ><div
              class="contents markdown-body"
              .innerHTML=${this._parse(item.markdown)}
            ></div
          ></wa-tab-panel>`,
      )}
    </wa-tab-group>`;
  }

  /**
   * MarkdownをHTMLにパースします。
   *
   * @private
   * @param {string} markdown
   * @return {*}
   * @memberof SnMenuHelp
   */
  private _parse(markdown: string) {
    return marked.parse(markdown, {
      renderer: this.renderer,
    }) as string;
  }
}
