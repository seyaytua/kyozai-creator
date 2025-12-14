import { useState } from 'react';
import { Copy, Check, Lightbulb } from 'lucide-react';

type MaterialType = 'exam' | 'worksheet' | 'lesson-plan';

interface ConditionFields {
  科目: string;
  範囲: string;
  難易度: string;
  試験時間: string;
  その他: string;
}

const defaultConditions: Record<MaterialType, ConditionFields> = {
  exam: {
    科目: '',
    範囲: '',
    難易度: '基本4割、標準4割、発展2割',
    試験時間: '50分',
    その他: '',
  },
  worksheet: {
    科目: '',
    範囲: '',
    難易度: '基本・標準・発展の3段階',
    試験時間: '',
    その他: 'A4で1〜2枚',
  },
  'lesson-plan': {
    科目: '',
    範囲: '',
    難易度: '',
    試験時間: '50分',
    その他: '',
  },
};

const getPromptTemplate = (type: MaterialType): string => {
  switch (type) {
    case 'exam':
      return `# 定期考査作成プロンプト

## 重要な出力形式
**回答は必ずYAMLコードブロックのみを出力してください。**
- Markdown表や説明文は一切不要です
- 以下のYAML形式をそのまま使用してください

## Step 1: 資料のアップロード
教科書の該当ページ等をアップロードしてください。

## Step 2: 以下のYAML形式のみを出力

\`\`\`yaml
タイトル: "第○回定期考査"
科目: "{{科目}}"
学校名: "○○高等学校"
試験時間: {{試験時間数値}}
配点合計: 100
サブタイトル: "{{範囲}}"

注意事項:
  - "問題は全部で○問あります。"
  - "計算用紙として裏面を使用してもよい。"
  - "解答は解答欄に記入すること。"

大問:
  - 番号: 1
    タイトル: "[大問1のタイトル]"
    必須: true
    配点: 30
    小問:
      - 番号: "(1)"
        本文: "[問題文をここに記述]"
        配点: 10
        解答: "[解答]"
        解説: "[解説]"
      - 番号: "(2)"
        本文: "[問題文をここに記述]"
        配点: 10
        解答: "[解答]"
        解説: "[解説]"
      - 番号: "(3)"
        本文: "[問題文をここに記述]"
        配点: 10
        解答: "[解答]"
        解説: "[解説]"

  - 番号: 2
    タイトル: "[大問2のタイトル]"
    必須: true
    配点: 30
    小問:
      - 番号: "(1)"
        本文: "[問題文]"
        配点: 15
        解答: "[解答]"
        解説: "[解説]"
      - 番号: "(2)"
        本文: "[問題文]"
        配点: 15
        解答: "[解答]"
        解説: "[解説]"

  - 番号: 3
    タイトル: "[大問3のタイトル]"
    必須: true
    配点: 40
    小問:
      - 番号: "(1)"
        本文: "[問題文]"
        配点: 20
        解答: "[解答]"
        解説: "[解説]"
      - 番号: "(2)"
        本文: "[問題文]"
        配点: 20
        解答: "[解答]"
        解説: "[解説]"
\`\`\`

**重要：上記のYAML形式を崩さずに、問題内容だけを置き換えてください。**
**⚠️ 繰り返し：YAMLコードブロックのみを出力してください。表や説明文は不要です。**

**作成条件：**
{{条件}}`;
    case 'worksheet':
      return `# プリント作成プロンプト

## 重要な出力形式
**回答は必ずYAMLコードブロックのみを出力してください。**
- Markdown表や説明文は一切不要です
- 以下のYAML形式をそのまま使用してください

## Step 1: 資料のアップロード
教科書の該当ページ等をアップロードしてください。

## Step 2: 以下のYAML形式のみを出力

\`\`\`yaml
タイトル: "{{科目}} {{範囲}}"
サブタイトル: "演習プリント"
解答を作成: true

問題:
  - type: header
    text: "基本問題"

  - 番号: 1
    本文: "[問題文をここに記述]"
    配点: 10
    スペース: 5
    解答: "[解答]"
    解説: "[解説]"

  - 番号: 2
    本文: "[問題文をここに記述]"
    配点: 10
    スペース: 5
    解答: "[解答]"
    解説: "[解説]"

  - type: header
    text: "標準問題"

  - 番号: 3
    本文: "[問題文をここに記述]"
    配点: 15
    スペース: 8
    解答: "[解答]"
    解説: "[解説]"

  - 番号: 4
    本文: "[問題文をここに記述]"
    配点: 15
    スペース: 8
    解答: "[解答]"
    解説: "[解説]"

  - type: header
    text: "発展問題"

  - 番号: 5
    本文: "[問題文をここに記述]"
    配点: 20
    スペース: 10
    解答: "[解答]"
    解説: "[解説]"
\`\`\`

**重要：上記のYAML形式を崩さずに、問題内容だけを置き換えてください。**
**⚠️ 繰り返し：YAMLコードブロックのみを出力してください。表や説明文は不要です。**

**作成条件：**
{{条件}}`;
    case 'lesson-plan':
      return `# 指導案作成プロンプト

## 重要な出力形式
**回答は必ずYAMLコードブロックのみを出力してください。**
- Markdown表、箇条書き、説明文は一切不要です
- 以下のYAML形式をそのまま使用し、内容を埋めてください
- YAMLコードブロック以外のテキストは出力しないでください

## Step 1: 資料のアップロード
まず、教科書の該当ページ等をアップロードしてください。

## Step 2: 以下のYAML形式のみを出力

\`\`\`yaml
教科: "{{科目}}"
日時: "[日時]"
学校名: "[学校名]"
対象: "[対象クラス]"
会場: "[教室名]"
授業者: "[氏名]"
単元名: "{{範囲}}"
使用教科書: "[教科書名]"

本時の目標:
  - "[目標1]"
  - "[目標2]"

展開:
  導入:
    時間: 10
    学習内容:
      - "[学習内容1]"
    学習活動:
      - "[生徒の活動1]"
    留意点:
      - "[指導上の留意点1]"
  
  展開:
    時間: 30
    学習内容:
      - "[学習内容1]"
      - "[学習内容2]"
    学習活動:
      - "[生徒の活動1]"
      - "[生徒の活動2]"
    留意点:
      - "[留意点1]"
  
  まとめ:
    時間: 10
    学習内容:
      - "[まとめの内容]"
    学習活動:
      - "[振り返り活動]"
    留意点:
      - "[留意点]"

評価:
  - "[評価規準1]"
  - "[評価規準2]"
\`\`\`

**⚠️ 繰り返し：YAMLコードブロックのみを出力してください。表や説明文は不要です。**

**作成条件：**
- 授業時間：{{試験時間}}
{{条件}}`;
  }
};

