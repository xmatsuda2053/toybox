// 1. Core Libraries
import {
  html,
  LitElement,
  unsafeCSS,
  type HTMLTemplateResult,
  nothing,
} from "lit";
import { classMap } from "lit/directives/class-map.js";

// 2. Lit Extensions (Decorators & Directives)
import { customElement, query, state, property } from "lit/decorators.js";

// 3. Third-party UI & SDKs
import { setBasePath } from "@awesome.me/webawesome/dist/utilities/base-path.js";

// 4. Internal Shared (Utils)
import { emit } from "@utils/EventUtils";

// 5. Styles
import "@awesome.me/webawesome/dist/styles/webawesome.css";
import styles from "./file-uploader.lit.scss?inline";

// 6. Initializations
setBasePath("/");

/**
 * メニュー
 *
 * @export
 * @class FileUploader
 * @extends {LitElement}
 */
@customElement("file-uploader")
export class FileUploader extends LitElement {
  /**
   * スタイルシートを適用
   *
   * @static
   * @memberof FileUploader
   */
  static styles = [unsafeCSS(styles)];

  /**
   * 選択可能なファイル種類
   *
   * @type {string}
   * @memberof FileUploader
   */
  @property({ type: String }) accept: string = "text/plain";

  /**
   * ファイル選択
   *
   * @type {HTMLInputElement}
   * @memberof FileUploader
   */
  @query("#input-file") inputFile!: HTMLInputElement;

  /**
   * 選択したファイル
   *
   * @type {File}
   * @memberof FileUploader
   */
  @state() selectedFile!: File | undefined;

  /**
   * ドラッグオーバーの状態
   *
   * @type {boolean}
   * @memberof FileUploader
   */
  @state() isDragOver: boolean = false;

  // -------------------------------------------------------------
  // イベント制御
  // -------------------------------------------------------------

  /**
   * ファイル選択時の処理を実装します。
   *
   * @private
   * @memberof FileUploader
   */
  private _handleInputFileChange = (): void => {
    const file = this.inputFile.files?.[0];
    if (!file) return;

    if (file.type !== this.accept) return;

    this.selectedFile = file;
  };

  /**
   * ドロップエリアをクリックした際の処理を制御します。
   *
   * @private
   * @memberof FileUploader
   */
  private _handleDropAreaClick = (): void => {
    this.inputFile.value = "";
    this.inputFile.click();
  };

  /**
   * ドロップエリアにドラッグオーバーした際の処理を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof FileUploader
   */
  private _handleDropAreaDragOver = (e: Event): void => {
    e.preventDefault();
  };

  /**
   * ドロップエリアにドラッグされた際の処理を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof FileUploader
   */
  private _handleDropAreaDragEnter = (e: Event): void => {
    e.preventDefault();
    this.isDragOver = true;
  };

  /**
   * ドロップエリアからドラッグが外れた際の処理を制御します。
   *
   * @private
   * @param {Event} e
   * @memberof FileUploader
   */
  private _handleDropAreaDragLeave = (e: Event): void => {
    e.preventDefault();
    this.isDragOver = false;
  };

  /**
   * ファイルドロップ時の処理を実装します。
   *
   * @private
   * @param {Event} e
   * @memberof FileUploader
   */
  private _handleDropAreaDrop = (e: DragEvent): void => {
    e.preventDefault();
    this.isDragOver = false;

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (file.type !== this.accept) return;

    this.selectedFile = file;
  };

  /**
   * 削除ボタンクリックの処理を制御します。
   *
   * @private
   * @memberof FileUploader
   */
  private _handleDeleteClick = (): void => {
    this.selectedFile = undefined;
    this.inputFile.value = "";
  };

  /**
   * アップロードボタンクリックの処理を制御します。
   *
   * @private
   * @memberof FileUploader
   */
  private _handleUploadClick = (): void => {
    emit(this, "upload-file", { detail: { file: this.selectedFile } });
  };

  // -------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------

  /**
   * コンテンツをレンダリングします。
   *
   * @protected
   * @override
   * @returns {HTMLTemplateResult} レンダリングされる Lit テンプレート
   * @memberof FileUploader
   */
  protected render(): HTMLTemplateResult {
    return html`<div id="contents-root">
      <input
        type="file"
        id="input-file"
        .accept=${this.accept}
        @change=${this._handleInputFileChange}
      />
      <div class="label">
        <slot></slot>
      </div>
      ${this._renderDropArea()} ${this._renderSelectedFile()}
      ${this._renderUploadButton()}
    </div> `;
  }

  /**
   * ドロップエリアをレンダリングします
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof FileUploader
   */
  private _renderDropArea(): HTMLTemplateResult {
    const classes = {
      "drop-area": true,
      "drag-over": this.isDragOver,
    };
    return html` <div
      id="drop-area"
      class=${classMap(classes)}
      @click=${this._handleDropAreaClick}
      @dragover=${this._handleDropAreaDragOver}
      @dragenter=${this._handleDropAreaDragEnter}
      @dragleave=${this._handleDropAreaDragLeave}
      @drop=${this._handleDropAreaDrop}
    >
      <wa-icon library="my-icons" name="upload-solid-full"></wa-icon>
      <span class="label">Drop File here / Click to browse</span>
    </div>`;
  }

  /**
   * 選択したファイルの情報をレンダリングします
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof FileUploader
   */
  private _renderSelectedFile(): HTMLTemplateResult | typeof nothing {
    if (!this.selectedFile) return nothing;

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
          @click=${this._handleDeleteClick}
        >
          <wa-icon library="my-icons" name="xmark-solid-full"></wa-icon>
        </wa-button>
      </div>
    </div>`;
  }

  /**
   * アップロードボタンをレンダリングします
   *
   * @private
   * @return {*}  {HTMLTemplateResult}
   * @memberof FileUploader
   */
  private _renderUploadButton(): HTMLTemplateResult | typeof nothing {
    if (!this.selectedFile) return nothing;

    return html` <wa-button
      variant="brand"
      appearance="filled"
      id="btn-upload"
      @click=${this._handleUploadClick}
    >
      Upload
    </wa-button>`;
  }
}
