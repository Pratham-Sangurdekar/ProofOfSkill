const deployedContractAddress = "0xACb8305976DED6855dE54c82a797b889527F7502";
const SESSION_KEY = "proofOfSkill.session";
const STATE_KEY = "proofOfSkill.state";

const ABI = [
  { inputs: [], stateMutability: "nonpayable", type: "constructor" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "score", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "reward", type: "uint256" },
    ],
    name: "CodingReward",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bytes32", name: "puzzleId", type: "bytes32" },
    ],
    name: "PuzzleReward",
    type: "event",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "uint256", name: "score", type: "uint256" },
      { internalType: "bytes32", name: "submissionHash", type: "bytes32" },
    ],
    name: "rewardCoding",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "user", type: "address" },
      { internalType: "bytes32", name: "puzzleId", type: "bytes32" },
    ],
    name: "rewardPuzzle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "setCodingReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "setPuzzleReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { inputs: [], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "Withdraw",
    type: "event",
  },
  { stateMutability: "payable", type: "receive" },
  {
    inputs: [],
    name: "codingBaseReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "completedPuzzles",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "contractBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "puzzleReward",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "rewards",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "usedSubmissions",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

const appState = {
  account: "",
  isConnected: false,
  isOwner: false,
  rewardBalance: 0,
  contractBalance: 0,
  currentModule: 1,
  modulesCompleted: [],
  currentDifficulty: "",
  miningPrefix: "0",
  hashNonce: 0,
  puzzleSolved: false,
  codingScore: 0,
  attemptCounter: 0,
  timer: 120,
};

let web3 = null;
let contract = null;
let codingBaseRewardEth = 0;
let puzzleRewardEth = 0;
let monacoEditor = null;
let eventSubscriptions = [];
let timerInterval = null;
let page = document.body?.dataset?.page || "index";

const puzzleModules = [
  { id: 1, title: "Module 1 — prefix 0", type: "prefix", prefix: "0" },
  { id: 2, title: "Module 2 — prefix 00", type: "prefix", prefix: "00" },
  { id: 3, title: "Module 3 — prefix 000", type: "prefix", prefix: "000" },
  { id: 4, title: "Module 4 — prefix 0000", type: "prefix", prefix: "0000" },
  { id: 5, title: "Module 5 — prefix 00000", type: "prefix", prefix: "00000" },
  { id: 6, title: "Module 6 — prefix + timestamp", type: "timestamp", prefix: "000" },
  { id: 7, title: "Module 7 — address salt", type: "salt", prefix: "0000" },
  { id: 8, title: "Module 8 — dynamic prefix", type: "dynamic", prefix: "000" },
  { id: 9, title: "Module 9 — double hash", type: "double", prefix: "0000" },
  { id: 10, title: "Module 10 — timed mining", type: "timed", prefix: "00000" },
];

const codingModules = [
  {
    id: 1,
    name: "Add Two Numbers",
    difficulty: "Easy",
    before: "pragma solidity ^0.8.24;\ncontract Module1 {\n    function add(uint a, uint b) external pure returns (uint) {",
    editable: "return a + b;",
    after: "    }\n}",
    tests: ["returns sum", "uses uint arithmetic", "pure function"],
    keywords: ["return", "+"],
  },
  {
    id: 2,
    name: "Even Number",
    difficulty: "Easy",
    before: "pragma solidity ^0.8.24;\ncontract Module2 {\n    function isEven(uint x) external pure returns (bool) {",
    editable: "return x % 2 == 0;",
    after: "    }\n}",
    tests: ["checks modulus", "returns bool", "handles zero"],
    keywords: ["%", "==", "bool"],
  },
  {
    id: 3,
    name: "Max Value",
    difficulty: "Easy",
    before: "pragma solidity ^0.8.24;\ncontract Module3 {\n    function maxOf(uint a, uint b) external pure returns (uint) {",
    editable: "return a > b ? a : b;",
    after: "    }\n}",
    tests: ["compares both args", "returns larger", "ternary usage"],
    keywords: [">", "?", ":"],
  },
  {
    id: 4,
    name: "Sum Array",
    difficulty: "Medium",
    before: "pragma solidity ^0.8.24;\ncontract Module4 {\n    function sum(uint[] calldata values) external pure returns (uint total) {",
    editable: "for (uint i = 0; i < values.length; i++) { total += values[i]; }",
    after: "    }\n}",
    tests: ["iterates array", "accumulates total", "handles empty array"],
    keywords: ["for", "length", "+="],
  },
  {
    id: 5,
    name: "Count Zeros",
    difficulty: "Medium",
    before: "pragma solidity ^0.8.24;\ncontract Module5 {\n    function countZeros(uint[] calldata values) external pure returns (uint count) {",
    editable: "for (uint i = 0; i < values.length; i++) { if (values[i] == 0) count++; }",
    after: "    }\n}",
    tests: ["filters zero values", "increments count", "returns uint"],
    keywords: ["if", "== 0", "count"],
  },
  {
    id: 6,
    name: "Reverse Array",
    difficulty: "Medium",
    before: "pragma solidity ^0.8.24;\ncontract Module6 {\n    function reverse(uint[] calldata values) external pure returns (uint[] memory out) {\n        out = new uint[](values.length);",
    editable: "for (uint i = 0; i < values.length; i++) { out[i] = values[values.length - 1 - i]; }",
    after: "    }\n}",
    tests: ["allocates output", "copies reverse order", "keeps length"],
    keywords: ["memory", "new", "values.length"],
  },
  {
    id: 7,
    name: "Mapping Balance",
    difficulty: "Hard",
    before: "pragma solidity ^0.8.24;\ncontract Module7 {\n    mapping(address => uint) public balances;\n    function update(address user, uint amount) external {",
    editable: "balances[user] += amount;",
    after: "    }\n}",
    tests: ["uses mapping", "updates address key", "state mutation"],
    keywords: ["mapping", "balances", "+="],
  },
  {
    id: 8,
    name: "Struct Storage",
    difficulty: "Hard",
    before: "pragma solidity ^0.8.24;\ncontract Module8 {\n    struct Record { uint score; bool active; }\n    mapping(address => Record) public records;\n    function save(address user, uint score) external {",
    editable: "records[user] = Record({score: score, active: true});",
    after: "    }\n}",
    tests: ["declares struct", "stores struct", "sets active flag"],
    keywords: ["struct", "Record", "records"],
  },
  {
    id: 9,
    name: "Gas Optimized Loop",
    difficulty: "Expert",
    before: "pragma solidity ^0.8.24;\ncontract Module9 {\n    function sumFast(uint[] calldata values) external pure returns (uint total) {",
    editable: "for (uint i = 0; i < values.length;) { total += values[i]; unchecked { ++i; } }",
    after: "    }\n}",
    tests: ["uses unchecked", "minimizes gas", "loop correctness"],
    keywords: ["unchecked", "++i", "for"],
  },
  {
    id: 10,
    name: "Hash Generator",
    difficulty: "Expert",
    before: "pragma solidity ^0.8.24;\ncontract Module10 {\n    function hashIt(string calldata value) external pure returns (bytes32) {",
    editable: "return keccak256(bytes(value));",
    after: "    }\n}",
    tests: ["returns bytes32", "uses keccak256", "encodes input"],
    keywords: ["keccak256", "bytes", "return"],
  },
];

function $(id) {
  return document.getElementById(id);
}

function fmtEth(value) {
  return `${Number(value).toFixed(3)} ETH`;
}

function shortAddress(address) {
  if (!address) return "Not linked";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function chainName(chainIdHex) {
  const chainId = Number.parseInt(chainIdHex, 16);
  const map = { 1: "Ethereum", 11155111: "Sepolia", 137: "Polygon", 8453: "Base", 10: "Optimism", 42161: "Arbitrum" };
  return map[chainId] || `Chain ${chainId}`;
}

function toEth(wei) {
  if (!web3) return 0;
  return Number(web3.utils.fromWei(String(wei), "ether"));
}

function pushConsole(message, type = "info") {
  const output = $("outputConsole");
  if (!output) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  line.style.color = type === "error" ? "#ff9b9b" : type === "ok" ? "#a7f3d0" : "#f8f7f3";
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function showToast(title, text, kind = "success") {
  const container = $("toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${kind}`;
  toast.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3400);
}

const confettiState = { ctx: null, running: false, particles: [] };

function resizeConfetti() {
  const canvas = $("confettiCanvas");
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function fireConfetti() {
  const canvas = $("confettiCanvas");
  if (!canvas) return;
  resizeConfetti();
  if (!confettiState.ctx) confettiState.ctx = canvas.getContext("2d");
  for (let index = 0; index < 100; index += 1) {
    confettiState.particles.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 120,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 4,
      life: 60 + Math.random() * 40,
      size: 3 + Math.random() * 4,
      color: ["#f7d26a", "#7dd3fc", "#fda4af", "#86efac"][Math.floor(Math.random() * 4)],
    });
  }
  if (!confettiState.running) {
    confettiState.running = true;
    requestAnimationFrame(stepConfetti);
  }
}

function stepConfetti() {
  const canvas = $("confettiCanvas");
  if (!canvas || !confettiState.ctx) {
    confettiState.running = false;
    return;
  }

  confettiState.ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiState.particles = confettiState.particles.filter((particle) => particle.life > 0);

  confettiState.particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vy += 0.04;
    particle.life -= 1;
    confettiState.ctx.fillStyle = particle.color;
    confettiState.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  });

  if (confettiState.particles.length) requestAnimationFrame(stepConfetti);
  else confettiState.running = false;
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    appState.modulesCompleted = Array.isArray(parsed.modulesCompleted) ? parsed.modulesCompleted : [];
    appState.currentModule = parsed.currentModule || 1;
  } catch (error) {
    console.warn(error);
  }
}

