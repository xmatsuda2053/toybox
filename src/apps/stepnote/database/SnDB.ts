import Dexie, { Table } from "dexie";
import "dexie-export-import";

import { QuickAccess } from "@sn/models/QuickAccess";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";
import { Log } from "@sn/models/Log";
import { Note } from "@sn/models/Note";
import { TaskStatus } from "@sn/code/TaskStatus";

import { formatDate } from "@utils/DateUtils";

import { isOverdue, isWithinAnyDaysBefore } from "@utils/DateUtils";
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

  /**
   * Creates an instance of SnDB.
   * @memberof SnDB
   */
  constructor() {
    super("SnDB");
    this.version(2).stores({
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
        isDoneSelected: 0,
        isOverdueSelected: 0,
        isUpcomingSelected: 0,
        isProgressSelected: 1,
        isPendingSelected: 1,
        isUncategorizedSelected: 0,
      });
    });
  }

  /**
   * 分類ラベルを追加/更新します。
   *
   * @param {Label} newData
   * @return {*}  {Promise<number>}
   * @memberof SnDB
   */
  async putLabel(newData: Label): Promise<number> {
    const now = new Date();

    newData.updatedAt = now;
    if (!newData.id) {
      newData.createdAt = now;
    }

    return await this.labels.put(newData);
  }

  /**
   * 分類ラベルを検索します。
   * 検索結果は名前の昇順でソートします。
   *
   * @param {string} [keyword]
   * @return {*}  {Promise<Label[]>}
   * @memberof SnDB
   */
  async selectLabelsAscName(keyword?: string): Promise<Label[]> {
    const collection = this.labels.orderBy("name");

    if (!keyword || !keyword.trim()) {
      return await collection.toArray();
    }

    const lowerKeyword = keyword.toLowerCase();
    return await collection
      .filter((label) => {
        return label.name?.toLowerCase().includes(lowerKeyword);
      })
      .toArray();
  }

  /**
   * IDをキーとして、labelの選択状態を更新する。
   * 選択済（true）は排他的に設定される。
   *
   * @param {number} id
   * @param {boolean} isSelected
   * @memberof SnDB
   */
  async updateLabelSelection(id: number, isSelected: number) {
    try {
      if (isSelected) {
        // 全ての選択を解除
        await this.labels.where("isSelected").equals(1).modify({
          isSelected: 0,
          updatedAt: new Date(),
        });

        // 指定したIDを選択状態とする
        const updated = await this.labels.update(id, {
          isSelected: 1,
          updatedAt: new Date(),
        });

        if (!updated) {
          console.log(`ID: ${id} が見つかりませんでした。`);
        }
      } else {
        // 指定したIDの選択状態を解除する
        const updated = await this.labels.update(id, {
          isSelected: 0,
          updatedAt: new Date(),
        });

        if (!updated) {
          console.log(`ID: ${id} が見つかりませんでした。`);
        }
      }
    } catch (error) {
      console.error("update error:", error);
    }
  }

  /**
   * ラベルの選択状態を解除します。
   *
   * @memberof SnDB
   */
  async resetLabelSelected() {
    await this.labels.where("isSelected").equals(1).modify({
      isSelected: 0,
      updatedAt: new Date(),
    });
  }

  /**
   * クイックアクセス設定データを追加または更新します。
   *
   * @param {QuickAccess} newData
   * @return {*}  {Promise<number>}
   * @memberof SnDB
   */
  async putQuickAccess(newData: QuickAccess): Promise<number> {
    if (!newData.id) {
      newData.id = 1;
    }

    return await this.quickAccesses.put(newData);
  }

  /**
   * クイックアクセス設定データを取得します。
   *
   * @return {*}  {(Promise<QuickAccess | undefined>)}
   * @memberof SnDB
   */
  async getQuickAccess(): Promise<QuickAccess> {
    const result = await this.quickAccesses.get(1);
    return result!;
  }

  /**
   * クイックアクセスの選択状態をリセットします。
   *
   * @memberof SnDB
   */
  async resetQuickAccessSelected() {
    const newData: QuickAccess = {
      id: 1,
      isBookmarkSelected: 0,
      isDoneSelected: 1,
      isOverdueSelected: 0,
      isUpcomingSelected: 0,
      isProgressSelected: 1,
      isPendingSelected: 1,
      isUncategorizedSelected: 0,
    };
    await this.putQuickAccess(newData);
  }

  /**
   * タスクを追加/更新します。
   *
   * @param {Task} newData
   * @return {*}  {Promise<number>}
   * @memberof SnDB
   */
  async putTask(newData: Task): Promise<number> {
    const now = new Date();

    newData.updatedAt = now;
    if (!newData.id) {
      newData.createdAt = now;
    }

    return await this.tasks.put(newData);
  }

  /**
   * タスクの状態を更新
   *
   * @param {number} id
   * @param {string} code
   * @return {*}  {Promise<void>}
   * @memberof SnDB
   */
  async changeStatusCode(id: number, code: string): Promise<void> {
    try {
      await this.tasks.update(id, {
        statusCode: code,
      });
    } catch (error) {
      console.error("Failed to update statusCode:", error);
    }
  }

  /**
   * タスクを選択中の状態に変更する。
   *
   * @param {number} id
   * @param {boolean} isLabelSetting
   * @return {*}  {Promise<void>}
   * @memberof SnDB
   */
  async selectSingleTask(
    id?: number,
    isLabelSetting: boolean = false,
  ): Promise<void> {
    try {
      await this.transaction(
        "rw",
        [this.tasks, this.labels, this.quickAccesses],
        async () => {
          // 指定したIDのタスクが存在するかチェック
          const task = await this.tasks.get(id);
          if (!task) return;

          // 現在の選択状態を解除
          await this.tasks.where("selected").equals(1).modify({ selected: 0 });

          // 指定したタスクを選択状態に変更
          await this.tasks.update(id, {
            selected: 1,
          });

          if (!isLabelSetting) return;

          // 指定したタスクのラベルを選択状態に変更
          await this.updateLabelSelection(task.labelId, 1);

          // 指定したタスクのステータスを選択状態に変更
          const oldData = await this.getQuickAccess();
          const newData = { ...oldData };
          const status = TaskStatus.fromCode(task.statusCode);

          if (status.isPending()) {
            newData.isPendingSelected = 1;
          } else if (status.isProgress()) {
            newData.isProgressSelected = 1;
          } else if (status.isDone()) {
            newData.isDoneSelected = 1;
          } else {
            // 何もしない
          }

          await this.putQuickAccess(newData);
        },
      );
    } catch (error) {
      console.error("Failed to update selection:", error);
    }
  }

  /**
   * 期限切れタスクの有無を判定します。
   *
   * @return {*}  {Promise<boolean>}
   * @memberof SnDB
   */
  async hasOverdueTasks(): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      (await this.tasks
        .where("statusCode")
        .anyOf([TaskStatus.PENDING.code, TaskStatus.PROGRESS.code]) // 開始待ち,対応中
        .filter((task) => task.dueDate < today) // 当日(00:00)より前
        .count()) > 0
    );
  }

  /**
   * 期限切れタスクのみ表示する。
   *
   * @memberof SnDB
   */
  async viewOverdueTasks() {
    await snDB.transaction(
      "rw",
      [this.labels, this.quickAccesses, this.tasks],
      async () => {
        await this.resetLabelSelected();
        await this.resetQuickAccessSelected();
        await this.resetTaskSelected();

        const newData: QuickAccess = {
          id: 1,
          isBookmarkSelected: 0,
          isDoneSelected: 0,
          isOverdueSelected: 1,
          isUpcomingSelected: 0,
          isProgressSelected: 1,
          isPendingSelected: 1,
          isUncategorizedSelected: 0,
        };

        await this.putQuickAccess(newData);
      },
    );
  }

  /**
   * タスクの選択状態を解除します。
   *
   * @return {*}  {Promise<void>}
   * @memberof SnDB
   */
  async resetTaskSelected(): Promise<void> {
    try {
      await this.tasks.where("selected").equals(1).modify({ selected: 0 });
    } catch (error) {
      console.error("Failed to update selection:", error);
    }
  }

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
          (isBookmarkOn || isUncategorizedOn || isOverdueOn || isUpcomingOn)
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

  /**
   * 指定したタスクのブックマーク状態をトグル（反転）させます。
   * 更新時には updatedAt を現在時刻に更新します。
   *
   * @param {Task} task
   * @return {*}
   * @memberof SnDB
   */
  async toggleBookmark(task: Task): Promise<void> {
    if (!task.id) return;

    await this.tasks.update(task.id, {
      bookmark: task.bookmark === 0 ? 1 : 0,
      updatedAt: new Date(),
    });
  }

  /**
   * ログを追加/更新します。
   *
   * @param {Log} newLog
   * @return {*}  {Promise<number>}
   * @memberof SnDB
   */
  async putLog(newLog: Log): Promise<number> {
    const now = new Date();

    newLog.updatedAt = now;
    if (!newLog.id) {
      newLog.createdAt = now;
    }

    return await this.logs.put(newLog);
  }

  /**
   * ログを検索します。
   * 検索結果はIDの昇順でソートします。
   *
   * @param {Number} taskId
   * @return {*}  {Promise<Log[]>}
   * @memberof SnDB
   */
  async selectLogsAscId(taskId: number): Promise<Log[]> {
    if (!this.logs) {
      return [];
    }
    return this.logs
      .where("[taskId+id]")
      .between([taskId, Dexie.minKey], [taskId, Dexie.maxKey])
      .toArray();
  }

  /**
   * ノートを追加/更新します。
   *
   * @param {Note} newNote
   * @return {*}  {Promise<number>}
   * @memberof SnDB
   */
  async putNote(newNote: Note): Promise<number> {
    const now = new Date();

    newNote.updatedAt = now;
    if (!newNote.id) {
      newNote.createdAt = now;
    }

    return await this.notes.put(newNote);
  }

  /**
   * ログを検索します。
   * 検索結果はIDの昇順でソートします。
   * ※現時点でノートは、タスクに対して１つ
   *
   * @param {number} taskId
   * @return {*}  {Promise<Note[]>}
   * @memberof SnDB
   */
  async selectNotesAscId(taskId: number): Promise<Note[]> {
    if (!this.notes) {
      return [];
    }
    return this.notes
      .where("[taskId+id]")
      .between([taskId, Dexie.minKey], [taskId, Dexie.maxKey])
      .toArray();
  }

  /**
   * データをエクスポートする
   *
   * @memberof SnDB
   */
  async exportDatabase() {
    // 1. 各テーブルのデータ件数を取得
    const tableCounts = await snDB.tasks.count();
    if (tableCounts === 0) {
      return; // タスク未登録の場合はエクスポート不要
    }

    // 2. エクスポート処理の実行
    const blob = await snDB.export({
      progressCallback: ({ totalRows, completedRows }) => {
        console.log(`Progress: ${completedRows}/${totalRows}`);
        return true;
      },
    });

    // 3. ダウンロード処理
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SnDB_backup_${formatDate(new Date(), "yyyyMMddHHmmss")}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /**
   * データをインポートする
   *
   * @param {File} file
   * @memberof SnDB
   */
  async importDatabase(file: File) {
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
