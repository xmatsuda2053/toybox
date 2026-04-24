// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/menu/sn-menu.lit.scss?inline";

// 6. Initializations
setBasePath("/");

/**
 * メニュー
 *
 * @export
 * @class SnMenu
 * @extends {LitElement}
 */
@customElement("sn-menu")
export class SnMenu extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnMenu
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
   * メニューボタンをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnMenu
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <!--エクスプローラーボタン-->
      <div class="field active">
        <wa-tooltip for="btn-explore" placement="right"> Explore </wa-tooltip>
        <wa-button
          variant="neutral"
          appearance="accent"
          id="btn-explore"
          @click=${() => emit(this, "click-menu-explore")}
        >
          <wa-icon library="my-icons" name="file-regular-full"></wa-icon>
        </wa-button>
      </div>

      <!--インポートボタン-->
      <div class="field bottom">
        <wa-tooltip for="btn-import" placement="right">Import</wa-tooltip>
        <wa-button
          variant="neutral"
          appearance="accent"
          id="btn-import"
          @click=${() => emit(this, "click-menu-import")}
        >
          <wa-icon library="my-icons" name="upload-solid-full"></wa-icon>
        </wa-button>
      </div>

      <!--エクスポートボタン-->
      <div class="field">
        <wa-tooltip for="btn-export" placement="right">Export</wa-tooltip>
        <wa-button
          variant="neutral"
          appearance="accent"
          id="btn-export"
          @click=${() => emit(this, "click-menu-export")}
        >
          <wa-icon library="my-icons" name="download-solid-full"></wa-icon>
        </wa-button>
      </div>

      <!--設定ボタン-->
      <div class="field">
        <wa-button
          variant="neutral"
          appearance="accent"
          id="config-button"
          @click=${() => emit(this, "click-menu-config")}
        >
          <wa-icon library="my-icons" name="gear-solid-full"></wa-icon>
        </wa-button>
      </div>
    </div>`;
  }
}