function saveState() {
  localStorage.setItem(
    STATE_KEY,
    JSON.stringify({ modulesCompleted: appState.modulesCompleted, currentModule: appState.currentModule }),
  );
}

function saveSession() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ account: appState.account, isConnected: appState.isConnected, isOwner: appState.isOwner }),
  );
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    appState.account = parsed.account || "";
    appState.isConnected = Boolean(parsed.isConnected);
    appState.isOwner = Boolean(parsed.isOwner);
  } catch (error) {
    console.warn(error);
  }
}

function updateRewardUI(previous, next) {
  const total = $("rewardTotal");
  const delta = $("rewardDelta");
  const rewardBalance = $("rewardBalanceValue");
  const rewardsEarned = $("rewardsEarnedValue");

  if (total) total.textContent = fmtEth(next);
  if (rewardBalance) rewardBalance.textContent = fmtEth(next);
  if (rewardsEarned) rewardsEarned.textContent = fmtEth(next);

  if (delta) {
    const diff = next - previous;
    delta.textContent = Math.abs(diff) < 1e-8 ? "" : `${diff > 0 ? "+" : ""}${diff.toFixed(4)} ETH`;
    if (diff !== 0) setTimeout(() => (delta.textContent = ""), 2200);
  }
}

async function initWeb3() {
  if (!window.ethereum) throw new Error("MetaMask not detected");
  if (!window.Web3) throw new Error("Web3 library missing");
  web3 = new window.Web3(window.ethereum);
  contract = new web3.eth.Contract(ABI, deployedContractAddress);
}

