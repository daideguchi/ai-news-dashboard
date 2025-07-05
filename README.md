# AI News Dashboard

毎日のAI技術動向を効率的にチェックできるReactベースのダッシュボード

## 🚀 機能

- **カテゴリー別表示**: LLM、生成AI、技術、ビジネス、日本のニュースを分類
- **リアルタイム検索**: キーワードでニュースを絞り込み
- **ワンクリック更新**: 最新ニュースを簡単に取得
- **多言語対応**: 英語・日本語の切り替え＆自動翻訳
- **レスポンシブデザイン**: PC・スマホ・タブレットに対応
- **直感的なUI**: 読みやすいカードレイアウト

## 🛠️ 技術スタック

- **React 18**: フロントエンドフレームワーク
- **Lucide React**: 美しいアイコン
- **Tailwind CSS**: スタイリング（組み込み）
- **Create React App**: 開発環境

## 📦 インストール

```bash
# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env
# .envファイルを編集してNewsAPIキーを設定

# 開発サーバーを起動
npm start

# ビルド
npm run build
```

## 🔑 API設定

リアルタイムニュース取得のため、NewsAPIキーが必要です：

1. [NewsAPI](https://newsapi.org/)で無料アカウントを作成
2. APIキーを取得
3. `.env`ファイルに以下を追加：
```bash
NEWS_API_KEY=your_actual_api_key_here
```

**Vercelデプロイ時**：
- Vercel ダッシュボードの Environment Variables に `NEWS_API_KEY` を設定

## 🔧 開発

```bash
# 開発サーバーを起動（ホットリロード有効）
npm start

# テスト実行
npm test

# プロダクションビルド
npm run build
```

## 🌐 デプロイ

### Vercel
```bash
# Vercelにデプロイ
npm install -g vercel
vercel
```

### Netlify
```bash
# Netlifyにデプロイ
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

## 📝 リアルタイムAPI連携

本アプリは以下のニュースソースからリアルタイムでAI関連ニュースを取得します：

### 主要ソース
- **TechCrunch**: AI・スタートアップニュース
- **VentureBeat**: AI技術分析
- **The Verge**: テクノロジートレンド
- **Reuters**: 企業・市場ニュース
- **Bloomberg**: 投資・資金調達情報
- **CNBC**: ビジネスニュース

### 自動カテゴリ分類
- **LLM**: OpenAI、GPT、Claude関連
- **ビジネス**: 資金調達、投資、スタートアップ
- **生成AI**: 画像・動画生成、クリエイティブAI
- **技術**: 研究成果、ブレークスルー
- **日本**: 国内AI動向

### API機能
- 重複記事の自動除去
- 最新順ソート
- 25件まで表示
- フォールバック（デモデータ）

## 🎨 カスタマイズ

### 新しいカテゴリーの追加

```javascript
// src/components/AINewsDashboard.js
const categories = [
  // 既存のカテゴリー...
  { id: 'robotics', name: 'ロボティクス', icon: Settings },
];
```

### スタイルの変更

Tailwind CSSクラスを使用してスタイルを調整できます：

```javascript
// 例: カードの背景色を変更
<article className="bg-gradient-to-br from-white to-gray-50 rounded-xl...">
```

## 📱 レスポンシブデザイン

- **モバイル**: 1カラム表示
- **タブレット**: 2カラム表示  
- **デスクトップ**: 3カラム表示

## 🔒 セキュリティ

- XSS対策済み
- 外部リンクは`rel="noopener noreferrer"`付き
- APIキーは環境変数で管理

## 🤝 コントリビューション

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## 🙏 謝辞

- [Lucide](https://lucide.dev/) - 美しいアイコンライブラリ
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストのCSSフレームワーク
- [Create React App](https://create-react-app.dev/) - React開発環境

---

**開発者**: Claude Code
**バージョン**: 1.0.0
**最終更新**: 2024-01-15