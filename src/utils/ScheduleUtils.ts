/**
 * スケジュールされる時刻の型定義
 */
export type ScheduledTime = { hour: number; minute: number };

/**
 * 指定された時刻リストに基づいて、自動的に次の実行タイミングを管理する
 *
 * @export
 * @class ScheduleUtils
 */
export class ScheduleUtils {
  private _timerId?: ReturnType<typeof setTimeout>;
  private _onExecute: () => void;
  private _schedule: ScheduledTime[];

  /**
   * Creates an instance of ScheduleUtils.
   * @param {ScheduledTime[]} schedule 実行したい時刻の配列。順不同でも内部でソートされます。
   * @param {() => void} onExecute 指定時刻に到達した際に実行されるコールバック関数。
   * @memberof ScheduleUtils
   */
  constructor(schedule: ScheduledTime[], onExecute: () => void) {
    this._schedule = [...schedule].sort(
      (a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute),
    );
    this._onExecute = onExecute;
  }

  /**
   * スケジュール監視を開始します。
   * 現在時刻とスケジュールを比較し、次に実行すべき時刻にタイマーを設定します。
   * 本日の全スケジュールが終了している場合は何もしません。
   *
   * @memberof ScheduleUtils
   */
  start() {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    // 現在時刻より後の、最初のスケジュールを探す
    const nextTime = this._schedule.find(
      (t) => t.hour * 60 + t.minute > currentTotalMinutes,
    );

    if (nextTime) {
      this._setTimer(nextTime.hour, nextTime.minute);
    } else {
      // 全スケジュール終了
    }
  }

  /**
   * 現在設定されているタイマーを停止します。
   * コンポーネントの破棄（disconnectedCallback）時などに必ず呼び出してください。
   *
   * @memberof ScheduleUtils
   */
  stop() {
    if (this._timerId) {
      clearTimeout(this._timerId);
      this._timerId = undefined;
    }
  }

  /**
   * 指定した時分にタイマーをセットします。
   *
   * @private
   * @param {number} hour
   * @param {number} minute
   * @memberof ScheduleUtils
   */
  private _setTimer(hour: number, minute: number) {
    const now = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);

    const delay = target.getTime() - now.getTime();

    this._timerId = setTimeout(() => {
      this._onExecute();
      // 実行が終わったら、次のスケジュールを再計算して予約
      this.start();
    }, delay);
  }
}
