// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  PropertyValues,
} from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, query, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import ApexCharts from "apexcharts";
import { ApexOptions } from "apexcharts";

// Internal Shared (Codes, Models, Database)
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-chart-status.lit.scss?inline";

// --- Configuration & Initialization ---

setBasePath("/");

/**
 * ステータスのチャート表示機能
 *
 * @export
 * @class SnDashboardChartStatus
 * @extends {LitElement}
 */
@customElement("sn-dashboard-chart-status")
export class SnDashboardChartStatus extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardChartStatus
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * KPI要素の値
   *
   * @type {KpiWidgetValue | undefined}
   * @memberof SnDashboardChartStatus
   */
  @property({ type: Object }) kpiWidgetValues?: KpiWidgetValue;

  /**
   * タスク状態のグラフ
   *
   * @type {HTMLDivElement}
   * @memberof SnDashboardChartStatus
   */
  @query("#status-chart") statusChart!: HTMLDivElement;

  /**
   * チャートのインスタンス
   *
   * @private
   * @type {ApexCharts | null}
   * @memberof SnDashboardChartStatus
   */
  private chart: ApexCharts | null = null;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * 画面更新後の処理を実行します。
   *
   * @protected
   * @param {PropertyValues} changedProperties
   * @memberof SnDashboardChartStatus
   */
  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has("kpiWidgetValues") && this.kpiWidgetValues) {
      var options: ApexOptions = {
        series: [
          this.kpiWidgetValues.pending,
          this.kpiWidgetValues.progress,
          this.kpiWidgetValues.done,
        ],
        chart: {
          type: "donut",
          height: 350,
        },
        legend: {
          show: true,
          fontSize: "13px",
          position: "top",
          horizontalAlign: "center",
        },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                total: {
                  showAlways: true,
                  show: true,
                  label: "タスク総数",
                },
              },
            },
          },
        },
        dataLabels: {
          enabled: false,
        },

        labels: ["開始待ち", "対応中", "完了"],
        colors: [
          "var(--wa-color-neutral-50)",
          "var(--wa-color-brand-50)",
          "var(--wa-color-success-50)",
        ],
      };

      if (this.chart) {
        this.chart.updateOptions(options);
      } else {
        this.chart = new ApexCharts(this.statusChart, options);
        this.chart.render();
      }
    }
  }

  /**
   * 要素が DOM から削除されたときの処理を実行します。
   *
   * @memberof SnDashboardChartStatus
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * チャートをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardChartStatus
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      <div class="title">ステータス別内訳</div>
      <div id="status-chart"></div>
    </div>`;
  }
}
