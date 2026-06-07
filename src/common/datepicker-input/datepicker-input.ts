// Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";
import { map } from "lit/directives/map.js";

// Lit Extensions (Decorators & Directives)
import { customElement, state, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaPopover from "@awesome.me/webawesome/dist/components/popover/popover.js";

// Internal Modules (Database, Models, Shared Components)
import {
  formatDate,
  getStartDay,
  isMatchYM,
  addDays,
  convertToJapaneseCalendar,
} from "@/utils/DateUtils";
import { emit } from "@/utils/EventUtils";

// Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./datepicker-input.lit.scss?inline";

// Initializations
setBasePath("/");

/**
 * 曜日名
 */
type weekName = {
  name: string;
  isHoliday: boolean;
};

/**
 * メニューボタン設定定義
 */
type menuButtonConfig = {
  id: string;
  label: string;
  icon: string;
  type: "month" | "year" | "today";
  method: "none" | "increment" | "decrement";
};

/**
 * メニューボタン設定
 */
const BUTTON_CONFIGS: menuButtonConfig[] = [
  {
    id: "btn-last-year",
    label: "前年",
    icon: "angles-left-solid-full",
    type: "year",
    method: "decrement",
  },
  {
    id: "btn-last-month",
    label: "前月",
    icon: "angle-left-solid-full",
    type: "month",
    method: "decrement",
  },
  {
    id: "btn-today",
    label: "当日",
    icon: "location-dot-solid-full",
    type: "today",
    method: "none",
  },
  {
    id: "btn-next-month",
    label: "翌月",
    icon: "angle-right-solid-full",
    type: "month",
    method: "increment",
  },
  {
    id: "btn-next-year",
    label: "翌年",
    icon: "angles-right-solid-full",
    type: "year",
    method: "increment",
  },
];

/**
 * 曜日名および祝日設定
 */
const WEEK_CONFIG: weekName[] = [
  { name: "日", isHoliday: true },
  { name: "月", isHoliday: false },
  { name: "火", isHoliday: false },
  { name: "水", isHoliday: false },
  { name: "木", isHoliday: false },
  { name: "金", isHoliday: false },
  { name: "土", isHoliday: true },
];

/**
 * カレンダー描画時の加算日数
 */
const ADDITIONAL_DAYS = [...Array(42).keys()] as const;

/**
 * データピッカー
 *
 * @export
 * @class DatePickerInput
 * @extends {LitElement}
 */
@customElement("datepicker-input")
export class DatePickerInput extends LitElement {
  // Form要素であることを明示
  static formAssociated = true;

  // ブラウザのForm制御と同期させるためのインターフェースを取得
  private _internals = this.attachInternals();

  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof DatePickerInput
   */
  static styles = [unsafeCSS(sharedStyles), unsafeCSS(styles)];

  /**
   * 現在選択中の年月
   *
   * @type {string}
   * @memberof DatePickerInput
   */
  @state() currentMY: string = formatDate(new Date(), "yyyy-MM");

  /**
   * コンポーネントの名前
   *
   * @memberof DatePickerInput
   */
  @property({ type: String }) name = "";

  /**
   * 日付
   *
   * @type {string}
   * @memberof DatePickerInput
   */
  private _value: string = formatDate(new Date(), "yyyy-MM-dd");

  /**
   * 選択中の日付
   *
   * @readonly
   * @memberof DatePickerInput
   */
  @property({ type: String })
  get value() {
    return this._value;
  }
  set value(newValue: string) {
    const oldValue = this._value;
    this._value = newValue;
    // ブラウザのFormDataシステムに値を登録
    this._internals.setFormValue(newValue);
    this.requestUpdate("value", oldValue);
  }

  /**
   * カレンダー
   *
   * @private
   * @type {WaPopover}
   * @memberof DatePickerInput
   */
  @query("#calendar-popover") private calenderPopover!: WaPopover;

  /**
   * サイズ
   *
   * @type {string}
   * @memberof DatePickerInput
   */
  @property({ type: String }) size: "small" | "medium" | "large" = "medium";

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * プロパティ変更時の処理
   *
   * @param {(PropertyValues)} changedProperties
   * @memberof DatePickerInput
   */
  willUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has("value")) {
      if (this.value) {
        const dateValue = new Date(this.value);
        if (!isNaN(dateValue.getTime())) {
          this.currentMY = formatDate(dateValue, "yyyy-MM");
        }
      }
    }
  }

  // -------------------------------------------------------------
  // Event
  // -------------------------------------------------------------

  /**
   * 指定した日付を選択状態とします。
   *
   * @private
   * @param {Event} e
   * @memberof DatePickerInput
   */
  private _handleDateValueClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const dateStr = target.dataset.date;
    if (!dateStr) return;

    this.value = dateStr;
    this.calenderPopover.open = false;

    emit(this, "input");
    emit(this, "change");
  };

  /**
   * メニューボタンクリック時の日付計算を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof DatePickerInput
   */
  private _handleMenuButtonClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const type = target.dataset.type;
    const method = target.dataset.method;

    if (!type || !method) return;

    const add = method === "increment" ? 1 : -1;
    const date = type === "today" ? new Date() : new Date(this.currentMY);

    switch (type) {
      case "year":
        date.setFullYear(date.getFullYear() + add);
        break;
      case "month":
        date.setMonth(date.getMonth() + add);
        break;
      case "today":
        this.value = formatDate(date, "yyyy-MM-dd");
        break;
      default:
        this.value = formatDate(date, "yyyy-MM-dd");
        break;
    }

    this.currentMY = formatDate(date, "yyyy-MM");
  };

  // -------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------

  /**
   * コンポーネントをレンダリングします。
   *
   * @return {*}
   * @memberof DatePickerInput
   */
  render(): HTMLTemplateResult {
    return html` ${this._renderInput()}
      <wa-popover
        id="calendar-popover"
        for="input-date"
        placement="bottom-start"
      >
        <div class="controller">
          <!--年月-->
          ${this._renderCurrentYearMonth()}
          <!--メニューボタン-->
          ${this._renderMenuButtons()}
        </div>
        <wa-divider></wa-divider>
        <div class="container">
          <!--曜日名-->
          ${this._renderWeekDay()}
          <!--日付-->
          ${this._renderDayBit()}
        </div>
      </wa-popover>`;
  }

  /**
   * 日付入力欄をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof DatePickerInput
   */
  private _renderInput(): HTMLTemplateResult {
    return html`<wa-input
      id="input-date"
      size=${this.size}
      .value=${formatDate(new Date(this.value), "yyyy-MM-dd (EEE)")}
      readonly
    >
      <wa-icon
        library="my-icons"
        name="calendar-solid-full"
        slot="end"
      ></wa-icon>
    </wa-input>`;
  }

  /**
   * 現在年月をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof DatePickerInput
   */
  private _renderCurrentYearMonth(): HTMLTemplateResult {
    const dateCurrent = new Date(this.currentMY);
    const dateCurrentStr = formatDate(dateCurrent, "yyyy年M月");
    const jpMatch = convertToJapaneseCalendar(dateCurrent).match(/^(.+?[年])/);
    const jpDateCurrent = jpMatch ? jpMatch[1] : "";

    return html`<div class="ym">
      ${dateCurrentStr}<span>(${jpDateCurrent})</span>
    </div>`;
  }

  /**
   * メニューボタンをレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof DatePickerInput
   */
  private _renderMenuButtons(): HTMLTemplateResult {
    return html`${map(BUTTON_CONFIGS, (config) => {
      return html` <div class="btn">
        <wa-tooltip for=${config.id}>${config.label}</wa-tooltip>
        <wa-icon
          id=${config.id}
          library="my-icons"
          name=${config.icon}
          data-type=${config.type}
          data-method=${config.method}
          @click=${this._handleMenuButtonClick}
        ></wa-icon>
      </div>`;
    })}`;
  }

  /**
   * 曜日名をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof DatePickerInput
   */
  private _renderWeekDay(): HTMLTemplateResult {
    return html` ${map(WEEK_CONFIG, (w) => {
      return html`<div
        class=${classMap({
          cell: true,
          week: true,
          holiday: w.isHoliday,
        })}
      >
        ${w.name}
      </div>`;
    })}`;
  }

  /**
   * 日付をレンダリングします。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof DatePickerInput
   */
  private _renderDayBit(): HTMLTemplateResult {
    const dateCurrent = new Date(this.currentMY);
    const startDay = getStartDay(dateCurrent);
    startDay.setHours(0, 0, 0, 0);

    return html` ${map(ADDITIONAL_DAYS, (d) => {
      const date = addDays(startDay, d);
      const dateStr = formatDate(date, "yyyy-MM-dd");

      const baseClassMap = classMap({
        cell: true,
        day: true,
        current: dateStr === this.value,
        today: dateStr === formatDate(new Date(), "yyyy-MM-dd"),
        notSysYm: !isMatchYM(date, dateCurrent),
        holiday: WEEK_CONFIG[date.getDay()].isHoliday,
      });

      return html`<div
        class=${baseClassMap}
        data-date=${dateStr}
        @click=${this._handleDateValueClick}
      >
        ${formatDate(date, "d")}
      </div>`;
    })}`;
  }
}
