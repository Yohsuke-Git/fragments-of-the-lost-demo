# Fragments of the Lost — Field Demo

固定スプライトを使った、小規模な2D JRPG風フィールド歩行デモです。ゲーム本編ではなく、移動・歩行アニメーション・カメラ追従・障害物との当たり判定を確認するためのプロトタイプです。

公開デモ: <https://yohsuke-git.github.io/fragments-of-the-lost-demo/>

## 起動

Node.js 18以降で、追加パッケージのインストールは不要です。

```bash
npm start
```

ブラウザで `http://127.0.0.1:4173` を開き、WASDまたは矢印キーで操作します。

## テスト

```bash
npm test
```

## 正式スプライトへの差し替え

仮スプライトは `assets/characters/hero/placeholder-spritesheet.svg` にあります。ゲーム中に画像生成は行わず、起動時にこの固定ファイルを読み込みます。

正式画像は、次のレイアウトの透過PNGスプライトシートにしてください。

- 1フレーム: 48 × 64 px
- 列: 3フレーム（左足・待機・右足）
- 行: 下、左、右、上
- 全体: 144 × 256 px

画像サイズや並びが異なる場合も、`src/config.js` の `HERO_SPRITE` だけを変更すればゲームロジックには影響しません。

## 構成

- `assets/characters/`: 固定キャラクター画像
- `assets/maps/meadow.json`: タイルマップと当たり判定定義
- `assets/tiles/`, `assets/objects/`: 将来のタイル・オブジェクト画像用
- `src/config.js`: スプライト、速度、画面サイズの設定
- `src/physics.js`: 移動、当たり判定、カメラ計算
- `src/game.js`: 入力、更新、描画

戦闘、会話、メニュー、セーブなどは今回の対象外です。
