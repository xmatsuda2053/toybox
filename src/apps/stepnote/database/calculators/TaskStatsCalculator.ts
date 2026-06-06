import { SnDB } from "../SnDB";
import { TaskStatus } from "@sn/code/TaskStatus";
import { isAsap, isWithinAnyDaysBefore } from "@utils/DateUtils";

export class TaskStatsCalculator {
  /**
   * Creates an instance of TaskStatsCalculator.
   * @param {SnDB} db
   * @memberof TaskStatsCalculator
   */
  constructor(private db: SnDB) {}

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
        .filter((task) => isWithinAnyDaysBefore(false, task.dueDate, 3)) // 当日(00:00)より前
        .count()) > 0
    );
  }
}
