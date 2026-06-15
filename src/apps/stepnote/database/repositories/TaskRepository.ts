import { SnDB } from "@sn/database/SnDB";
import { Task } from "@sn/models/Task";
import { TaskStatus } from "@sn/code/TaskStatus";

/**
 * タスクデータの永続化および状態変更を管理するリポジトリクラスです。
 * データベースを介して、タスクの追加・更新および状態変更などの機能を提供します。
 *
 * @export
 * @class TaskRepository
 */
export class TaskRepository {
  /**
   * Creates an instance of TaskRepository.
   * @param {SnDB} db
   * @memberof TaskRepository
   */
  constructor(private db: SnDB) {}

  /**
   * タスクを新規追加します。
   * ログ、ノートの初期データも登録し、新規タスクを選択状態とします。
   *
   * @param {Task} data
   * @return {*}  {Promise<number>}
   * @memberof TaskRepository
   */
  async addTask(data: Task): Promise<number> {
    return await this.db.transaction(
      "rw",
      [
        this.db.tasks,
        this.db.logs,
        this.db.notes,
        this.db.labels,
        this.db.quickAccesses,
      ],
      async () => {
        const now = new Date();

        if (!data.id) {
          data.createdAt = now;
        }
        data.updatedAt = now;

        console.log(data);

        const id = await this.db.tasks.add(data);

        // 初期ログ、初期ノート、タスク選択状態設定、ラベル選択状態設定を平行で実施する。
        await Promise.all([
          await this.db.logRepo.addLog({
            taskId: id,
            value: "#### 新規追加",
          }),
          await this.db.noteRepo.addNote({
            taskId: id,
            value: "",
          }),
          await this.changeTaskSelectionInTransaction(id),
          await this.db.labelRepo.selectLabelInTransaction(data.labelId),
        ]);

        return id;
      },
    );
  }

  /**
   * タスクを更新する。
   *
   * @param {Partial<Task>} newData
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async updateTask(data: Partial<Task>): Promise<void> {
    if (!data.id) return;

    data.updatedAt = new Date();
    await this.db.tasks.update(data.id, data);
  }

  /**
   * タスクを更新する。※更新日の設定なし
   *
   * @private
   * @param {Partial<Task>} data
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async updateTaskInternalWithoutTimestamp(data: Partial<Task>): Promise<void> {
    if (!data.id) return;
    await this.db.tasks.update(data.id, data);
  }

  /**
   * タスクを更新する。
   * このメソッドは、タスクに設定したラベル更新時に実行するため、ラベルの選択状態も変更する。
   *
   * @param {Partial<Task>} data
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async updateTaskAndSelectLabel(data: Partial<Task>): Promise<void> {
    if (!data.id) return;

    this.db.transaction("rw", [this.db.tasks, this.db.labels], async () => {
      await this.updateTask(data);
      if (!data.labelId) return;
      await this.db.labelRepo.selectLabelInTransaction(data.labelId);
    });
  }

  /**
   * タスクを削除します。
   *
   * @param {number} id
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async deleteTask(id: number): Promise<void> {
    await this.db.transaction("rw", [this.db.tasks], async () => {
      await this.db.tasks.delete(id);
      await this.changeAllTaskUnSelection();
    });
  }

  /**
   * タスクを選択状態に変更する。
   *
   * @param {number} [id]
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async changeTaskSelection(id?: number): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.tasks, this.db.labels, this.db.quickAccesses],
      async () => {
        await this.changeTaskSelectionInTransaction(id);
      },
    );
  }

  /**
   * タスクを選択状態にする。
   * タスク情報に合わせてナビゲーションの状態も更新する。
   *
   * @param {number} [id]
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async changeTaskAndNavSelection(id?: number): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.tasks, this.db.labels, this.db.quickAccesses],
      async () => {
        const task = await this.db.tasks.get(id);
        if (!task) return;

        // タスクを選択状態に変更
        await this.changeTaskSelectionInTransaction(id);

        // 指定したタスクのラベルを選択状態に変更
        await this.db.labelRepo.selectLabelInTransaction(task.labelId);

        // 指定したタスクのステータスを選択状態に変更
        const status = TaskStatus.fromCode(task.statusCode);
        const keyMap = [
          { check: () => status.isPending(), key: "isPendingSelected" },
          { check: () => status.isProgress(), key: "isProgressSelected" },
          { check: () => status.isDone(), key: "isDoneSelected" },
        ];
        const matched = keyMap.find((item) => item.check());

        // 指定したタスクに合わせてクイックアクセスの状態を変更
        const quickAccessData = matched ? { [matched.key]: 1 } : undefined;
        if (!quickAccessData) return;
        await this.db.quickAccessRepo.updateQuickAccess(quickAccessData);
      },
    );
  }

  /**
   * タスクを選択状態に変更する。
   * 親のトランザクションから呼び出します。
   *
   * @param {number} [id]
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async changeTaskSelectionInTransaction(id?: number): Promise<void> {
    // 指定したIDのタスクが存在するかチェック
    const task = await this.db.tasks.get(id);
    if (!task) return;

    // 現在の選択状態を解除
    await this.changeAllTaskUnSelection();

    // 指定したタスクを選択状態に変更
    await this.updateTaskInternalWithoutTimestamp({
      id: id,
      selected: 1,
    });
  }

  /**
   * タスクの選択状態を解除します。
   *
   * @memberof TaskRepository
   */
  async changeAllTaskUnSelection() {
    await this.db.tasks.where("selected").equals(1).modify({ selected: 0 });
  }

  /**
   * タスクの状態を更新します。
   *
   * @param {{
   *     id: number;
   *     afterCode: string;
   *     beforeCode: string;
   *   }} data
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async changeStatusCode(data: {
    id: number;
    afterCode: string;
    beforeCode: string;
  }): Promise<void> {
    await this.db.transaction("rw", [this.db.tasks, this.db.logs], async () => {
      await this.db.tasks.update(data.id, {
        statusCode: data.afterCode,
      });

      const beforeStatus = TaskStatus.fromCode(data.beforeCode);
      const afterStatus = TaskStatus.fromCode(data.afterCode);

      await this.db.logRepo.addLog({
        taskId: data.id,
        value: `#### 状態変更\n- ${beforeStatus.label} > ${afterStatus.label}`,
      });
    });
  }

  /**
   * 指定したタスクのブックマーク状態をトグル（反転）させます。

   *
   * @param {Task} task
   * @return {*}  {Promise<void>}
   * @memberof TaskRepository
   */
  async toggleBookmark(id: number): Promise<void> {
    await this.db.transaction("rw", [this.db.tasks], async () => {
      await this.db.tasks
        .where("id")
        .equals(id)
        .modify((task) => {
          task.bookmark = task.bookmark === 0 ? 1 : 0;
        });
    });
  }
}