async function connectWallet(options = {}) {
  const silent = Boolean(options.silent);

  try {
    await initWeb3();
    const accounts = silent
      ? await window.ethereum.request({ method: "eth_accounts" })
      : await window.ethereum.request({ method: "eth_requestAccounts" });

    if (!accounts.length) throw new Error("No wallet account available");

    appState.account = accounts[0];
    appState.isConnected = true;

    const ownerAddress = await contract.methods.owner().call();
    appState.isOwner = ownerAddress.toLowerCase() === appState.account.toLowerCase();

    await getRewardBalance();
    await getContractBalance();
    await getRewardMeta();

    updateWalletUI();
    saveSession();
    bindEventListeners();

    showToast("Wallet connected", shortAddress(appState.account));
    pushConsole(`Connected ${appState.account}`, "ok");
  } catch (error) {
    if (!silent) {
      showToast("Wallet error", error.message, "warn");
      pushConsole(error.message, "error");
    }
    appState.isConnected = false;
    updateWalletUI();
  }
}

function updateWalletUI() {
  const walletLabel = $("walletStateLabel");
  const walletSession = $("walletSession");
  const accountValue = $("accountValue");
  const networkValue = $("networkValue");
  const ownerBadge = $("ownerBadge");
  const connectBtn = $("connectWalletButton");
  const isHomeWalletControl = connectBtn?.dataset?.homeWallet === "true";

  if (!appState.isConnected) {
    if (walletLabel) walletLabel.textContent = window.ethereum ? "METAMASK READY" : "NO WALLET";
    if (walletSession) walletSession.textContent = "Not linked";
    if (accountValue) accountValue.textContent = "Not linked";
    if (networkValue) networkValue.textContent = "EVM ready";
    if (ownerBadge) ownerBadge.textContent = "No";
    if (connectBtn && !isHomeWalletControl) connectBtn.textContent = "CONNECT";
    return;
  }

  if (walletLabel) walletLabel.textContent = "CONNECTED";
  if (walletSession) walletSession.textContent = shortAddress(appState.account);
  if (accountValue) accountValue.textContent = shortAddress(appState.account);
  if (ownerBadge) ownerBadge.textContent = appState.isOwner ? "Yes" : "No";
  if (connectBtn && !isHomeWalletControl) connectBtn.textContent = `🦊 ${shortAddress(appState.account)}`;

  if (window.ethereum) {
    window.ethereum.request({ method: "eth_chainId" }).then((chainId) => {
      if (networkValue) networkValue.textContent = chainName(chainId);
    });
  }
}

