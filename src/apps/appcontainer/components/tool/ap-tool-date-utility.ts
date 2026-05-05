// 1. Core Libraries
import { css, html, LitElement, unsafeCSS, type HTMLTemplateResult } from "lit";

// 2. Library Extensions & Third-party
import { customElement, state } from "lit/decorators.js";
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 3. Internal Assets & Logic
import {
  formatDate,
  convertToJapaneseCalendar,
  getJapaneseWeekday,
  convertMonthsToYears,
  addMonths,
  getPreviousMonthLastDay,
  convertJpToAd,
} from "@/utils/DateUtils";

// 4. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ap/styles/tool/ap-tool-date-utility.lit.scss?inline";

// 5. Initializations (Side Effects)
setBasePath("/");

/**
 * 経過月アイテム
 */
type MonthlyItem = {
  month: string;
  year: string;
  adDate: string;
  jpDate: string;
  adPrevMonthLastDay: string;
  jpPrevMonthLastDay: string;
  wd: string;
};

/**
 * 算出対象の経過月数リスト
 */
const monthCount: number[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 24, 36, 48, 60,
];

/**
 * アプリケーションコンテナー
 *
 * @export
 * @class ApTool
 * @extends {LitElement}
 */
@customElement("ap-tool-date-utility")
export class ApToolDateUtility extends LitElement {
  /**
   * スタイルシートを適用します。
   *
   * @static
   * @memberof ApToolDateUtility
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
   * 基準日和暦の入力エラー有無
   *
   * @type {boolean}
   * @memberof ApToolDateUtility
   */
  @state() isErrorJpBaseDate: boolean = false;

  /**
   * 基準日
   *
   * @type {Date}
   * @memberof ApToolDateUtility
   */
  @state() baseDate: Date = new Date();

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof ApToolDateUtility
   */
  protected render(): HTMLTemplateResult {
    const jpBaseDate = convertToJapaneseCalendar(this.baseDate);
    const wdBaseDate = getJapaneseWeekday(this.baseDate);
    const monthlyList = this.getMonthlyList();

    return html`<div id="contents-root">
      <header>
        <div class="row head">
          <div class="col">基準日（西暦）</div>
          <div class="col">基準日（和暦）</div>
          <div class="col">基準日（曜日）</div>
        </div>
        <div class="row body">
          <div class="col">
            <wa-input
              id="base-date"
              type="date"
              size="small"
              .value=${formatDate(this.baseDate, "yyyy-MM-dd")}
              @change=${this.changeBaseDate}
            ></wa-input>
          </div>
          <div class="col">
            <wa-input
              size="small"
              placeholder="元号y年m月d日"
              .value=${jpBaseDate}
              class=${this.isErrorJpBaseDate ? "error" : ""}
              @change=${this.changeJpBaseDate}
            ></wa-input>
          </div>
          <div class="col">${wdBaseDate}</div>
        </div>
      </header>
      <main>
        <div class="row head">
          <div class="col">月数</div>
          <div class="col">年数</div>
          <div class="col">曜日</div>
          <div class="col">西暦日</div>
          <div class="col">和暦日</div>
          <div class="col">前月末日(西暦)</div>
          <div class="col">前月末日(和暦)</div>
        </div>
        ${monthlyList.map((item) => {
          return html` <div class="row body">
            <div class="col">${item.month}</div>
            <div class="col">${item.year}</div>
            <div class="col">${item.wd}</div>
            <div class="col">${item.adDate}</div>
            <div class="col">${item.jpDate}</div>
            <div class="col">${item.adPrevMonthLastDay}</div>
            <div class="col">${item.jpPrevMonthLastDay}</div>
          </div>`;
        })}
      </main>
    </div>`;
  }

  /**
   * 基準日の変更を検知し、stateを更新します。
   *
   * @private
   * @param {Event} e
   * @memberof ApToolDateUtility
   */
  private changeBaseDate(e: Event): void {
    const target = e.target as HTMLInputElement;
    const date = new Date(target.value);
    this.baseDate = date;
    this.isErrorJpBaseDate = false;
  }

  /**
   * 基準日和暦の変更を検知し、stateを更新します。
   *
   * @private
   * @param {Event} e
   * @memberof ApToolDateUtility
   */
  private changeJpBaseDate(e: Event): void {
    const target = e.target as HTMLInputElement;
    const date = convertJpToAd(target.value);

    if (!date) {
      this.isErrorJpBaseDate = true;
      return;
    }

    this.baseDate = date;
    this.isErrorJpBaseDate = false;
  }

  /**
   * 基準日に対して指定した月数が経過した日付のリストを作成する。
   *
   * @private
   * @return {*}  {MonthlyItem[]}
   * @memberof ApToolDateUtility
   */
  private getMonthlyList(): MonthlyItem[] {
    const monthlyList: MonthlyItem[] = [];

    monthCount.forEach((month) => {
      const y = convertMonthsToYears(month);
      const adDate = addMonths(this.baseDate, month);
      const adDatePrevMonthLastDay = getPreviousMonthLastDay(adDate);

      monthlyList.push({
        month: month + "ヶ月後",
        year: y === "0" ? "-" : y + "年後",
        adDate: formatDate(adDate, "yyyy-MM-dd"),
        jpDate: convertToJapaneseCalendar(adDate),
        adPrevMonthLastDay: formatDate(adDatePrevMonthLastDay, "yyyy-MM-dd"),
        jpPrevMonthLastDay: convertToJapaneseCalendar(adDatePrevMonthLastDay),
        wd: getJapaneseWeekday(adDate),
      });
    });

    return monthlyList;
  }
}
