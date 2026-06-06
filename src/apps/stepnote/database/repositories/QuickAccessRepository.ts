import { SnDB } from "@sn/database/SnDB";
import { QuickAccess } from "@sn/models/QuickAccess";

export class QuickAccessRepository {
  /**
   * Creates an instance of QuickAccessRepository.
   * @param {SnDB} db
   * @memberof QuickAccessRepository
   */
  constructor(private db: SnDB) {}

  /**
   * クイックアクセス設定データを追加/更新します。
   *
   * @param {QuickAccess} data
   * @return {*}  {Promise<number>}
   * @memberof QuickAccessRepository
   */
  async putQuickAccess(data: QuickAccess): Promise<number> {
    return await this.db.quickAccesses.put(data);
  }

  /**
   * クイックアクセス設定データを取得します。
   *
   * @return {*}  {Promise<QuickAccess>}
   * @memberof QuickAccessRepository
   */
  async getQuickAccess(): Promise<QuickAccess> {
    const result = await this.db.quickAccesses.get(1);
    return result!;
  }

  /**
   * クイックアクセスの選択状態を全タスク検索モードに変更します。
   *
   * @memberof QuickAccessRepository
   */
  async changeAllSearchMode() {
    const newData: QuickAccess = {
      id: 1,
      isBookmarkSelected: 0,
      isUncategorizedSelected: 0,
      isOverdueSelected: 0,
      isAsapSelected: 0,
      isUpcomingSelected: 0,
      isDoneSelected: 1,
      isProgressSelected: 1,
      isPendingSelected: 1,
    };
    await this.putQuickAccess(newData);
  }

  /**
   * クイックアクセスの選択状態を実行中タスク表示モードに変更します。
   *
   * @memberof QuickAccessRepository
   */
  async changeInProgressMode() {
    const newData: QuickAccess = {
      id: 1,
      isBookmarkSelected: 0,
      isUncategorizedSelected: 0,
      isOverdueSelected: 0,
      isAsapSelected: 0,
      isUpcomingSelected: 0,
      isDoneSelected: 0,
      isProgressSelected: 1,
      isPendingSelected: 1,
    };
    await this.putQuickAccess(newData);
  }
}
