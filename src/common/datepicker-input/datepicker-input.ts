// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, state, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

// 3. Third-party UI & SDKs (WebAwesome)
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";
import WaPopover from "@awesome.me/webawesome/dist/components/popover/popover.js";

// 4. Internal Modules (Database, Models, Shared Components)
import {
  formatDate,
  getStartDay,
  isMatchYM,
  addDays,
  convertToJapaneseCalendar,
} from "@/utils/DateUtils";
import { emit } from "@/utils/EventUtils";

// 6. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "./datepicker-input.lit.scss?inline";

// 7. Initializations
setBasePath("/");

/**
 * 曜日名
 */
type weekName = {
  name: string;
  isHoliday: boolean;
};

const weekConfig: weekName[] = [
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
const additionalDays = [...Array(42).keys()] as const;

/**
 * コピー専用ボタン
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
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
    css`
      ${unsafeCSS(styles)}
    `,
  ];

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

  /**
   * コンポーネント削除時
   *
   * @memberof DatePickerInput
   */
  disconnectedCallback() {
    super.disconnectedCallback();
  }

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

  /**
   * コンポーネントをレンダリングします。
   *
   * @return {*}
   * @memberof DatePickerInput
   */
  render(): HTMLTemplateResult {
    const dateValue = new Date(this.value);
    const dateCurrent = new Date(this.currentMY);

    const dateCurrentStr = formatDate(dateCurrent, "yyyy年M月");
    const jpMatch = convertToJapaneseCalendar(dateCurrent).match(/^(.+?[年])/);
    const jpDateCurrent = jpMatch ? jpMatch[1] : "";

    const formattedDate = formatDate(dateValue, "yyyy-MM-dd (EEE)");

    const startDay = getStartDay(dateCurrent);
    startDay.setHours(0, 0, 0, 0);

    return html` <wa-input
        id="input-date"
        size=${this.size}
        .value=${formattedDate}
        readonly
      >
        <wa-icon
          library="my-icons"
          name="calendar-solid-full"
          slot="end"
        ></wa-icon>
      </wa-input>
      <wa-popover
        id="calendar-popover"
        for="input-date"
        placement="bottom-start"
      >
        <div class="controller">
          <div class="ym">${dateCurrentStr}<span>(${jpDateCurrent})</span></div>
          <div class="btn">
            <wa-tooltip for="btn-last-year">前年</wa-tooltip>
            <wa-icon
              id="btn-last-year"
              library="my-icons"
              name="angles-left-solid-full"
              @click=${() => {
                this._calcYear(-1);
              }}
            ></wa-icon>
          </div>
          <div class="btn">
            <wa-tooltip for="btn-last-month">前月</wa-tooltip>
            <wa-icon
              id="btn-last-month"
              library="my-icons"
              name="angle-left-solid-full"
              @click=${() => {
                this._calcMonth(-1);
              }}
            ></wa-icon>
          </div>
          <div class="btn">
            <wa-tooltip for="btn-today">当日</wa-tooltip>
            <wa-icon
              id="btn-today"
              library="my-icons"
              name="location-dot-solid-full"
              @click=${() => {
                this._setToday();
              }}
            ></wa-icon>
          </div>
          <div class="btn">
            <wa-tooltip for="btn-next-month">翌月</wa-tooltip>
            <wa-icon
              id="btn-next-month"
              library="my-icons"
              name="angle-right-solid-full"
              @click=${() => {
                this._calcMonth(1);
              }}
            ></wa-icon>
          </div>
          <wa-tooltip for="btn-next-year">翌年</wa-tooltip>
          <div class="btn">
            <wa-icon
              id="btn-next-year"
              library="my-icons"
              name="angles-right-solid-full"
              @click=${() => {
                this._calcYear(1);
              }}
            ></wa-icon>
          </div>
        </div>
        <wa-divider></wa-divider>
        <div class="container">
          <!--曜日名を出力-->
          ${weekConfig.map((w) => {
            const baseClassMap = classMap({
              cell: true,
              week: true,
              holiday: w.isHoliday,
            });
            return html`<div class=${baseClassMap}>${w.name}</div>`;
          })}
          <!--日付を出力-->
          ${additionalDays.map((d) => {
            const date = addDays(startDay, d);
            const day = formatDate(date, "d");

            const isSysYm = isMatchYM(date, dateCurrent);
            const isCurrent = formatDate(date, "yyyy-MM-dd") === this.value;

            const baseClassMap = classMap({
              cell: true,
              day: true,
              current: isCurrent,
              notSysYm: !isSysYm,
              holiday: weekConfig[date.getDay()].isHoliday,
            });

            return html`<div
              class=${baseClassMap}
              @click=${() => {
                this._updateValue(date);
              }}
            >
              ${day}
            </div>`;
          })}
        </div>
      </wa-popover>`;
  }

  /**
   * valueの値を更新します。
   *
   * @private
   * @param {Date} date
   * @memberof DatePickerInput
   */
  private _updateValue(date: Date) {
    this.value = formatDate(date, "yyyy-MM-dd");
    this.calenderPopover.open = false;
    emit(this, "input");
    emit(this, "change");
  }

  /**
   * 選択中の年月の月を加減算します。
   *
   * @private
   * @param {number} addMonth
   * @memberof DatePickerInput
   */
  private _calcMonth(addMonth: number) {
    const date = new Date(this.currentMY);
    date.setMonth(date.getMonth() + addMonth);
    this.currentMY = formatDate(date, "yyyy-MM");
  }

  /**
   * 選択中の年月の年を加減算します。
   *
   * @private
   * @param {number} addYear
   * @memberof DatePickerInput
   */
  private _calcYear(addYear: number) {
    const date = new Date(this.currentMY);
    date.setFullYear(date.getFullYear() + addYear);
    this.currentMY = formatDate(date, "yyyy-MM");
  }

  /**
   * 当日を選択します。
   *
   * @private
   * @memberof DatePickerInput
   */
  private _setToday() {
    const date = new Date();
    this.value = formatDate(date, "yyyy-MM-dd");
    this.currentMY = formatDate(date, "yyyy-MM");
  }
}
