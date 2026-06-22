---
description: ステージングされた変更のみから日本語のコミットメッセージを生成してコミットします。
---

# Steps

1. **Get Current Branch Name and Staged Diff**
   - 以下のコマンドを順番に実行し、「現在のブランチ名」と「ステージングされている変更（diff）」を取得してください。
   - `git branch --show-current`
   - `git diff --cached`
   - ※未ステージングのファイルや、作業スペースのその他の状態は完全に無視してください。

2. **Extract GitHub ID from Branch Name**
   - ステップ1で取得したブランチ名（例: `feature/#123_hoge-fuga`）を解析します。
   - ブランチ名に `#` で始まる数値（例: `#123`）が含まれている場合、そのIDを記録し、ステップ3のコミットメッセージ生成時に使用してください。

3. **Generate Message in Japanese with ID**
   - 取得した `git diff --cached` の内容を元に、コミットメッセージを生成します。その際、以下の**厳格なルール**をすべて遵守してください。

   - **言語と固有名詞の維持**:
     - メッセージの要約および詳細文は、**必ずすべて日本語**で記述すること。
     - プレフィックス、ファイル名、パス、関数・変数名などの英単語は、翻訳せず**そのまま英語で維持**すること。
   
   - **フォーマット（GitHub IDの挿入位置）**:
     - ブランチ名から GitHub ID（例: `#123`）が抽出できた場合は、**プレフィックスの直後（スペースを空けて）**にIDを挿入してください。
     - 構造: `<type>: <GitHub ID> <日本語の要約>`
     - 例: `feat: #123 src/components/SearchBox.ts にクリア機能を追加`
     - ※ブランチ名にIDが含まれていない場合は、通常の形式（`<type>: <日本語の要約>`）にしてください。

   - **使用可能なタイプ（Type）**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

4. **Execute Commit**
   - 生成したコミットメッセージ（プレフィックス、GitHub ID、日本語の要約が正しく構成されていること）を確認し、`git commit -m "<generated_message>"` を実行するか、実行前にユーザーに確認を求めてください。