import { registerIconLibrary } from "@awesome.me/webawesome/dist/webawesome.js";
import { icons } from "@assets/icons";

/**
 * カスタムアイコンを登録する。
 *
 * @export
 */
export function registerIcons() {
  registerIconLibrary("my-icons", {
    resolver: (name: string) => {
      if (name in icons) {
        return `data:image/svg+xml;utf8,${encodeURIComponent(icons[name])}`;
      }
      return "";
    },
    mutator: (svg) => svg.setAttribute("fill", "currentColor"),
  });
}

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

/**
 * 指定された文字列が空（null, undefined, 空文字）でないか判定します。
 * * @param val - 判定対象の文字列
 * @returns 空でない場合は true、それ以外（null, undefined, ""）は false
 * * @example
 * isNotBlank("hello") // true
 * isNotBlank("")      // false
 * isNotBlank(null)    // false
 */
export function isNotBlank(val: string | null | undefined): boolean {
  return val !== null && val !== undefined && val !== "";
}
