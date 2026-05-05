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
import { customElement, query } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaDialog from "@awesome.me/webawesome/dist/components/dialog/dialog.js";
import WaDropdownItem from "@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js";

// 3. Internal Assets & Logic

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@ap/styles/_header-item.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApTool
 * @extends {LitElement}
 */
@customElement("ap-tool")
export class ApTool extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApTool
   */
  static styles = [
    css`
      ${unsafeCSS(styles)}
    `,
  ];

  /**
   * 西暦和暦変換ツール画面
   *
   * @type {WaDialog}
   * @memberof ApTool
   */
  @query("#ad-jpc-converter") adJpcConverter!: WaDialog;

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ApTool
   */
  protected render(): HTMLTemplateResult {
    return html`<wa-dropdown @wa-select=${this._selectTool}>
        <div class="menu-header" slot="trigger">
          <span>Tool(T)</span>
          <wa-icon library="my-icons" name="caret-down-solid-full"></wa-icon>
        </div>
        <wa-dropdown-item value="ad-jpc-converter">
          日付Utility
        </wa-dropdown-item>
      </wa-dropdown>
      <wa-dialog id="ad-jpc-converter" label="日付Utility">
        <ap-tool-date-utility></ap-tool-date-utility>
      </wa-dialog>`;
  }

  /**
   * 選択ツールを表示します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof ApTool
   */
  private _selectTool(e: CustomEvent): void {
    const item: WaDropdownItem = e.detail.item;
    const code: string = item.value;

    switch (code) {
      case "ad-jpc-converter":
        this.adJpcConverter.open = true;
        break;
      default:
      // 何もしない
    }
  }
}
