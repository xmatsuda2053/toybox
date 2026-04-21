/**
 * カスタムイベントを生成し、指定した要素から送出（dispatch）します。
 * デフォルトで bubbles と composed が true に設定されており、Shadow DOM の境界を越えて伝播します。
 * @param el - イベントを発生させる対象のHTML要素
 * @param name - カスタムイベントの名前（例: 'fg-change'）
 * @param options - CustomEvent に渡す追加オプション。detail や bubbles の上書きが可能です
 * @returns 送出された CustomEvent オブジェクト
 */
export function emit(el: HTMLElement, name: string, options?: CustomEventInit) {
  const event = new CustomEvent(name, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: {},
    ...options, // オプションで上書き可能（個別に false にすることも可能）
  });

  el.dispatchEvent(event);
  return event;
}
