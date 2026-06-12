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
import { variants } from "@sn/components/dashboard/sn-dashboard-kpi-widget";

// Internal Shared (Utils)
import { getYearList, getCurrentFiscalYear } from "@/utils/DateUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-container.lit.scss?inline";

// --- Configuration & Initialization ---
const yearList = getYearList(2024, new Date().getFullYear() + 1);
const currentFiscalYear = getCurrentFiscalYear();

/**
 * KPI要素描画時の設定
 */
type kpiParam = {
  label: string;
  variant: variants;
  hasTotal?: boolean;
};

const kpiParams: kpiParam[] = [
  {
    label: "タスク総数",
    variant: "total",
  },
  {
    label: "開始待ち",
    variant: "pending",
  },
  {
    label: "対応中",
    variant: "progress",
  },
  {
    label: "完了",
    variant: "done",
    hasTotal: true,
  },
  {
    label: "",
    variant: "separator",
  },
  {
    label: "期限間近",
    variant: "upcoming",
  },
  {
    label: "期限当日",
    variant: "asap",
  },
  {
    label: "期限切れ",
    variant: "overdue",
  },
];

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
  @state() kpiWidgetValue: KpiWidgetValue = {
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
    [this.kpiWidgetValue] = await snDB.dashboardQuery.getDashboardData(
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
   * @param {Event} e
   * @memberof SnDashboardContainer
   */
  private _handleFiscalYearChange(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaSelect;
    this.fiscalYear = Number(target.value);
  }

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
      <div class="header">
        <div class="title">DASHBOARD</div>
        ${this._renderFiscalYear()}
      </div>
      <div class="main">
        <div class="row kpi">${this._renderKpi()}</div>
      </div>
    </div>`;
  }

  /**
   * 年度をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardContainer
   */
  private _renderFiscalYear(): HTMLTemplateResult {
    return html`<div class="contents">
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
    </div>`;
  }

  /**
   * KPI要素をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardContainer
   */
  private _renderKpi(): HTMLTemplateResult {
    return html`${kpiParams.map((param) => {
      if (param.variant === "separator") {
        return html`<wa-divider orientation="vertical"></wa-divider>`;
      }
      return html`<sn-dashboard-kpi-widget
        .variant=${param.variant}
        .value=${this.kpiWidgetValue[param.variant]}
        .total=${param.hasTotal ? this.kpiWidgetValue.total : 0}
      >
        ${param.label}
      </sn-dashboard-kpi-widget>`;
    })}`;
  }
}
