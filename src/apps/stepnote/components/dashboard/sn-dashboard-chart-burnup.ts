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
import { BurnupValue } from "@sn/models/BurnupValue";

// Internal Shared (Utils)

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-chart-burnup.lit.scss?inline";

// --- Configuration & Initialization ---

setBasePath("/");

/**
 * ステータスのチャート表示機能
 *
 * @export
 * @class SnDashboardChartBurnUp
 * @extends {LitElement}
 */
@customElement("sn-dashboard-chart-burnup")
export class SnDashboardChartBurnUp extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardChartBurnUp
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 選択中の年度
   *
   * @type {number}
   * @memberof SnDashboardContainer
   */
  @property({ type: Number }) fiscalYear: number = 0;

  /**
   * タスク追加推移
   * */
  @property({ type: Array }) burnupCreateCountValues?: BurnupValue[];

  /**
   * タスク完了推移
   *
   * @type {BurnupValue[]}
   * @memberof SnDashboardChartBurnUp
   */
  @property({ type: Array }) burnupDoneCountValues?: BurnupValue[];

  /**
   * チャート描画エリア
   *
   * @type {HTMLDivElement}
   * @memberof SnDashboardChartBurnUp
   */
  @query("#burnup-chart") burnupChart!: HTMLDivElement;

  /**
   * チャートのインスタンス
   *
   * @private
   * @type {ApexCharts | null}
   * @memberof SnDashboardChartBurnUp
   */
  private chart: ApexCharts | null = null;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * チャートを再描画します。
   *
   * @protected
   * @param {PropertyValues} changedProperties
   * @memberof SnDashboardChartBurnUp
   */
  protected async updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    // チャート表示に必要なデータプロパティの更新を監視
    const hasDataChanged =
      changedProperties.has("burnupCreateCountValues") ||
      changedProperties.has("burnupDoneCountValues");

    // データが更新され、かつ必須データ（タスク作成数）が存在する場合に描画を実行
    if (hasDataChanged && this.burnupCreateCountValues) {
      this._renderOrUpdateChart();
    }
  }

  /**
   * チャートの初期描画、または既存チャートの更新処理を行います。
   *
   * @private
   * @memberof SnDashboardChartBurnUp
   */
  private _renderOrUpdateChart() {
    if (!this.burnupCreateCountValues) return;

    // X軸のカテゴリ情報を生成（重複して生成しないように共通変数化）
    const categories = this.burnupCreateCountValues.map((v) => v.label);
    const options = this._createChartOptions(categories);

    if (this.chart) {
      // 既にチャートが存在する場合はオプション更新で再描画（アニメーションを伴う）
      this.chart.updateOptions(options);
    } else {
      // 初回は新規にチャートインスタンスを作成しレンダリング
      this.chart = new ApexCharts(this.burnupChart, options);
      this.chart.render();
    }
  }

  /**
   * ApexCharts に渡すオプションオブジェクトを生成します。
   *
   * @private
   * @param {string[]} categories X軸のカテゴリ一覧
   * @return {*}  {ApexOptions}
   * @memberof SnDashboardChartBurnUp
   */
  private _createChartOptions(categories: string[]): ApexOptions {
    return {
      series: [
        {
          name: "タスク総数",
          data: this.burnupCreateCountValues?.map((v) => v.count) ?? [],
        },
        {
          name: "タスク完了数",
          data: this.burnupDoneCountValues?.map((v) => v.count) ?? [],
        },
      ],
      colors: ["var(--wa-color-neutral-20)", "var(--wa-color-success-50)"],
      legend: {
        show: true,
        showForSingleSeries: true,
        position: "top",
        horizontalAlign: "right",
      },
      annotations: {
        xaxis: this._createAnnotationsXaxis(categories),
      },
      chart: {
        height: 350,
        type: "line",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      markers: {
        size: 6,
        shape: "square",
      },
      stroke: {
        curve: "monotoneCubic",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: categories,
      },
    };
  }

  /**
   * X軸に対する当月の縦ラインアノテーション（annotations.xaxis）の設定を生成します。
   *
   * @private
   * @param {string[]} categories X軸のカテゴリ一覧
   * @return {*}  {(ApexOptions["annotations"]["xaxis"] | undefined)}
   * @memberof SnDashboardChartBurnUp
   */
  private _createAnnotationsXaxis(categories: string[]) {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // マッチング判定用の当月表現の候補リスト
    const candidateLabels = [
      `${currentMonth}月`,
      `${String(currentMonth).padStart(2, "0")}月`,
      `${currentYear}/${String(currentMonth).padStart(2, "0")}`,
      `${currentYear}-${String(currentMonth).padStart(2, "0")}`,
    ];

    // 表示するX軸カテゴリの中に当月に該当するものがあるか検索
    const matchedLabel = categories.find((label) =>
      candidateLabels.includes(label),
    );

    if (!matchedLabel) {
      return undefined;
    }

    return [
      {
        x: matchedLabel,
        borderColor: "var(--wa-color-red-50)",
        strokeDashArray: 4,
        label: {
          borderColor: "var(--wa-color-red-50)",
          style: {
            color: "#fff",
            background: "var(--wa-color-red-50)",
          },
          text: "This Month",
        },
      },
    ];
  }

  /**
   * 要素が DOM から削除されたときの処理を実行します。
   *
   * @memberof SnDashboardChartBurnUp
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
   * @memberof SnDashboardChartBurnUp
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      <div class="title">タスク進捗推移</div>
      <div id="burnup-chart"></div>
    </div>`;
  }
}
