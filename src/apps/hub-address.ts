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
  static styles = css`
    #contents-root {
      display: grid;
      grid-template-rows: 30px 1fr 25px;
      height: 100vh;

      header {
        background: var(--wa-color-neutral-30);

        display: flex;
        gap: var(--wa-space-2xs);
        align-items: center;

        .app-icon {
          margin-block-start: var(--wa-space-3xs);
        }

        padding-block: var(--wa-space-s);
        padding-inline: var(--wa-space-xs);
      }

      main {
        height: 100%;
        overflow: hidden;

        .app {
          display: block;
          height: 100%;
        }
      }

      footer {
        background: var(--wa-color-neutral-30);
        display: flex;
        gap: 5px;
        align-items: center;

        padding-inline: var(--wa-space-xs);

        .footer {
          flex: 1;

          color: var(--wa-color-neutral-95);
          font-size: var(--wa-font-size-xs);
        }

        .app-name {
          display: flex;
          gap: var(--wa-space-2xs);
          align-items: center;
          justify-content: center;
        }
      }
    }
  `;

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
    return html`<div id="contents-root">
      <header>
        <div class="app-icon">
          <wa-icon library="my-icons" name="icon-hub-address"></wa-icon>
        </div>
        <ap-tool></ap-tool>
      </header>
      <main>
        <hub-address-app></hub-address-app>
      </main>
      <footer>
        <div class="footer"></div>
        <div class="footer"></div>
        <div class="footer app-name">
          <wa-icon library="my-icons" name="caret-right-solid-full"></wa-icon>
          Hub-Address
          <wa-icon library="my-icons" name="caret-left-solid-full"></wa-icon>
        </div>
        <div class="footer"></div>
        <div class="footer"></div>
      </footer>
    </div>`;
  }
}
