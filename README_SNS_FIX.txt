V161 SNS SHARE FIX

目的:
- GitHub Pages の Jekyll 処理を止め、既存サイトを従来どおり完全な静的配信に戻します。
- Pit の _sns_share/*.md だけを GitHub Actions が静的HTMLへ変換します。
- 既存HTML/CSS/JSには手を触れません。

重要:
1) GitHub Desktopで最初に Pull origin を実行し、Pitで作った最新データをローカルへ取り込む。
2) このZIPの中身をリポジトリ直下へ上書きコピー。
3) Commit → Push origin。
4) GitHub Actions が share/ を自動生成して再コミットします。
5) https://miraiwithyou.jp/share/ を確認。

.nojekyll により _config.yml / _layouts が残っていても使用されません。
