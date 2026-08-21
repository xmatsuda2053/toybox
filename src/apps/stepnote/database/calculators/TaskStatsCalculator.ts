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
  async getBookmarkCount(): Promise<number> {
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
  async getUncategorizedCount(): Promise<number> {
    const labels = await this.db.labelRepo.getLabelsAscName();
    const existingLabelSet = new Set(labels.map((l) => l.id));

    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => !existingLabelSet.has(task.labelId)) // ラベルなし
      .count();
  }

  /**
   * 期限切れタスクの件数を取得します。
   *
   * @return {*}  {Promise<number>}
   * @memberof TaskStatsCalculator
   */
  async getOverdueCount(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => task.dueDate < today) // 当日(00:00)より前
      .count();
  }

  /**
   * 期限当日タスクの件数を取得します。
   * ※As Soon As Possible
   *
   * @return {*}  {Promise<number>}
   * @memberof TaskStatsCalculator
   */
  async getAsapCount(): Promise<number> {
    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => isAsap(false, task.dueDate)) // 当日
      .count();
  }

  /**
   * 期限間近タスクの件数を取得します。
   *
   * @return {*}  {Promise<number>}
   * @memberof TaskStatsCalculator
   */
  async getUpcomingCount(): Promise<number> {
    return await this.db.tasks
      .where("statusCode")
      .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
      .filter((task) => isWithinAnyDaysBefore(false, task.dueDate)) // 当日(00:00)より前
      .count();
  }
}