const buildPrompt = (type: MaterialType, conditions: ConditionFields): string => {
  let template = getPromptTemplate(type);

  // 条件リストを構築
  const conditionLines: string[] = [];
  if (conditions.科目) conditionLines.push(`- 科目：${conditions.科目}`);
  if (conditions.範囲) conditionLines.push(`- 範囲：${conditions.範囲}`);
  if (conditions.難易度) conditionLines.push(`- 難易度バランス：${conditions.難易度}`);
  if (conditions.試験時間) conditionLines.push(`- 試験時間：${conditions.試験時間}`);
  if (conditions.その他) conditionLines.push(`- ${conditions.その他}`);

  const conditionsText = conditionLines.length > 0
    ? conditionLines.join('\n')
    : '- （条件を入力してください）';

  // 試験時間から数値を抽出
  const timeMatch = conditions.試験時間.match(/(\d+)/);
  const timeNumber = timeMatch ? timeMatch[1] : '50';

  // プレースホルダーを置換
  template = template
    .replace(/\{\{科目\}\}/g, conditions.科目 || '[科目名]')
    .replace(/\{\{範囲\}\}/g, conditions.範囲 || '[単元名]')
    .replace(/\{\{試験時間\}\}/g, conditions.試験時間 || '50分')
    .replace(/\{\{試験時間数値\}\}/g, timeNumber)
    .replace(/\{\{条件\}\}/g, conditionsText);

  return template;
};

interface CopilotHelperProps {
  type: MaterialType;
}

export function CopilotHelper({ type }: CopilotHelperProps) {
  const [copied, setCopied] = useState(false);
  const [conditions, setConditions] = useState<ConditionFields>(defaultConditions[type]);

  const updateCondition = (field: keyof ConditionFields, value: string) => {
    setConditions(prev => ({ ...prev, [field]: value }));
  };

  const handleCopy = async () => {
    const prompt = buildPrompt(type, conditions);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fieldLabels: Record<keyof ConditionFields, string> = {
    科目: '科目',
    範囲: '範囲・単元',
    難易度: '難易度バランス',
    試験時間: type === 'lesson-plan' ? '授業時間' : '試験時間',
    その他: 'その他の条件',
  };

  const showField = (field: keyof ConditionFields): boolean => {
    if (type === 'lesson-plan' && field === '難易度') return false;
    if (type === 'worksheet' && field === '試験時間') return false;
    return true;
  };

  return (
    <div className="bg-gradient-to-br from-[var(--color-surface)] to-[#1a2744] rounded-xl border border-[var(--color-border)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface)]">
        <div className="flex items-center gap-2">
          <Lightbulb size={18} className="text-yellow-400" />
          <span className="font-medium">Copilotで作成</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${copied
            ? 'bg-green-500/20 text-green-400'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
            }`}
        >
          {copied ? (
            <>
              <Check size={16} />
              コピー完了！
            </>
          ) : (
            <>
              <Copy size={16} />
              プロンプトをコピー
            </>
          )}
        </button>
      </div>

      {/* 条件入力フォーム */}
      <div className="p-4 space-y-3">
        <p className="text-sm text-[var(--color-text-muted)] mb-3">
          📝 以下の条件を入力してからプロンプトをコピーしてください
        </p>

        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(conditions) as (keyof ConditionFields)[]).map((field) =>
            showField(field) && (
              <div key={field} className={field === 'その他' ? 'col-span-2' : ''}>
                <label className="block text-xs text-[var(--color-text-muted)] mb-1">
                  {fieldLabels[field]}
                </label>
                <input
                  type="text"
                  value={conditions[field]}
                  onChange={(e) => updateCondition(field, e.target.value)}
                  placeholder={`${fieldLabels[field]}を入力...`}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:outline-none text-sm"
                />
              </div>
            )
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
          <p className="text-xs text-[var(--color-text-muted)]">
            👆 条件を入力後、「プロンプトをコピー」をクリックしてCopilotに送信してください
          </p>
        </div>
      </div>
    </div>
  );
}

