
import requests
import json
import sys

def verify_live_api():
    url = "http://localhost:8000/api/exam/generate"
    payload = {
        "yaml_content": """
タイトル: "ライブ検証"
科目: "情報"
学校名: "検証高校"
試験時間: 50
配点合計: 100
サブタイトル: "検証"
注意事項: []

大問:
  - 番号: 1
    タイトル: "改ページ確認"
    必須: true
    配点: 50
    改ページ: true
    小問: []
"""
    }
    
    print(f"Connecting to {url}...")
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        
        if not data.get("success"):
            print(f"❌ API returned error: {data.get('error')}")
            return False
            
        html = data.get("html", "")
        print("API Response received.")
        
        # チェック: 改ページスタイル
        expected_style = 'style="page-break-before: always; break-before: page;"'
        if expected_style in html:
            print("✅ Verification Successful: Page break style found in HTML.")
            return True
        else:
            print("❌ Verification Failed: Page break style NOT found.")
            print("HTML Snippet around problem:")
            idx = html.find("改ページ確認")
            print(html[idx-200:idx+200] if idx != -1 else "Title not found")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Server is not running on port 8000.")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if verify_live_api():
        sys.exit(0)
    else:
        sys.exit(1)
