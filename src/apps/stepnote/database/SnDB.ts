import Dexie, { Table } from "dexie";
import "dexie-export-import";
import { importInto } from "dexie-export-import";

import { QuickAccess } from "@sn/models/task/QuickAccess";
import { Label } from "@sn/models/task/Label";
import { Task } from "@sn/models/task/Task";
import { Log } from "@sn/models/task/Log";
import { Note } from "@sn/models/task/Note";
import { Config } from "@sn/models/task/Config";
import { Notebook } from "@sn/models/notebook/Notebook";

import { LabelRepository } from "@sn/database/repositories/LabelRepository";
import { QuickAccessRepository } from "@sn/database/repositories/QuickAccessRepository";
import { LogRepository } from "@sn/database/repositories/LogRepository";
import { TaskRepository } from "./repositories/TaskRepository";
import { NoteRepository } from "@sn/database/repositories/NoteRepository";
import { ConfigRepository } from "./repositories/ConfigRepository";
import { DashboardRepository } from "./repositories/DashboardRepository";
import { NotebookRepository } from "./repositories/NotebookRepository";

import { TaskQueryService } from "@sn/database/services/TaskQueryService";
import { DashboardQueryService } from "./services/DashboardQueryService";
import { NotebookQueryService } from "./services/NotebookQueryService";

import { TaskStatsCalculator } from "./calculators/TaskStatsCalculator";

import { formatDate } from "@utils/DateUtils";

/**
 * データベース
 *
 * @export
 * @class SnDB
 * @extends {Dexie}
 */
export class SnDB extends Dexie {
  labels!: Table<Label>;
  quickAccesses!: Table<QuickAccess>;
  tasks!: Table<Task>;
  logs!: Table<Log>;
  notes!: Table<Note>;
  config!: Table<Config>;
  notebooks!: Table<Notebook>;

  readonly labelRepo = new LabelRepository(this);
  readonly quickAccessRepo = new QuickAccessRepository(this);
  readonly logRepo = new LogRepository(this);
  readonly taskRepo = new TaskRepository(this);
  readonly noteRepo = new NoteRepository(this);
  readonly configRepo = new ConfigRepository(this);
  readonly dashboardRepo = new DashboardRepository(this);
  readonly notebookRepo = new NotebookRepository(this);

  readonly taskQuery = new TaskQueryService(this);
  readonly dashboardQuery = new DashboardQueryService(this);
  readonly notebookQuery = new NotebookQueryService(this);

  readonly taskStats = new TaskStatsCalculator(this);

  // -------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------

  /**
   * Creates an instance of SnDB.
   * @memberof SnDB
   */
  constructor() {
    super("SnDB");
    this.version(7).stores({
      labels: "++id, name, fiscalYear, isSelected",
      quickAccesses: "++id",
      tasks: "++id, statusCode, name, dueDate, fiscalYear, selected",
      logs: "++id, taskId, [taskId+id]",
      notes: "++id, taskId, [taskId+id]",
      config: "id, group, name",
      notebooks: "++id, selected",
    });

    this.on("populate", () => {
      this.quickAccesses.add({
        id: 1,
        isBookmarkSelected: 0,
        isUncategorizedSelected: 0,
        isOverdueSelected: 0,
        isAsapSelected: 0,
        isUpcomingSelected: 0,
        isDoneSelected: 1,
        isProgressSelected: 1,
        isPendingSelected: 1,
      });
    });
  }

  // -------------------------------------------------------------
  // インポート／エクスポート
  // -------------------------------------------------------------

  /**
   * SnDB内の全データをエクスポートします。
   * @returns void
   */
  async exportDatabase(): Promise<void> {
    const tableCounts = await snDB.tasks.count();
    if (tableCounts === 0) return;

    const blob = await snDB.export({
      progressCallback: ({ totalRows, completedRows }) => {
        console.log(`Progress: ${completedRows}/${totalRows}`);
        return true;
      },
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SnDB_backup_${formatDate(new Date(), "yyyyMMddHHmmss")}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * SnDBにデータをインポートします。
   *
   * @param {File} file
   * @return {*}  {Promise<void>}
   * @memberof SnDB
   */
  async importDatabase(file: File): Promise<void> {
    await importInto(snDB, file, {
      overwriteValues: true,
      progressCallback: ({ totalRows, completedRows }) => {
        console.log(`Progress: ${completedRows}/${totalRows}`);
        return true;
      },
    });
  }
}
export const snDB = new SnDB();
