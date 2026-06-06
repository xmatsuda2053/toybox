import Dexie from "dexie";
import { SnDB } from "@sn/database/SnDB";
import { Note } from "@sn/models/Note";

/**
 * タスクに紐づくノート（メモ）データの永続化およびデータアクセスを管理するリポジトリクラスです。
 * データベースを介してノートの追加、更新、およびタスクIDをキーとした検索機能を提供します。
 * （※現時点の仕様において、ノートは1つのタスクに対して1つのペアとして管理されます）
 *
 * @export
 * @class NoteRepository
 */
export class NoteRepository {
  /**
   * Creates an instance of NoteRepository.
   * @param {SnDB} db
   * @memberof NoteRepository
   */
  constructor(private db: SnDB) {}

  /**
   * ノートを追加します。
   *
   * @param {Note} date
   * @return {*}  {Promise<number>}
   * @memberof NoteRepository
   */
  async addNote(date: Note): Promise<number> {
    const now = new Date();

    if (!date.id) {
      date.createdAt = now;
    }
    date.updatedAt = now;

    return await this.db.notes.put(date);
  }

  /**
   * ノートを更新します。
   *
   * @param {Partial<Note>} data
   * @return {*}  {Promise<void>}
   * @memberof NoteRepository
   */
  async updateNote(data: Partial<Note>): Promise<void> {
    if (!data.id) return;

    data.updatedAt = new Date();
    await this.db.notes.update(data.id, data);
  }

  /**
   * ログを検索します。
   * 検索結果はIDの昇順でソートします。
   * ※現時点でノートは、タスクに対して１つ
   *
   * @param {number} taskId
   * @return {*}  {Promise<Note[]>}
   * @memberof NoteRepository
   */
  async getNotesAscId(taskId: number): Promise<Note[]> {
    if (!this.db.notes) return [];

    return this.db.notes
      .where("[taskId+id]")
      .between([taskId, Dexie.minKey], [taskId, Dexie.maxKey])
      .toArray();
  }
}
