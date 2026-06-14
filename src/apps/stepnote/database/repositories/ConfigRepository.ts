import { SnDB } from "@sn/database/SnDB";
import { Config } from "@sn/models/Config";

/**
 * 設定データの永続化、および設内容を管理するリポジトリクラスです。
 * データベースを介して設定データのCRUD操作や名前順の検索を提供します。
 *
 * @export
 * @class ConfigRepository
 */
export class ConfigRepository {
  /**
   * Creates an instance of ConfigRepository.
   * @param {SnDB} db
   * @memberof ConfigRepository
   */
  constructor(private db: SnDB) {}

  /**
   * 設定データの初期登録を行う。
   * ※初期値が存在しない場合のみ
   *
   * @param {Config[]} defaultConfigs
   * @memberof ConfigRepository
   */
  async initializeDefaultConfig(defaultConfigs: Config[]) {
    await this.db.transaction("rw", this.db.config, async () => {
      for (const defaultConfig of defaultConfigs) {
        const exists = await this.getConfigById(defaultConfig.id);
        if (!exists) {
          await this.putConfig(defaultConfig);
        }
      }
    });
  }

  /**
   * 設定データを追加/更新します。
   *
   * @param {Config} data
   * @return {*}  {Promise<number>}
   * @memberof ConfigRepository
   */
  async putConfig(data: Config): Promise<number> {
    const now = new Date();

    if (!data.createdAt) {
      data.createdAt = now;
    }
    data.updatedAt = now;

    return await this.db.config.put(data);
  }

  /**
   * 全ての設定データを取得します。
   *
   * @return {*}  {Promise<Config[]>}
   * @memberof ConfigRepository
   */
  async getConfigAll(): Promise<Config[]> {
    return await this.db.config.toArray();
  }

  /**
   * IDを条件として設定データを取得します。
   *
   * @param {string} id
   * @return {*}  {(Promise<Config | undefined>)}
   * @memberof ConfigRepository
   */
  async getConfigById(id: string): Promise<Config | undefined> {
    return await this.db.config.get(id);
  }

  /**
   * グループ名を条件として設定データを取得します。
   *
   * @param {string} group
   * @return {*}  {Promise<Config[]>}
   * @memberof ConfigRepository
   */
  async getConfigByGroup(group: string): Promise<Config[]> {
    return await this.db.config.where("group").equals(group).toArray();
  }
}
