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
import styles from "@sn/styles/dashboard/sn-dashboard-status-chart.lit.scss?inline";

// --- Configuration & Initialization ---

setBasePath("/");

/**
 * ステータスのチャート表示機能
 *
 * @export
 * @class SnDashboardStatusChart
 * @extends {LitElement}
 */
@customElement("sn-dashboard-status-chart")
export class SnDashboardStatusChart extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardStatusChart
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * KPI要素の値
   *
   * @type {KpiWidgetValue | undefined}
   * @memberof SnDashboardStatusChart
   */
  @property({ type: Object }) kpiWidgetValues?: KpiWidgetValue;

  /**
   * タスク状態のグラフ
   *
   * @type {HTMLDivElement}
   * @memberof SnDashboardStatusChart
   */
  @query("#status-chart") statusChart!: HTMLDivElement;

  /**
   * チャートのインスタンス
   *
   * @private
   * @type {ApexCharts | null}
   * @memberof SnDashboardStatusChart
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
   * @memberof SnDashboardStatusChart
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
        },
        legend: {
          fontSize: "16px",
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
        colors: ["#717584", "#0071ec", "#00883c"],
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
   * @memberof SnDashboardStatusChart
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

  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      <div class="title">ステータス別内訳</div>
      <div id="status-chart"></div>
    </div>`;
  }
}
