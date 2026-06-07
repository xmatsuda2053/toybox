// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state, property } from "lit/decorators.js";

// Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./copy-button.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * コピー専用ボタン
 *
 * @export
 * @class CopyButton
 * @extends {LitElement}
 */
@customElement("copy-button")
export class CopyButton extends LitElement {
  /**
   * ボタンサイズ
   *
   * @type {("small" | "medium" | "large")}
   * @memberof CopyButton
   */
  @property({ type: String }) size: "small" | "medium" | "large" = "small";

  /**
   * ボタンスタイル
   *
   * @type {("outlined" | "filled" | "outlined")}
   * @memberof CopyButton
   */
  @property({ type: String }) appearance:
    | "accent"
    | "filled-outlined"
    | "filled"
    | "outlined"
    | "plain" = "outlined";

  @property({ type: String }) variant:
    | "neutral"
    | "brand"
    | "success"
    | "warning"
    | "danger" = "neutral";

  /**
   * コピー状態を管理するフラグ
   *
   * @private
   * @memberof CopyButton
   */
  @state() private _isCopied = false;

  /**
   * タイマーのIDを管理
   *
   * @private
   * @type {number}
   * @memberof CopyButton
   */
  private _timerId?: number;

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnTaskSummary
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * コンポーネント削除時
   *
   * @memberof CopyButton
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer(); // コンポーネント消滅時にタイマーを確実に止める
  }

  /**
   * タイマーをクリア
   *
   * @private
   * @memberof CopyButton
   */
  private _clearTimer() {
    if (this._timerId !== undefined) {
      window.clearTimeout(this._timerId);
      this._timerId = undefined;
    }
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------
  /**
   * クリックイベント
   *
   * @private
   * @memberof CopyButton
   */
  private _handleClick = () => {
    this._clearTimer();

    this._isCopied = true;

    this._timerId = window.setTimeout(() => {
      this._isCopied = false;
      this._timerId = undefined;
    }, 1250);

    emit(this, "copy");
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------
  /**
   * コンポーネントをレンダリングします。
   *
   * @return {*}
   * @memberof CopyButton
   */
  render(): HTMLTemplateResult {
    return html`
      <wa-tooltip for="btn-copy" placement="top"><slot></slot></wa-tooltip>
      <wa-button
        id="btn-copy"
        size=${this.size}
        appearance=${this.appearance}
        variant=${this.variant}
        class=${this._isCopied ? "is-copied" : ""}
        @click=${this._handleClick}
      >
        <div class="lapper-icon">
          <wa-icon
            class="check"
            library="my-icons"
            name="check-solid-full"
          ></wa-icon>
          <wa-icon
            class="copy"
            library="my-icons"
            name="clipboard-regular-full"
          ></wa-icon>
        </div>
      </wa-button>
    `;
  }
}
