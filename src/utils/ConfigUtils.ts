import { liveQuery } from "dexie";
import { snDB } from "@sn/database/SnDB";
import { Config } from "@/apps/stepnote/models/Config";

/**
 * アプリ全体の設定値をメモリ上にキャッシュするマネージャー
 */
class ConfigUtils {
  private _config: Config[] = [];

  /**
   * 指定したIDのデータを読み取る。
   *
   * @template T
   * @param {string} id
   * @param {T} fallback DBからロードされる前や、データがない場合のデフォルト値
   * @return {*}  {T} 型定義されたvalueオブジェクト
   * @memberof ConfigUtils
   */
  fetch<T>(id: string, fallback: T): T {
    const config = this._config.find((c) => c.id === id) as Config<T>;
    return config?.value ?? fallback;
  }

  /**
   * タスク期日の通知を行う際の基準日数
   *
   * @return {*}  {number}
   * @memberof ConfigUtils
   */
  getG01_0001(): number {
    return this.fetch<{ day: number }>("g01_0001", {
      day: 3,
    }).day;
  }

  /**
   * キャッシュの初期化とDB監視の開始
   * 💡 アプリの起動時（main.ts やルートコンポーネントの初期化時）に1回だけ呼び出します
   *
   * @memberof ConfigUtils
   */
  initialize() {
    // liveQueryで「TaskLimitDay」の変更を永続的に監視
    liveQuery(async () => {
      // id: 1 の設定データを取得 (前回の実装に基づき)
      return await snDB.configRepo.getConfigAll();
    }).subscribe({
      next: (config) => {
        this._config = config;
      },
      error: (err) => console.error("[Cache] 監視エラー:", err),
    });
  }
}

export const configUtils = new ConfigUtils();
