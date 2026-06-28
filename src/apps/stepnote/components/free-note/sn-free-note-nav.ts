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
import styles from "@sn/styles/free-note/sn-free-note-nav.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * ナビゲーションバー
 *
 * @export
 * @class SnFreeNoteNav
 * @extends {LitElement}
 */
@customElement("sn-free-note-nav")
export class SnFreeNoteNav extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnFreeNoteContainer
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
   * @memberof SnFreeNoteNav
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="contents-root">
      <header>
        <span class="label">FREE NOTE</span>
        <wa-icon id="btn-add" library="my-icons" name="plus-solid-full">
        </wa-icon>
      </header>
      <search-input></search-input>
      <main>
        <sn-free-note-nav-item pinned>item001</sn-free-note-nav-item>
        <sn-free-note-nav-item selected>item002</sn-free-note-nav-item>
        <sn-free-note-nav-item>item003</sn-free-note-nav-item>
        <sn-free-note-nav-item>item004</sn-free-note-nav-item>
        <sn-free-note-nav-item>item005</sn-free-note-nav-item>
        <sn-free-note-nav-item>item006</sn-free-note-nav-item>
        <sn-free-note-nav-item>item007</sn-free-note-nav-item>
        <sn-free-note-nav-item>item008</sn-free-note-nav-item>
        <sn-free-note-nav-item>item009</sn-free-note-nav-item>
        <sn-free-note-nav-item>item010</sn-free-note-nav-item>
        <sn-free-note-nav-item>item011</sn-free-note-nav-item>
        <sn-free-note-nav-item>item012</sn-free-note-nav-item>
        <sn-free-note-nav-item>item013</sn-free-note-nav-item>
        <sn-free-note-nav-item>item014</sn-free-note-nav-item>
        <sn-free-note-nav-item>item015</sn-free-note-nav-item>
        <sn-free-note-nav-item>item016</sn-free-note-nav-item>
        <sn-free-note-nav-item>item017</sn-free-note-nav-item>
        <sn-free-note-nav-item>item018</sn-free-note-nav-item>
        <sn-free-note-nav-item>item019</sn-free-note-nav-item>
        <sn-free-note-nav-item>item020</sn-free-note-nav-item>
        <sn-free-note-nav-item>item021</sn-free-note-nav-item>
        <sn-free-note-nav-item>item022</sn-free-note-nav-item>
        <sn-free-note-nav-item>item023</sn-free-note-nav-item>
        <sn-free-note-nav-item>item024</sn-free-note-nav-item>
        <sn-free-note-nav-item>item025</sn-free-note-nav-item>
        <sn-free-note-nav-item>item026</sn-free-note-nav-item>
        <sn-free-note-nav-item>item027</sn-free-note-nav-item>
        <sn-free-note-nav-item>item028</sn-free-note-nav-item>
        <sn-free-note-nav-item>item029</sn-free-note-nav-item>
        <sn-free-note-nav-item>item030</sn-free-note-nav-item>
      </main>
    </div>`;
  }
}
