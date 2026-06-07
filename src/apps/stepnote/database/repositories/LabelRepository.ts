import { SnDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";

/**
 * 分類ラベルデータの永続化、およびラベルの選択状態を管理するリポジトリクラスです。
 * データベースを介してラベルのCRUD操作や名前順の検索を提供するほか、
 * トランザクションを用いた「特定ラベルの排他的な選択状態の切り替え」などの制御を行います。
 *
 * @export
 * @class LabelRepository
 */
export class LabelRepository {
  /**
   * Creates an instance of LabelRepository.
   *
   * @param {SnDB} db
   * @memberof LabelRepository
   */
  constructor(private db: SnDB) {}

  /**
   * ラベルデータを追加/更新します。
   * 変更したラベルを選択状態とします。
   *
   * @param {Label} data
   * @return {*}  {(Promise<number>)}
   * @memberof LabelRepository
   */
  async putLabel(data: Label): Promise<number> {
    const now = new Date();

    if (!data.id) {
      data.createdAt = now;
    }
    data.updatedAt = now;

    return await this.db.transaction("rw", [this.db.labels], async () => {
      const id = await this.db.labels.put(data);
      await this.selectLabelInTransaction(id);

      return id;
    });
  }

  /**
   * 指定したIDのラベルを排他的に選択状態にします。
   * (既存の選択をすべて解除した上で、指定したラベルを選択します)
   * @param id
   */
  async selectLabel(id: number): Promise<void> {
    await this.db.transaction("rw", [this.db.labels], async () => {
      await this.selectLabelInTransaction(id);
    });
  }

  /**
   * 指定したIDのラベルを排他的に選択状態にします。
   * (既存の選択をすべて解除した上で、指定したラベルを選択します)
   * 親のトランザクションから呼び出します。
   *
   * @param id
   */
  async selectLabelInTransaction(id: number): Promise<void> {
    await this.deSelectAllLabel();
    await this.db.labels.update(id, {
      isSelected: 1,
      updatedAt: new Date(),
    });
  }

  /**
   * 指定したIDのラベルを選択状態とし、タスク選択状態を解除します。
   *
   * @param {number} id
   * @return {*}  {Promise<void>}
   * @memberof LabelRepository
   */
  async selectLabelAndDeSelectTask(id: number): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.labels, this.db.tasks],
      async () => {
        await this.selectLabelInTransaction(id);
        await this.db.taskRepo.changeAllTaskUnSelection();
      },
    );
  }

  /**
   * 全てのラベルの選択状態を解除します。
   *
   * @memberof LabelRepository
   */
  async deSelectAllLabel() {
    await this.db.labels.where("isSelected").equals(1).modify({
      isSelected: 0,
      updatedAt: new Date(),
    });
  }

  /**
   * 全てのラベルの選択状態を解除し、タスク選択状態を解除します。
   *
   * @return {*}  {Promise<void>}
   * @memberof LabelRepository
   */
  async deSelectLabelAndDeSelectTask(): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.labels, this.db.tasks],
      async () => {
        await this.deSelectAllLabel();
        await this.db.taskRepo.changeAllTaskUnSelection();
      },
    );
  }

  /**
   * 分類ラベルを検索します。
   * 検索結果は名前の昇順でソートします。
   *
   * @param {string} [keyword]
   * @return {*}  {Promise<Label[]>}
   * @memberof LabelRepository
   */
  async getLabelsAscName(keyword?: string): Promise<Label[]> {
    const collection = this.db.labels.orderBy("name");

    if (!keyword || !keyword.trim()) {
      return await collection.toArray();
    }

    const lowerKeyword = keyword.toLowerCase();
    return await collection
      .filter((label) => {
        return label.name?.toLowerCase().includes(lowerKeyword ?? false);
      })
      .toArray();
  }
}
