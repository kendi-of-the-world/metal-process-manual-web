# 金属加工作業手順書管理 Web版

金属加工屋向けの作業手順書作成・管理アプリのWeb版です。React + TypeScript + Viteで構築されています。

## 機能

- **作業手順書の管理**: 作成、編集、削除、検索
- **基本情報の入力**: 客先、品名、品番、ファイルNo、加工機械、作成日、作成者
- **工程・材質情報**: 工程、工程時間、PRG(M)、PRG(S)、材質、材寸、処理
- **使用工具一覧**: T番号、H番号、使用工具、突出、刃長の5項目
- **工具コメント・サブプログラムN番号**: 複数行対応のメモ欄
- **PDF出力**: 「第一製造部 セットアップシート」形式でのPDF生成
- **データ管理**: ローカルストレージでデータを永続化、エクスポート/インポート機能

## 技術スタック

- React 19
- TypeScript 5.9
- Vite 7
- jsPDF + html2canvas（PDF生成）
- ローカルストレージ（データ永続化）

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm preview
```

## プロジェクト構造

```
src/
├── App.tsx                          # メインアプリケーション
├── App.css                          # グローバルスタイル
├── main.tsx                         # エントリーポイント
├── screens/
│   ├── HomeScreen.tsx               # ホーム画面（一覧表示）
│   ├── CreateManualScreen.tsx       # 作成画面
│   └── ManualDetailScreen.tsx       # 詳細画面（表示・編集）
├── contexts/
│   └── StorageContext.tsx           # ローカルストレージ管理
└── constants/
    └── theme.ts                     # カラー・スペーシング定義
```

## 使用方法

### 新規作成
1. ホーム画面の「新規作成」ボタンをクリック
2. 基本情報、工程・材質情報、使用工具一覧を入力
3. 「保存」ボタンで作業手順書を保存

### 編集
1. ホーム画面から編集したい作業手順書をクリック
2. 詳細画面の「編集」ボタンをクリック
3. 情報を変更して「保存」ボタンをクリック

### PDF出力
1. 詳細画面の「PDFダウンロード」ボタンをクリック
2. 「第一製造部 セットアップシート」形式のPDFが生成・ダウンロード

### データバックアップ
1. ホーム画面の「データエクスポート」ボタンをクリック
2. JSON形式でデータをダウンロード

## データ構造

### WorkManual
```typescript
interface WorkManual {
  id: string;
  customer: string;           // 客先
  productName: string;        // 品名
  productNumber: string;      // 品番
  fileNo: string;            // ファイルNo
  machine: string;           // 加工機械
  createdDate: string;       // 作成日
  createdBy: string;         // 作成者
  processName: string;       // 工程
  processTime: string;       // 工程（分）
  prgM: string;             // PRG(M)
  prgS: string;             // PRG(S)
  material: string;         // 材質
  materialSize: string;     // 材寸
  treatment: string;        // 処理
  toolComment: string;      // 工具コメント
  subProgramNNumbers: string; // サブプログラムN番号
  tools: Tool[];            // 使用工具一覧
  images: string[];         // 画像（Base64）
}
```

### Tool
```typescript
interface Tool {
  id: string;
  tNumber: string;          // T番号
  hNumber: string;          // H番号
  toolName: string;         // 使用工具
  protrusion: string;       // 突出
  bladeLength: string;      // 刃長
}
```

## ブラウザサポート

- Chrome/Edge（最新版）
- Firefox（最新版）
- Safari（最新版）

## ライセンス

内部用ツール

## 注記

- データはブラウザのローカルストレージに保存されます
- ブラウザのデータをクリアするとすべてのデータが削除されます
- 定期的にデータをエクスポートしてバックアップすることをお勧めします
