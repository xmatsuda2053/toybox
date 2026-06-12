import { SnDB } from "@sn/database/SnDB";
import { Task } from "@sn/models/Task";
import { KpiWidgetValue } from "@sn/models/KpiWidgetValue";
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

  async getDashboardData(fiscalYear: number): Promise<[KpiWidgetValue]> {
    const tasks: Task[] =
      await this.db.taskQuery.getTasksByFiscalYear(fiscalYear);

    return [this._getKpiWidgetValue(tasks)];
  }

  private _getKpiWidgetValue(tasks: Task[]): KpiWidgetValue {
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
}
