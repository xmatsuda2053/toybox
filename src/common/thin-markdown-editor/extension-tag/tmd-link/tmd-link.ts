// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@common/thin-markdown-editor/extension-tag/tmd-link/tmd-link.lit.scss?inline";

// Initializations
setBasePath("/");

@customElement("tmd-link")
export class TmdLink extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof TmdLink
   */
  static styles = [unsafeCSS(styles)];

  /**
   * URL
   *
   * @type {string}
   * @memberof TmdLink
   */
  @property({ type: String }) href: string = "";

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * クリックイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof TmdLink
   */
  private _handleClick = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.href) {
      try {
        await navigator.clipboard.writeText(this.href);
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
   * @memberof TmdLink
   */
  protected render(): HTMLTemplateResult {
    return html`<span class="md-link" @click=${this._handleClick}>
      ${this._renderIcon()}
      <slot></slot>
    </span>`;
  }

  /**
   * アイコンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof TmdLink
   */
  private _renderIcon(): HTMLTemplateResult {
    let icon: string;

    if (this.href.startsWith("http")) {
      icon = "globe-solid-full";
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.href)) {
      icon = "envelope-solid-full";
    } else {
      icon = "folder-open-solid-full";
    }

    return html`<wa-icon library="my-icons" name="${icon}"></wa-icon>`;
  }
}