async function getRewardMeta() {
  if (!contract) return;
  const codingWei = await contract.methods.codingBaseReward().call();
  const puzzleWei = await contract.methods.puzzleReward().call();
  codingBaseRewardEth = toEth(codingWei);
  puzzleRewardEth = toEth(puzzleWei);
  const rewardEstimateLabel = $("rewardEstimateLabel");
  if (rewardEstimateLabel) {
    rewardEstimateLabel.textContent = fmtEth(page === "solidity" ? codingBaseRewardEth : puzzleRewardEth);
  }
}

async function getRewardBalance() {
  if (!contract || !appState.account) return 0;
  const prev = appState.rewardBalance;
  const rewardWei = await contract.methods.rewards(appState.account).call();
  const rewardEth = toEth(rewardWei);
  appState.rewardBalance = rewardEth;
  updateRewardUI(prev, rewardEth);
  return rewardEth;
}

async function getContractBalance() {
  if (!contract) return 0;
  const balanceWei = await contract.methods.contractBalance().call();
  appState.contractBalance = toEth(balanceWei);
  const holder = $("contractBalanceValue");
  if (holder) holder.textContent = fmtEth(appState.contractBalance);
  return appState.contractBalance;
}

async function withdrawRewards() {
  if (!contract || !appState.isConnected) throw new Error("Connect wallet first");
  await contract.methods.withdraw().send({ from: appState.account });
  await getRewardBalance();
  await getContractBalance();
  showToast("Withdraw success", "ETH transferred to MetaMask");
  fireConfetti();
  pushConsole("Withdraw completed", "ok");
}

function generateHash(nonce) {
  if (!web3 || !appState.account) throw new Error("Connect wallet first");
  return web3.utils.soliditySha3(
    { type: "string", value: "ProofOfSkill" },
    { type: "address", value: appState.account },
    { type: "uint256", value: String(nonce) },
  );
}

function getActivePuzzleModule() {
  return puzzleModules[appState.currentModule - 1];
}

function computePuzzlePrefix() {
  const mod = getActivePuzzleModule();
  if (!mod) return "0";

  if (mod.type === "prefix") return mod.prefix;
  if (mod.type === "timestamp") return `${mod.prefix}${new Date().getSeconds().toString(16).slice(-1)}`;
  if (mod.type === "salt") return mod.prefix;
  if (mod.type === "dynamic") {
    const len = 3 + (appState.attemptCounter % 3);
    return "0".repeat(len);
  }
  if (mod.type === "double") return mod.prefix;
  if (mod.type === "timed") return mod.prefix;
  return mod.prefix;
}

