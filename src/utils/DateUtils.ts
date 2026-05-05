import * as kanjidate from "kanjidate";

/**
 * 日付オブジェクトを指定されたフォーマットの文字列に変換します。
 * * 使用可能なトークン: yyyy, MM, dd, HH, mm, ss
 *
 * @export
 * @param {Date} [date] - 変換対象の日付オブジェクト。
 * @param {string} [format="yyyy/MM/dd HH:mm:ss"] - フォーマット形式。
 * @returns {string} フォーマット済みの日付文字列、または空文字。
 */
export const formatDate = (
  date?: Date,
  format: string = "yyyy/MM/dd HH:mm:ss",
): string => {
  if (!date) return "";

  const pad = (num: number) => String(num).padStart(2, "0");

  const values: { [key: string]: string | number } = {
    yyyy: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    dd: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  // 正規表現でトークンを一括置換
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (matched) =>
    values[matched].toString(),
  );
};

/**
 * 指定された日数後の日付（時刻 00:00:00）を取得する
 * @param {number} days - 加算する日数
 * @returns {Date}
 */
export const getThresholdDate = (days: number): Date => {
  const date = new Date();
  date.setHours(0, 0, 0, 0); // 時刻をクリア
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * 指定された基準日が期限切れかどうかを判定します。
 * * @param {boolean} isDone - 完了済みか否か
 * * @param {Date} expiryDate - 判定対象となる基準日（有効期限など）
 * @returns {boolean} 基準日が過去日の場合は true、未来日の場合は false
 */
export const isOverdue = (isDone: boolean, expiryDate: Date): boolean => {
  // 完了済みの場合は判定不要なのでfalse
  if (isDone) {
    return false;
  }

  // 比較のために現在の時刻を取得し、時刻部分を切り捨てて「今日」の開始時点（00:00:00）にする
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 基準日も同様に時刻を切り捨てて比較する（日付のみの比較にする場合）
  const targetDate = new Date(expiryDate.getTime());
  targetDate.setHours(0, 0, 0, 0);

  // 基準日が当日より前なら期限切れ(true)
  return targetDate < today;
};

/**
 * システム日付が基準日から見て1日、2日、3日前のいずれかであるかを判定します。
 * * @param {boolean} isDone - 完了済みか否か
 * * @param {Date} referenceDate - 判定のベースとなる基準日
 * * @param {number} dayCount - 計算日数
 * @returns {boolean} 当日〜any日前なら true、それ以外は false
 */
export const isWithinAnyDaysBefore = (
  isDone: boolean,
  referenceDate: Date,
  dayCount: number,
): boolean => {
  // 完了済みの場合は判定不要なのでfalse
  if (isDone) {
    return false;
  }

  // 現在の日付を取得し、時刻を切り捨てる
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 基準日のコピーを作成し、時刻を切り捨てる
  const targetDate = new Date(referenceDate.getTime());
  targetDate.setHours(0, 0, 0, 0);

  // 日付を計算するためのミリ秒（1日 = 24h * 60m * 60s * 1000ms）
  const oneDayMs = 24 * 60 * 60 * 1000;

  const todayBefore = new Date(targetDate.getTime());
  const anyDaysBefore = new Date(targetDate.getTime() - dayCount * oneDayMs);

  // 今日が「基準日のany日前」以上 かつ 「基準日の当日」以下であるかを判定
  return today >= anyDaysBefore && today <= todayBefore;
};

/**
 * 指定した範囲の年リストを取得します。
 *
 * @export
 * @param {number} startYear
 * @param {number} [endYear=new Date().getFullYear()]
 * @return {*}  {number[]}
 */
export const getYearList = (
  startYear: number,
  endYear: number = new Date().getFullYear(),
): number[] => {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
};

/**
 * システム日付に基づき、現在の年度（4月始まり）を返します。
 * * @returns {number} 現在の年度（YYYY形式）
 */
export const getCurrentFiscalYear = (): number => {
  const now = new Date();
  const month = now.getMonth(); // 0: 1月, 3: 4月
  const year = now.getFullYear();

  // 1月〜3月の期間は前年を年度として扱うため
  if (month < 3) {
    return year - 1;
  }

  return year;
};

/**
 * 西暦の日付を和暦（令和/平成...）に変換します。
 * @param {Date} date - 変換対象の日付オブジェクト
 * @returns {string} 和暦表記
 */
export const convertToJapaneseCalendar = (date: Date): string => {
  return new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
    era: "long", // '令和' などの元号を表示
    year: "numeric", // '〇年' を表示
    month: "long", // '〇月' を表示
    day: "numeric", // '〇日' を表示
  }).format(date);
};

/**
 * 指定された日付から日本語の曜日を取得する
 *
 * @param {Date} date - 曜日を取得したい日付オブジェクト
 * @param {'long' | 'short'} [format='long'] - 表記形式。'long'は「〇曜日」、'short'は「〇」
 * @returns {string} 日本語の曜日文字列
 *
 * @example
 * getJapaneseWeekday(new Date()); // "火曜日"
 * getJapaneseWeekday(new Date(), 'short'); // "火"
 */
