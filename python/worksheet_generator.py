#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
プリント作成ジェネレーター（HTML版）
YAMLコンテンツからHTML形式のプリント（ワークシート）を生成する
"""

import yaml
import markdown


class WorksheetGenerator:
    def __init__(self, yaml_content: str):
        """YAMLコンテンツから初期化"""
        self.data = yaml.safe_load(yaml_content)

    def generate_html(self) -> str:
        """HTML文字列を生成して返す"""
        return self._build_html()

    def _build_html(self):
        return f"""<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self.data.get('タイトル', 'プリント')}</title>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
    <script>
        MathJax = {{
            tex: {{
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
                processEscapes: true
            }}
        }};
    </script>
    <style>
        @media print {{
            @page {{ size: A4; margin: 20mm; }}
            .page-break {{ page-break-after: always; }}
            body {{
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
            }}
        }}

        /* 画面プレビュー用：改ページ位置を可視化 */
        @media screen {{
            .page-break, [style*="break-before: page"], [style*="break-after: page"] {{
                border-top: 4px dashed #ddd !important;
                margin-top: 40px !important;
                padding-top: 40px !important;
                position: relative;
                display: block;
            }}
            .page-break::before, [style*="break-before: page"]::before, [style*="break-after: page"]::before {{
                content: "--- 改ページ ---";
                display: block;
                position: absolute;
                top: -24px;
                left: 50%;
                transform: translateX(-50%);
                color: #aaa;
                font-size: 12px;
                font-weight: bold;
                background: #fff;
                padding: 0 10px;
            }}
        }}
        body {{ 
            font-family: 'Hiragino Mincho ProN', 'Yu Mincho', serif; 
            line-height: 1.8; 
            max-width: 210mm; 
            margin: 0 auto; 
            padding: 20px;
            color: #333;
        }}
        
        /* ヘッダー */
        .header {{
            display: flex;
            justify-content: flex-end;
            margin-bottom: 20px;
            font-size: 12pt;
        }}
        .header-field {{
            margin-left: 20px;
        }}
        .header-field .label {{
            margin-right: 5px;
        }}
        .header-field .underline {{
            display: inline-block;
            border-bottom: 1px solid #333;
            min-width: 80px;
        }}
        .header-field.name .underline {{
            min-width: 200px;
        }}
        
        /* タイトル */
        .title {{
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            margin: 30px 0 10px;
        }}
        .subtitle {{
            text-align: center;
            font-size: 14pt;
            color: #555;
            margin-bottom: 30px;
        }}
        
        /* セクション */
        .section-header {{
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 30px 0 20px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 5px;
        }}
        
        /* 問題 */
        .problem {{
            margin: 25px 0;
        }}
        .problem-header {{
            display: flex;
            align-items: baseline;
            margin-bottom: 10px;
        }}
        .problem-number {{
            font-weight: bold;
            font-size: 14pt;
            margin-right: 15px;
        }}
        .problem-text {{
            font-size: 11pt;
            flex: 1;
        }}
        .problem-score {{
            font-size: 10pt;
            color: #666;
            margin-left: 10px;
        }}
        .sub-problems {{
            margin-left: 30px;
            margin-top: 10px;
        }}
        .sub-problem {{
            margin: 8px 0;
        }}
        .answer-space {{
            height: 100px;
            margin: 15px 0;
        }}
        
        /* 解答ページ */
        .answer-page {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 3px double #333;
        }}
        .answer-page h2 {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .answer-item {{
            margin: 15px 0;
            padding: 10px;
            background: #fafafa;
            border-radius: 5px;
        }}
        .answer-correct {{
            font-weight: bold;
            color: #d00;
        }}
        .answer-explanation {{
            margin-top: 10px;
            font-size: 10pt;
            color: #555;
            padding: 10px;
            background: #fff;
            border-left: 3px solid #3b82f6;
        }}
    </style>
</head>
<body>
    {self._create_header()}
    {self._create_title()}
    {self._create_problems()}
    {self._create_answers() if self.data.get('解答を作成', True) else ''}
</body>
</html>"""

    def _create_header(self):
        return """
    <div class="header">
        <span class="header-field"><span class="label">年</span><span class="underline"></span></span>
        <span class="header-field"><span class="label">組</span><span class="underline"></span></span>
        <span class="header-field"><span class="label">番</span><span class="underline"></span></span>
        <span class="header-field name"><span class="label">名前</span><span class="underline"></span></span>
    </div>"""

    def _create_title(self):
        title = self.data.get('タイトル', '')
        subtitle = self.data.get('サブタイトル', '')
        
        html = f'<h1 class="title">{title}</h1>'
        if subtitle:
            html += f'<div class="subtitle">〜 {subtitle} 〜</div>'
        return html

    def _create_problems(self):
        problems = self.data.get('問題', [])
        html = ""
        
        for i, prob in enumerate(problems):
            # セクションヘッダー
            if prob.get('type') == 'header':
                # ヘッダーにも改ページ適用可能
                hb_style = ""
                if prob.get('改ページ', False):
                    hb_style = ' style="page-break-before: always; break-before: page;"'
                html += f'<div class="section-header"{hb_style}>{prob.get("text", "")}</div>'
                continue
            
            # 問題の改ページチェック
            pb_style = ""
            if prob.get('改ページ', False):
                pb_style = ' style="page-break-before: always; break-before: page;"'
            
            num = prob.get('番号', i + 1)
            text = prob.get('本文', '')
            score = prob.get('配点')
            sub_problems = prob.get('小問', [])
            spaces = prob.get('スペース', 5)
            
            score_html = f'<span class="problem-score">[{score}点]</span>' if score else ''
            text_html = markdown.markdown(text) if text else ''
            
            html += f"""
    <div class="problem"{pb_style}>
        <div class="problem-header">
            <span class="problem-number">{num}</span>
            <span class="problem-text">{text_html}</span>
            {score_html}
        </div>"""
            
            if sub_problems:
                html += '<div class="sub-problems">'
                for sub in sub_problems:
                    if isinstance(sub, str):
                        html += f'<div class="sub-problem">{sub}</div>'
                    elif isinstance(sub, dict):
                        sub_text = sub.get('本文', '')
                        sub_num = sub.get('番号', '')
                        html += f'<div class="sub-problem">{sub_num} {sub_text}</div>'
                html += '</div>'
            
            # 解答スペース
            space_height = spaces * 20
            html += f'<div class="answer-space" style="height: {space_height}px;"></div>'
            html += '</div>'
        
        return html

    def _create_answers(self):
        problems = self.data.get('問題', [])
        html = """
    <div class="page-break"></div>
    <div class="answer-page">
        <h2>解答・解説</h2>"""
        
        for i, prob in enumerate(problems):
            if prob.get('type') == 'header':
                continue
            
            num = prob.get('番号', i + 1)
            answers = prob.get('解答', [])
            explanation = prob.get('解説', '')
            
            if not answers and not explanation:
                continue
            
            html += f'<div class="answer-item"><strong>{num}</strong>'
            
            if answers:
                if isinstance(answers, list):
                    for ans in answers:
                        html += f' <span class="answer-correct">答: {ans}</span>'
                else:
                    html += f' <span class="answer-correct">答: {answers}</span>'
            
            if explanation:
                exp_html = markdown.markdown(str(explanation))
                html += f'<div class="answer-explanation">【解説】{exp_html}</div>'
            
            html += '</div>'
        
        html += '</div>'
        return html


def generate_worksheet_html(yaml_content: str) -> str:
    """YAML文字列からHTML文字列を生成"""
    generator = WorksheetGenerator(yaml_content)
    return generator.generate_html()
