// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";
import WaNumberInput from "@awesome.me/webawesome/dist/components/number-input/number-input.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { Config } from "@sn/models/Config";

// Internal Shared (Utils)
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import itemStyles from "@sn/styles/config/sn-config-item.lit.scss?inline";

// --- Configuration & Initialization ---
setBasePath("/");

/**
 * タスク期日通知日数
 *
 * @export
 * @class SnConfigTaskLimitDay
 * @extends {LitElement}
 */
@customElement("sn-config-task-limit-day")
export class SnConfigTaskLimitDay extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnConfigTaskLimitDay
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(itemStyles)];

  /**
   * 設定データ
   *
   * @type {Config}
   * @memberof SnConfigTaskLimitDay
   */
  @property({ type: Object }) config!: Config<{ day: string }>;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 設定値更新時のイベントを処理します。
   *
   * @private
   * @param {Event} e
   * @return {*}
   * @memberof SnConfigTaskLimitDay
   */
  private _handleValueChange = (e: Event) => {
    const target = e.target as WaNumberInput;
    if (!target) return;
    if (!target.value) return;

    const newConfig = { ...this.config };
    newConfig.value.day = target.value;

    emit(this, "update-config", { detail: { config: newConfig } });
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnConfigTaskLimitDay
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    return html`<header>
        <span>期日の ${this.config.value.day} 日前から通知する</span>
        <wa-tooltip for="help" placement="right">
          期限日が近づいていることを通知する際の基準日数
        </wa-tooltip>
        <wa-icon
          id="help"
          class="help-icon"
          library="my-icons"
          name="circle-question-regular-full"
        ></wa-icon>
      </header>
      <main>
        <wa-number-input
          .value=${this.config.value.day}
          min="3"
          size="small"
          style="max-width: 180px;"
          @change=${this._handleValueChange}
        ></wa-number-input>
      </main>`;
  }
}
