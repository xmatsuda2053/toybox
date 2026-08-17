import { SnDB } from "@sn/database/SnDB";
import { Notebook } from "@sn/models/notebook/Notebook";

/**
 * ノートブックの永続化操作を担うリポジトリクラス。
 * IndexedDB（SnDB）を介してノートブックの追加・更新・削除・選択状態の管理を行います。
 *
 * @export
 * @class NotebookRepository
 */
export class NotebookRepository {
  /**
   * Creates an instance of NotebookRepository.
   * @param {SnDB} db
   * @memberof NotebookRepository
   */
  constructor(private db: SnDB) {}

  /**
   * ノートブックを追加します。
   *
   * @param {Notebook} data
   * @return {*}  {Promise<number>}
   * @memberof NotebookRepository
   */
  async addNotebook(data: Notebook): Promise<number> {
    const now = new Date();

    if (!data.id) {
      data.createdAt = now;
    }
    data.updatedAt = now;

    return await this.db.notebooks.put(data);
  }

  /**
   * ノートブックを更新します。
   *
   * @param {Partial<Notebook>} data
   * @return {*}  {Promise<void>}
   * @memberof NotebookRepository
   */
  async updateNotebook(data: Partial<Notebook>): Promise<void> {
    if (!data.id) return;
    data.updatedAt = new Date();
    await this.db.notebooks.update(data.id, data);
  }

  /**
   * ノートブックを削除します。
   *
   * @param {number} id
   * @return {*}  {Promise<void>}
   * @memberof NotebookRepository
   */
  async deleteNotebook(id: number): Promise<void> {
    await this.db.notebooks.delete(Number(id));
  }

  /**
   * 指定したノートブックを現在の選択状態にします。
   *
   * @param {number} id
   * @return {*}  {Promise<void>}
   * @memberof NotebookRepository
   */
  async selected(id: number): Promise<void> {
    const numericId = Number(id);
    await this.db.transaction("rw", [this.db.notebooks], async () => {
      // Notebookの有無を確認する
      const notebook = await this.db.notebooks.get(numericId);
      if (!notebook) return;

      // 現在の選択状態を解除
      await this.db.notebooks
        .where("selected")
        .equals(1)
        .modify({ selected: 0 });

      // 指定したNotebookを選択状態に変更
      await this.db.notebooks.update(numericId, { selected: 1 });
    });
  }

  /**
   * ノートブックのピンを設定／解除します。
   *
   * @param {number} id
   * @return {*}  {Promise<void>}
   * @memberof NotebookRepository
   */
  async pined(id: number): Promise<void> {
    const numericId = Number(id);
    await this.db.transaction("rw", [this.db.notebooks], async () => {
      // Notebookの有無を確認する
      const notebook = await this.db.notebooks.get(numericId);
      if (!notebook) return;

      const pin = notebook.pin == 1 ? 0 : 1;

      // 指定したNotebookのpinを変更する
      await this.db.notebooks.update(numericId, { pin: pin });
    });
  }
}
