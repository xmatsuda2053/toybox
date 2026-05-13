import { execSync } from "child_process";
import fs from "fs";
import path from "path";

/**
 * ビルド対象のターゲットリスト
 */
const targets = [
  { name: "toybox", env: "toybox" },
  { name: "stepnote", env: "stepnote" },
  { name: "hubaddress", env: "hubaddress" },
];

console.log("🚀 全ターゲットのビルドを開始します...\n");

targets.forEach((target) => {
  try {
    console.log(`--- [${target.name}] ビルド中... ---`);

    // cross-envを使って環境変数を渡しつつ、vite buildを実行
    // stdio: 'inherit' を指定することで、ビルド中のログをリアルタイムで表示
    execSync(`cross-env APP_TARGET=${target.env} vite build`, {
      stdio: "inherit",
    });

    // build結果を同じ階層にまとめる。
    const endDir = path.join("dist", target.env);
    const sourcePath = path.join(endDir, "root", `${target.env}.html`);
    const destPath = path.join("dist", `${target.env}.html`);
    fs.copyFileSync(sourcePath, destPath);

    // 作業フォルダを削除する。
    fs.rmSync(endDir, { recursive: true });

    console.log(`✅ [${target.name}] ビルド完了！\n`);
  } catch (error) {
    console.error(`❌ [${target.name}] ビルド中にエラーが発生しました。`);
    process.exit(1); // 途中でエラーが出たらプロセスを終了させる
  }
});

console.log("✨ 全てのビルドが正常に終了しました！");
