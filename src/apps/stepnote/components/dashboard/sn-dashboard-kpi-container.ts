// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// Lit Extensions (Decorators & Directives)
import { customElement, property } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";
import { variants } from "@sn/components/dashboard/sn-dashboard-kpi-widget";

// Internal Shared (Utils)
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-kpi-container.lit.scss?inline";

// --- Configuration & Initialization ---

/**
 * KPI要素描画の設定定義
 */
type kpiParam = {
  label: string;
  variant?: variants;
  hasTotal?: boolean;
  animation?: boolean;
  clickable?: boolean;
};

/**
 * KPI要素描画の設定
 */
const kpiParams: kpiParam[] = [
  {
    label: "タスク総数",
    variant: "total",
  },
  {
    label: "開始待ち",
    variant: "pending",
    clickable: true,
  },
  {
    label: "対応中",
    variant: "progress",
    clickable: true,
  },
  {
    label: "完了",
    variant: "done",
    hasTotal: true,
  },
  {
    label: "",
    variant: undefined,
  },
  {
    label: "期限間近",
    variant: "upcoming",
    animation: true,
    clickable: true,
  },
  {
    label: "期限当日",
    variant: "asap",
    animation: true,
    clickable: true,
  },
  {
    label: "期限切れ",
    variant: "overdue",
    animation: true,
    clickable: true,
  },
];

setBasePath("/");

/**
 * ダッシュボードのKPIコンテナ
 *
 * @export
 * @class SnDashboardKpiContainer
 * @extends {LitElement}
 */
@customElement("sn-dashboard-kpi-container")
export class SnDashboardKpiContainer extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardKpiContainer
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * KPI要素の値
   *
   * @type {KpiWidgetValue}
   * @memberof SnDashboardKpiContainer
   */
  @property({ type: Object }) kpiWidgetValues: KpiWidgetValue = {
    total: 0,
    pending: 0,
    progress: 0,
    done: 0,
    upcoming: 0,
    asap: 0,
    overdue: 0,
  };

  /**
   * 選択中のラベルID
   *
   * @type {(number | undefined)}
   * @memberof SnDashboardKpiContainer
   */
  @property({ type: Number }) labelId: number | undefined = undefined;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * ウィジェットのクリック処理を制御します。
   *
   * @private
   * @param {CustomEvent} e
   * @memberof SnDashboardKpiContainer
   */
  private _handleKpiWidgetClick = async (e: CustomEvent) => {
    switch (e.detail.variant) {
      case "upcoming":
        await snDB.dashboardRepo.changeUpcomingMode(this.labelId);
        break;
      case "asap":
        await snDB.dashboardRepo.changeAsapMode(this.labelId);
        break;
      case "overdue":
        await snDB.dashboardRepo.changeOverdueMode(this.labelId);
        break;
      case "pending":
        await snDB.dashboardRepo.changePendingMode(this.labelId);
        break;
      case "progress":
        await snDB.dashboardRepo.changeProgressMode(this.labelId);
        break;
      default:
        break;
    }

    emit(this, "to-main-content");
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardKpiContainer
   */
  protected render(): HTMLTemplateResult {
    return html`<div class="container">
      ${kpiParams.map((param) => {
        if (!param.variant) {
          return html`<wa-divider orientation="vertical"></wa-divider>`;
        }
        return html`<sn-dashboard-kpi-widget
          .variant=${param.variant}
          .value=${this.kpiWidgetValues[param.variant]}
          .total=${param.hasTotal ? this.kpiWidgetValues.total : 0}
          .animation=${param.animation ?? false}
          .clickable=${param.clickable ?? false}
          @click-kpi-widget=${this._handleKpiWidgetClick}
        >
          ${param.label}
        </sn-dashboard-kpi-widget>`;
      })}
    </div>`;
  }
}