function validatePuzzleHash(hash, nonce) {
  const mod = getActivePuzzleModule();
  const prefix = appState.miningPrefix;

  if (mod.type === "prefix" || mod.type === "timestamp" || mod.type === "dynamic") {
    return hash.startsWith(prefix);
  }

  if (mod.type === "salt") {
    const salted = web3.utils.soliditySha3(hash, appState.account);
    return salted && salted.startsWith(prefix);
  }

  if (mod.type === "double") {
    const secondHash = web3.utils.soliditySha3(hash);
    return secondHash && secondHash.startsWith(prefix);
  }

  if (mod.type === "timed") {
    return appState.timer > 0 && hash.startsWith(prefix);
  }

  return hash.startsWith(prefix);
}

async function rewardPuzzle() {
  if (!contract || !appState.isConnected) throw new Error("Connect wallet first");
  const nonce = appState.hashNonce;
  const hash = generateHash(nonce);
  if (!validatePuzzleHash(hash, nonce)) throw new Error("Invalid mined hash for current module");

  const puzzleId = web3.utils.soliditySha3(
    { type: "string", value: "PUZZLE" },
    { type: "address", value: appState.account },
    { type: "uint256", value: String(nonce) },
    { type: "uint256", value: String(appState.currentModule) },
  );

  const alreadyCompleted = await contract.methods.completedPuzzles(puzzleId).call();
  if (alreadyCompleted) throw new Error("Puzzle already rewarded on-chain");

  await contract.methods.rewardPuzzle(appState.account, puzzleId).send({ from: appState.account });
  appState.puzzleSolved = true;
  markCurrentModuleCompleted();
  await getRewardBalance();
  await getContractBalance();
  showToast("Puzzle solved", `Module ${appState.currentModule} rewarded`);
  fireConfetti();
  pushConsole(`rewardPuzzle sent for module ${appState.currentModule}`, "ok");
}

async function rewardCoding(score) {
  if (!contract || !appState.isConnected) throw new Error("Connect wallet first");
  const safeScore = Math.max(0, Math.min(100, Number(score)));
  const submissionHash = web3.utils.soliditySha3(
    { type: "string", value: "Coding" },
    { type: "address", value: appState.account },
    { type: "uint256", value: String(safeScore) },
    { type: "uint256", value: String(appState.currentModule) },
    { type: "uint256", value: String(Date.now()) },
  );

  await contract.methods.rewardCoding(appState.account, safeScore, submissionHash).send({ from: appState.account });

  appState.codingScore = safeScore;
  const scoreText = $("codingScoreValue");
  if (scoreText) scoreText.textContent = `Score: ${safeScore}`;

  markCurrentModuleCompleted();
  await getRewardBalance();
  await getContractBalance();

  showToast("Coding completed", `Score ${safeScore} rewarded`);
  fireConfetti();
  pushConsole(`rewardCoding sent score=${safeScore}`, "ok");
}

function markCurrentModuleCompleted() {
  if (!appState.modulesCompleted.includes(appState.currentModule)) {
    appState.modulesCompleted.push(appState.currentModule);
  }
  const completion = $("moduleCompletionLabel");
  if (completion) completion.textContent = `${appState.modulesCompleted.length} / 10`;

  const completionState = $("completionStateLabel");
  if (completionState) completionState.textContent = appState.modulesCompleted.includes(appState.currentModule) ? "Completed" : "Not started";

  saveState();
}

function updateModuleLabels() {
  const difficulty = $("difficultyLabel");
  if (difficulty) difficulty.textContent = appState.currentDifficulty || `Module ${appState.currentModule}`;

  const puzzleModuleTitle = $("puzzleModuleTitle");
  if (puzzleModuleTitle && page === "puzzle") puzzleModuleTitle.textContent = getActivePuzzleModule().title;

  const currentPrefix = $("miningPrefixLabel");
  if (currentPrefix) currentPrefix.textContent = appState.miningPrefix;

  const completionState = $("completionStateLabel");
  if (completionState) completionState.textContent = appState.modulesCompleted.includes(appState.currentModule) ? "Completed" : "Not started";
}

function selectModule(moduleId) {
  appState.currentModule = Math.max(1, Math.min(10, moduleId));
  appState.currentDifficulty = `Module ${appState.currentModule}`;
  appState.miningPrefix = computePuzzlePrefix();
  appState.puzzleSolved = false;
  if (page === "solidity") {
    const output = $("outputConsole");
    if (output) output.innerHTML = "";
    const score = $("codingScoreValue");
    if (score) score.textContent = "Score: 0";
  }
  updateModuleLabels();
  renderSolidityModule();
  renderPuzzleModule();
  saveState();
}