export const getJapaneseWeekday = (
  date: Date,
  format: "long" | "short" = "long",
): string => {
  return new Intl.DateTimeFormat("ja-JP", {
    weekday: format,
  }).format(date);
};

/**
 * 月数を年数に変換する（12ヶ月未満はハイフン）
 *
 * @param {number} months - 変換対象の月数
 * @returns {string} 変換後の年数（例: "1"）、または 12ヶ月未満の場合は "0"
 *
 * @example
 * convertMonthsToYears(12); // "1"
 * convertMonthsToYears(24); // "2"
 * convertMonthsToYears(6);  // "0"
 */
export const convertMonthsToYears = (months: number): string => {
  if (months < 12) {
    return "0";
  }

  const years = Math.floor(months / 12);
  return `${years}`;
};

/**
 * 基準日からnヶ月後の日付を算出する
 *
 * 計算手順:
 * 1. 基準日の属する月の「1日」を算出する（基準日初日）
 * 2. 基準日初日のnヶ月後（計算日初日）を算出する
 * 3. 計算日初日の「日」を基準日の「日」に置き換える
 * 4. 結果が非実在日の場合、その月の末日とする
 *
 * @param {Date} baseDate - 基準となる日付
 * @param {number} monthsToAdd - 加算する月数
 * @returns {Date} 計算後の日付オブジェクト
 */
export const addMonths = (baseDate: Date, monthsToAdd: number): Date => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  // 1. & 2. 基準日初日のnヶ月後（計算日初日）を算出
  const targetFirstDay = new Date(year, month + monthsToAdd, 1);

  // 3. 計算日初日の「日」を基準日の「日」に置き換える
  const targetDate = new Date(
    targetFirstDay.getFullYear(),
    targetFirstDay.getMonth(),
    day,
  );

  // 4. 結果が非実在日の場合（月が繰り上がってしまった場合）、計算月の末日に調整
  if (targetDate.getMonth() !== targetFirstDay.getMonth()) {
    // 翌月の0日を指定することで、今月の末日を取得
    return new Date(
      targetFirstDay.getFullYear(),
      targetFirstDay.getMonth() + 1,
      0,
    );
  }

  return targetDate;
};

/**
 * 指定した日付の前月末日を取得する
 *
 * @param {Date} date - 基準となる日付
 * @returns {Date} 前月の末日オブジェクト
 *
 * @example
 * getPreviousMonthLastDay(new Date(2025, 4, 15)); // 2025-03-31 (4/15の前月末)
 * getPreviousMonthLastDay(new Date(2025, 1, 1));  // 2024-12-31 (1/1の前月末)
 */
export const getPreviousMonthLastDay = (date: Date): Date => {
  // 基準日の「年」と「月」を取得
  const year = date.getFullYear();
  const month = date.getMonth();

  // new Date(year, month, 0) とすることで、
  // 指定した年・月の「0日」＝「前月の最終日」が生成される
  return new Date(year, month, 0);
};

/**
 * 和暦形式の日付文字列（例：令和6年5月1日）を西暦のDateオブジェクトに変換する
 *
 * 内部処理：
 * 1. 正規表現を用いて「元号」「年」「月」「日」を抽出する
 * 2. 「元年」表記を数値の1に変換する
 * 3. kanjidateライブラリを使用して元号から西暦年を取得する
 * 4. JavaScriptのDate仕様（月が0〜11）に合わせてDateオブジェクトを生成する
 *
 * @param {string} jpDateStr - 和暦の日付文字列（例: "令和元年12月31日", "昭和64年1月7日"）
 * @returns {Date | null} 変換後のDateオブジェクト。形式不正や解析不能な場合はnull
 *
 * @example
 * convertJpToAd("令和6年5月1日");  // 2024-05-01T00:00:00 (ローカル時間)
 * convertJpToAd("令和元年5月1日"); // 2019-05-01T00:00:00
 */
export const convertJpToAd = (jpDateStr: string): Date | null => {
  // 1. 正規表現で「元号」「年」「月」「日」を抽出
  // 年の部分は「数字」または「元」を許容
  const regStr = /^(令和|平成|昭和|大正|明治)(.+?)年(\d+?)月(\d+?)日$/;
  const match = jpDateStr.match(regStr);

  if (!match) {
    return null;
  }

  const [, eraName, yearStr, monthStr, dayStr] = match;

  // 2. 数値への変換処理
  const year = yearStr === "元" ? 1 : parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }

  // 3. 和暦日付を西暦に変換
  try {
    const adYear = kanjidate.fromGengou(eraName, year);
    return new Date(adYear, month - 1, day);
  } catch (e) {
    return null;
  }
};
