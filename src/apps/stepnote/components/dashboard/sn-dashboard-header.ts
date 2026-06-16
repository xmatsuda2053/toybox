// Core Libraries
import { html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";
import { map } from "lit/directives/map.js";

// Lit Extensions (Decorators & Directives)
import { customElement, property, state } from "lit/decorators.js";

// Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaSelect from "@awesome.me/webawesome/dist/components/select/select.js";

// Internal Shared (Codes, Models, Database)
import { snDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";
import { liveQuery, type Subscription } from "dexie";

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

  /**
   * ラベル一覧
   *
   * @type {Label[]}
   * @memberof SnDashboardHeader
   */
  @state() labels: Label[] = [];

  /**
   * テーブルの更新を検知する
   *
   * @private
   * @type {Subscription}
   * @memberof SnConfigContainer
   */
  private _dbSubscription?: Subscription;

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------
  /**
   * コンポーネントがドキュメントの DOM に追加されたときに実行されます。
   *
   * @override
   * @memberof SnConfigContainer
   */
  async connectedCallback() {
    super.connectedCallback();
    this._subscribeLabels();
  }

  /**
   * コンポーネントがドキュメントの DOM から削除されたときに実行されます。
   *
   * @override
   * @memberof SnConfigContainer
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this._dbSubscription?.unsubscribe();
  }

  // -------------------------------------------------------------
  // Database Actions (Dexie 連携)
  // -------------------------------------------------------------

  /**
   * データの更新を検知して再取得する。
   *
   * @private
   * @memberof SnConfigContainer
   */
  private _subscribeLabels() {
    this._dbSubscription?.unsubscribe();

    // 初期値が存在しない場合は登録する。
    const observable = liveQuery(async () => {
      const labels = await snDB.labelRepo.getLabelsAscName();
      return {
        labels,
      };
    });

    this._dbSubscription = observable.subscribe({
      next: async (data) => {
        this.labels = data.labels;
      },
      error: (err) => console.error("LiveQuery Error:", err),
    });
  }

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

  /**
   * ラベルの変更イベントを処理します。
   *
   * @private
   * @param {Event} e
   * @memberof SnDashboardHeader
   */
  private _handleLabelChange = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.target as WaSelect;
    const labelId = Number(target.value);

    emit(this, "change-label", {
      detail: { id: labelId === -1 ? undefined : labelId },
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
      <wa-tooltip for="task-fiscal-year" placement="right">年度</wa-tooltip>
      <!--年度-->
      ${this._renderFiscalYear()}
      <!--ラベル-->
      ${this._renderLabels()}
    </div>`;
  }

  /**
   * 年度リストをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardHeader
   */
  private _renderFiscalYear(): HTMLTemplateResult {
    return html` <wa-select
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
      ${map(yearList, (year) => {
        return html`<wa-option value=${year}>${year}年度</wa-option>`;
      })}
    </wa-select>`;
  }

  /**
   * ラベルリストをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof SnDashboardHeader
   */
  private _renderLabels(): HTMLTemplateResult {
    return html`<wa-select
      id="task-labels"
      name="taskLabels"
      size="small"
      value="-1"
      @change=${this._handleLabelChange}
    >
      <wa-icon library="my-icons" name="tag-solid-full" slot="end"></wa-icon>
      <wa-option value="-1">全てのラベル</wa-option>
      ${map(this.labels, (label) => {
        return html`<wa-option .value=${label.id!}>${label.name}</wa-option>`;
      })}
    </wa-select>`;
  }
}
