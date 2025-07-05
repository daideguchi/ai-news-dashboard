# AI News Dashboard

毎日のAI技術動向を効率的にチェックできるReactベースのダッシュボード

## 🚀 機能

- **カテゴリー別表示**: LLM、生成AI、技術、ビジネス、日本のニュースを分類
- **リアルタイム検索**: キーワードでニュースを絞り込み
- **ワンクリック更新**: 最新ニュースを簡単に取得
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

# 開発サーバーを起動
npm start

# ビルド
npm run build
```

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

## 📝 API連携

現在はデモデータを使用していますが、実際のニュースAPIと連携するには：

1. **News API**: https://newsapi.org/
2. **Google News API**: https://developers.google.com/news
3. **RSS Feed**: 各メディアのRSSフィード

```javascript
// src/components/AINewsDashboard.js の fetchNews 関数を修正
const fetchNews = async () => {
  setLoading(true);
  try {
    const response = await fetch('/api/news');
    const data = await response.json();
    setNews(data.articles);
    setLastUpdated(new Date());
  } catch (error) {
    console.error('ニュースの取得に失敗しました:', error);
  } finally {
    setLoading(false);
  }
};
```

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