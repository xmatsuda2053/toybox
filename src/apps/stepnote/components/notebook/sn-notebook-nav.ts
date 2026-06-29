// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/notebook/sn-notebook-nav.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ナビゲーションバー
 *
 * @export
 * @class SnNotebookNav
 * @extends {LitElement}
 */
@customElement("sn-notebook-nav")
export class SnNotebookNav extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnNotebookNav
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * ナビゲーションバーのコンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnNotebookNav
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="contents-root">
      <header>
        <span class="label">NOTEBOOK</span>
        <wa-icon id="btn-add" library="my-icons" name="plus-solid-full">
        </wa-icon>
      </header>
      <search-input></search-input>
      <main>
        <sn-notebook-nav-item pinned>item001</sn-notebook-nav-item>
        <sn-notebook-nav-item selected>item002</sn-notebook-nav-item>
        <sn-notebook-nav-item>item003</sn-notebook-nav-item>
        <sn-notebook-nav-item>item004</sn-notebook-nav-item>
        <sn-notebook-nav-item>item005</sn-notebook-nav-item>
        <sn-notebook-nav-item>item006</sn-notebook-nav-item>
        <sn-notebook-nav-item>item007</sn-notebook-nav-item>
        <sn-notebook-nav-item>item008</sn-notebook-nav-item>
        <sn-notebook-nav-item>item009</sn-notebook-nav-item>
        <sn-notebook-nav-item>item010</sn-notebook-nav-item>
        <sn-notebook-nav-item>item011</sn-notebook-nav-item>
        <sn-notebook-nav-item>item012</sn-notebook-nav-item>
        <sn-notebook-nav-item>item013</sn-notebook-nav-item>
        <sn-notebook-nav-item>item014</sn-notebook-nav-item>
        <sn-notebook-nav-item>item015</sn-notebook-nav-item>
        <sn-notebook-nav-item>item016</sn-notebook-nav-item>
        <sn-notebook-nav-item>item017</sn-notebook-nav-item>
        <sn-notebook-nav-item>item018</sn-notebook-nav-item>
        <sn-notebook-nav-item>item019</sn-notebook-nav-item>
        <sn-notebook-nav-item>item020</sn-notebook-nav-item>
        <sn-notebook-nav-item>item021</sn-notebook-nav-item>
        <sn-notebook-nav-item>item022</sn-notebook-nav-item>
        <sn-notebook-nav-item>item023</sn-notebook-nav-item>
        <sn-notebook-nav-item>item024</sn-notebook-nav-item>
        <sn-notebook-nav-item>item025</sn-notebook-nav-item>
        <sn-notebook-nav-item>item026</sn-notebook-nav-item>
        <sn-notebook-nav-item>item027</sn-notebook-nav-item>
        <sn-notebook-nav-item>item028</sn-notebook-nav-item>
        <sn-notebook-nav-item>item029</sn-notebook-nav-item>
        <sn-notebook-nav-item>item030</sn-notebook-nav-item>
      </main>
    </div>`;
  }
}
