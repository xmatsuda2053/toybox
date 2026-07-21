import { SnDB } from "@sn/database/SnDB";
import { Notebook } from "@sn/models/Notebook";

/**
 * ノートブックのクエリ操作を提供するサービスクラスです。
 * データの変更は行わず、フィルタリングやソートを組み合わせた取得ロジックをカプセル化します。
 *
 * @export
 * @class NotebookQueryService
 */
export class NotebookQueryService {
  /**
   * Creates an instance of NotebookQueryService.
   * @param {SnDB} db
   * @memberof NotebookQueryService
   */
  constructor(private db: SnDB) {}

  /**
   * 選択中のノートブックを取得します。
   *
   * @return {*}  {(Promise<Notebook | undefined>)}
   * @memberof NotebookQueryService
   */
  async getNotebookSelected(): Promise<Notebook | undefined> {
    return this.db.notebooks.where({ selected: 1 }).first();
  }

  /**
   * キーワードでソートしてノートブックを取得します。
   *
   * @param {string} [keyword]
   * @return {*}  {Promise<Notebook[]>}
   * @memberof NotebookQueryService
   */
  async getNotebookAscSortKey(keyword?: string): Promise<Notebook[]> {
    // 全てのタスクデータを取得する。
    let result = await this.db.notebooks.toArray();

    // キーワードでフィルタする。
    if (keyword && keyword.trim() !== "") {
      result = this._filterByKeywords(result, keyword);
    }

    // ピンを優先し、さらにタイトルでソートする。
    result.sort((a, b) => {
      if (b.pin !== a.pin) return b.pin - a.pin;
      return a.title.localeCompare(b.title);
    });

    return result;
  }

  /**
   * キーワードによる絞り込みを行う。
   *
   * @private
   * @param {Notebook[]} notebooks
   * @param {string} keyword
   * @return {*}  {Notebook[]}
   * @memberof NotebookQueryService
   */
  private _filterByKeywords(
    notebooks: Notebook[],
    keyword: string,
  ): Notebook[] {
    // キーワードを配列化する。※複数条件を考慮
    const keywords = keyword
      .trim()
      .toLowerCase()
      .split(/[\s\u3000]+/) // \sは半角空白やタブ、\u3000は全角空白
      .filter(Boolean); // 空文字を除去

    return notebooks.filter((nb) => {
      // 検索対象文字列をすべてフラットな配列として抽出
      const targets = [nb.title?.toLowerCase(), nb.value?.toLowerCase()].filter(
        (t) => t?.trim(),
      );

      // すべてのキーワード（AND）が、いずれかの項目（OR）に含まれているか
      return keywords.every((kw) => {
        return targets.some((v) => {
          return v.includes(kw);
        });
      });
    });
  }
}
