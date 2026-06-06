import { SnDB } from "@sn/database/SnDB";
import { Label } from "@sn/models/Label";

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
      await this.changeLabelSelectionInTransaction(id);

      return id;
    });
  }

  /**
   * 指定したIDのラベルを排他的に選択状態にします。
   * (既存の選択をすべて解除した上で、指定したラベルを選択します)
   * @param id
   */
  async changeLabelSelection(id: number): Promise<void> {
    await this.db.transaction("rw", [this.db.labels], async () => {
      await this.changeLabelSelectionInTransaction(id);
    });
  }

  /**
   * 指定したIDのラベルを排他的に選択状態にします。
   * (既存の選択をすべて解除した上で、指定したラベルを選択します)
   * 親のトランザクションから呼び出します。
   *
   * @param id
   */
  async changeLabelSelectionInTransaction(id: number): Promise<void> {
    await this.deSelectAllLabel();
    await this.selectLabel(id);
  }

  /**
   * IDをキーとして、対象のラベルを選択状態とする。
   *
   * @param {number} id
   * @memberof LabelRepository
   */
  async selectLabel(id: number) {
    await this.db.labels.update(id, {
      isSelected: 1,
      updatedAt: new Date(),
    });
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
