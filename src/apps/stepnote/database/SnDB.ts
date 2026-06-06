import Dexie, { Table } from "dexie";
import "dexie-export-import";

import { QuickAccess } from "@sn/models/QuickAccess";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";
import { Log } from "@sn/models/Log";
import { Note } from "@sn/models/Note";
import { TaskStatus } from "@sn/code/TaskStatus";

import { LabelRepository } from "@sn/database/repositories/LabelRepository";
import { QuickAccessRepository } from "@sn/database/repositories/QuickAccessRepository";
import { LogRepository } from "@sn/database/repositories/LogRepository";
import { TaskRepository } from "./repositories/TaskRepository";
import { NoteRepository } from "@sn/database/repositories/NoteRepository";

import { TaskQueryService } from "@sn/database/services/TaskQueryService";
import { TaskStatsCalculator } from "./calculators/TaskStatsCalculator";

import { formatDate } from "@utils/DateUtils";

import { isOverdue, isAsap, isWithinAnyDaysBefore } from "@utils/DateUtils";
import { importInto } from "dexie-export-import";
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

  readonly labelRepo = new LabelRepository(this);
  readonly quickAccessRepo = new QuickAccessRepository(this);
  readonly logRepo = new LogRepository(this);
  readonly taskRepo = new TaskRepository(this);
  readonly noteRepo = new NoteRepository(this);

  readonly taskQuery = new TaskQueryService(this);
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
    this.version(3).stores({
      labels: "++id, name, fiscalYear, isSelected",
      quickAccesses: "++id",
      tasks: "++id, statusCode, name, dueDate, fiscalYear, selected",
      logs: "++id, taskId, [taskId+id]",
      notes: "++id, taskId, [taskId+id]",
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

  // -------------------------------------------------------------
  // ▼ リファクタリング対象
  // -------------------------------------------------------------

  /**
   * タスク一覧を特定の優先順位でソートして取得します。
   * * ソート順序:
   * 1. 年度 (fiscalYear): 降順（新しい年度順）
   * 2. 期限日 (dueDate): 昇順（期限が近い順）
   * 3. 名前 (name): 昇順（五十音/アルファベット順）
   * * @param {string} [keyword]
   * * @returns {Promise<Task[]>} ソート済みのタスク配列
   * @memberof SnDB
   */
  async selectTaskAscSortKey(keyword?: string): Promise<Task[]> {
    const quickAccess = (await this.quickAccesses.toArray())[0];
    const allLabels = await this.labels.toArray();
    const selectedLabelIds = allLabels
      .filter((l) => l.isSelected)
      .map((l) => l.id);
    const existingLabelSet = new Set(allLabels.map((l) => l.id)); // 全ラベルIDのSet

    const hasQuickAccess = (target: QuickAccess) => {
      const { id, ...flags } = target;
      return Object.values(flags).includes(1);
    };

    // 条件未設定の場合、何も表示しない。
    if (
      !keyword &&
      selectedLabelIds.length === 0 &&
      !hasQuickAccess(quickAccess)
    ) {
      return [];
    }

    // フィルタ対象のデータを取得する。
    // - ログとノートは、検索キーワードが存在する場合のみ取得する。
    let result = await this.tasks.toArray();
    let logs = keyword ? await this.logs.toArray() : [];
    let notes = keyword ? await this.notes.toArray() : [];

    // --- [1] 状態・ラベル・クイックアクセスの複合フィルタ（1回の走査にまとめる） ---
    const isDoneOff = quickAccess.isDoneSelected === 0;
    const isProgressOff = quickAccess.isProgressSelected === 0;
    const isPendingOff = quickAccess.isPendingSelected === 0;
    const isBookmarkOn = quickAccess.isBookmarkSelected === 1;
    const isUncategorizedOn = quickAccess.isUncategorizedSelected === 1;
    const isOverdueOn = quickAccess.isOverdueSelected === 1;
    const isAsapOn = quickAccess.isAsapSelected === 1;
    const isUpcomingOn = quickAccess.isUpcomingSelected === 1;

    result = result.filter((task) => {
      const status = TaskStatus.fromCode(task.statusCode);
      const isDone = status.isDone();

      // タスク状態フィルタ
      if (isDoneOff && isDone) return false;
      if (isProgressOff && status.isProgress()) return false;
      if (isPendingOff && status.isPending()) return false;

      // 選択中のラベルに属するタスクであるかチェック
      if (
        selectedLabelIds.length !== 0 &&
        !selectedLabelIds.includes(task.labelId)
      ) {
        return false;
      }

      // クイックアクセスの状態に合致するかチェック
      if (hasQuickAccess(quickAccess)) {
        let qaMatch = false;

        // ブックマークフィルタ
        if (isBookmarkOn && task.bookmark === 1) {
          qaMatch = true;
        }

        // 未分類フィルタ
        if (
          !qaMatch &&
          isUncategorizedOn &&
          !existingLabelSet.has(task.labelId)
        ) {
          qaMatch = true;
        }

        // 期限日超過フィルタ
        if (!qaMatch && isOverdueOn && isOverdue(isDone, task.dueDate)) {
          qaMatch = true;
        }

        // 期限当日フィルタ
        if (!qaMatch && isAsapOn && isAsap(isDone, task.dueDate)) {
          qaMatch = true;
        }

        // 期限間近フィルタ
        if (
          !qaMatch &&
          isUpcomingOn &&
          isWithinAnyDaysBefore(isDone, task.dueDate, 3)
        ) {
          qaMatch = true;
        }

        // いずれのクイックアクセスにもヒットしない場合、false
        if (
          !qaMatch &&
          (isBookmarkOn ||
            isUncategorizedOn ||
            isOverdueOn ||
            isAsapOn ||
            isUpcomingOn)
        ) {
          return false;
        }

        return true;
      }
    });

    // キーワードフィルタ
    // - タスク名,説明,年度
    // - 連絡先（氏名,所属,電話番号)
    // - ログ
    // - ノート
    if (keyword && keyword.trim() !== "") {
      const keywords = keyword
        .trim()
        .toLowerCase()
        .split(/[\s\u3000]+/) // \sは半角空白やタブ、\u3000は全角空白
        .filter(Boolean); // 空文字を除去

      // 計算量を下げるため、どのタスクに、どのログ／タスクが関連付けされているかマッピング
      const logsMap = Map.groupBy(logs, (l) => l.taskId);
      const notesMap = Map.groupBy(notes, (n) => n.taskId);

      result = result.filter((task) => {
        const targetValues = [
          task.name?.toLowerCase(),
          task.description?.toLowerCase(),
          task.fiscalYear.toString(),
          "+" + formatDate(task.createdAt, "yyyy/MM/dd"),
          "@" + formatDate(task.dueDate, "yyyy/MM/dd"),
          ...task.contacts.flatMap((c) => [
            c.name.toLowerCase(),
            c.div.toLowerCase(),
            c.tel,
          ]),
          ...(logsMap.get(task.id!)?.map((l) => l.value.toLowerCase()) ?? []),
          ...(notesMap.get(task.id!)?.map((n) => n.value.toLowerCase()) ?? []),
        ].filter((t) => t?.trim());

        return keywords.every((keyword) => {
          return targetValues.some((value) => {
            return value.includes(keyword);
          });
        });
      });
    }

    // ソート
    result.sort((a, b) => {
      // 1. 年度
      if (b.fiscalYear !== a.fiscalYear) return b.fiscalYear - a.fiscalYear;
      // 2. 期限日
      const timeA = a.dueDate.getTime();
      const timeB = b.dueDate.getTime();
      if (timeA !== timeB) return timeA - timeB;
      // 3. 名前
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  /**
   * タスクに登録されている年度のリストを降順で取得する。
   *
   * @return {*}  {Promise<number[]>}
   * @memberof SnDB
   */
  async getActiveFiscalYears(keyword?: string): Promise<number[]> {
    const tasks = await this.selectTaskAscSortKey(keyword);
    const years = [...new Set(tasks.map((t) => t.fiscalYear))].sort(
      (a, b) => b - a,
    );
    return years as number[];
  }
}
export const snDB = new SnDB();
