// 1. Core Libraries
import { css, html, LitElement, type HTMLTemplateResult } from "lit";

// 2. Library Extensions & Third-party
import { customElement } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 3. Internal Assets & Logic
import "@/library";
import { registerIcons } from "@/utils/CommonUtils";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class HubAddress
 * @extends {LitElement}
 */
@customElement("hub-address")
export class HubAddress extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof HubAddress
   */
  static styles = css``;

  /**
   * Creates an instance of HubAddress.
   * @memberof HubAddress
   */
  constructor() {
    super();
    registerIcons();
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof HubAddress
   */
  protected render(): HTMLTemplateResult {
    console.log("render");
    return html`<hub-address-app></hub-address-app>`;
  }
}