function nextModule() {
  selectModule(appState.currentModule >= 10 ? 1 : appState.currentModule + 1);
}

function previousModule() {
  selectModule(appState.currentModule <= 1 ? 10 : appState.currentModule - 1);
}

function renderModuleList() {
  const list = $("solidityModuleList");
  if (!list) return;
  list.innerHTML = "";

  codingModules.forEach((module) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `module-row${module.id === appState.currentModule ? " active" : ""}`;
    row.innerHTML = `<span>${module.id}. ${module.name}</span><span>${appState.modulesCompleted.includes(module.id) ? "✓" : "•"}</span>`;
    row.addEventListener("click", () => selectModule(module.id));
    list.appendChild(row);
  });
}

function getCurrentCodingModule() {
  return codingModules[appState.currentModule - 1];
}

function renderSolidityModule() {
  if (page !== "solidity") return;
  const mod = getCurrentCodingModule();
  if (!mod) return;

  const title = $("codingModuleTitle");
  if (title) title.textContent = `Module ${mod.id} — ${mod.name}`;

  const before = $("templateBefore");
  const after = $("templateAfter");
  if (before) before.textContent = mod.before;
  if (after) after.textContent = mod.after;

  const tests = $("testCasePreview");
  if (tests) {
    tests.innerHTML = "";
    mod.tests.forEach((test) => {
      const item = document.createElement("li");
      item.textContent = test;
      tests.appendChild(item);
    });
  }

  appState.currentDifficulty = `${mod.difficulty}`;
  appState.miningPrefix = computePuzzlePrefix();
  updateModuleLabels();
  renderModuleList();

  if (monacoEditor) {
    monacoEditor.setValue(mod.editable);
  }
}

function renderPuzzleModule() {
  if (page !== "puzzle") return;
  appState.currentDifficulty = getActivePuzzleModule().title;
  appState.miningPrefix = computePuzzlePrefix();
  updateModuleLabels();
  const solved = appState.modulesCompleted.includes(appState.currentModule);
  const status = $("puzzleStatus");
  if (status) status.textContent = solved ? "Already rewarded" : "Awaiting mining";
}

function calculateCodingScore(source) {
  const mod = getCurrentCodingModule();
  const lower = source.toLowerCase();

  const correctness = mod.keywords.reduce((acc, keyword) => acc + (lower.includes(keyword.toLowerCase()) ? 1 : 0), 0);
  const correctnessScore = Math.round((correctness / mod.keywords.length) * 50);

  const efficiencyScore = lower.includes("unchecked") ? 20 : 12;
  const gasScore = lower.includes("for") ? 15 : 8;
  const codeLengthScore = source.length > 20 && source.length < 260 ? 15 : 8;

  return Math.max(0, Math.min(100, correctnessScore + efficiencyScore + gasScore + codeLengthScore));
}

function getEditorBody() {
  if (monacoEditor) return monacoEditor.getValue();
  return "";
}

function buildSignatureList() {
  const list = $("functionSignatureList");
  if (!list) return;
  list.innerHTML = "";
  ABI.filter((entry) => entry.type === "function").forEach((entry) => {
    const args = (entry.inputs || []).map((input) => input.type).join(", ");
    const li = document.createElement("li");
    li.textContent = `${entry.name}(${args})`;
    list.appendChild(li);
  });
}

function mineCurrentNonce() {
  const nonceEl = $("nonceInput");
  const nonce = Number.parseInt(nonceEl?.value || "0", 10);
  appState.hashNonce = Number.isNaN(nonce) ? 0 : nonce;
  appState.attemptCounter += 1;

  const attempts = $("attemptCounter");
  if (attempts) attempts.textContent = String(appState.attemptCounter);

  appState.miningPrefix = computePuzzlePrefix();
  updateModuleLabels();

  try {
    const hash = generateHash(appState.hashNonce);
    const output = $("hashOutput");
    if (output) output.textContent = hash;

    const valid = validatePuzzleHash(hash, appState.hashNonce);
    const status = $("puzzleStatus");
    if (status) status.textContent = valid ? "Valid hash mined" : "Hash does not satisfy module";
    appState.puzzleSolved = valid;

    if (valid) {
      showToast("Puzzle candidate found", `Module ${appState.currentModule} hash is valid`);
      pushConsole(`Valid hash for nonce ${appState.hashNonce}`, "ok");
    } else {
      pushConsole(`Nonce ${appState.hashNonce} failed prefix ${appState.miningPrefix}`);
    }
  } catch (error) {
    pushConsole(error.message, "error");
  }
}

