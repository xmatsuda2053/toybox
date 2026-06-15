import { SnDB } from "@sn/database/SnDB";
import { QuickAccess } from "@sn/models/QuickAccess";

/**
 * クイックアクセス（フィルターやタスクの表示状態・モード設定）データの永続化および状態変更を管理するリポジトリクラスです。
 * データベースを介して、クイックアクセス設定の取得・更新、および特定の表示モード（全タスク検索、実行中タスク表示など）への一括切り替え機能を提供します。
 *
 * @export
 * @class QuickAccessRepository
 */
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
   * クイックアクセス設定データを部分更新します。
   *
   * @param {Partial<QuickAccess>} data
   * @return {*}  {Promise<void>}
   * @memberof QuickAccessRepository
   */
  async updateQuickAccess(data: Partial<QuickAccess>): Promise<void> {
    if (!data.id) {
      data.id = 1;
    }
    await this.db.quickAccesses.update(data.id, data);
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

    return await this.db.transaction(
      "rw",
      [this.db.labels, this.db.quickAccesses],
      async () => {
        await this.putQuickAccess(newData);
        await this.db.labelRepo.deSelectAllLabel();
      },
    );
  }

  /**
   * クイックアクセスの選択状態を実行中タスク表示モードに変更します。
   *
   * @memberof QuickAccessRepository
   */
  async changeInProgressMode() {
    return await this.db.transaction(
      "rw",
      [this.db.labels, this.db.quickAccesses],
      async () => {
        await this.changeInProgressModeInTransaction();
      },
    );
  }

  /**
   * クイックアクセスの選択状態を実行中タスク表示モードに変更します。
   * (トランザクション内呼び出し)
   *
   * @memberof QuickAccessRepository
   */
  async changeInProgressModeInTransaction() {
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
    await this.db.labelRepo.deSelectAllLabel();
  }

  /**
   * 状態ラベルがすべて未選択であるか否かをチェックする。
   * (完了、実行中、未実行がすべて未選択)
   *
   * @return {*}  {Promise<boolean>}
   * @memberof QuickAccessRepository
   */
  async deSelectAllStatusLabel(): Promise<boolean> {
    const currentSettings = await this.getQuickAccess();
    if (!currentSettings) return false;

    return (
      currentSettings.isDoneSelected === 0 &&
      currentSettings.isProgressSelected === 0 &&
      currentSettings.isPendingSelected === 0
    );
  }
}
