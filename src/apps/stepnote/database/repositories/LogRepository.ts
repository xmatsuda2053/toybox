import Dexie from "dexie";
import { SnDB } from "@sn/database/SnDB";
import { Log } from "@sn/models/Log";

/**
 * ログデータの永続化およびデータアクセスを管理するリポジトリクラスです。
 * データベース（Dexie.js等）を介して、ログ（Log）の追加、更新、およびタスクIDに紐づく検索機能を提供します。
 *
 * @export
 * @class LogRepository
 */
export class LogRepository {
  /**
   * Creates an instance of LogRepository.
   * @param {SnDB} db
   * @memberof LogRepository
   */
  constructor(private db: SnDB) {}

  /**
   * ログを新規追加します。
   *
   * @param {Log} data
   * @return {*}  {Promise<number>}
   * @memberof LogRepository
   */
  async addLog(data: Log): Promise<number> {
    const now = new Date();

    if (!data.id) {
      data.createdAt = now;
    }
    data.updatedAt = now;

    return await this.db.logs.add(data);
  }

  /**
   * ログを更新します。
   *
   * @param {Partial<Log>} data
   * @return {*}  {Promise<void>}
   * @memberof LogRepository
   */
  async updateLog(data: Partial<Log>): Promise<void> {
    if (!data.id) return;

    data.updatedAt = new Date();
    await this.db.logs.update(data.id, data);
  }

  /**
   * ログを検索します。
   * 検索結果はIDの昇順でソートします。
   *
   * @param {number} taskId
   * @return {*}  {Promise<Log[]>}
   * @memberof LogRepository
   */
  async getLogsAscId(taskId: number): Promise<Log[]> {
    if (!this.db.logs) return [];

    return this.db.logs
      .where("[taskId+id]")
      .between([taskId, Dexie.minKey], [taskId, Dexie.maxKey])
      .toArray();
  }
}