function initPuzzleTimer() {
  if (page !== "puzzle") return;
  if (timerInterval) clearInterval(timerInterval);
  appState.timer = 120;
  const timerLabel = $("timerValue");
  if (timerLabel) timerLabel.textContent = `${appState.timer}s`;
  timerInterval = setInterval(() => {
    appState.timer = Math.max(0, appState.timer - 1);
    if (timerLabel) timerLabel.textContent = `${appState.timer}s`;
  }, 1000);
}

function initMonaco() {
  if (page !== "solidity") return;
  if (!window.require || !$("monacoEditor")) return;

  window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
  window.require(["vs/editor/editor.main"], () => {
    monaco.languages.register({ id: "solidity" });
    monaco.languages.setMonarchTokensProvider("solidity", {
      tokenizer: {
        root: [
          [/\b(contract|function|returns|pure|view|mapping|struct|external|public|return|if|for|unchecked)\b/, "keyword"],
          [/\b(uint|bool|bytes32|string|address|calldata|memory)\b/, "type.identifier"],
          [/\d+/, "number"],
          [/"[^"]*"/, "string"],
        ],
      },
    });

    const mod = getCurrentCodingModule();
    monacoEditor = monaco.editor.create($("monacoEditor"), {
      value: mod.editable,
      language: "solidity",
      theme: "vs-dark",
      minimap: { enabled: false },
      fontSize: 13,
      automaticLayout: true,
    });
  });
}

function bindEventListeners() {
  eventSubscriptions.forEach((subscription) => subscription?.unsubscribe && subscription.unsubscribe());
  eventSubscriptions = [];
  if (!contract || !appState.account) return;

  try {
    const codingSub = contract.events.CodingReward({ fromBlock: "latest" }).on("data", async (event) => {
      if (event.returnValues.user?.toLowerCase() === appState.account.toLowerCase()) {
        await getRewardBalance();
        showToast("Reward received", `Coding reward ${toEth(event.returnValues.reward).toFixed(4)} ETH`);
      }
    });

    const puzzleSub = contract.events.PuzzleReward({ fromBlock: "latest" }).on("data", async (event) => {
      if (event.returnValues.user?.toLowerCase() === appState.account.toLowerCase()) {
        await getRewardBalance();
        showToast("Reward received", "Puzzle reward credited");
      }
    });

    const withdrawSub = contract.events.Withdraw({ fromBlock: "latest" }).on("data", async (event) => {
      if (event.returnValues.user?.toLowerCase() === appState.account.toLowerCase()) {
        await getRewardBalance();
        showToast("Withdraw event", `${toEth(event.returnValues.amount).toFixed(4)} ETH`);
      }
    });

    eventSubscriptions.push(codingSub, puzzleSub, withdrawSub);
  } catch (error) {
    pushConsole("Event subscriptions not available on current provider", "error");
  }
}

function bindSharedControls() {
  const connectBtn = $("connectWalletButton");
  if (connectBtn) connectBtn.addEventListener("click", () => connectWallet());

  const withdrawBtn = $("withdrawRewardsButton");
  if (withdrawBtn) {
    withdrawBtn.addEventListener("click", async () => {
      try {
        await withdrawRewards();
      } catch (error) {
        showToast("Withdraw failed", error.message, "warn");
      }
    });
  }

  window.addEventListener("resize", resizeConfetti);

  if (window.ethereum) {
    window.ethereum.on("accountsChanged", (accounts) => {
      if (!accounts.length) {
        appState.account = "";
        appState.isConnected = false;
        appState.isOwner = false;
        saveSession();
        updateWalletUI();
        return;
      }
      connectWallet({ silent: true });
    });

    window.ethereum.on("chainChanged", () => {
      if (appState.isConnected) connectWallet({ silent: true });
    });
  }
}

