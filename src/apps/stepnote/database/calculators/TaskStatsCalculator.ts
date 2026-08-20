import { SnDB } from "../SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { isAsap, isWithinAnyDaysBefore } from "@utils/DateUtils";

/**
 * タスクデータの状態を取得するカリキュレータークラスです。
 *
 * @export
 * @class TaskStatsCalculator
 */
export class TaskStatsCalculator {
  /**
   * Creates an instance of TaskStatsCalculator.
   * @param {SnDB} db
   * @memberof TaskStatsCalculator
   */
  constructor(private db: SnDB) {}

  /**
   * ブックマーク件数を取得します。
   *
   * @return {*}  {Promise<number>}
   * @memberof TaskStatsCalculator
   */
  async countBookmark(): Promise<number> {
    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => task.bookmark === 1) // ブックマーク済み
      .count();
  }

  /**
   * 未分類タスク数を取得します。
   *
   * @return {*}  {Promise<number>}
   * @memberof TaskStatsCalculator
   */
  async countUncategorized(): Promise<number> {
    const labels = await this.db.labelRepo.getLabelsAscName();
    const existingLabelSet = new Set(labels.map((l) => l.id));

    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => !existingLabelSet.has(task.labelId)) // ラベルなし
      .count();
  }

  /**
   * 期限切れタスクの有無を判定します。
   *
   * @return {*}  {Promise<boolean>}
   * @memberof TaskStatsCalculator
   */
  async hasOverdue(): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      (await this.db.tasks
        .where("statusCode")
        .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
        .filter((task) => task.dueDate < today) // 当日(00:00)より前
        .count()) > 0
    );
  }

  /**
   * 期限当日タスクの有無を判定します。
   * ※As Soon As Possible
   *
   * @return {*}  {Promise<boolean>}
   * @memberof TaskStatsCalculator
   */
  async hasAsap(): Promise<boolean> {
    return (
      (await this.db.tasks
        .where("statusCode")
        .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
        .filter((task) => isAsap(false, task.dueDate)) // 当日
        .count()) > 0
    );
  }

  /**
   * 期限間近タスクの有無を判定します。
   *
   * @return {*}  {Promise<boolean>}
   * @memberof TaskStatsCalculator
   */
  async hasUpcoming(): Promise<boolean> {
    return (
      (await this.db.tasks
        .where("statusCode")
        .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
        .filter((task) => isWithinAnyDaysBefore(false, task.dueDate)) // 当日(00:00)より前
        .count()) > 0
    );
  }
}
