// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { ThinMarkdownEditor } from "@/common/thin-markdown-editor/thin-markdown-editor";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/notebook/sn-notebook-container.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ノートブックコンテナ
 *
 * @export
 * @class SnNotebookContainer
 * @extends {LitElement}
 */
@customElement("sn-notebook-container")
export class SnNotebookContainer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNotebookContainer
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------
  /**
   * エディタの最終行でEnterキーが押下された場合、画面最下部までスクロールします。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
   */
  private _handleKeyupEnterLastLine = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    const parent = target.parentNode as HTMLElement;
    parent.scrollTo({
      top: parent.scrollHeight,
      behavior: "smooth",
    });
  };

  /**
   * Markdown入力イベントを制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnNotebookContainer
   */
  private _handleInput = (e: CustomEvent) => {
    const target = e.target as ThinMarkdownEditor;
    const value = target.value;
    const header1 = e.detail.header1;

    console.log(header1);
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンポーネントのメインレイアウトをレンダリングします。
   * アプリケーションの基本構造を定義します。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof SnNotebookContainer
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="contents-root">
      <nav>
        <sn-notebook-nav></sn-notebook-nav>
      </nav>
      <main>
        <thin-markdown-editor
          deletable
          @keyup-enter-last-line=${this._handleKeyupEnterLastLine}
          @input=${this._handleInput}
        ></thin-markdown-editor>
      </main>
    </div>`;
  }
}
