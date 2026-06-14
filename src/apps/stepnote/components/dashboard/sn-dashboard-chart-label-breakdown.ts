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
import { LabelBreakdownValue } from "@sn/models/LabelBreakdownValue";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-chart-label-breakdown.lit.scss?inline";

// --- Configuration & Initialization ---

setBasePath("/");

/**
 * ステータスのチャート表示機能
 *
 * @export
 * @class SnDashboardChartLabelBreakdown
 * @extends {LitElement}
 */
@customElement("sn-dashboard-chart-label-breakdown")
export class SnDashboardChartLabelBreakdown extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardChartLabelBreakdown
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * KPI要素の値
   *
   * @type {KpiWidgetValue | undefined}
   * @memberof SnDashboardChartLabelBreakdown
   */
  @property({ type: Array }) labelBreakdownValues?: LabelBreakdownValue[];

  /**
   * ラベル内訳のグラフ
   *
   * @type {HTMLDivElement}
   * @memberof SnDashboardChartLabelBreakdown
   */
  @query("#label-breakdown-chart") labelBreakdownChart!: HTMLDivElement;

  /**
   * チャートのインスタンス
   *
   * @private
   * @type {ApexCharts | null}
   * @memberof SnDashboardChartLabelBreakdown
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
   * @memberof SnDashboardChartLabelBreakdown
   */
  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has("labelBreakdownValues") &&
      this.labelBreakdownValues
    ) {
      var options: ApexOptions = {
        series: [
          {
            name: "開始待ち",
            data: this.labelBreakdownValues?.map((v) => v.pending),
          },
          {
            name: "対応中",
            data: this.labelBreakdownValues?.map((v) => v.progress),
          },
          {
            name: "完了",
            data: this.labelBreakdownValues?.map((v) => v.done),
          },
        ],
        chart: {
          type: "bar",
          height: 350,
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              total: {
                enabled: true,
                offsetX: 5,
                style: {
                  fontSize: "13px",
                  fontWeight: 900,
                },
                formatter: function (val) {
                  return val + "件";
                },
              },
            },
          },
        },
        stroke: {
          width: 1,
          colors: ["#fff"],
        },
        colors: [
          "var(--wa-color-neutral-50)",
          "var(--wa-color-brand-50)",
          "var(--wa-color-success-50)",
        ],
        xaxis: {
          categories: this.labelBreakdownValues?.map((v) => v.label),
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return val + "件";
            },
          },
        },
        fill: {
          opacity: 1,
        },
        legend: {
          position: "top",
          horizontalAlign: "right",
          offsetX: 40,
          fontSize: "13px",
        },
      };

      if (this.chart) {
        this.chart.updateOptions(options);
      } else {
        this.chart = new ApexCharts(this.labelBreakdownChart, options);
        this.chart.render();
      }
    }
  }

  /**
   * 要素が DOM から削除されたときの処理を実行します。
   *
   * @memberof SnDashboardChartLabelBreakdown
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
   * @memberof SnDashboardChartLabelBreakdown
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      <div class="title">ラベル内訳</div>
      <div id="label-breakdown-chart"></div>
    </div>`;
  }
}
