import Dexie, { Table } from "dexie";
import "dexie-export-import";

import { QuickAccess } from "@sn/models/QuickAccess";
import { Label } from "@sn/models/Label";
import { Task } from "@sn/models/Task";
import { Contact } from "@sn/models/Contact";
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
    this.version(1).stores({
      labels: "++id, name, fiscalYear, isSelected",
      quickAccesses: "++id",
      tasks: "++id, name, dueDate, fiscalYear, selected",
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
        isProgressSelected: 0,
        isPendingSelected: 0,
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

    const selectedLabelIds = (await this.labels.toArray())
      .filter((label) => label.isSelected)
      .map((label) => {
        return label.id;
      });

    const hasQuickAccessSelected = (target: QuickAccess) => {
      const { id, ...flags } = target;
      return Object.values(flags).includes(1);
    };

    // 条件未設定の場合、何も表示しない。
    if (
      !keyword &&
      selectedLabelIds.length === 0 &&
      !hasQuickAccessSelected(quickAccess)
    ) {
      return [];
    }

    let result = await this.tasks.toArray();
    let logs = await this.logs.toArray();
    let notes = await this.notes.toArray();

    // タスク状態判定は最初に行う。
    const isDoneOff = quickAccess.isDoneSelected === 0;
    const isProgressOff = quickAccess.isProgressSelected === 0;
    const isPendingOff = quickAccess.isPendingSelected === 0;
    if (isDoneOff || isProgressOff || isPendingOff) {
      result = result.filter((task) => {
        const taskStatus = TaskStatus.fromCode(task.statusCode);
        if (isDoneOff && taskStatus.isDone()) return false;
        if (isProgressOff && taskStatus.isProgress()) return false;
        if (isPendingOff && taskStatus.isPending()) return false;
        return true;
      });
    }

    // ラベルフィルタ
    if (selectedLabelIds.length !== 0) {
      result = result.filter((task) => {
        return selectedLabelIds.some((id) => {
          return task.labelId === id;
        });
      });
    }

    // クイックアクセスフィルタ
    const isBookmarkOn = quickAccess.isBookmarkSelected === 1;
    const isUncategorizedOn = quickAccess.isUncategorizedSelected === 1;
    const isOverdueOn = quickAccess.isOverdueSelected === 1;
    const isUpcomingOn = quickAccess.isUpcomingSelected === 1;

    if (hasQuickAccessSelected(quickAccess)) {
      // フィルタ：お気に入り、未分類
      if (isBookmarkOn || isUncategorizedOn) {
        const labelIdsInResult = [
          ...new Set(result.map((task) => task.labelId)),
        ];

        const existingLabelIds = await this.labels
          .where("id")
          .anyOf(labelIdsInResult)
          .primaryKeys();

        const existingLabelsSet = new Set(existingLabelIds);

        result = result.filter((task) => {
          const bookmark = task.bookmark === 1;
          const existLabel = existingLabelsSet.has(task.labelId);
          if (isBookmarkOn && bookmark) return true;
          if (isUncategorizedOn && !existLabel) return true;
          return false;
        });
      }

      // フィルタ：期限切れ、期限間近
      if (isOverdueOn || isUpcomingOn) {
        result = result.filter((task) => {
          const taskStatus = TaskStatus.fromCode(task.statusCode);
          const overdue = isOverdue(taskStatus.isDone(), task.dueDate);
          const upcoming = isWithinAnyDaysBefore(
            taskStatus.isDone(),
            task.dueDate,
            3,
          );

          if (isOverdueOn && overdue) return true;
          if (isUpcomingOn && upcoming) return true;
          return false;
        });
      }
    }

    // キーワードフィルタ
    if (keyword && keyword.trim() !== "") {
      const lowerKeyword = keyword.toLowerCase();

      const filterKeys: (keyof Task)[] = ["name", "description"];
      const contactFields: (keyof Contact)[] = ["name", "div", "tel"];

      result = result.filter((task) => {
        // 指定したキーのいずれかにキーワードが含まれているか判定
        const matchesMainFields = filterKeys.some((key) => {
          const value = task[key];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(lowerKeyword)
          );
        });

        // contacts（配列）の中の要素も検索対象に含める
        const matchInContacts = task.contacts?.some((contact) => {
          return contactFields.some((key) => {
            const value = contact[key];
            return (
              typeof value === "string" &&
              value.toLowerCase().includes(lowerKeyword)
            );
          });
        });

        // logs（ログ）の中の要素も検索対象に含める
        const matchInLogs = logs.some((log) => {
          return (
            task.id === log.taskId &&
            log.value.toLowerCase().includes(lowerKeyword)
          );
        });

        // notes（ノート）の中の要素も検索対象に含める
        const matchInNotes = notes.some((note) => {
          return (
            task.id === note.taskId &&
            note.value.toLowerCase().includes(lowerKeyword)
          );
        });

        return (
          matchesMainFields || matchInContacts || matchInLogs || matchInNotes
        );
      });
    }

    // ソート
    result.sort((a, b) => {
      // 比較ロジックの配列（インデックスが小さいほど優先度が高い）
      const comparators = [
        () => b.fiscalYear - a.fiscalYear, // [1] 年度の降順
        () => a.dueDate.getTime() - b.dueDate.getTime(), // [2] 期限日の昇順
        () => a.name.localeCompare(b.name), // [3] 名前の昇順
      ];

      for (const compare of comparators) {
        const res = compare();
        // 0以外（差がある）場合は、その時点で順序を確定させる
        if (res !== 0) return res;
      }

      return 0;
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
