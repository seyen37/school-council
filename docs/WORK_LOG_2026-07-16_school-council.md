# WORK_LOG 2026-07-15 ～ 2026-07-16：校園議事廳（school-council）

## 成果

- **線上網址**：https://school-council-one.vercel.app/ （school-council.vercel.app 被他人佔用，Vercel 自動配 -one）
- **GitHub**：origin＝seyen37/school-council、backup＝seyenbot/school-council（雙遠端，照 playbook 慣例）
- **本機**：`C:\Users\USER\Documents\Cowork\theater`（即 repo 根目錄，日常用 push.ps1／pull.ps1）
- **致敬原作**：改寫自 Joanna8521/emperor（百官朝議，MIT）。LICENSE 並列原作者 JWang 著作權、README 有致敬章節、首次 commit 訊息註明 tribute、已到原 repo 按星。

## 專案內容摘要

三方校園議事 AI 模擬器（Vite + React SPA、BYOK 直連 Anthropic/OpenAI/Gemini、key 只存 localStorage、無後端）：

- 四入口：學校行政（校長）、教師會（理事長）、家長會（會長）、聯席會議（主持身分三選一），共 18 種會議、34 個角色 persona
- 校務設定：23 班以下／24 班以上（小校教導主任制 vs 四處室制）、附幼與否，角色以 `requires` 條件顯示
- 十一種會議風格（STYLE_DEFS）：實務帶戲味、嚴謹公文、鄉土劇、議會質詢、溫馨共好、辦公室喜劇、武俠、宮鬥、偵探推理、實況主播、English
- 機制承襲原作換皮：會議紀錄（太史令）、請顧問裁示（朕乏了）、場外聲音（後宮亂入：里長／記者／志工家長）、壓軸總評（太后：督學／退休前輩／榮譽會長）
- 內建使用說明（大門按鈕，內容在 src/guide.js）

## 時間軸

### 2026-07-15（建置日）
1. Clone 並研讀 emperor 原始碼（courts 資料檔驅動、BYOK 串流、speakOrder 逐一發言）
2. QODA 對焦四決策（定位／玩家身分／技術路線／委員會組成）→ 用戶核准後動工
3. 建骨架（黑板綠配色）、寫 34 個 persona、四議會資料檔、校務設定與會議選單、聯席主席切換
4. 驗證：vite build ＋ node 一致性檢查（defaultOn id、四種 config 組合、prompt 組裝）＋ Playwright 全流程冒煙
5. 交付 17 檔到 theater 資料夾
6. 多輪版面迭代（均依用戶指示）：字牌排法（中間字放大）、上排三卡＋聯席寬卡、會議改標籤直排、卡片等高、校務設定改單鈕切換、外圍底圖改明亮米色（中央保留黑板面板）、風格鈕固定兩行
7. 會議結構迭代：教師會加理事會議（理事推會務／監事督經費）、家長委員會改對口處室模式、學校行政加學年會議（首個 meeting.chair 會議層主席覆寫：學年代表主持）
8. 風格系統：從 1 種擴到 11 種（STYLE_DEFS 四段式：turn/ext/record/regent）

### 2026-07-16（上線日）
1. 內建使用說明面板（src/guide.js，Markdown 經 marked 渲染，鈕在校務設定左側）
2. GitHub 上版：LICENSE（雙著作權）、README 致敬章節、init_github.ps1／push.ps1／pull.ps1
   - 踩雷一：.ps1 含中文無 BOM → Windows PowerShell 5.1 以 Big5 解讀 → ParserError。加 UTF-8 BOM 解決（已入共通性原則）
   - 踩雷二：init_github.log 在 git add 前開始寫 → 被一起 commit。加入 .gitignore ＋ git rm --cached 清除
   - 首推成功 commit a80d188，雙遠端同步
3. Vercel 部署（Claude in Chrome 協作，登入／註冊／OAuth 皆用戶本人操作）：
   - 註冊 Vercel Hobby（GitHub 登入）→ GitHub App 只授權 school-council 單一 repo → Import → Vite 自動偵測 → 用戶確認後 Deploy
   - 網域：school-council.vercel.app 被佔 → 接受 school-council-one.vercel.app
   - 帶 hash 的部署網址轉登入頁＝Vercel 預設保護，非故障；正式網域公開，已 WebFetch 驗證
4. README 加上線上入場連結；產線全自動：push.ps1 → GitHub → Vercel 自動重新部署

## 驗證方法（本專案的閘門）

- `vite build` 通過
- node 一致性腳本：esbuild 打包資料層 → 窮舉四種校務設定 × 全部會議，驗 defaultOn id 無誤植、出席數合理、主席正確剔除、11 種風格 prompt 組裝
- Playwright 冒煙：大門 → 選會議 → 換主持 → 會議室 → 點名面板 → 切校務設定，全程無 console/page error；截圖等動畫結束再截
- 交付後：WebFetch 正式網域核對標題與內容（注意 15 分快取，加 ?v= 繞過）

## 維護指南

- 改角色 persona：src/councils/roles.js；改會議：school/teachers/parents/joint.js；改文案與風格：councils/index.js；改說明書：src/guide.js
- 新增議會＝加資料檔＋在 councils/index.js 註冊；新增風格＝STYLE_DEFS 加一組 turn/ext/record/regent（English 保持最後）
- 頭像：PNG 丟 public/avatars/ ＋角色 avatar 欄位填路徑
- 上版：跑 push.ps1（自動觸發 Vercel 部署）
