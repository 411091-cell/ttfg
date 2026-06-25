const players = [
  { name: "LeBron James", team: "Lakers", position: "SF", rating: 97 },
  { name: "Stephen Curry", team: "Warriors", position: "PG", rating: 96 },
  { name: "Kevin Durant", team: "Nets", position: "SF", rating: 95 },
  { name: "Giannis Antetokounmpo", team: "Bucks", position: "PF", rating: 98 },
  { name: "Luka Dončić", team: "Mavericks", position: "PG", rating: 96 },
  { name: "Joel Embiid", team: "76ers", position: "C", rating: 97 },
  { name: "Kawhi Leonard", team: "Clippers", position: "SF", rating: 94 },
  { name: "Jayson Tatum", team: "Celtics", position: "SF", rating: 94 },
  { name: "Ja Morant", team: "Grizzlies", position: "PG", rating: 93 },
  { name: "Nikola Jokić", team: "Nuggets", position: "C", rating: 97 },
  { name: "Anthony Davis", team: "Lakers", position: "PF", rating: 94 },
  { name: "Damian Lillard", team: "Trail Blazers", position: "PG", rating: 92 }
];

const selectedList = [];
const maxSelection = 5;
const defaultPlayers = [...players];

const playerGrid = document.getElementById("playerGrid");
const selectedCountEl = document.getElementById("selectedCount");
const totalPowerEl = document.getElementById("totalPower");
const selectedListEl = document.getElementById("selectedList");
const confirmButton = document.getElementById("confirmButton");
const clearButton = document.getElementById("clearButton");
const apiFillButton = document.getElementById("apiFillButton");
const resetPlayersButton = document.getElementById("resetPlayersButton");
const resultBox = document.getElementById("resultBox");
const sheetStatus = document.getElementById("sheetStatus");

function renderPlayers() {
  playerGrid.innerHTML = "";
  players.forEach((player, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "player-card";
    card.innerHTML = `
      <h3>${player.name}</h3>
      <div class="player-meta">${player.team} • ${player.position}</div>
      <div class="rating">戰力 ${player.rating}</div>
    `;
    card.addEventListener("click", () => toggleSelection(index));
    if (selectedList.includes(index)) {
      card.classList.add("selected");
    }
    playerGrid.appendChild(card);
  });
}

function toggleSelection(index) {
  const selectedIndex = selectedList.indexOf(index);

  if (selectedIndex >= 0) {
    selectedList.splice(selectedIndex, 1);
  } else {
    if (selectedList.length >= maxSelection) {
      showResult("你已經選滿 5 位球員，先移除一位才能繼續。", false);
      return;
    }
    selectedList.push(index);
  }

  updateSelectionDisplay();
  renderPlayers();
}

function updateSelectionDisplay() {
  selectedCountEl.textContent = `已選 ${selectedList.length} / ${maxSelection}`;
  const power = calculatePower();
  totalPowerEl.textContent = `總戰力 ${power}`;

  selectedListEl.innerHTML = "";
  if (selectedList.length === 0) {
    selectedListEl.innerHTML = '<p class="empty-label">點擊球員卡片加入你的陣容。</p>';
    return;
  }

  selectedList.forEach((playerIndex) => {
    const player = players[playerIndex];
    const item = document.createElement("div");
    item.className = "selected-item";
    item.innerHTML = `
      <strong>${player.name}</strong>
      <span>${player.position} • ${player.rating}</span>
    `;
    selectedListEl.appendChild(item);
  });
}

function calculatePower() {
  return selectedList.reduce((sum, index) => sum + players[index].rating, 0);
}

function buildOpponentTeam() {
  const availableIndexes = players.map((_, idx) => idx).filter((idx) => !selectedList.includes(idx));
  const shuffled = availableIndexes.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, maxSelection).map((idx) => players[idx]);
}

function showResult(message, success = true) {
  resultBox.classList.remove("hidden");
  resultBox.innerHTML = `
    <h3>${success ? "選人結果" : "提示"}</h3>
    <p>${message}</p>
  `;
}

function updateSheetStatus(message, type = "info") {
  sheetStatus.textContent = message;
  sheetStatus.classList.remove("success", "error");
  if (type === "success") sheetStatus.classList.add("success");
  if (type === "error") sheetStatus.classList.add("error");
}

async function saveSelectionToSheet(payload) {
  try {
    const response = await fetch("https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      updateSheetStatus("已將選擇結果同步到 Google Sheet。", "success");
      return true;
    }
    throw new Error(result.error || "Google Sheet 同步失敗");
  } catch (error) {
    updateSheetStatus(`同步失敗：${error.message}`, "error");
    return false;
  }
}

async function confirmSelection() {
  if (selectedList.length === 0) {
    showResult("請先選擇至少一位球員，再完成選擇。", false);
    return;
  }

  const teamPower = calculatePower();
  const opponentTeam = buildOpponentTeam();
  const opponentPower = opponentTeam.reduce((sum, player) => sum + player.rating, 0);

  const verdict = teamPower > opponentPower ? "你的陣容勝過電腦隊！" : teamPower === opponentPower ? "你和電腦隊勢均力敵！" : "電腦隊略勝一籌，下次再挑戰！";

  const opponentList = opponentTeam.map((player) => `${player.name} (${player.rating})`).join("、");
  showResult(`
    你的陣容總戰力：${teamPower}。<br>
    電腦隊陣容：${opponentList}。<br>
    電腦隊總戰力：${opponentPower}。<br>
    <strong>${verdict}</strong>
  `);

  const payload = {
    timestamp: new Date().toISOString(),
    selectedPlayers: selectedList.map((idx) => players[idx]),
    totalPower: teamPower,
    opponentPlayers: opponentTeam,
    opponentPower,
    verdict,
  };

  saveSelectionToSheet(payload);
}

function clearSelection() {
  selectedList.length = 0;
  updateSelectionDisplay();
  renderPlayers();
  resultBox.classList.add("hidden");
}

confirmButton.addEventListener("click", confirmSelection);
clearButton.addEventListener("click", clearSelection);
apiFillButton.addEventListener("click", fetchPlayersFromApi);
resetPlayersButton.addEventListener("click", resetPlayerList);

renderPlayers();
updateSelectionDisplay();
updateSheetStatus("系統尚未同步到 Google Sheet。", "info");

async function fetchPlayersFromApi() {
  updateSheetStatus("正在從 API 讀取球員資料...", "info");
  try {
    const response = await fetch("https://www.balldontlie.io/api/v1/players?per_page=12");
    if (!response.ok) throw new Error(`API 錯誤：${response.status}`);
    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) throw new Error("API 回傳資料格式錯誤");

    players.length = 0;
    data.data.forEach((item) => {
      players.push({
        name: item.first_name + " " + item.last_name,
        team: item.team.full_name || item.team.name,
        position: item.position || "N/A",
        rating: Math.floor(Math.random() * 8) + 88,
      });
    });

    selectedList.length = 0;
    renderPlayers();
    updateSelectionDisplay();
    showResult("已從 API 自動填入球員資料。", true);
    updateSheetStatus("已載入 API 資料，請完成選擇同步到 Google Sheet。", "success");
  } catch (error) {
    showResult(`從 API 讀取失敗：${error.message}`, false);
    updateSheetStatus("API 讀取失敗，請稍後再試。", "error");
  }
}

function resetPlayerList() {
  players.length = 0;
  defaultPlayers.forEach((player) => players.push({ ...player }));
  selectedList.length = 0;
  renderPlayers();
  updateSelectionDisplay();
  updateSheetStatus("已重置球員名單。", "info");
}

