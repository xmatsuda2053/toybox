import Dexie, { Table } from "dexie";
import { FileData, Category } from "../models/FileData";

/**
 * データベース
 *
 * @export
 * @class HaDB
 * @extends {Dexie}
 */
export class HaDB extends Dexie {
  fileData!: Table<FileData>;

  /**
   * Creates an instance of CccGoDB.
   * @memberof CccGoDB
   */
  constructor() {
    super("HaDB");
    this.version(1).stores({
      fileData: "++id, category, *searchTerms",
    });
  }

  /**
   * データを削除する。
   *
   * @memberof HaDB
   */
  async deleteData() {
    await this.fileData.clear();
  }

  /**
   * データを登録する。
   *
   * @param {FileData[]} data
   * @return {*}  {Promise<number>}
   * @memberof HaDB
   */
  async importData(data: FileData[]): Promise<number> {
    return await this.fileData.bulkAdd(data);
  }

  /**
   * カテゴリに合致するデータを取得する。
   *
   * @param {Category} category
   * @return {*}  {Promise<FileData[]>}
   * @memberof HaDB
   */
  async getDataByCategory(category: Category): Promise<FileData[]> {
    return await this.fileData.where("category").equals(category).toArray();
  }
}
export const haDB = new HaDB();
