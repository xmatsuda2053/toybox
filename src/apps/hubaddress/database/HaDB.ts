import Dexie, { Table } from "dexie";
import { FileData, Category } from "@ha/models/FileData";
import { SearchKeyword } from "@ha/models/SearchKeyword";

/**
 * データベース
 *
 * @export
 * @class HaDB
 * @extends {Dexie}
 */
export class HaDB extends Dexie {
  fileData!: Table<FileData>;
  searchKeywords!: Table<SearchKeyword>;

  /**
   * Creates an instance of CccGoDB.
   * @memberof CccGoDB
   */
  constructor() {
    super("HaDB");
    this.version(1).stores({
      fileData: "++id, category, *searchTerms",
      searchKeywords: "category",
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
   * 検索キーワードが設定されている場合、フィルタを実行する。
   *
   * @param {Category} category
   * @return {*}  {Promise<FileData[]>}
   * @memberof HaDB
   */
  async getDataByCategoryAndFilter(category: Category): Promise<FileData[]> {
    const keyword = await this.getSearchKeywordByCategory(category);
    const allData = await this.fileData
      .where("category")
      .equals(category)
      .toArray();

    if (keyword.trim() === "") {
      return allData;
    }

    const keywords = keyword
      .split(/[\s\u3000]+/) // 半角スペース・全角スペースの連続に対応
      .filter((t) => t.length > 0);

    return allData.filter((file) => {
      return keywords.every((t) =>
        file.searchTerms.some((term) => term.includes(t)),
      );
    });
  }

  /**
   * 検索キーワードを保存する。
   *
   * @param {Category} category
   * @param {string} keyword
   * @memberof HaDB
   */
  async putSearchKeyword(category: Category, keyword: string) {
    const data: SearchKeyword = {
      category: category,
      keyword: keyword,
    };
    await this.searchKeywords.put(data);
  }

  /**
   * 検索キーワードを追記する。
   *
   * @param {Category} category
   * @param {string} keyword
   * @memberof HaDB
   */
  async concatSearchKeyword(category: Category, keyword: string) {
    const data = await this.searchKeywords.get(category);
    if (!data) {
      await this.putSearchKeyword(category, keyword);
      return;
    }
    const newKeyword = data.keyword + " " + keyword;
    await this.putSearchKeyword(category, newKeyword);
  }

  /**
   * 検索キーワードを取得する。
   *
   * @param {Category} category
   * @return {*}  {Promise<string>}
   * @memberof HaDB
   */
  async getSearchKeywordByCategory(category: Category): Promise<string> {
    const result = await this.searchKeywords.get(category);
    if (!result) {
      return "";
    }
    return result.keyword;
  }

  /**
   * 検索キーワードをクリアする。
   *
   * @memberof HaDB
   */
  async clearSearchKeyword() {
    // 1. 現在のデータベース接続を閉じる
    this.close();

    // 2. データベース自体を削除（これでカウンターがリセットされる）
    await this.delete();

    // 3. 再度データベースを開く（スキーマが再定義される）
    await this.open();
  }
}
export const haDB = new HaDB();
