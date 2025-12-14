
import sys
import yaml
from exam_generator import ExamGenerator, generate_exam_html

def test_page_break_style():
    print("Testing Page Break Style Injection...")
    
    # 改ページを含むYAMLデータ
    yaml_content = """
タイトル: "テスト検証"
科目: "情報"
学校名: "検証高校"
試験時間: 50
配点合計: 100
サブタイトル: "改ページテスト"
注意事項: []

大問:
  - 番号: 1
    タイトル: "改ページなし大問"
    必須: true
    配点: 50
    小問: []

  - 番号: 2
    タイトル: "改ページあり大問"
    必須: true
    配点: 50
    改ページ: true
    小問:
      - 番号: "(1)"
        本文: "ここは改ページされない"
      - 番号: "(2)"
        本文: "ここは改ページされる"
        改ページ: true
"""
    
    html = generate_exam_html(yaml_content)
    
    # チェック1: 大問の改ページスタイル
    expected_q_style = 'style="page-break-before: always; break-before: page;"'
    if expected_q_style in html:
        print("✅ 大問の改ページスタイルが検出されました")
    else:
        print("❌ 大問の改ページスタイルが見つかりません")
        # デバッグ用に出力の一部を表示
        print("Generated HTML around Question 2:")
        start = html.find("改ページあり大問") - 200
        end = html.find("改ページあり大問") + 200
        print(html[start:end])
        return False

    # チェック2: 小問の改ページスタイル
    if 'style="page-break-before: always; break-before: page;"' in html:
        # 大問ですでに見つかっているが、小問分も含まれているか（出現回数でチェックするのもありだが）
        # ここはとりあえずCSSクラスや属性チェックに留める
        pass

    # チェック3: 画面プレビュー用CSSが含まれているか
    preview_css = 'border-top: 4px dashed #ddd !important;'
    if preview_css in html:
        print("✅ 画面プレビュー可視化用CSSが検出されました")
    else:
        print("❌ 画面プレビュー可視化用CSSが見つかりません")
        return False

    # チェック4: 印刷用bodyリセットCSSが含まれているか
    print_reset_css = 'max-width: none !important;'
    if print_reset_css in html:
        print("✅ 印刷用bodyリセットCSSが検出されました")
    else:
        print("❌ 印刷用bodyリセットCSSが見つかりません")
        return False
        
    return True

def test_yaml_escaping():
    print("\nTesting YAML Parsing with Escaped Characters...")
    # フロントエンドが生成するであろうエスケープ済みYAMLを想定
    # バックスラッシュがエスケープされている状態: "\\"
    
    yaml_content = r"""
タイトル: "エスケープテスト"
科目: "数学"
学校名: "〇〇高校"
試験時間: 50
配点合計: 100
サブタイトル: ""
注意事項: []
大問:
  - 番号: 1
    タイトル: "数式"
    必須: true
    配点: 10
    小問:
      - 番号: "(1)"
        本文: "数式: $x = 2\\cos\\theta$"
"""
    try:
        data = yaml.safe_load(yaml_content)
        question_text = data['大問'][0]['小問'][0]['本文']
        print(f"Parsed text: {question_text}")
        
        # 期待値: x = 2\cos\theta (Python文字列としてはバックスラッシュが1つ)
        if r"2\cos\theta" in question_text:
            print("✅ YAMLパース: バックスラッシュは正しく保持されています")
        else:
            print(f"❌ YAMLパース: バックスラッシュが期待通りではありません。Got: {question_text}")
            return False
            
    except Exception as e:
        print(f"❌ YAML Parse Error: {e}")
        return False

    return True

if __name__ == "__main__":
    success_style = test_page_break_style()
    success_yaml = test_yaml_escaping()
    
    if success_style and success_yaml:
        print("\n✨ 全ての検証テストに合格しました！")
        sys.exit(0)
    else:
        print("\n💥 検証テスト失敗...")
        sys.exit(1)
