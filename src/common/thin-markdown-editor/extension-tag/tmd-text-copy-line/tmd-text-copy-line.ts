// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@common/thin-markdown-editor/extension-tag/tmd-text-copy-line/tmd-text-copy-line.lit.scss?inline";

// Initializations
setBasePath("/");

@customElement("tmd-text-copy-line")
export class TmdTextCopyLine extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof TmdTextCopyLine
   */
  static styles = [unsafeCSS(styles)];

  /**
   * コピー用のテキスト
   *
   * @type {string}
   * @memberof TmdTextCopyLine
   */
  @property({ type: String }) copyText: string = "";

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * クリックイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof TmdTextCopyLine
   */
  private _handleClick = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.copyText) {
      try {
        const rawText = this.copyText.replace(/%5C/g, "\\");
        await navigator.clipboard.writeText(rawText);
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    }
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * カスタムタグをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof TmdTextCopyLine
   */
  protected render(): HTMLTemplateResult {
    return html`<span class="text-copy-line" @click=${this._handleClick}>
      <wa-icon library="my-icons" name="clipboard-regular-full"></wa-icon>
      <span class="label">
        <slot></slot>
      </span>
    </span>`;
  }
}
