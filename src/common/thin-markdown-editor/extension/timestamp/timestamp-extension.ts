import { formatDate } from "@utils/DateUtils";

/**
 * テキストエリアの現在のカーソル位置（または選択範囲）に、現在日時のタイムスタンプを挿入します。
 * * 「yyyy/MM/dd(EEE) HH:mm:ss」形式のタイムスタンプを生成します。
 * * 挿入後、カーソル位置はタイムスタンプの直後に自動的に移動します。
 *
 * @param {HTMLTextAreaElement} textarea - タイムスタンプを挿入する対象のテキストエリア要素
 * @returns {void}
 */
export const addTimeStamp = (textarea: HTMLTextAreaElement): void => {
  const timestamp = formatDate(new Date(), "yyyy/MM/dd(EEE) HH:mm:ss");

  // 選択範囲の位置情報を取得
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const oldText = textarea.value;

  textarea.value =
    oldText.substring(0, start) +
    timestamp +
    oldText.substring(end, oldText.length);

  const newCursorPos = start + timestamp.length;
  textarea.selectionStart = newCursorPos;
  textarea.selectionEnd = newCursorPos;
};
