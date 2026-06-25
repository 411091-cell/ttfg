# ttfg

這是一個簡單的 NBA 主題互動式選人遊戲。

## 使用方式

1. 開啟 `index.html`。
2. 點擊你喜歡的 NBA 球員，最多可選 5 名。
3. 點選「完成選擇」來比較你與電腦隊的總戰力。
4. 點選「重新開始」清除已選球員。

## 支援功能

- 選擇/取消選擇球員
- 顯示已選人數與總戰力
- 從 API 讀取球員資料
- 將選擇結果同步到 Google Sheet
- 重新開始或重置球員名單

## Google Apps Script 設定

1. 建立 Google 試算表，並建立工作表名稱為 `Sheet1`。
2. 開啟 Google Apps Script，建立新專案。
3. 新增 `google-apps-script.gs`，並貼上遊戲專案中的內容。
4. 修改 `YOUR_SPREADSHEET_ID` 為你試算表的 ID。
5. 將專案部署為「網路應用程式」，並設定為「任何人，包括匿名者」可以存取。
6. 將部署後的網址填入 `script.js` 中的 `YOUR_DEPLOYED_SCRIPT_ID`。

## 本地測試

- 直接在瀏覽器開啟 `index.html`。
- 點擊「從 API 自動填入」測試 API 讀取。
- 選擇球員並完成選擇，確認 Google Sheet 是否紀錄。
