/**
 * 日付オブジェクトを指定されたフォーマットの文字列に変換します。
 * * 使用可能なトークン: yyyy, MM, dd, HH, mm, ss
 *
 * @export
 * @param {Date} [date] - 変換対象の日付オブジェクト。
 * @param {string} [format="yyyy/MM/dd HH:mm:ss"] - フォーマット形式。
 * @returns {string} フォーマット済みの日付文字列、または空文字。
 */
export function formatDate(
  date?: Date,
  format: string = "yyyy/MM/dd HH:mm:ss",
): string {
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
}

/**
 * 指定された日数後の日付（時刻 00:00:00）を取得する
 * @param {number} days - 加算する日数
 * @returns {Date}
 */
export function getThresholdDate(days: number): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0); // 時刻をクリア
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * 指定された基準日が期限切れかどうかを判定します。
 * * @param {boolean} isDone - 完了済みか否か
 * * @param {Date} expiryDate - 判定対象となる基準日（有効期限など）
 * @returns {boolean} 基準日が過去日の場合は true、未来日の場合は false
 */
export function isOverdue(isDone: boolean, expiryDate: Date): boolean {
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
}

/**
 * システム日付が基準日から見て1日、2日、3日前のいずれかであるかを判定します。
 * * @param {boolean} isDone - 完了済みか否か
 * * @param {Date} referenceDate - 判定のベースとなる基準日
 * * @param {number} dayCount - 計算日数
 * @returns {boolean} 当日〜any日前なら true、それ以外は false
 */
export function isWithinAnyDaysBefore(
  isDone: boolean,
  referenceDate: Date,
  dayCount: number,
): boolean {
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
}

/**
 * 指定した範囲の年リストを取得します。
 *
 * @export
 * @param {number} startYear
 * @param {number} [endYear=new Date().getFullYear()]
 * @return {*}  {number[]}
 */
export function getYearList(
  startYear: number,
  endYear: number = new Date().getFullYear(),
): number[] {
  return Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
}

/**
 * システム日付に基づき、現在の年度（4月始まり）を返します。
 * * @returns {number} 現在の年度（YYYY形式）
 */
export function getCurrentFiscalYear(): number {
  const now = new Date();
  const month = now.getMonth(); // 0: 1月, 3: 4月
  const year = now.getFullYear();

  // 1月〜3月の期間は前年を年度として扱うため
  if (month < 3) {
    return year - 1;
  }

  return year;
}
