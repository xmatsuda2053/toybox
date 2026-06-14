// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";

// Internal Shared (Codes, Models, Database)

// Internal Shared (Utils)
import { getYearList } from "@/utils/DateUtils";
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-header.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);

setBasePath("/");

/**
 * ダッシュボードのヘッダー機能
 *
 * @export
 * @class SnDashboardHeader
 * @extends {LitElement}
 */
@customElement("sn-dashboard-header")
export class SnDashboardHeader extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardHeader
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中年度
   *
   * @type {number}
   * @memberof SnDashboardHeader
   */
  @property({ type: Number }) fiscalYear: number = new Date().getFullYear();

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 年度の変更イベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof SnDashboardHeader
   */
  private _handleFiscalYearChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaSelect;
    this.fiscalYear = Number(target.value);

    emit(this, "change-fiscal-year", {
      detail: { fiscalYear: this.fiscalYear },
    });
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardHeader
   */
  protected render(): HTMLTemplateResult {
    return html` <div class="container">
      <div class="title">DASHBOARD</div>
      <div class="contents">
        <wa-tooltip for="task-fiscal-year" placement="right">年度</wa-tooltip>
        <wa-select
          id="task-fiscal-year"
          name="taskFiscalYear"
          size="small"
          value=${this.fiscalYear}
          @change=${this._handleFiscalYearChange}
        >
          <wa-icon
            library="my-icons"
            name="calendar-regular-full"
            slot="end"
          ></wa-icon>
          ${yearList.map((year) => {
            return html`<wa-option value=${year}>${year}年度</wa-option>`;
          })}
        </wa-select>
      </div>
    </div>`;
  }
}
