// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  PropertyValues,
  nothing,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";

// Internal Shared (Utils)
import { getCurrentFiscalYear } from "@/utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-container.lit.scss?inline";

// --- Configuration & Initialization ---
const currentFiscalYear = getCurrentFiscalYear();

setBasePath("/");

/**
 * ダッシュボード本体
 *
 * @export
 * @class SnDashboardContainer
 * @extends {LitElement}
 */
@customElement("sn-dashboard-container")
export class SnDashboardContainer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardContainer
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中の年度
   *
   * @type {number}
   * @memberof SnDashboardContainer
   */
  @state() fiscalYear: number = currentFiscalYear;

  /**
   * KPI要素の値
   *
   * @type {KpiWidgetValue | undefined}
   * @memberof SnDashboardContainer
   */
  @state() kpiWidgetValues?: KpiWidgetValue;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------
  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof SnDashboardContainer
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);

    if (_changedProperties.has("fiscalYear")) {
      this._getDashboardData();
    }
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * ダッシュボード用のデータを取得します。
   *
   * @private
   * @memberof SnDashboardContainer
   */
  private _getDashboardData = async () => {
    [this.kpiWidgetValues] = await snDB.dashboardQuery.getDashboardData(
      this.fiscalYear,
    );
  };

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 年度の変更イベントを処理します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnDashboardContainer
   */
  private _handleFiscalYearChange = (e: CustomEvent) => {
    this.fiscalYear = e.detail.fiscalYear;
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardContainer
   */
  protected render(): HTMLTemplateResult | typeof nothing {
    if (!this.kpiWidgetValues) return nothing;

    return html`<div class="container">
      <sn-dashboard-header
        .fiscalYear=${this.fiscalYear}
        @change-fiscal-year=${this._handleFiscalYearChange}
      ></sn-dashboard-header>
      <div class="main">
        <sn-dashboard-kpi-container
          class="row"
          .kpiWidgetValues=${this.kpiWidgetValues}
        ></sn-dashboard-kpi-container>
        <sn-dashboard-status-chart
          class="row"
          .kpiWidgetValues=${this.kpiWidgetValues}
        ></sn-dashboard-status-chart>
      </div>
    </div>`;
  }
}
