import { SnDB } from "@sn/database/SnDB";
import { Task } from "@sn/models/Task";
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";
import { BurnupValue } from "@sn/models/BurnupValue";
import { TaskStatus } from "@sn/code/TaskStatus";
import { isOverdue, isAsap, isWithinAnyDaysBefore } from "@utils/DateUtils";

/**
 * ダッシュボード用の各種データを取得するクラスです。
 *
 * @export
 * @class DashboardQueryService
 */
export class DashboardQueryService {
  /**
   * Creates an instance of DashboardService.
   * @param {SnDB} db
   * @memberof DashboardQueryService
   */
  constructor(private db: SnDB) {}

  async getDashboardData(
    fiscalYear: number,
  ): Promise<[KpiWidgetValue, BurnupValue[], BurnupValue[]]> {
    const tasks: Task[] =
      await this.db.taskQuery.getTasksByFiscalYear(fiscalYear);

    return [
      this._getKpiWidgetValues(tasks),
      this._getBurnupCreateCountValue(tasks),
      this._getBurnupDoneCountValue(tasks),
    ];
  }

  /**
   *　KPI用のデータセットを取得する。
   *
   * @private
   * @param {Task[]} tasks
   * @return {*}  {KpiWidgetValue}
   * @memberof DashboardQueryService
   */
  private _getKpiWidgetValues(tasks: Task[]): KpiWidgetValue {
    const kpiResult: KpiWidgetValue = {
      total: tasks.length,
      pending: tasks.filter((t) =>
        TaskStatus.fromCode(t.statusCode).isPending(),
      ).length,
      progress: tasks.filter((t) =>
        TaskStatus.fromCode(t.statusCode).isProgress(),
      ).length,
      done: tasks.filter((t) => TaskStatus.fromCode(t.statusCode).isDone())
        .length,
      upcoming: tasks.filter((t) => isWithinAnyDaysBefore(false, t.dueDate, 3))
        .length,
      asap: tasks.filter((t) => isAsap(false, t.dueDate)).length,
      overdue: tasks.filter((t) => isOverdue(false, t.dueDate)).length,
    };

    return kpiResult;
  }

  /**
   * バーンチャートに出力する「タスクの月ごとの作成数（総数）」を取得します。
   *
   * @private
   * @param {Task[]} tasks
   * @return {*}  {BurnupValue[]}
   * @memberof DashboardQueryService
   */
  private _getBurnupCreateCountValue(tasks: Task[]): BurnupValue[] {
    const monthlyCount = tasks.reduce(
      (acc, task) => {
        const date = new Date(task.createdAt!); // Dateオブジェクトに変換して「月（1〜12）」を取得
        const month = `${date.getMonth() + 1}`; // getMonth()は0から始まるため+1
        acc[month] = (acc[month] || 0) + 1; // すでにその月のキーがあれば+1、なければ1で初期化
        return acc;
      },
      {} as Record<string, number>,
    );

    let countSum = 0;
    const result: BurnupValue[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map(
      (month) => {
        const count = monthlyCount[month] ?? 0;
        countSum += count;

        return {
          label: `${month}月`,
          count: countSum,
        };
      },
    );

    return result;
  }

  private _getBurnupDoneCountValue(tasks: Task[]): BurnupValue[] {
    const monthlyCount = tasks
      .filter((t) => TaskStatus.fromCode(t.statusCode).isDone())
      .reduce(
        (acc, task) => {
          const date = new Date(task.updatedAt!); // Dateオブジェクトに変換して「月（1〜12）」を取得
          const month = `${date.getMonth() + 1}`; // getMonth()は0から始まるため+1
          acc[month] = (acc[month] || 0) + 1; // すでにその月のキーがあれば+1、なければ1で初期化
          return acc;
        },
        {} as Record<string, number>,
      );

    let countSum = 0;
    const result: BurnupValue[] = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3].map(
      (month) => {
        const count = monthlyCount[month] ?? 0;
        countSum += count;

        return {
          label: `${month}月`,
          count: countSum,
        };
      },
    );

    return result;
  }
}