function bindSolidityControls() {
  if (page !== "solidity") return;

  $("compileButton")?.addEventListener("click", () => {
    const score = calculateCodingScore(getEditorBody());
    appState.codingScore = score;
    $("codingScoreValue").textContent = `Score: ${score}`;
    pushConsole(`Compile completed, predicted score ${score}`);
  });

  $("runTestsButton")?.addEventListener("click", async () => {
    try {
      const score = calculateCodingScore(getEditorBody());
      await rewardCoding(score);
    } catch (error) {
      showToast("Run tests failed", error.message, "warn");
      pushConsole(error.message, "error");
    }
  });

  $("submitSolutionButton")?.addEventListener("click", async () => {
    try {
      const score = calculateCodingScore(getEditorBody());
      await rewardCoding(score);
    } catch (error) {
      showToast("Submit failed", error.message, "warn");
      pushConsole(error.message, "error");
    }
  });

  $("testModuleButton")?.addEventListener("click", async () => {
    try {
      if (!contract || !appState.isConnected) throw new Error("Connect wallet first");
      const submissionHash = web3.utils.soliditySha3(
        { type: "string", value: "TEST" },
        { type: "address", value: appState.account },
        { type: "uint256", value: String(Date.now()) },
      );
      await contract.methods.rewardCoding(appState.account, 100, submissionHash).send({ from: appState.account });
      markCurrentModuleCompleted();
      await getRewardBalance();
      await getContractBalance();
      showToast("Test module", "Coding test reward sent");
      fireConfetti();
    } catch (error) {
      showToast("Test module failed", error.message, "warn");
    }
  });
}

function bindPuzzleControls() {
  if (page !== "puzzle") return;

  $("mineButton")?.addEventListener("click", mineCurrentNonce);

  $("submitPuzzleButton")?.addEventListener("click", async () => {
    try {
      await rewardPuzzle();
    } catch (error) {
      showToast("Puzzle submit failed", error.message, "warn");
      pushConsole(error.message, "error");
    }
  });

  $("testModuleButton")?.addEventListener("click", async () => {
    try {
      if (!contract || !appState.isConnected) throw new Error("Connect wallet first");
      const puzzleId = web3.utils.soliditySha3(
        { type: "string", value: "TESTPUZZLE" },
        { type: "address", value: appState.account },
        { type: "uint256", value: String(Date.now()) },
      );
      await contract.methods.rewardPuzzle(appState.account, puzzleId).send({ from: appState.account });
      markCurrentModuleCompleted();
      await getRewardBalance();
      await getContractBalance();
      showToast("Test module", "Puzzle test reward sent");
      fireConfetti();
    } catch (error) {
      showToast("Test module failed", error.message, "warn");
    }
  });

  $("nextModuleButton")?.addEventListener("click", () => {
    nextModule();
    initPuzzleTimer();
  });

  $("prevModuleButton")?.addEventListener("click", () => {
    previousModule();
    initPuzzleTimer();
  });
}

function bindPageTime() {
  const timeEl = $("systemTime");
  if (!timeEl) return;
  const tick = () => {
    timeEl.textContent = new Date().toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  tick();
  setInterval(tick, 1000);
}

async function initializeApp() {
  resizeConfetti();
  loadSavedState();
  loadSession();
  bindPageTime();
  bindSharedControls();

  selectModule(appState.currentModule || 1);

  if (page === "solidity") {
    renderModuleList();
    renderSolidityModule();
    buildSignatureList();
    initMonaco();
    bindSolidityControls();
  }

  if (page === "puzzle") {
    renderPuzzleModule();
    initPuzzleTimer();
    bindPuzzleControls();
  }

  if (window.ethereum) {
    await connectWallet({ silent: true });
  } else {
    updateWalletUI();
  }

  pushConsole("ProofOfSkill initialized", "ok");
}

window.connectWallet = connectWallet;
window.rewardCoding = rewardCoding;
window.rewardPuzzle = rewardPuzzle;
window.withdrawRewards = withdrawRewards;
window.getRewardBalance = getRewardBalance;

initializeApp();
