/**
 * 指定された時間（ms）、実行を待機させるデバウンス関数
 * * @param func 実行したい関数
 * @param wait 待機時間（ミリ秒）
 * @returns デバウンス処理された関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  // 実際に実行されるメイン関数
  const debounced = (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };

  // タイマーを外部から破棄する
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

/**
 * 対象のエレメントを右に１回転させる。
 *
 * @param el
 * @returns
 */
export function rotateElement(el: HTMLElement | null) {
  if (!el) return;
  el.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
    duration: 350,
    easing: "ease-in-out",
    iterations: 1,
  });
}
