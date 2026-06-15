import { liveQuery } from "dexie";
import { snDB } from "@sn/database/SnDB";
import { Config } from "@/apps/stepnote/models/Config";

/**
 * 設定データの初期値
 */
const DEFAULT_CONFIG: Config[] = [
  {
    id: "g01_0001",
    group: "g01",
    name: "TaskLimitDayCount",
    value: {
      day: 3,
    },
  },
];

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
   * @return {*}  {T} 型定義されたvalueオブジェクト
   * @memberof ConfigUtils
   */
  private fetch<T>(id: string): Config<T> {
    const defaultConfig = DEFAULT_CONFIG.find((c) => c.id === id)! as Config<T>;
    const config = this._config.find((c) => c.id === id) as Config<T>;
    return config ?? defaultConfig;
  }

  /**
   * タスク期日の通知を行う際の基準日数
   *
   * @return {*}  {(Config | undefined)}
   * @memberof ConfigUtils
   */
  get_g01_0001(): Config {
    return this.fetch<{ day: number }>("g01_0001");
  }

  /**
   * タスク期日の通知を行う際の基準日数（valueのみ)
   *
   * @return {*}  {number}
   * @memberof ConfigUtils
   */
  get_g01_0001_value(): { day: number } {
    return this.get_g01_0001().value;
  }

  /**
   * キャッシュの初期化とDB監視の開始
   * 💡 アプリの起動時（main.ts やルートコンポーネントの初期化時）に1回だけ呼び出します
   *
   * @memberof ConfigUtils
   */
  async initialize() {
    // liveQueryで「TaskLimitDay」の変更を永続的に監視
    liveQuery(async () => {
      return await snDB.configRepo.getConfigAll();
    }).subscribe({
      next: (config) => {
        this._config = config;
      },
      error: (err) => console.error("[Cache] 監視エラー:", err),
    });

    await snDB.configRepo.initializeDefaultConfig(DEFAULT_CONFIG);
  }
}

export const configUtils = new ConfigUtils();
