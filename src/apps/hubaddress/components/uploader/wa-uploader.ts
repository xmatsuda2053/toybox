// 1. Core Libraries
import {
  css,
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  type PropertyValues,
} from "lit";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, query, state } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import sharedStyles from "@shared/shared-css.lit.scss?inline";
import styles from "@ha/styles/uploader/ha-uploader.lit.scss?inline";

// 6. Initializations
setBasePath("/");

/**
 * メニュー
 *
 * @export
 * @class HaUploader
 * @extends {LitElement}
 */
@customElement("ha-uploader")
export class HaUploader extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof HaUploader
   */
  static styles = [
    css`
      ${unsafeCSS(sharedStyles)}
    `,
    css`
      ${unsafeCSS(styles)}
    `,
  ];

  /**
   * ファイル選択
   *
   * @type {HTMLInputElement}
   * @memberof HaUploader
   */
  @query("#input-file") inputFile!: HTMLInputElement;

  /**
   * ドロップエリア
   *
   * @type {HTMLDivElement}
   * @memberof HaUploader
   */
  @query("#drop-area") dropArea!: HTMLDivElement;

  /**
   * 選択したファイル
   *
   * @type {File}
   * @memberof HaUploader
   */
  @state() selectedFile!: File | undefined;

  /**
   * render直前に実行されます。
   *
   * @protected
   * @param {PropertyValues} _changedProperties
   * @memberof HaUploader
   */
  protected willUpdate(_changedProperties: PropertyValues) {
    super.willUpdate(_changedProperties);
  }

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof HaUploader
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <input
        type="file"
        id="input-file"
        accept="text/csv"
        @change=${this._changeInput}
      />
      <div
        id="drop-area"
        class="drop-area"
        @click=${() => this.inputFile.click()}
        @dragover=${(e: Event) => e.preventDefault()}
        @dragenter=${() => this.dropArea.classList.add("drag-over")}
        @dragleave=${() => this.dropArea.classList.remove("drag-over")}
        @drop=${this._dropFile}
      >
        <wa-icon library="my-icons" name="upload-solid-full"></wa-icon>
        <span class="label">Drop CSV here / Click to browse</span>
      </div>
      ${this.renderSelectedFile()} ${this.renderUploadButton()}
    </div> `;
  }

  /**
   * 選択したファイルの情報を画面に表示します。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof HaUploader
   */
  private renderSelectedFile(): HTMLTemplateResult {
    if (!this.selectedFile) return html``;

    return html`<div class="file-data">
      <div class="icon-area">
        <wa-icon library="my-icons" name="file-code-solid-full"></wa-icon>
      </div>
      <div class="meta-area">
        <span>${this.selectedFile.name}</span>
        <wa-format-bytes value=${this.selectedFile.size}></wa-format-bytes>
      </div>
      <div class="button-area">
        <wa-button
          variant="neutral"
          appearance="plain"
          id="btn-delete"
          @click=${() => {
            this.selectedFile = undefined;
            this.inputFile.value = "";
          }}
        >
          <wa-icon library="my-icons" name="xmark-solid-full"></wa-icon>
        </wa-button>
      </div>
    </div>`;
  }

  /**
   * アップロードボタンを表示する。
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof HaUploader
   */
  private renderUploadButton(): HTMLTemplateResult {
    if (!this.selectedFile) return html``;

    return html` <wa-button
      variant="brand"
      appearance="filled"
      id="btn-upload"
      @click=${() => {
        emit(this, "upload-file", { detail: { file: this.selectedFile } });
      }}
    >
      Upload
    </wa-button>`;
  }

  /**
   * ファイル選択時の処理を実装します。
   *
   * @private
   * @return {*}
   * @memberof HaUploader
   */
  private _changeInput() {
    const file = this.inputFile.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") return;

    this.selectedFile = file;
  }

  /**
   * ファイルドロップ時の処理を実装します。
   *
   * @private
   * @param {Event} e
   * @memberof HaUploader
   */
  private _dropFile(e: DragEvent) {
    e.preventDefault();
    this.dropArea.classList.remove("drag-over");

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") return;

    this.selectedFile = file;
  }
}
