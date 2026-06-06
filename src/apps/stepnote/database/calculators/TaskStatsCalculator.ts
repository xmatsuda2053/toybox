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
}
