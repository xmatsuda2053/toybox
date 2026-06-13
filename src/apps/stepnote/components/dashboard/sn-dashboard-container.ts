// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  PropertyValues,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";

// Internal Shared (Utils)
import { getYearList, getCurrentFiscalYear } from "@/utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-container.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);
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
   * @type {KpiWidgetValue}
   * @memberof SnDashboardContainer
   */
  @state() kpiWidgetValues: KpiWidgetValue = {
    total: 0,
    pending: 0,
    progress: 0,
    done: 0,
    upcoming: 0,
    asap: 0,
    overdue: 0,
  };

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
    e.preventDefault();
    e.stopPropagation();

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
  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      <sn-dashboard-header
        .fiscalYear=${this.fiscalYear}
        @change-fiscal-year=${this._handleFiscalYearChange}
      ></sn-dashboard-header>
      <div class="main">
        <sn-dashboard-kpi-container
          .kpiWidgetValues=${this.kpiWidgetValues}
        ></sn-dashboard-kpi-container>
      </div>
    </div>`;
  }
}
