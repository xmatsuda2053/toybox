import { SnDB } from "../SnDB";
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
      await this.selectLabel(id);
      return id;
    });
  }

  /**
   * IDをキーとして、対象のラベルを選択状態とする。
   * 選択済（true）は排他的に設定される。
   *
   * @param {number} id
   * @memberof LabelRepository
   */
  async selectLabel(id: number) {
    const now = new Date();

    await this.db.transaction("rw", [this.db.labels], async () => {
      // 全ての選択を解除
      await this.db.labels.where("isSelected").equals(1).modify({
        isSelected: 0,
        updatedAt: now,
      });

      // 指定したIDを選択状態とする
      await this.db.labels.update(id, {
        isSelected: 1,
        updatedAt: now,
      });
    });
  }

  /**
   * 全てのラベルの選択状態を解除します。
   *
   * @memberof LabelRepository
   */
  async deSelectAllLabel() {
    // 全ての選択を解除
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
