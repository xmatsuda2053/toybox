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
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// Internal Shared (Codes, Models, Database)

// Internal Shared (Utils)
import { financial } from "@/utils/CommonUtils";
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@sn/styles/dashboard/sn-dashboard-kpi-widget.lit.scss?inline";

setBasePath("/");

/**
 * KPIの種類の定義
 *
 * @export
 * */
export type variants =
  | "total"
  | "pending"
  | "progress"
  | "done"
  | "upcoming"
  | "asap"
  | "overdue";

/**
 * アイコン定義
 */
interface icon {
  name: string;
  variant: variants;
}

/**
 * アイコン種類
 */
const icons: icon[] = [
  {
    name: "sliders-solid-full",
    variant: "total",
  },
  {
    name: "circle-stop-solid-full",
    variant: "pending",
  },
  {
    name: "circle-play-solid-full",
    variant: "progress",
  },
  {
    name: "circle-check-solid-full",
    variant: "done",
  },
  {
    name: "fire-solid-full",
    variant: "overdue",
  },

  {
    name: "triangle-exclamation-solid-full",
    variant: "asap",
  },
  {
    name: "calendar-solid-full",
    variant: "upcoming",
  },
];

/**
 * ダッシュボードウェジット
 *
 * @export
 * @class SnDashboardKpiWidget
 * @extends {LitElement}
 */
@customElement("sn-dashboard-kpi-widget")
export class SnDashboardKpiWidget extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof SnDashboardKpiWidget
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * KPIの種類
   *
   * @type {Variants}
   * @memberof SnDashboardKpiWidget
   */
  @property({ type: String }) variant: variants = "total";

  /**
   * 設定値
   *
   * @type {number}
   * @memberof SnDashboardKpiWidget
   */
  @property({ type: Number }) value: number = 0;

  /**
   * 合計値
   *
   * @type {number}
   * @memberof SnDashboardKpiWidget
   */
  @property({ type: Number }) total: number = 0;

  /**
   * アニメーションの実行を制御する
   *
   * @type {boolean}
   * @memberof SnDashboardKpiWidget
   */
  @property({ type: Boolean }) animation: boolean = false;

  /**
   * クリック可否を制御する
   *
   * @type {boolean}
   * @memberof SnDashboardKpiWidget
   */
  @property({ type: Boolean }) clickable: boolean = false;

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * ウィジェットのクリック処理を制御します。
   *
   * @private
   * @memberof SnDashboardKpiWidget
   */
  private _handleWidgetClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (!this.clickable) return;

    emit(this, "click-kpi-widget", {
      detail: {
        variant: this.variant,
      },
    });
  };

  // -------------------------------------------------------------
  // Method
  // -------------------------------------------------------------

  /**
   * 合計値に対する割合を計算します。
   *
   * @private
   * @return {*}  {number}
   * @memberof SnDashboardKpiWidget
   */
  private _calcPercent(): number {
    if (this.total === 0) return 0;
    return Number(financial((this.value / this.total) * 100, 1));
  }

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardKpiWidget
   */
  protected render(): HTMLTemplateResult {
    const percent = this._calcPercent();
    const baseClassMap = classMap({
      [this.variant]: true,
      clickable: this.clickable,
    });

    return html`<div
      id="content-root"
      class=${baseClassMap}
      @click=${this._handleWidgetClick}
    >
      <header>${this._renderHeaderItem()}</header>
      <main>${this._renderMainItem(percent)}</main>
      <footer>${this._renderFooterItem(percent)}</footer>
    </div>`;
  }

  /**
   * ヘッダーの要素をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardKpiWidget
   */
  private _renderHeaderItem(): HTMLTemplateResult {
    return html` <div class="label"><slot></slot></div>
      <wa-icon
        slot="icon"
        library="my-icons"
        name=${icons.find((i) => i.variant === this.variant)?.name ??
        "sliders-solid-full"}
        .animation=${this.animation && this.value > 0 ? "bounce" : undefined}
      ></wa-icon>`;
  }

  /**
   * メインの要素をレンダリングします。
   *
   * @private
   * @param {number} percent
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardKpiWidget
   */
  private _renderMainItem(percent: number): HTMLTemplateResult {
    return html`<div class="value">
        <wa-format-number .value=${this.value} lang="en"></wa-format-number>
        <span class="unit">件</span>
      </div>
      <div class="percent">${percent === 0 ? "" : html`${percent}%`}</div>`;
  }

  /**
   * フッターの要素をレンダリングします。
   *
   * @private
   * @return {*}  {(HTMLTemplateResult | typeof nothing)}
   * @memberof SnDashboardKpiWidget
   */
  private _renderFooterItem(
    percent: number,
  ): HTMLTemplateResult | typeof nothing {
    if (percent === 0) return nothing;
    return html`<wa-progress-bar .value=${percent}></wa-progress-bar>`;
  }
}
