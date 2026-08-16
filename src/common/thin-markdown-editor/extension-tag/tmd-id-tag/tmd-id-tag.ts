// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Extensions & Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "@common/thin-markdown-editor/extension-tag/tmd-id-tag/tmd-id-tag.lit.scss?inline";

// Initializations
setBasePath("/");

@customElement("tmd-id-tag")
export class TmdIdTag extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof TmdIdTag
   */
  static styles = [unsafeCSS(styles)];

  /**
   * 遷移先のタスクID
   *
   * @type {number}
   * @memberof TmdIdTag
   */
  @property({ type: Number }) taskId: number = 0;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * クリックイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof TmdIdTag
   */
  private _handleClick = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    emit(this, "id-click", { detail: { id: this.taskId } });
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * カスタムタグをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof TmdIdTag
   */
  protected render(): HTMLTemplateResult {
    return html`<span class="id-tag" @click=${this._handleClick}>
      [#${this.taskId}] <slot></slot>
    </span>`;
  }
}
