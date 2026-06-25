function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: '請使用 POST 提交資料。'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById('YOUR_SPREADSHEET_ID').getSheetByName('Sheet1');
    if (!sheet) {
      throw new Error('找不到名稱為 Sheet1 的試算表工作表。');
    }

    const headers = ['時間', '選擇球員', '總戰力', '電腦隊球員', '電腦隊總戰力', '結果'];
    const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (existingHeaders.join('|') !== headers.join('|')) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = [
      data.timestamp || new Date().toISOString(),
      (data.selectedPlayers || []).map((p) => `${p.name} (${p.position})`).join(' / '),
      data.totalPower || '',
      (data.opponentPlayers || []).map((p) => `${p.name} (${p.position})`).join(' / '),
      data.opponentPower || '',
      data.verdict || ''
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
