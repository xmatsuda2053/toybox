import { SnDB } from "../SnDB";
import { Task } from "@sn/models/Task";
import { QuickAccess } from "@sn/models/QuickAccess";
import { TaskStatus } from "@sn/code/TaskStatus";
import {
  formatDate,
  isOverdue,
  isAsap,
  isWithinAnyDaysBefore,
} from "@utils/DateUtils";

export class TaskQueryService {
  /**
   * Creates an instance of TaskQueryService.
   * @param {SnDB} db
   * @memberof TaskQueryService
   */
  constructor(private db: SnDB) {}
}
