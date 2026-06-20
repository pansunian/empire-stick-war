const canvas = document.querySelector("#battlefield");
const ctx = canvas.getContext("2d");
const battlefieldWrap = document.querySelector(".battlefield-wrap");

const factionSelect = document.querySelector("#factionSelect");
const factionButtons = [...document.querySelectorAll(".faction-card")];
const modeButtons = [...document.querySelectorAll(".mode-card")];
const teamModeButtons = [...document.querySelectorAll("[data-team-mode]")];
const controlModeButtons = [...document.querySelectorAll("[data-control-mode]")];
const ruleDialog = document.querySelector("#ruleDialog");
const homeStartBtn = document.querySelector("#homeStartBtn");
const ruleStartBtn = document.querySelector("#ruleStartBtn");
const ruleCancelBtn = document.querySelector("#ruleCancelBtn");
const campaignMap = document.querySelector("#campaignMap");
const campaignTitle = document.querySelector("#campaignTitle");
const campaignProgress = document.querySelector("#campaignProgress");
const campaignPath = document.querySelector("#campaignPath");
const campaignBackBtn = document.querySelector("#campaignBackBtn");
const campaignBriefing = document.querySelector("#campaignBriefing");
const briefingTitle = document.querySelector("#briefingTitle");
const briefingReward = document.querySelector("#briefingReward");
const briefingContent = document.querySelector("#briefingContent");
const briefingStartBtn = document.querySelector("#briefingStartBtn");
const briefingCloseBtn = document.querySelector("#briefingCloseBtn");
const playerCard = document.querySelector(".empire-card.player");
const enemyCard = document.querySelector(".empire-card.enemy");
const playerNameEl = document.querySelector("#playerName");
const enemyNameEl = document.querySelector("#enemyName");
const goldEl = document.querySelector("#gold");
const enemyGoldEl = document.querySelector("#enemyGold");
const statusEl = document.querySelector("#gameStatus");
const playerHpBar = document.querySelector("#playerHpBar");
const enemyHpBar = document.querySelector("#enemyHpBar");
const topHomeBtn = document.querySelector("#topHomeBtn");
const installBtn = document.querySelector("#installBtn");
const installGuide = document.querySelector("#installGuide");
const installGuideText = document.querySelector("#installGuideText");
const closeInstallGuideBtn = document.querySelector("#closeInstallGuideBtn");
const fullscreenBtn = document.querySelector("#fullscreenBtn");
const zoomOutBtn = document.querySelector("#zoomOutBtn");
const zoomFitBtn = document.querySelector("#zoomFitBtn");
const zoomInBtn = document.querySelector("#zoomInBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const statsBtn = document.querySelector("#statsBtn");
const homeBtn = document.querySelector("#homeBtn");
const closeStatsBtn = document.querySelector("#closeStatsBtn");
const statsOverlay = document.querySelector("#statsOverlay");
const statsTable = document.querySelector("#statsTable");
const armyCommandButtons = [...document.querySelectorAll(".command-btn[data-command]")];
const minerCommandButtons = [...document.querySelectorAll(".miner-command-btn")];
const controlDeck = document.querySelector(".control-deck");
const unitShop = document.querySelector(".unit-shop");
const mobileUnitsToggle = document.querySelector("#mobileUnitsToggle");
let trainButtons = [...document.querySelectorAll(".train-btn")];
const restartBtn = document.querySelector("#restartBtn");
let deferredInstallPrompt = null;
const manualKeys = {
  up: false,
  down: false,
  left: false,
  right: false,
};
const manualJoystick = {
  pointerId: null,
  active: false,
  center: null,
  knob: null,
  vector: { x: 0, y: 0 },
};

if (/iphone|ipad|ipod/i.test(window.navigator.userAgent)) {
  document.documentElement.classList.add("ios-device");
}

const FIELD = {
  width: 3600,
  height: 800,
  ground: 610,
  playerBase: 70,
  enemyBase: 3530,
  playerGate: 160,
  enemyGate: 3440,
  playerMineX: 570,
  enemyMineX: 3030,
  mineDistance: 300,
};
const DEFAULT_FIELD = { ...FIELD };
const MINE_LANES = [-205, -72, 72, 185];
const NORMAL_MINE_COLUMNS = [0, 170];
const MAGIC_MINE_COLUMN_OFFSET = 340;
const NORMAL_MINE_CAPACITY = 2500;
const MINE_WORKER_LIMIT = 2;
const RALLY = {
  playerOffset: 150,
  enemyOffset: 150,
  spacing: 9,
  maxSpread: 180,
  guardForwardFromMine: 300,
};

const MERGE_UNITS = new Set(["treeEnt", "rog", "dreadfire", "redflame", "stormLich", "hurricane", "hill", "linghan", "scaldStrike", "electricGate", "vUnit"]);
const BASIC_ELEMENT_UNITS = new Set(["earthElement", "waterElement", "fireElement", "windElement"]);
const ELEMENT_MERGE_REVIVE_CHANCE = 0.6;
const ELEMENT_MERGE_BLAST_CHANCE = 1;
const ELEMENT_MERGE_BLAST_RADIUS = 140;
const ELEMENT_MERGE_BLAST_DAMAGE = 15;
const ELEMENT_MERGE_BLAST_EXCLUDED_UNITS = new Set(["scaldStrike", "electricGate"]);
const ELEMENT_MERGE_REVIVE_EXCLUDED_UNITS = new Set(["scaldStrike", "electricGate"]);
const ELEMENT_MERGE_REVIVE_POOL = {
  hill: ["earthElement"],
  treeEnt: ["earthElement", "waterElement"],
  linghan: ["waterElement", "windElement"],
  rog: ["earthElement", "fireElement"],
  redflame: ["fireElement", "earthElement"],
  stormLich: ["windElement", "waterElement"],
  dreadfire: ["fireElement", "windElement"],
  hurricane: ["windElement"],
  vUnit: ["earthElement", "waterElement", "fireElement", "windElement"],
};
const ELEMENT_MERGE_MAGIC_COSTS = {
  hill: 100,
  treeEnt: 100,
  rog: 100,
  hurricane: 100,
  linghan: 100,
  redflame: 150,
  stormLich: 150,
  vUnit: 150,
  dreadfire: 150,
};
const FOUR_WAY_MERGE_VALUES = {
  electricGate: 150,
  hill: 160,
  linghan: 170,
  redflame: 205,
  stormLich: 230,
  treeEnt: 190,
  rog: 245,
  dreadfire: 280,
  hurricane: 250,
  scaldStrike: 180,
  vUnit: 275,
};
const V_CONTROL_BLOCKED_UNITS = new Set([
  "catapult",
  "rocketCart",
  "ironCavalry",
  "minotaur",
  "hornKnightRider",
  "arrowShieldCart",
  "rhinoMan",
  "deathGod",
  "boneGiant",
  "bannerBearer",
]);
const FREE_MERGE_UNITS = new Set(["scaldStrike", "electricGate"]);
const WIND_MERGED_UNITS = new Set(["dreadfire", "stormLich", "hurricane", "electricGate"]);
const AOE_TARGET_LIMIT = 5;
const UNDEAD_SKELETON_TRAIT = { interval: 10, intervalPerExtra: 5, rampEvery: 60, maxCount: 5 };
const FOUR_WAY_UNDEAD_SKELETON_TRAIT = { interval: 10, intervalPerExtra: 5, rampEvery: 60, maxCount: 5 };
const ORDER_ARMOR_TRAIT = {
  light: { hpBelow: 100, interval: 5, reductionStep: 0.1, maxReduction: 0.9 },
  medium: { hpMin: 100, hpMax: 300, interval: 8, reductionStep: 0.15, maxReduction: 0.9 },
  heavy: { hpAbove: 300, reduction: 0.2 },
};
const ORDER_MELEE_VETERAN_TRAIT = {
  hpBelow: 150,
  requiredKills: 3,
  reduction: 0.25,
  cleaveChance: 0.25,
  cleaveRadius: 76,
  cleaveLimit: 3,
  meleeRange: 80,
};
const ORDER_COMBAT_TRAIT = {
  chance: 0.3,
  meleeDamageFactor: 2,
  rangedStun: 2.5,
  siegeKnockbackFactor: 1.5,
};
const ORDER_SIEGE_UNITS = new Set(["catapult", "rocketCart"]);
const CHAOS_KILL_GOLD = 3;
const CHAOS_FOUR_WAY_KILL_GOLD = 3;
const CHAOS_KILL_HEAL_RATIO = 0.1;
const CHAOS_SURVIVAL_HP_TRAIT = { interval: 10, factor: 1.2 };
const CHAOS_ORC_PACK_TRAIT = { count: 5, radius: 260, damageFactor: 1.2 };
const CHAOS_ORC_PACK_UNITS = new Set(["orc", "berserkOrc"]);
const CHAOS_AI_FRONTLINE_UNITS = new Set(["creeper", "orc", "berserkOrc", "apeMan", "minotaur", "rhinoMan", "arrowShieldCart"]);
const CHAOS_AI_SUPPORT_UNITS = new Set(["goblinExpert", "shaman", "priest", "goblin"]);
const CHAOS_AI_RAIDER_UNITS = new Set(["bomber", "javelinThrower", "goblinVulture", "griffinBomber", "minotaur", "rhinoMan"]);
const CHAOS_AI_HIGH_TIER_PRIORITY = ["rhinoMan", "minotaur", "griffinBomber", "arrowShieldCart", "apeMan", "goblinExpert", "shaman", "priest", "berserkOrc"];
const AI_ROLE_PROFILES = {
  order: {
    frontline: ["swordsman", "spearman", "greatsword", "spartan", "ironCavalry", "archon"],
    ranged: ["archer", "crossbow", "musketeer", "shotgunner", "mage"],
    support: ["monk", "commander", "barricadeEngineer"],
    raider: ["ironCavalry", "shotgunner", "swordsman", "spearman"],
    highPriority: ["rocketCart", "catapult", "mage", "musketeer", "shotgunner", "ironCavalry", "spartan", "archon", "commander"],
    clarity: "formation",
  },
  chaos: {
    frontline: [...CHAOS_AI_FRONTLINE_UNITS],
    ranged: ["javelinThrower", "goblinVulture", "griffinBomber"],
    support: [...CHAOS_AI_SUPPORT_UNITS],
    raider: [...CHAOS_AI_RAIDER_UNITS],
    highPriority: CHAOS_AI_HIGH_TIER_PRIORITY,
    clarity: "assault",
  },
  undeadEmpire: {
    frontline: ["machete", "undead", "ghoul", "darkKnight", "boneGiant"],
    ranged: ["boneThrower", "poisonZombie", "candlelight", "undeadVulture"],
    support: ["graveDigger", "bannerBearer", "undeadMage", "necromancer"],
    raider: ["reaper", "darkKnight", "undeadVulture"],
    highPriority: ["deathGod", "boneGiant", "necromancer", "graveDigger", "bannerBearer", "undeadMage", "darkKnight"],
  },
  element: {
    frontline: ["earthElement", "waterElement", "hill", "treeEnt", "rog", "vUnit"],
    ranged: ["fireElement", "windElement", "linghan", "redflame", "stormLich", "hurricane", "dreadfire"],
    support: ["waterElement", "electricGate"],
    raider: ["windElement", "scaldStrike", "vUnit"],
    highPriority: ["vUnit", "dreadfire", "hurricane", "stormLich", "redflame", "linghan", "treeEnt", "rog", "hill"],
  },
  swarm: {
    frontline: ["crawler", "ironAnt", "swarmWorm", "heavyAnt", "giantSpider", "broodMother"],
    ranged: ["corrosiveSpitter", "boneStinger", "lurker", "caterpillar", "hoodCaterpillar"],
    support: ["spider", "antQueen", "ashWorm"],
    raider: ["poisonBug", "blastBug", "locust"],
    highPriority: ["hoodCaterpillar", "broodMother", "ashWorm", "antQueen", "heavyAnt", "lurker", "giantSpider", "caterpillar"],
  },
};
const NECROMANCER_DARK_KNIGHT_HP_THRESHOLD = 300;
const NECROMANCER_CONVERSION_BLOCKED_UNITS = new Set([
  "covenantGuard",
  "ironCavalry",
  "rocketCart",
  "catapult",
  "minotaur",
  "hornKnightRider",
  "apeMan",
  "summonedApeMan",
  "rhinoMan",
  "arrowShieldCart",
  "vUnit",
  "godVUnit",
  "rog",
  "treeEnt",
  "hurricane",
  "dreadfire",
]);
const MAGE_STONE_GOLEM_BLOCKED_UNITS = new Set([
  "vUnit",
  "godVUnit",
  "vClone",
  "deathGod",
  "deathGodClone",
  "catapult",
  "rocketCart",
  "undeadCatapult",
  "arrowShieldCart",
  "electricGate",
  "scaldStrike",
]);
const MAGIC_MINE_CAPACITY = 1600;
const MAGIC_INCOME_PER_SECOND = 6;
const STATUE_MAX_HP = 3000;
const GOD_V_CONTROL_RANGE = 1000;
const BASE_ATTACK = {
  range: 420,
  damage: 20,
  cooldown: 2,
  orderCooldown: 4,
  orderArrowCount: 15,
  orderArrowDamage: 8,
  orderArrowSplash: 40,
  orderArrowLimit: 3,
  chaosDamage: 60,
  chaosCooldown: 3,
  chaosSplash: 64,
  chaosLimit: 3,
  chaosStun: 1,
  elementStormDamage: 15,
  elementStormCooldown: 6,
};
const CENTER_TOWER = {
  x: FIELD.width / 2,
  y: FIELD.ground - 72,
  radiusX: 155,
  radiusY: 150,
  captureTime: 15,
  income: 6,
};

const UNIT = {
  miner: {
    name: "矿工",
    cost: 100,
    hp: 100,
    damage: 4,
    range: 30,
    speed: 46,
    train: 2.8,
    goldPerSwing: 25,
    bagSize: 100,
    magicPerSwing: 12.5,
    magicBagSize: 50,
  },
  summoner: {
    name: "召唤师",
    cost: 180,
    hp: 135,
    damage: 5,
    range: 160,
    speed: 38,
    train: 3.2,
    cooldown: 1.4,
    firstSummonDelay: 5,
    summonEvery: 25,
    summonCount: 2,
  },
  wraithMiner: {
    name: "亡魂",
    cost: 0,
    hp: 40,
    damage: 3,
    range: 28,
    speed: 46,
    train: 0,
    cooldown: 1,
    goldPerSwing: 10,
    bagSize: 60,
    magicPerSwing: 5,
    magicBagSize: 30,
    lifeDrainPerSecond: 2,
    summonOnly: true,
  },
  gnawMiner: {
    name: "咀矿者",
    cost: 0,
    hp: 80,
    damage: 4,
    range: 28,
    speed: 48,
    train: 2.8,
    cooldown: 1,
    goldPerSwing: 25,
    bagSize: 100,
    magicPerSwing: 12.5,
    magicBagSize: 50,
    summonOnly: true,
  },
  crawler: {
    name: "爬虫",
    cost: 55,
    hp: 60,
    damage: 6,
    range: 26,
    speed: 60,
    train: 2.5,
    cooldown: 0.8,
    evolveGoldCost: 0,
    evolveMagicCost: 0,
  },
  poisonBug: {
    name: "毒虫",
    cost: 100,
    hp: 30,
    damage: 20,
    range: 26,
    speed: 58,
    train: 3.1,
    cooldown: 1,
    splash: 72,
    aoeLimit: 5,
    corrosionDps: 5,
    corrosionDpsGrowth: 1,
    corrosionDuration: 5,
    corrosionSlow: 0.75,
  },
  swarmWorm: {
    name: "沙虫",
    cost: 110,
    hp: 135,
    damage: 12,
    range: 32,
    speed: 48,
    train: 3.6,
    cooldown: 1,
    slimeRadius: 72,
    slimeSlow: 0.8,
    slimeDuration: 8,
    evolveGoldCost: 50,
    evolveMagicCost: 100,
    evolveDuration: 5,
  },
  broodMother: {
    name: "虫母",
    cost: 0,
    hp: 450,
    damage: 10,
    range: 36,
    speed: 25,
    train: 0,
    cooldown: 1.4,
    summonEvery: 12.5,
    summonCount: 5,
    summonOnly: true,
  },
  locust: {
    name: "蝗虫",
    cost: 0,
    hp: 30,
    damage: 4,
    range: 32,
    speed: 50,
    train: 0,
    cooldown: 0.8,
    flying: true,
    summonOnly: true,
  },
  ashWorm: {
    name: "灰烬",
    cost: 0,
    hp: 400,
    damage: 0,
    range: 0,
    speed: 22,
    train: 0,
    cooldown: 1,
    summonEvery: 10,
    summonCount: 4,
    summonOnly: true,
  },
  blastBug: {
    name: "自爆虫",
    cost: 0,
    hp: 50,
    damage: 40,
    range: 28,
    speed: 60,
    train: 0,
    cooldown: 1,
    splash: 72,
    aoeLimit: 5,
    summonOnly: true,
  },
  ironAnt: {
    name: "铁蚁",
    cost: 120,
    hp: 130,
    damage: 7,
    range: 28,
    speed: 54,
    train: 3.4,
    cooldown: 1,
    lowDamageShieldThreshold: 15,
    lowDamageShieldCharges: 15,
    evolveGoldCost: 50,
    evolveMagicCost: 100,
    evolveDuration: 5,
  },
  spider: {
    name: "蜘蛛",
    cost: 0,
    magicCost: 100,
    hp: 90,
    damage: 8,
    range: 34,
    speed: 48,
    train: 4.2,
    cooldown: 1,
    webRadius: 100,
    webDuration: 8,
    webEnemySlow: 0.5,
    webSpiderBoost: 1.5,
    webCooldown: 14,
    evolveGoldCost: 50,
    evolveMagicCost: 100,
    evolveDuration: 5,
  },
  giantSpider: {
    name: "巨蛛",
    cost: 0,
    hp: 300,
    damage: 16,
    range: 42,
    speed: 30,
    train: 0,
    cooldown: 1.4,
    summonEvery: 10,
    summonCount: 3,
    summonOnly: true,
  },
  caterpillar: {
    name: "毛毛虫",
    cost: 450,
    magicCost: 100,
    hp: 200,
    damage: 35,
    range: 400,
    speed: 24,
    train: 6.2,
    cooldown: 2.5,
    splash: 86,
    aoeLimit: 5,
    neuralRetreatDuration: 5,
    evolveGoldCost: 50,
    evolveMagicCost: 100,
    evolveDuration: 5,
  },
  hoodCaterpillar: {
    name: "毛帽虫",
    cost: 0,
    hp: 200,
    damage: 20,
    range: 500,
    speed: 22,
    train: 0,
    cooldown: 2.5,
    splash: 76,
    aoeLimit: 5,
    scatterCount: 6,
    scatterSpread: 44,
    neuralRetreatDuration: 5,
    summonOnly: true,
  },
  heavyAnt: {
    name: "重蚁",
    cost: 0,
    hp: 300,
    damage: 14,
    range: 34,
    speed: 36,
    train: 0,
    cooldown: 1.25,
    rangedShieldThreshold: 35,
    rangedShieldCharges: 35,
    dodgeDuration: 6,
    summonOnly: true,
  },
  antQueen: {
    name: "蚁后",
    cost: 0,
    hp: 200,
    damage: 9,
    range: 145,
    speed: 34,
    train: 0,
    cooldown: 1.6,
    summonEvery: 8,
    summonCount: 2,
    summonStun: 2,
    summonOnly: true,
  },
  corrosiveSpitter: {
    name: "腐蚀者",
    cost: 200,
    magicCost: 50,
    hp: 120,
    damage: 13,
    range: 170,
    speed: 38,
    train: 4.8,
    cooldown: 1.45,
    corrosionDps: 5,
    corrosionDuration: 6,
    vulnerabilityBonus: 0.05,
    vulnerabilityMax: 0.5,
    vulnerabilityDuration: 8,
    splashChance: 0.2,
    splash: 72,
    aoeLimit: 5,
    slimeRadius: 80,
    slimeSlow: 0.8,
    slimeDuration: 8,
  },
  boneStinger: {
    name: "骨刺者",
    cost: 185,
    hp: 110,
    damage: 10,
    range: 105,
    speed: 42,
    train: 4.5,
    cooldown: 1,
    pierceLimit: 2,
    burrowDuration: 10,
    burrowDamage: 8,
    burrowReduction: 0.5,
    burrowCooldown: 16,
    evolveGoldCost: 50,
    evolveMagicCost: 100,
    evolveDuration: 5,
  },
  lurker: {
    name: "潜伏者",
    cost: 0,
    hp: 300,
    damage: 15,
    range: 100,
    speed: 0,
    train: 0,
    cooldown: 1,
    pierceLimit: 4,
    burrowReduction: 0.5,
    summonOnly: true,
  },
  swordsman: {
    name: "剑士",
    cost: 100,
    hp: 85,
    damage: 8,
    range: 32,
    speed: 55,
    train: 3.8,
    selfRageEvery: 12,
    selfRageDuration: 6,
    selfRageRange: 115,
    selfRageEnemyCount: 2,
    selfRageHpCost: 10,
    jumpSlashDistance: 80,
    jumpSlashDamageMultiplier: 2,
    jumpSlashStun: 2,
    jumpSlashCooldown: 12,
  },
  spearman: {
    name: "长矛兵",
    cost: 120,
    hp: 100,
    damage: 12,
    range: 70,
    speed: 54,
    train: 4.2,
    cooldown: 0.95,
    throwDamage: 25,
    throwRange: 165,
    throwRecover: 1,
  },
  archer: {
    name: "弓箭手",
    cost: 120,
    hp: 70,
    damage: 10,
    range: 200,
    speed: 44,
    train: 4.4,
    cooldown: 1.35,
    fireArrowBurnDps: 3,
    fireArrowBurnDuration: 5,
  },
  goldenArcher: {
    name: "黄金弓箭手",
    cost: 0,
    hp: 200,
    damage: 18,
    range: 220,
    speed: 46,
    train: 0,
    cooldown: 1,
    hero: true,
  },
  greatsword: {
    name: "大剑兵",
    cost: 250,
    hp: 250,
    damage: 20,
    range: 38,
    speed: 42,
    train: 5.6,
    cooldown: 1.75,
  },
  spartan: {
    name: "斯巴达",
    cost: 300,
    magicCost: 50,
    hp: 450,
    damage: 12,
    range: 40,
    speed: 55,
    train: 6.2,
    cooldown: 1,
    shieldStanceDuration: 10,
    shieldStanceReduction: 0.9,
    shieldStanceCooldown: 10,
    shieldProtectBehind: 80,
  },
  ironCavalry: {
    name: "铁骑兵",
    cost: 400,
    magicCost: 100,
    hp: 420,
    damage: 24,
    range: 600,
    speed: 35,
    train: 7,
    cooldown: 2,
    spearDamage: 24,
    spearRange: 48,
    spearCooldown: 2,
    musketDamage: 20,
    musketRange: 600,
    musketCooldown: 2,
    bombDamage: 50,
    bombRange: 150,
    bombSplash: 70,
    bombLimit: 5,
    bombCooldown: 6,
    chargeCooldown: 15,
    chargeDuration: 8,
    chargeSpeed: 80,
  },
  goldenSpartan: {
    name: "黄金斯巴达",
    cost: 0,
    hp: 850,
    damage: 40,
    range: 42,
    speed: 55,
    train: 0,
    cooldown: 1.8,
    goldenSpearDamage: 100,
    hero: true,
  },
  archon: {
    name: "执政官",
    cost: 350,
    magicCost: 50,
    hp: 180,
    shieldHp: 400,
    damage: 15,
    range: 38,
    speed: 45,
    train: 5.8,
    cooldown: 1,
  },
  monk: {
    name: "修道士",
    cost: 150,
    magicCost: 150,
    hp: 150,
    damage: 0,
    range: 150,
    speed: 38,
    train: 4.4,
    healEvery: 2,
    healAmount: 30,
    healRange: 150,
    fieldArea: 1000,
    fieldHeal: 10,
    fieldDuration: 10,
    fieldCooldown: 18,
  },
  crossbow: {
    name: "弩手",
    cost: 200,
    magicCost: 100,
    hp: 150,
    damage: 10,
    range: 108,
    speed: 38,
    train: 5,
    cooldown: 1.2,
    splash: 62,
    splashDamage: 18,
    bombDelay: 2,
    bombLimit: 5,
    deathCrashDamage: 20,
    deathCrashLimit: 5,
    flying: true,
  },
  musketeer: {
    name: "火枪手",
    cost: 350,
    hp: 100,
    damage: 45,
    range: 350,
    speed: 34,
    train: 5.2,
    cooldown: 2.25,
  },
  shotgunner: {
    name: "散弹枪手",
    cost: 260,
    hp: 145,
    damage: 4,
    range: 230,
    speed: 36,
    train: 5.6,
    cooldown: 3,
    pellets: 30,
    spread: 76,
    bombSkillCooldown: 16,
    bombCount: 3,
  },
  orderMiniBomb: {
    name: "小炸弹",
    cost: 0,
    hp: 40,
    damage: 15,
    range: 30,
    speed: 30,
    train: 0,
    cooldown: 0.4,
    splash: 58,
    aoeLimit: 5,
    duration: 10,
    summonOnly: true,
  },
  mage: {
    name: "法师",
    cost: 180,
    magicCost: 300,
    hp: 180,
    damage: 50,
    range: 300,
    speed: 32,
    train: 5.8,
    cooldown: 6,
    skillCooldown: 15,
    explosionRadius: 76,
    iceRadius: 120,
    iceDuration: 5,
    iceSlow: 0.1,
    iceAttackSlow: 0.1,
    iceDps: 3,
    electricWallDamage: 16,
    electricWallDuration: 6,
    electricWallWidth: 58,
    stoneGolemDuration: 10,
    stoneGolemMaxHp: 500,
  },
  stoneGolem: {
    name: "石头人",
    hp: 1,
    damage: 15,
    range: 38,
    speed: 18,
    train: 0,
    cooldown: 1.5,
    splash: 58,
    aoeLimit: 3,
    summonOnly: true,
  },
  commander: {
    name: "号令官",
    cost: 220,
    magicCost: 100,
    hp: 220,
    damage: 8,
    range: 45,
    speed: 38,
    train: 5.6,
    cooldown: 1.5,
    commandRadius: 260,
    commandDamageBonus: 0.1,
    markCooldown: 18,
    markDuration: 6,
    markBonusDamage: 4,
  },
  barricadeEngineer: {
    name: "拒马工兵",
    cost: 150,
    magicCost: 50,
    hp: 170,
    damage: 6,
    range: 35,
    speed: 35,
    train: 5,
    cooldown: 1.4,
    barricadeCost: 150,
    barricadeBuildTime: 5,
    barricadeCooldown: 8,
    barricadeMax: Infinity,
    barricadeHp: 300,
    barricadeLength: 260,
    barricadeWidth: 60,
    barricadeDuration: Infinity,
    barricadeTickEvery: 6,
    barricadeDamage: 6,
    barricadeSlow: 0,
    cavalryStop: 0.6,
  },
  covenantGuard: {
    name: "圣契卫士",
    cost: 300,
    magicCost: 100,
    hp: 420,
    damage: 20,
    range: 42,
    speed: 36,
    train: 7,
    cooldown: 1.8,
    formationRadius: 180,
    formationReduction: 0.2,
    formationTypes: 3,
    guardCooldown: 24,
    guardDuration: 6,
    guardReduction: 0.5,
    guardReductionDuration: 2,
  },
  berserker: {
    name: "狂战士",
    cost: 0,
    hp: 1000,
    damage: 65,
    range: 42,
    speed: 52,
    train: 0,
    cooldown: 2,
    rageEvery: 15,
    rageDuration: 8,
    rageRange: 220,
    rageLimit: 10,
    rageEnemyCount: 3,
    hero: true,
  },
  archmage: {
    name: "大法师",
    cost: 0,
    hp: 800,
    damage: 50,
    range: 260,
    speed: 32,
    train: 0,
    cooldown: 1.9,
    chainDamages: [50, 30, 18],
    chainRange: 170,
    fireballEvery: 15,
    fireballCount: 5,
    fireballDamage: 70,
    fireballRadius: 34,
    arcaneEvery: 5,
    arcaneDamage: 100,
    arcaneRadius: 150,
    arcaneStun: 3,
    arcaneTriggerRange: 200,
    blinkHpThreshold: 100,
    blinkThreatHp: 600,
    blinkDistance: 500,
    hero: true,
  },
  catapult: {
    name: "火炮",
    cost: 1000,
    hp: 560,
    damage: 60,
    range: 500,
    speed: 35,
    train: 8,
    cooldown: 3,
    blindSpot: 95,
    splash: 58,
    aoeLimit: 5,
  },
  enslavedGiant: {
    name: "投石巨人",
    cost: 750,
    hp: 1000,
    damage: 50,
    range: 600,
    speed: 40,
    train: 8,
    cooldown: 1.5,
    stunDuration: 1,
    blindSpot: 120,
    splash: 58,
    aoeLimit: 3,
    giant: true,
    freezeImmune: true,
  },
  rocketCart: {
    name: "火箭车",
    cost: 1000,
    hp: 470,
    damage: 6,
    range: 350,
    speed: 35,
    train: 8,
    cooldown: 0,
    reloadEvery: 4,
    ammoPerReload: 35,
    fireInterval: 0.05,
    volleyRadius: 50,
    splash: 24,
    arrowLife: 1.35,
    blindSpot: 100,
  },
  undeadCatapult: {
    name: "骷髅投石车",
    cost: 500,
    hp: 470,
    damage: 40,
    range: 580,
    speed: 30,
    train: 7,
    cooldown: 3,
    blindSpot: 95,
    splash: 58,
    aoeLimit: 3,
    groundFireDuration: 10,
    groundFireDps: 3,
    groundFireRadius: 62,
  },
  creeper: {
    name: "爬行者",
    cost: 50,
    hp: 35,
    damage: 10,
    range: 28,
    speed: 72,
    train: 2.7,
    cooldown: 0.72,
  },
  largeCreeper: {
    name: "大型爬行者",
    cost: 0,
    hp: 200,
    damage: 18,
    range: 28,
    speed: 72,
    train: 0,
    cooldown: 1.2,
    visualScale: 1.3,
  },
  undead: {
    name: "丧尸",
    cost: 70,
    hp: 80,
    damage: 8,
    range: 30,
    speed: 32,
    train: 2.5,
    cooldown: 1,
  },
  ghoul: {
    name: "食尸鬼",
    cost: 110,
    hp: 130,
    damage: 5,
    range: 30,
    speed: 50,
    train: 3.2,
    cooldown: 1,
    devourDuration: 3,
  },
  candlelight: {
    name: "烛光",
    cost: 150,
    hp: 115,
    damage: 6,
    range: 145,
    speed: 45,
    train: 3.4,
    cooldown: 0.6,
    defaultForm: "ice",
    burnDps: 3,
    burnDuration: 5,
    slowDuration: 1,
    slowFactor: 0.75,
  },
  reaper: {
    name: "收割者",
    cost: 175,
    hp: 90,
    damage: 16,
    range: 36,
    speed: 60,
    train: 4.2,
    cooldown: 0.9,
    stackBonus: 0.2,
    maxStackBonus: 1,
    stealthDuration: 10,
    stealthSpeed: 40,
    ambushDamage: 50,
  },
  deathGod: {
    name: "死神",
    cost: 500,
    magicCost: 150,
    hp: 420,
    damage: 50,
    range: 46,
    speed: 37,
    train: 7,
    cooldown: 2,
    spikeRadius: 196,
    spikeCount: 12,
    spikeDamage: 13,
    spikeCooldown: 20,
    cloneCooldown: 16,
  },
  deathGodClone: {
    name: "死神分身",
    cost: 0,
    hp: 220,
    damage: 30,
    range: 46,
    speed: 0,
    train: 0,
    cooldown: 2,
    duration: 16,
    immobile: true,
  },
  machete: {
    name: "骷髅兵",
    cost: 50,
    hp: 50,
    damage: 6,
    range: 34,
    speed: 60,
    train: 3.9,
    cooldown: 0.88,
  },
  boneThrower: {
    name: "掷骨手",
    cost: 50,
    hp: 40,
    damage: 4,
    range: 165,
    speed: 48,
    train: 3.7,
    cooldown: 0.6,
    boneAmmo: 30,
    maxBoneAmmo: 30,
    corpseBoneRatio: 0.2,
    boneHarvestRange: 190,
    boneHarvestCooldown: 6,
  },
  medusa: {
    name: "美杜莎",
    cost: 0,
    hp: 1500,
    damage: 30,
    range: 150,
    speed: 38,
    train: 0,
    cooldown: 1.4,
    poisonEvery: 12,
    poisonRange: 190,
    poisonDps: 6,
    poisonDuration: Infinity,
    corpseReleaseCount: 2,
    slayCooldown: 20,
    hero: true,
  },
  deadCorpse: {
    name: "死尸",
    cost: 65,
    hp: 40,
    damage: 0,
    range: 34,
    speed: 70,
    train: 3.4,
    cooldown: 1.15,
    poisonDps: 7,
    poisonDuration: Infinity,
    poisonRadius: 84,
    poisonSlow: 0.65,
  },
  poisonZombie: {
    name: "毒尸",
    cost: 100,
    magicCost: 100,
    hp: 225,
    damage: 8,
    range: 135,
    speed: 30,
    train: 4.8,
    cooldown: 1.55,
    poisonDps: 5,
    poisonDuration: Infinity,
  },
  necromancer: {
    name: "死灵法师",
    cost: 200,
    magicCost: 200,
    hp: 200,
    damage: 30,
    range: 150,
    speed: 32,
    train: 5,
    cooldown: 2,
    convertEvery: 8,
    corpseHpRatio: 0.22,
    summonCooldown: 24,
    summonCount: 3,
    summonedSpeed: 60,
    plagueCooldown: 25,
    plagueRange: 190,
    plagueRadius: 90,
    plagueDamage: 15,
    plaguePoisonDps: 5,
    plaguePoisonDuration: Infinity,
  },
  bomber: {
    name: "炸弹客",
    cost: 75,
    hp: 35,
    damage: 30,
    range: 34,
    speed: 65,
    train: 3.4,
    cooldown: 1.1,
    splash: 78,
    burnDps: 3,
    burnDuration: 8,
  },
  orc: {
    name: "兽人",
    cost: 90,
    hp: 110,
    damage: 6,
    range: 34,
    speed: 40,
    train: 3.4,
    cooldown: 1,
  },
  berserkOrc: {
    name: "狂兽人",
    cost: 150,
    hp: 140,
    damage: 13,
    range: 38,
    speed: 38,
    train: 4.2,
    cooldown: 1.15,
  },
  goblin: {
    name: "地精",
    cost: 180,
    hp: 80,
    damage: 0,
    range: 0,
    speed: 52,
    train: 3.8,
    cooldown: 0.9,
    mineEvery: 10,
    minePlantDuration: 2.5,
    mineAmmo: 5,
    mineLife: 70,
    mineDamage: 20,
    mineTriggerRadius: 34,
    mineBlastRadius: 90,
    mineAoeLimit: 3,
    burrowReduction: 0.9,
  },
  goblinExpert: {
    name: "地精专家",
    cost: 210,
    hp: 140,
    damage: 0,
    range: 0,
    speed: 46,
    train: 5.2,
    cooldown: 1,
    armorEvery: 20,
    armorRange: 625,
    armorLimit: 5,
    armorStepReduction: 0.25,
    armorMaxReduction: 0.5,
    heavyArmorReduction: 0.9,
    heavyArmorDuration: 12,
  },
  arrowShieldCart: {
    name: "遮箭车",
    cost: 400,
    hp: 200,
    damage: 0,
    range: 0,
    speed: 30,
    train: 6,
    cooldown: 1,
    arrowBoardHp: 700,
    arrowBoardWidth: 90,
    arrowBoardHeight: 90,
    arrowBoardYOffset: 96,
    arrowBoardProtectPadding: 36,
  },
  shaman: {
    name: "萨满",
    cost: 100,
    magicCost: 150,
    hp: 170,
    damage: 0,
    range: 0,
    speed: 42,
    train: 5.8,
    cooldown: 1,
    thornEvery: 10,
    thornArea: 625,
    thornDps: 4,
    thornSlow: 0.9,
    thornDuration: 12,
    thornCooldown: 10,
    healEvery: 1,
    healAmount: 7,
    healRange: 625,
  },
  priest: {
    name: "祭司",
    cost: 150,
    magicCost: 200,
    hp: 150,
    damage: 20,
    range: 145,
    speed: 42,
    train: 5.4,
    cooldown: 1.4,
    sacrificeNeeded: 6,
    ritualRange: 220,
    siphonMaxHp: 350,
    siphonDamage: 30,
    siphonCooldown: 14,
    bloodSacrificeCooldown: 10,
    bloodSacrificeFactor: 1.5,
  },
  apeMan: {
    name: "猿人",
    cost: 200,
    magicCost: 100,
    hp: 320,
    damage: 20,
    range: 44,
    speed: 34,
    train: 5.8,
    cooldown: 2,
    knockback: 100,
    stunDuration: 1.2,
  },
  summonedApeMan: {
    name: "召唤猿人",
    cost: 0,
    hp: 280,
    damage: 16,
    range: 44,
    speed: 34,
    train: 0,
    cooldown: 2,
    knockback: 100,
    stunDuration: 1.2,
    summonOnly: true,
  },
  scimitarWarrior: {
    name: "弯刀兵",
    cost: 190,
    hp: 400,
    damage: 16,
    range: 38,
    speed: 38,
    train: 5.6,
    cooldown: 1.3,
    roarCooldown: 15,
    roarRadius: 225,
    roarStun: 3,
  },
  minotaur: {
    name: "巨角骑士",
    cost: 300,
    magicCost: 100,
    hp: 600,
    damage: 30,
    range: 48,
    speed: 30,
    train: 6.5,
    cooldown: 0.2,
    riderHp: 200,
    riderDamage: 10,
    riderCooldown: 1.6,
    beastDamage: 30,
    beastCooldown: 2,
    chargeDistance: 160,
    chargeStun: 2,
    chargeCooldown: 16,
  },
  hornKnightRider: {
    name: "兽人骑士",
    cost: 0,
    hp: 200,
    damage: 10,
    range: 38,
    speed: 35,
    train: 0,
    cooldown: 1.6,
    summonOnly: true,
  },
  rhinoMan: {
    name: "犀牛人",
    cost: 480,
    magicCost: 50,
    hp: 670,
    damage: 36,
    range: 44,
    speed: 27,
    train: 7,
    cooldown: 2,
    rangedShieldThreshold: 15,
    deathRageRange: 1600,
    deathRageMoveFactor: 1.2,
    deathRageAttackFactor: 1.2,
  },
  javelinThrower: {
    name: "投矛手",
    cost: 150,
    hp: 60,
    damage: 14,
    range: 200,
    speed: 50,
    train: 4,
    cooldown: 1.2,
    poisonChance: 0.3,
    poisonDps: 2,
    poisonDuration: Infinity,
  },
  goblinVulture: {
    name: "持弩哨兵",
    cost: 100,
    magicCost: 50,
    hp: 90,
    damage: 13,
    range: 170,
    speed: 60,
    train: 4.8,
    cooldown: 1.25,
    flying: true,
  },
  undeadVulture: {
    name: "秃鹫",
    cost: 50,
    magicCost: 100,
    hp: 90,
    damage: 16,
    range: 180,
    speed: 65,
    train: 4.8,
    cooldown: 1.6,
    flying: true,
    splash: 90,
    aoeLimit: 3,
    crashDamage: 20,
    crashRadius: 90,
    crashLimit: 3,
  },
  griffinBomber: {
    name: "巨龙轰炸机",
    cost: 200,
    magicCost: 150,
    hp: 400,
    damage: 30,
    range: 200,
    speed: 120,
    train: 7.5,
    cooldown: 1.5,
    flying: true,
    ammo: 8,
    bombRadius: 72,
    bombLimit: 5,
  },
  demonArcher: {
    name: "日蚀",
    cost: 140,
    hp: 125,
    damage: 14,
    range: 180,
    speed: 58,
    train: 4.7,
    cooldown: 1.6,
    flying: true,
  },
  darkKnight: {
    name: "黑骑士",
    cost: 100,
    magicCost: 100,
    hp: 350,
    damage: 17,
    range: 38,
    speed: 42,
    train: 5.8,
    cooldown: 1.05,
    chargeDistance: 160,
    chargeStun: 2,
    chargeCooldown: 15,
  },
  bannerBearer: {
    name: "掌旗手",
    cost: 200,
    magicCost: 100,
    hp: 450,
    damage: 8,
    range: 32,
    speed: 40,
    train: 5.2,
    cooldown: 1.4,
    inspireEvery: 17,
    inspireDuration: 3,
    inspireBuffDuration: 12,
    inspireUndeadDuration: 10,
    inspireRadius: 20,
    inspireArea: 1256,
  },
  graveDigger: {
    name: "掘墓者",
    cost: 150,
    magicCost: 50,
    hp: 300,
    damage: 12,
    range: 34,
    speed: 55,
    train: 5,
    cooldown: 1.2,
    reviveEvery: 7,
    reviveRadius: 150,
    ghostEvery: 24,
    ghostCount: 3,
    ghostSpeed: 70,
    ghostDuration: 12,
    ghostFearDuration: 4,
  },
  boneGiant: {
    name: "骸骨",
    cost: 400,
    magicCost: 150,
    hp: 800,
    damage: 40,
    range: 46,
    speed: 38,
    train: 6.2,
    cooldown: 2,
    splash: 48,
    aoeLimit: 3,
    rangedReduction: 0.25,
    antiAir: true,
  },
  darkKnightBrother: {
    name: "黑骑士兄长",
    cost: 0,
    hp: 700,
    damage: 20,
    range: 42,
    speed: 44,
    train: 0,
    cooldown: 1.2,
    hero: true,
  },
  executioner: {
    name: "刽子手",
    cost: 200,
    hp: 700,
    damage: 35,
    range: 42,
    speed: 40,
    train: 6.3,
    cooldown: 1.5,
  },
  undeadMage: {
    name: "骨巫",
    cost: 150,
    magicCost: 250,
    hp: 200,
    damage: 25,
    range: 120,
    speed: 26,
    train: 5.6,
    cooldown: 1.5,
    staffRadius: 120,
    boneSpikeEvery: 10,
    boneSpikeDamage: 32,
    boneSpikeRange: 160,
    lureCooldown: 10,
    lureDamage: 30,
    lureDuration: 4,
    skeletonSummonCooldown: 20,
    skeletonSummonCount: 3,
  },
  suikai: {
    name: "隋凯",
    cost: 0,
    hp: 1200,
    damage: 55,
    range: 250,
    speed: 28,
    train: 0,
    cooldown: 2.4,
    summonCount: 5,
    summonHp: 55,
    summonDamage: 6,
    summonPoisonDps: 2,
    corpseEvery: 15,
    corpseCount: 5,
    hookEvery: 15,
    hookDamage: 150,
    hero: true,
  },
  chaosGiant: {
    name: "巨人",
    cost: 750,
    hp: 1200,
    damage: 65,
    range: 48,
    speed: 18,
    train: 8.5,
    cooldown: 1.6,
    splash: 52,
    aoeLimit: 3,
    giant: true,
    antiAir: true,
    freezeImmune: true,
    stunDuration: 2,
  },
  superGiant: {
    name: "超级巨人",
    cost: 0,
    hp: 20000,
    damage: 300,
    range: 58,
    speed: 20,
    train: 0,
    cooldown: 4,
    giant: true,
    antiAir: true,
    freezeImmune: true,
    stunImmune: true,
    slayImmune: true,
    controlImmune: true,
    statueOnly: true,
    visualScale: 2.45,
    hero: true,
  },
  earthElement: {
    name: "土元素",
    cost: 100,
    hp: 95,
    damage: 7,
    range: 36,
    speed: 34,
    train: 4.2,
    cooldown: 1.8,
    stunDuration: 1.5,
  },
  waterElement: {
    name: "水元素",
    cost: 175,
    hp: 140,
    damage: 0,
    range: 34,
    speed: 50,
    train: 4.8,
    cooldown: 1,
    healOnDeath: 150,
    healRadius: 130,
    freezeDps: 4,
  },
  fireElement: {
    name: "火元素",
    cost: 250,
    hp: 100,
    damage: 17,
    range: 185,
    speed: 34,
    train: 4.8,
    cooldown: 1.2,
    burnDps: 3,
    burnDuration: 5,
  },
  fireImp: {
    name: "小火人",
    cost: 0,
    hp: 150,
    damage: 10,
    range: 34,
    speed: 62,
    train: 0,
    cooldown: 1,
    burnDps: 3,
    burnDuration: 10,
  },
  windElement: {
    name: "风元素",
    cost: 200,
    hp: 85,
    damage: 28,
    range: 235,
    speed: 52,
    train: 5.2,
    cooldown: 2.6,
    flying: true,
    lightning: true,
  },
  treeEnt: {
    name: "树精",
    cost: 0,
    hp: 500,
    damage: 12,
    range: 150,
    speed: 20,
    train: 0,
    cooldown: 5,
    summonEvery: 8,
    summonLimit: 5,
    summonDamage: 15,
    healOnHit: 10,
    immobile: false,
  },
  waterScorpion: {
    name: "水蝎子",
    cost: 0,
    hp: 45,
    damage: 6,
    range: 28,
    speed: 55,
    train: 0,
    cooldown: 0.9,
    poisonOnHit: true,
    poisonDps: 2,
    poisonDuration: Infinity,
  },
  rog: {
    name: "罗格",
    cost: 0,
    hp: 750,
    damage: 10,
    range: 38,
    speed: 38,
    train: 0,
    cooldown: 0.72,
    magmaEvery: 10,
    magmaRadius: 120,
    burnDps: 5,
    burnDuration: 10,
  },
  dreadfire: {
    name: "厄火",
    cost: 0,
    hp: 225,
    damage: 0,
    range: 260,
    speed: 30,
    train: 6.2,
    cooldown: 7,
    dragonMarkDamage: 25,
    dragonDamage: 50,
    dragonStun: 2.5,
    dragonDelay: 0.6,
    dragonRadius: 225,
    meteorCount: 40,
    meteorDamage: 4,
    meteorWidth: 200,
    meteorHeight: 80,
  },
  redflame: {
    name: "赤炎",
    cost: 0,
    hp: 300,
    damage: 0,
    range: 260,
    speed: 32,
    train: 0,
    cooldown: 7,
    fireballDamage: 80,
    fireballRadius: 95,
    fireballBurnDps: 6,
    fireballBurnDuration: 10,
    pillarDamage: 50,
    pillarCount: 5,
    pillarRadius: 52,
    pillarSpacing: 54,
    pillarStun: 2,
  },
  stormLich: {
    name: "风暴巫妖",
    cost: 0,
    hp: 200,
    damage: 0,
    range: 270,
    speed: 38,
    train: 0,
    cooldown: 4,
    cloudRadius: 100,
    cloudDuration: 9.6,
    boltEvery: 0.8,
    boltCount: 12,
    boltDamage: 15,
    boltSlow: 0.75,
    boltSlowDuration: 4,
    deathRainRadius: 400,
    deathRainDrops: 100,
    rainHeal: 5,
  },
  prometheus: {
    name: "普罗米修斯",
    cost: 0,
    hp: 700,
    damage: 0,
    range: 300,
    speed: 34,
    train: 0,
    cooldown: 1,
    spellEvery: 8,
    dragonCount: 4,
    dragonDamage: 50,
    dragonRadius: 70,
    dragonLimit: 3,
    dragonStun: 3,
    burnDps: 3,
    burnDuration: 10,
    fireImpCount: 3,
    meteorCount: 50,
    meteorDamage: 9,
    meteorRadius: 135,
    hero: true,
  },
  zeus: {
    name: "宙斯",
    cost: 0,
    hp: 1000,
    damage: 0,
    range: 320,
    speed: 32,
    train: 0,
    cooldown: 1,
    overheadRadius: 180,
    overheadEvery: 0.6,
    cloudEvery: 10,
    cloudRadius: 300,
    cloudDuration: 15,
    cloudMoveSpeed: 30,
    boltEvery: 0.6,
    boltDamage: 16,
    boltStun: 1,
    columnEvery: 12,
    columnDuration: 8,
    columnDamage: 24,
    columnWidth: 28,
    gateEvery: 15,
    gateDuration: 8,
    gateDamage: 24,
    gateWidth: 92,
    gateSlow: 0.5,
    gateSlowDuration: 2,
    hero: true,
  },
  hurricane: {
    name: "飓风",
    cost: 0,
    hp: 250,
    damage: 60,
    range: 230,
    speed: 70,
    train: 5.8,
    cooldown: 5,
    stunDuration: 1.5,
    tornadoLife: 0.85,
    shieldEvery: 15,
    shieldDuration: 10,
    shieldReduction: 0.8,
    flying: true,
  },
  hill: {
    name: "山丘",
    cost: 0,
    hp: 300,
    damage: 20,
    range: 40,
    speed: 34,
    train: 0,
    cooldown: 1.5,
    jumpEvery: 10,
    jumpRadius: 80,
    jumpDamage: 15,
    jumpStun: 2.5,
    visualScale: 1.22,
    collisionRadius: 19,
  },
  linghan: {
    name: "凌寒",
    cost: 0,
    hp: 250,
    damage: 0,
    range: 160,
    speed: 36,
    train: 0,
    cooldown: 1,
    freezeCount: 5,
    freezeDuration: 8,
    freezeCooldown: 8,
    freezeDps: 4,
    healRadius: 150,
    deathIceRadius: 200,
    deathIceDuration: 12,
    deathIceSlow: 0.3,
  },
  scaldStrike: {
    name: "烫水击",
    cost: 0,
    hp: 120,
    damage: 100,
    range: 42,
    speed: 55,
    train: 0,
    cooldown: 1,
    splash: 104,
    stunDuration: 3.5,
    burnDps: 6,
    burnDuration: 10,
  },
  electricGate: {
    name: "电门",
    cost: 0,
    hp: 180,
    damage: 10,
    range: 285,
    speed: 0,
    train: 0,
    cooldown: 1,
    duration: 40,
    respawnType: "earthElement",
    immobile: true,
    untargetable: true,
  },
  vUnit: {
    name: "V",
    cost: 0,
    hp: 300,
    damage: 35,
    range: 38,
    speed: 40,
    train: 0,
    cooldown: 1,
    controlEvery: 15,
    controlLock: 1,
    controlRange: 700,
    blinkHpThreshold: 100,
    blinkThreatHp: 600,
    blinkCooldown: 12,
    blinkDistance: 500,
    cloneReleaseDelay: 3,
    cloneRespawnDelay: 10,
    cloneLimit: 3,
  },
  vClone: {
    name: "V分身",
    cost: 0,
    hp: 200,
    damage: 10,
    range: 32,
    speed: 42,
    train: 0,
    cooldown: 1.1,
  },
};

const FACTIONS = {
  order: {
    name: "秩序帝国",
    roster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "ironCavalry", "archon", "monk", "crossbow", "musketeer", "shotgunner", "mage", "commander", "barricadeEngineer", "catapult", "rocketCart"],
    startingUnits: ["miner", "swordsman", "archer"],
    mineColor: "#e2b64e",
  },
  chaos: {
    name: "混沌帝国",
    roster: ["miner", "creeper", "goblin", "goblinExpert", "arrowShieldCart", "shaman", "priest", "apeMan", "orc", "berserkOrc", "minotaur", "rhinoMan", "bomber", "javelinThrower", "goblinVulture", "griffinBomber"],
    startingUnits: ["miner", "creeper", "orc", "bomber"],
    mineColor: "#b7f56e",
  },
  undeadEmpire: {
    name: "亡灵帝国",
    roster: ["summoner", "machete", "boneThrower", "undead", "ghoul", "candlelight", "reaper", "undeadVulture", "necromancer", "deathGod", "graveDigger", "boneGiant", "bannerBearer", "poisonZombie", "darkKnight", "undeadMage"],
    startingUnits: ["summoner", "machete", "undead", "ghoul", "candlelight"],
    mineColor: "#b8b0a5",
  },
  element: {
    name: "元素帝国",
    roster: ["earthElement", "waterElement", "fireElement", "windElement"],
    startingUnits: ["earthElement", "waterElement", "fireElement", "windElement"],
    mineColor: "#8ee0cf",
  },
  swarm: {
    name: "虫群帝国",
    roster: ["crawler", "ironAnt", "poisonBug", "swarmWorm", "spider", "corrosiveSpitter", "boneStinger", "caterpillar"],
    startingUnits: ["crawler", "crawler", "ironAnt"],
    mineColor: "#b6d56d",
  },
};

const FOUR_WAY_SIDES = ["order", "chaos", "undeadEmpire", "element"];
const FOUR_WAY_FIELD = {
  width: 3000,
  height: 1800,
  ground: 900,
  playerBase: 130,
  enemyBase: 2870,
  playerGate: 230,
  enemyGate: 2770,
  playerMineX: 520,
  enemyMineX: 2480,
  mineDistance: 330,
  minY: 160,
  maxY: 1640,
};
const FOUR_WAY_BASES = {
  order: { x: 330, y: 250, label: "秩序", color: "#5f82bd" },
  chaos: { x: 2670, y: 250, label: "混沌", color: "#a55246" },
  undeadEmpire: { x: 330, y: 1550, label: "亡灵", color: "#8f88a8" },
  element: { x: 2670, y: 1550, label: "元素", color: "#5e9f92" },
};
const FOUR_WAY_AI_ROSTER = {
  order: ["swordsman", "spearman", "archer", "greatsword", "spartan", "ironCavalry", "archon", "monk", "crossbow", "musketeer", "shotgunner", "mage", "commander", "barricadeEngineer", "catapult", "rocketCart"],
  chaos: ["creeper", "goblin", "goblinExpert", "arrowShieldCart", "shaman", "priest", "apeMan", "orc", "berserkOrc", "minotaur", "rhinoMan", "bomber", "javelinThrower", "goblinVulture"],
  undeadEmpire: ["machete", "boneThrower", "undead", "ghoul", "candlelight", "reaper", "undeadVulture", "necromancer", "deathGod", "graveDigger", "boneGiant", "bannerBearer", "poisonZombie", "darkKnight", "undeadMage"],
  element: ["earthElement", "waterElement", "fireElement", "windElement", "electricGate", "hill", "linghan", "redflame", "stormLich", "treeEnt", "rog", "dreadfire", "hurricane", "scaldStrike", "vUnit"],
};
const FOUR_WAY_TECH_UNLOCK = 35;
const FOUR_WAY_HIGH_TIER_COST = 180;
const FOUR_WAY_STARTERS = {
  order: ["swordsman", "archer", "spearman"],
  chaos: ["creeper", "orc", "bomber"],
  undeadEmpire: ["machete", "undead", "candlelight"],
  element: ["earthElement", "waterElement", "fireElement", "windElement"],
};
const FOUR_WAY_START_GOLD = 600;
const FOUR_WAY_MINE_LINE_SPACING = 80;
const FOUR_WAY_MINE_BACK_DISTANCE = 210;
const FOUR_WAY_MINE_SIDE_OFFSET = 105;
const SWARM_HATCH_HEALTH_FACTOR = 0.6;
const SWARM_HATCH_MIN_HEALTH_FACTOR = 0.22;
const SWARM_HATCH_DAMAGE_FACTOR = 0.6;
const FOUR_WAY_FACTION_SKILL = {
  order: { cooldown: 30, duration: 15 },
  chaos: { cooldown: 30, duration: 15, summons: ["chaosGiant", "enslavedGiant"] },
  undeadEmpire: { cooldown: 30, duration: 15, summons: ["undeadMage", "necromancer"] },
  element: { cooldown: 30, duration: 15, summons: ["vUnit"] },
  swarm: { cooldown: 30, duration: 15, summons: ["antQueen", "giantSpider", "caterpillar"] },
};

const UNIT_ICON = {
  miner: "miner",
  summoner: "wizard-hat",
  wraithMiner: "skull",
  swordsman: "sharp-sword",
  spearman: "spear",
  archer: "bow",
  goldenArcher: "bow",
  greatsword: "greatsword",
  spartan: "spartan",
  ironCavalry: "spear",
  goldenSpartan: "spartan",
  archon: "spartan",
  monk: "monk",
  crossbow: "bomb-crossbow",
  musketeer: "gun",
  shotgunner: "gun",
  mage: "wizard-hat",
  commander: "spartan",
  barricadeEngineer: "miner",
  covenantGuard: "spartan",
  berserker: "greatsword",
  archmage: "wizard-hat",
  catapult: "bomb",
  enslavedGiant: "earth",
  rocketCart: "bomb-crossbow",
  undeadCatapult: "skull",
  creeper: "claws",
  undead: "zombie-head",
  ghoul: "claws",
  candlelight: "fire",
  reaper: "skull",
  deathGod: "skull",
  deathGodClone: "skull",
  machete: "machete",
  boneThrower: "skull",
  deadCorpse: "venom",
  poisonZombie: "venom",
  necromancer: "wizard-hat",
  bomber: "bomb",
  orc: "claws",
  berserkOrc: "axe",
  goblin: "miner",
  goblinExpert: "miner",
  arrowShieldCart: "spartan",
  shaman: "wizard-hat",
  priest: "skull",
  apeMan: "claws",
  summonedApeMan: "claws",
  scimitarWarrior: "machete",
  minotaur: "axe",
  hornKnightRider: "axe",
  rhinoMan: "axe",
  javelinThrower: "spear",
  goblinVulture: "wing",
  undeadVulture: "wing",
  griffinBomber: "bomb",
  medusa: "venom",
  demonArcher: "wing",
  darkKnight: "axe",
  bannerBearer: "spartan",
  graveDigger: "miner",
  boneGiant: "axe",
  darkKnightBrother: "axe",
  executioner: "axe",
  undeadMage: "skull",
  suikai: "skull",
  zeus: "lightning",
  chaosGiant: "axe",
  superGiant: "axe",
  earthElement: "earth",
  waterElement: "water",
  fireElement: "fire",
  fireImp: "fire",
  windElement: "lightning",
  treeEnt: "miner",
  waterScorpion: "spear",
  rog: "lava",
  dreadfire: "fire-dragon",
  redflame: "fire",
  stormLich: "lightning",
  prometheus: "fire",
  hurricane: "tornado",
  hill: "earth",
  linghan: "water",
  scaldStrike: "water",
  electricGate: "lightning",
  vUnit: "white-orb",
  gnawMiner: "claws",
  crawler: "claws",
  poisonBug: "venom",
  swarmWorm: "claws",
  broodMother: "venom",
  locust: "wing",
  ashWorm: "fire",
  blastBug: "bomb",
  ironAnt: "spartan",
  spider: "claws",
  giantSpider: "claws",
  caterpillar: "venom",
  hoodCaterpillar: "venom",
  heavyAnt: "spartan",
  antQueen: "venom",
  corrosiveSpitter: "venom",
  boneStinger: "spear",
  lurker: "spear",
};

function normalizeUnitType(type) {
  return type === "godVUnit" ? "vUnit" : type;
}

const STAT_GROUPS = [
  ["秩序帝国", ["miner", "swordsman", "spearman", "archer", "goldenArcher", "greatsword", "spartan", "ironCavalry", "goldenSpartan", "archon", "monk", "crossbow", "musketeer", "shotgunner", "mage", "commander", "barricadeEngineer", "berserker", "archmage", "catapult", "rocketCart"]],
  ["混沌帝国", ["miner", "creeper", "goblin", "goblinExpert", "arrowShieldCart", "shaman", "priest", "apeMan", "summonedApeMan", "orc", "berserkOrc", "minotaur", "hornKnightRider", "rhinoMan", "bomber", "javelinThrower", "goblinVulture", "griffinBomber", "medusa", "darkKnightBrother", "suikai"]],
  ["亡灵帝国", ["summoner", "wraithMiner", "machete", "boneThrower", "undead", "ghoul", "candlelight", "reaper", "undeadVulture", "necromancer", "deathGod", "deathGodClone", "graveDigger", "boneGiant", "bannerBearer", "poisonZombie", "darkKnight", "undeadMage"]],
  ["元素帝国", ["earthElement", "waterElement", "fireElement", "windElement", "dreadfire", "redflame", "stormLich", "hurricane", "hill", "linghan", "scaldStrike", "electricGate", "treeEnt", "waterScorpion", "rog", "vUnit", "vClone", "prometheus", "zeus", "fireImp"]],
  ["虫群帝国", ["crawler", "gnawMiner", "ironAnt", "heavyAnt", "antQueen", "poisonBug", "swarmWorm", "broodMother", "locust", "ashWorm", "blastBug", "spider", "giantSpider", "corrosiveSpitter", "boneStinger", "lurker", "caterpillar", "hoodCaterpillar"]],
];

let state = null;
let lastTime = performance.now();
let selectedFaction = "order";
let enemyFaction = "chaos";
let selectedMode = "versus";
let selectedTeamMode = "solo";
let selectedControlMode = "human";
let playerAllyFaction = null;
let enemyAllyFaction = null;
let battlefieldZoom = 1;
let currentFieldModeFourWay = false;
const BATTLEFIELD_MAX_ZOOM = 2.25;
const BATTLEFIELD_MIN_ZOOM = 0.05;
const BATTLEFIELD_ZOOM_STEP = 1.22;
const MODE_START_GOLD = {
  versus: 120,
  brawl: 1500,
};
const MODE_GOLD_RUSH = {
  brawl: { columns: 6, rows: 5, mineGold: 2500 },
};
const CAMPAIGN_START_GOLD = 200;
const CAMPAIGN_LEVEL_COUNT = 8;
const HIDE_EXISTING_CAMPAIGNS = false;
const CAMPAIGN_HIGH_WALL = {
  hp: 2000,
  length: 132,
  width: 460,
  archerCount: 5,
  archerDamage: 6,
  archerRange: 620,
  archerCooldown: 1.25,
};
const CAMPAIGN_CONTROL_TOWER = {
  hp: 2600,
  length: 150,
  width: 330,
  goldPerSecond: 20,
  magicPerSecond: 10,
  spawnEvery: 8,
  spawnTypes: ["earthElement", "waterElement", "fireElement", "windElement", "scaldStrike", "electricGate", "linghan", "hill"],
};
const CAMPAIGN_ACID_TOWER = {
  hp: 1000,
  length: 132,
  width: 300,
  damage: 30,
  range: 620,
  cooldown: 2,
  slimeRadius: 90,
  slimeSlow: 0.5,
  slimeDuration: 8,
};
const UNDEAD_BASE_UNITS = new Set(["summoner", "undead", "ghoul", "candlelight", "reaper", "undeadVulture", "necromancer", "machete", "boneThrower", "darkKnight", "deadCorpse", "poisonZombie", "undeadMage", "bannerBearer", "graveDigger"]);
const UNDEAD_CORPSE_EXCLUDED = new Set(["reaper", "deathGod", "deathGodClone", "catapult", "undeadCatapult", "boneGiant"]);
const SKELETON_UNITS = new Set(["machete", "boneThrower", "undeadVulture", "darkKnight", "undeadMage", "graveDigger", "boneGiant", "bannerBearer"]);
const ZOMBIE_UNITS = new Set(["undead", "ghoul", "deadCorpse", "poisonZombie", "necromancer"]);
const SPIRIT_UNITS = new Set(["reaper", "candlelight", "deathGod"]);
const BANNER_INSPIRE_GROUPS = ["skeleton", "zombie", "spirit"];
const BANNER_INSPIRE_LABELS = {
  skeleton: "骷髅",
  zombie: "丧尸",
  spirit: "亡灵",
};
const ECONOMY_UNITS = new Set(["miner", "summoner", "gnawMiner"]);
const CAMPAIGN_UNLOCKS = {
  order: ["spearman", "archer", "greatsword", "spartan", "ironCavalry", "monk", "crossbow", "musketeer", "mage", "catapult", "rocketCart", "rocketCart"],
  chaos: ["creeper", "goblin", "goblinExpert", "arrowShieldCart", "shaman", "priest", "apeMan", "orc", "berserkOrc", "minotaur", "rhinoMan", "bomber", "javelinThrower", "goblinVulture", "griffinBomber", "machete", "undead", "deadCorpse", "poisonZombie", "darkKnight", "undeadMage"],
  undeadEmpire: ["summoner", "machete", "boneThrower", "undead", "ghoul", "candlelight", "reaper", "undeadVulture", "necromancer", "deathGod", "graveDigger", "boneGiant", "bannerBearer", "poisonZombie", "darkKnight", "undeadMage"],
  element: ["hill", "linghan", "redflame", "stormLich", "hurricane", "vUnit", "electricGate", "dreadfire", "treeEnt", "rog", "scaldStrike", "windElement"],
  swarm: ["crawler", "poisonBug", "ironAnt", "swarmWorm", "antQueen", "heavyAnt", "gnawMiner", "corrosiveSpitter"],
};
const campaignProgressByFaction = {
  order: 1,
  chaos: 1,
  undeadEmpire: 1,
  element: 1,
  swarm: 1,
};
const campaignAbilities = {
  element: {
    earthMiner: false,
  },
};
const CAMPAIGN_SAVE_KEY = "empireStickWarCampaignSave";
const CAMPAIGN_LEVELS = {
  order: {
    1: {
      title: "第一关：守城之战",
      playerRoster: ["miner", "swordsman", "greatsword", "archer", "spearman", "spartan", "crossbow"],
      playerStart: ["miner", "miner", "swordsman", "archer", "spearman"],
      enemyRoster: ["miner", "creeper", "bomber", "orc", "berserkOrc", "javelinThrower", "goblinVulture", "apeMan"],
      enemyStart: ["miner", "miner", "orc", "orc", "berserkOrc", "berserkOrc", "javelinThrower", "javelinThrower", "javelinThrower"],
      enemyFaction: "chaos",
      campaignHighWalls: [
        { x: CENTER_TOWER.x + 200 },
        { x: FIELD.playerBase + 1400 },
      ],
      enemyReinforcement: { type: "creeper", every: 12, count: 2 },
      startGold: 220,
      enemyGold: 220,
      rewardText: "正式战役开启",
      objective: "依托两座高城抵御混沌进攻，并摧毁敌方前哨基地；高城生命值 2000，可阻拦敌人前进，上方各有五名弓箭手，每发 6 伤害",
    },
    2: {
      title: "第二关：箭雨阵线",
      playerRoster: ["miner", "swordsman", "spearman"],
      playerStart: ["miner", "swordsman", "spearman", "spartan"],
      enemyRoster: ["miner", "archer", "swordsman", "greatsword"],
      enemyStart: ["miner", "archer", "swordsman", "greatsword"],
      enemyFaction: "order",
      startGold: 120,
      enemyGold: 150,
      arrowRain: { every: 20, total: 300, perSecond: 75, damage: 10, radius: 24 },
      rewardText: "弓箭手与大剑兵",
      objective: "借助唯一的斯巴达，穿过周期性箭雨击败敌军",
    },
    3: {
      title: "第三关：反叛矛阵",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword"],
      playerStart: ["miner", "miner", "swordsman", "swordsman", "archer", "spearman"],
      enemyRoster: ["miner", "spearman", "spartan"],
      enemyStart: ["miner", "miner", "spartan", "spearman", "spearman"],
      enemyFaction: "order",
      startGold: 140,
      enemyGold: 160,
      playerDeathsBecomeEnemySpearman: true,
      rewardText: "斯巴达",
      objective: "谨慎推进，阵亡的我方单位会被敌军转化为长矛兵",
    },
    4: {
      title: "第四关：淘金热",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan"],
      playerStart: ["miner", "miner", "miner", "miner", "miner", "miner"],
      enemyRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan"],
      enemyStart: ["miner", "miner", "miner", "miner", "miner", "miner"],
      enemyFaction: "order",
      startGold: 120,
      enemyGold: 120,
      goldRush: { columns: 6, rows: 5, mineGold: 2500 },
      rewardText: "",
      objective: "争夺地图中部金矿，控制淘金速度取得优势",
    },
    5: {
      title: "第五关：双帝国战线",
      playerRoster: ["miner", "swordsman", "greatsword", "spearman", "archer", "spartan"],
      playerStart: ["miner", "swordsman", "greatsword", "spearman", "archer", "spartan"],
      enemyRoster: ["miner", "swordsman", "greatsword", "musketeer", "crossbow"],
      enemyStart: ["miner", "swordsman", "greatsword", "musketeer", "crossbow"],
      enemyFaction: "order",
      startGold: 160,
      enemyGold: 180,
      secondPhase: {
        enemyFaction: "chaos",
        enemyRoster: ["miner", "creeper", "bomber", "machete", "darkKnight"],
        enemyStart: ["miner", "creeper", "bomber", "machete", "darkKnight"],
        enemyGold: 200,
        killPlayerArmy: true,
        message: "混沌帝国参战，摧毁混沌基地才可胜利",
      },
      rewardText: "火枪手",
      objective: "先击破秩序基地，再迎战混沌帝国并摧毁第二座基地",
    },
    6: {
      title: "第六关：霜冻之地",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "monk", "crossbow", "musketeer", "mage"],
      playerStart: ["miner", "swordsman", "spearman", "archer", "musketeer", "berserker"],
      enemyRoster: ["miner", "chaosGiant", "enslavedGiant", "bomber", "creeper"],
      enemyStart: ["miner", "miner", "bomber", "bomber", "bomber", "creeper"],
      enemyFaction: "chaos",
      startGold: 180,
      enemyGold: 760,
      iceRoad: { slowFactor: 0.9, fastFactor: 0.9, affectedSides: ["player"] },
      secondPhase: {
        enemyFaction: "chaos",
        enemyRoster: [],
        enemyStart: ["superGiant"],
        enemyGold: 0,
        disableEnemyTraining: true,
        forceAllUnitsCharge: true,
        stunPlayerArmy: 5,
        reinforcements: [
          { type: "creeper", every: 5 },
          { type: "bomber", every: 6 },
          { type: "miner", every: 10, count: 2 },
        ],
        winByKillingType: "superGiant",
        message: "超级巨人出现，击杀它才可通关",
      },
      rewardText: "火炮",
      objective: "冰地会让我方单位移速下降 10%，敌方不受影响；摧毁基地后击杀超级巨人",
    },
    7: {
      title: "第七关：负隅顽抗",
      playerRoster: ["miner", "swordsman", "greatsword", "archon", "crossbow", "rocketCart"],
      playerStart: ["miner", "miner", "swordsman", "archon", "crossbow", "rocketCart", "rocketCart"],
      enemyRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hill", "linghan", "redflame", "stormLich", "scaldStrike", "electricGate", "hurricane", "dreadfire"],
      enemyStart: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hurricane", "vUnit"],
      enemyFaction: "element",
      startGold: 350,
      enemyGold: 220,
      campaignMissiles: { side: "player", label: "火箭弹支援", every: 30, warning: 8, count: 12, damage: 50, radius: 58, limit: 3, speedPerSecond: 450 },
      rewardText: "火箭车",
      hideObjectiveMechanic: true,
      objective: "双方阵容相当于元素帝国第六关互换；我方没有大法师，但有火箭弹支援；敌方只有普通 V，摧毁敌方基地即可胜利",
    },
    8: {
      title: "第八关：岩浆箭雨",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "archon", "monk", "crossbow", "musketeer", "mage", "catapult", "rocketCart"],
      playerStart: ["miner", "miner", "miner", "miner", "swordsman", "swordsman", "swordsman", "swordsman", "goldenArcher"],
      enemyRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hill", "linghan", "redflame", "stormLich", "scaldStrike", "electricGate", "hurricane", "dreadfire", "vUnit"],
      enemyStart: ["miner", "miner", "vUnit", "prometheus", "fireElement"],
      enemyFaction: "element",
      startGold: 300,
      enemyGold: 320,
      arrowRain: { every: 15, total: 300, perSecond: 75, damage: 10, radius: 24, side: "player", cooldownAfterComplete: true },
      playerDeathBlast: { damage: 13, radius: 52, limit: 3 },
      magmaGround: { every: 20, duration: 10, damage: 3 },
      campaignMeteor: { every: 15, count: 3, damage: 80, radius: 96, duration: 2.4, size: 18, cooldownAfterComplete: true },
      rewardText: "其他未解锁的所有单位",
      objective: "箭雨每 15 秒支援我方，只攻击敌方；我方阵亡会小范围爆炸伤到友军；周期性岩浆地会灼烧战场，火元素合成单位免疫；同时会落下巨大陨石",
    },
    9: {
      title: "第九关：黄金战矛",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "archon", "monk", "crossbow", "musketeer", "mage", "catapult", "rocketCart"],
      playerStart: ["miner", "miner", "miner", "miner", "swordsman", "swordsman", "greatsword", "spartan", "goldenSpartan"],
      enemyRoster: ["miner", "creeper", "undead", "poisonZombie", "machete", "darkKnight", "deadCorpse", "undeadMage", "executioner"],
      enemyStart: ["miner", "miner", "creeper", "undead", "machete", "darkKnight"],
      enemyFaction: "chaos",
      startGold: 300,
      enemyGold: 320,
      rewardText: "",
      objective: "我方可使用秩序帝国全部单位；英雄黄金斯巴达参战，双击可向最前方敌人投出一次黄金长矛",
    },
  },
  chaos: {
    1: {
      title: "第一关：侦查平原",
      playerRoster: ["miner", "orc", "berserkOrc", "javelinThrower", "apeMan", "goblinVulture", "griffinBomber"],
      playerStart: ["miner", "miner", "orc", "javelinThrower"],
      enemyRoster: ["summoner", "machete", "darkKnight", "undead", "poisonZombie", "deadCorpse", "graveDigger", "bannerBearer"],
      enemyStart: ["summoner", "undead", "undead", "poisonZombie", "machete", "machete"],
      enemyFaction: "undeadEmpire",
      initialTowerOwner: "player",
      enemyReinforcement: { type: "undead", every: 10 },
      startGold: 220,
      enemyGold: 180,
      rewardText: "正式战役开启",
      objective: "混沌侦查队已占据中心塔，推进平原并摧毁敌方古墓；敌方每 10 秒会召唤 1 只丧尸",
    },
    2: {
      title: "第二关：亡灵矿潮",
      playerRoster: ["miner", "machete", "darkKnight"],
      playerStart: ["miner", "machete", "darkKnight", "medusa"],
      enemyRoster: ["miner", "undead", "poisonZombie", "deadCorpse"],
      enemyStart: ["miner", "undead", "poisonZombie", "deadCorpse"],
      enemyFaction: "chaos",
      failOnDeath: "medusa",
      startGold: 140,
      enemyGold: 150,
      undeadMineWave: { every: 10, baseCount: 1, increaseEvery: 60 },
      rewardText: "亡灵与毒尸",
      objective: "保护美杜莎，在亡灵矿潮中击败敌军",
    },
    3: {
      title: "第三关：黑暗降临",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "darkKnight"],
      playerStart: ["miner", "machete", "darkKnight", "medusa"],
      enemyRoster: ["miner", "creeper", "bomber"],
      enemyStart: ["miner", "creeper", "bomber"],
      enemyFaction: "chaos",
      failOnDeath: "medusa",
      startGold: 150,
      enemyGold: 170,
      darkeningSky: { tick: 5, duration: 300, maxAlpha: 0.82 },
      rewardText: "炸弹客",
      objective: "在逐渐降临的黑暗中保护美杜莎，击败混沌军团",
    },
    4: {
      title: "第四关：巨人血潮",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "bomber"],
      playerStart: ["miner", "machete", "undead", "poisonZombie", "bomber"],
      enemyRoster: ["miner", "creeper", "bomber", "chaosGiant"],
      enemyStart: ["miner", "creeper", "bomber", "chaosGiant"],
      enemyFaction: "chaos",
      startGold: 180,
      enemyGold: 220,
      enemyHealthGrowth: { every: 2, percent: 0.01 },
      rewardText: "巨人",
      objective: "没有美杜莎支援，击败生命不断增长的巨人军团",
    },
    5: {
      title: "第五关：双王围猎",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "bomber", "darkKnight", "chaosGiant"],
      playerStart: ["miner", "machete", "undead", "poisonZombie", "bomber", "chaosGiant"],
      enemyRoster: ["miner", "creeper", "bomber", "machete", "darkKnight"],
      enemyStart: ["miner", "creeper", "bomber", "machete", "darkKnight"],
      enemyFaction: "chaos",
      startGold: 190,
      enemyGold: 220,
      enemyReinforcement: { type: "largeCreeper", every: 20, phase: 1 },
      secondPhase: {
        enemyFaction: "order",
        enemyRoster: ["miner", "swordsman", "archer", "greatsword", "spearman", "spartan"],
        enemyStart: ["miner", "swordsman", "archer", "greatsword", "spearman", "spartan"],
        enemyGold: 230,
        killPlayerArmy: true,
        message: "秩序帝国参战，再次摧毁秩序基地才可胜利",
      },
      rewardText: "爬行者",
      objective: "顶住大型爬行者冲击，击败混沌基地后再迎战秩序帝国",
    },
    6: {
      title: "第六关：大法师围城",
      playerRoster: ["miner", "undead", "poisonZombie", "deadCorpse", "undeadMage"],
      playerStart: ["miner", "undead", "poisonZombie", "deadCorpse", "undeadMage", "suikai"],
      enemyRoster: ["miner", "archer", "greatsword", "crossbow", "monk", "mage", "archmage"],
      enemyStart: ["miner", "archer", "greatsword", "crossbow", "monk", "mage", "archmage"],
      enemyFaction: "order",
      startGold: 170,
      enemyGold: 210,
      enemyDeathsBecomePlayerUndead: true,
      rewardText: "骨巫",
      objective: "敌军阵亡会在原地转化为我方亡灵，击败拥有连锁闪电与火球雨的大法师",
    },
    7: {
      title: "第七关：淘金热",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "deadCorpse", "undeadMage", "bomber", "darkKnight", "chaosGiant", "creeper"],
      playerStart: ["miner", "miner", "miner", "miner", "miner", "miner"],
      enemyRoster: ["miner", "swordsman", "greatsword", "archon", "musketeer", "crossbow", "catapult"],
      enemyStart: ["miner", "miner", "miner", "miner", "miner", "miner"],
      enemyFaction: "order",
      startGold: 120,
      enemyGold: 120,
      goldRush: { columns: 6, rows: 5, mineGold: 2500 },
      rewardText: "无新增单位",
      objective: "淘金热规则与秩序帝国淘金热一致，争夺中央金矿并击败秩序帝国",
    },
    8: {
      title: "第八关：雷霆神王",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "deadCorpse", "undeadMage", "bomber", "darkKnight", "chaosGiant", "creeper"],
      playerStart: ["miner", "miner", "miner", "miner", "machete", "machete", "machete", "darkKnightBrother", "darkKnightBrother"],
      enemyRoster: ["earthElement", "waterElement", "fireElement", "windElement", "hill", "linghan", "redflame", "stormLich", "vUnit", "zeus"],
      enemyStart: ["miner", "miner", "vUnit", "zeus", "windElement"],
      enemyFaction: "element",
      startGold: 260,
      enemyGold: 300,
      stormClouds: { every: 20, duration: 15, strikeEvery: 5, bolts: 5, hitChance: 0.7, damage: 15, healWindFused: 8 },
      rewardText: "其他未解锁的所有单位",
      objective: "敌方英雄宙斯参战：头顶雷云会自动攻击下方敌人，并周期召唤移动乌云、电墙和电门；战场会周期出现雷云，强化风元素合成单位与宙斯",
    },
  },
  undeadEmpire: {
    1: {
      title: "第一关：逃命亡徒",
      playerRoster: ["summoner", "machete", "darkKnight", "bannerBearer", "graveDigger", "undead", "deadCorpse", "poisonZombie", "necromancer"],
      playerStart: ["summoner", "summoner", "machete", "undead", "poisonZombie"],
      enemyRoster: ["miner", "swordsman", "greatsword", "archer", "spearman", "spartan", "crossbow"],
      enemyStart: ["miner", "miner", "swordsman", "archer", "spearman"],
      enemyFaction: "order",
      disableEnemyBaseAttack: true,
      delayedEnemyReinforcements: [
        {
          at: 360,
          message: "秩序支援到来",
          statusText: "秩序支援抵达战场，尽快摧毁敌方基地",
          units: [
            { type: "musketeer", count: 3 },
            { type: "swordsman", count: 8 },
            { type: "greatsword", count: 3 },
            { type: "monk", count: 2 },
            { type: "spartan", count: 2 },
          ],
        },
      ],
      timeLimit: 900,
      timeLimitFailText: "失败，15分钟内未能摧毁敌方基地",
      startGold: 220,
      enemyGold: 220,
      rewardText: "正式战役开启",
      objective: "摧毁敌方基地。敌方不会主动进攻我方基地；6分钟后秩序支援到来，15分钟内未摧毁敌方基地则失败",
    },
  },
  element: {
    1: {
      title: "第一关：笼中之鸟",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "dreadfire", "hurricane", "vUnit"],
      playerStart: ["earthElement", "waterElement", "fireElement", "windElement", "vUnit"],
      enemyRoster: ["summoner", "machete", "darkKnight", "undead", "poisonZombie", "reaper", "candlelight"],
      enemyStart: ["summoner", "machete", "undead", "poisonZombie"],
      enemyFaction: "undeadEmpire",
      campaignControlTower: {
        side: "enemy",
        label: "控制之塔",
        x: CENTER_TOWER.x,
        hp: CAMPAIGN_CONTROL_TOWER.hp,
        spawnTypes: CAMPAIGN_CONTROL_TOWER.spawnTypes,
      },
      requireControlTowerDestroyed: true,
      startGold: 180,
      enemyGold: 180,
      rewardText: "正式战役开启",
      objective: "摧毁中心控制之塔，拯救被控制的元素同胞，再摧毁亡灵基地；控制之塔每秒积累 20 金币、10 魔力，用这些资源建造土、水、火、风以及合成出的烫水击、电门、凌寒、山丘",
    },
    2: {
      title: "第二关：冰地异变",
      playerRoster: ["earthElement", "hill"],
      playerStart: ["earthElement", "hill", "vUnit"],
      enemyRoster: ["miner", "creeper", "bomber", "machete"],
      enemyStart: ["miner", "creeper", "bomber", "machete"],
      enemyFaction: "chaos",
      startGold: 130,
      enemyGold: 180,
      godV: true,
      iceRoad: { slowFactor: 0.8, fastFactor: 0.8 },
      enemyDeathsBecomeWaterScorpion: true,
      rewardText: "水元素、树精与凌寒",
      objective: "在冰地上稳住阵线，利用敌军死亡后的水蝎子反击",
    },
    3: {
      title: "第三关：天火矿脉",
      playerRoster: ["earthElement", "hill", "waterElement", "treeEnt", "linghan"],
      playerStart: ["vUnit", "waterElement", "waterElement", "waterElement"],
      enemyRoster: ["miner", "creeper", "machete"],
      enemyStart: ["miner", "miner", "darkKnight", "darkKnight", "creeper"],
      enemyFaction: "chaos",
      startGold: 120,
      enemyGold: 160,
      godV: true,
      allowEarthMinerConversion: true,
      campaignMeteor: { every: 15, count: 3, damage: 80, radius: 96, duration: 2.4, size: 18 },
      rewardText: "火元素、罗格与赤炎",
      objective: "以土元素开采与作战，在巨大陨石下守住矿脉",
    },
    4: {
      title: "第四关：雷云战场",
      playerRoster: ["earthElement", "waterElement", "fireElement", "treeEnt", "rog", "hill", "linghan", "redflame"],
      playerStart: ["earthElement", "waterElement", "fireElement", "treeEnt", "rog", "redflame"],
      enemyRoster: ["miner", "swordsman", "crossbow", "archer", "spearman"],
      enemyStart: ["miner", "swordsman", "crossbow", "archer", "spearman"],
      enemyFaction: "order",
      startGold: 160,
      enemyGold: 190,
      stormClouds: { every: 5, bolts: 5, hitChance: 0.7, damage: 15 },
      rewardText: "风暴巫妖、烫水击与电门",
      objective: "没有神明 V 支援，在雷云随机轰击中击败秩序军团",
    },
    5: {
      title: "第五关：雪中电门",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hill", "linghan", "redflame", "stormLich", "scaldStrike", "electricGate"],
      playerStart: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "redflame", "vUnit"],
      enemyRoster: ["miner", "undead", "poisonZombie", "deadCorpse", "suikai", "undeadMage"],
      enemyStart: ["miner", "undead", "poisonZombie", "deadCorpse", "suikai", "undeadMage"],
      enemyFaction: "chaos",
      startGold: 180,
      enemyGold: 220,
      godV: true,
      centerElectricGate: true,
      snow: { moveFactor: 0.9 },
      secondPhase: {
        enemyFaction: "order",
        enemyRoster: ["miner", "swordsman", "greatsword", "crossbow", "mage", "monk"],
        enemyStart: ["miner", "swordsman", "greatsword", "crossbow", "mage", "monk"],
        enemyGold: 240,
        killPlayerArmy: true,
        spareGodV: true,
        message: "秩序帝国基地出现，神明 V 躲过秒杀，继续摧毁秩序基地",
      },
      rewardText: "飓风与厄火",
      objective: "雪中守护神明 V，先破混沌基地，再击破秩序基地",
    },
    6: {
      title: "第六关：导弹前线",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hill", "linghan", "redflame", "stormLich", "scaldStrike", "electricGate", "hurricane", "dreadfire"],
      playerStart: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hurricane"],
      enemyRoster: ["miner", "swordsman", "archon", "crossbow", "rocketCart"],
      enemyStart: ["miner", "miner", "swordsman", "archon", "crossbow", "rocketCart"],
      enemyFaction: "order",
      startGold: 220,
      enemyGold: 260,
      campaignMissiles: { every: 30, warning: 8, count: 12, damage: 50, radius: 58, limit: 3, speed: 0.18 },
      rewardText: "V",
      objective: "敌方每 30 秒会朝我方最前线发射 12 发高速导弹；导弹来袭前会有 8 秒警告倒计时",
    },
    7: {
      title: "第七关：普罗米修斯",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "hill", "linghan", "redflame", "stormLich", "scaldStrike", "electricGate", "hurricane", "dreadfire", "vUnit"],
      playerStart: ["earthElement", "waterElement", "fireElement", "windElement", "vUnit", "prometheus"],
      enemyRoster: ["miner", "swordsman", "spearman", "greatsword", "spartan", "archer", "monk", "mage", "crossbow", "musketeer"],
      enemyStart: ["miner", "miner", "swordsman", "spearman", "greatsword", "archer", "monk", "mage"],
      enemyFaction: "order",
      startGold: 260,
      enemyGold: 300,
      rewardText: "",
      objective: "英雄普罗米修斯参战：每 8 秒轮流释放火龙、小火人和神火流星，对抗秩序帝国全兵种军团",
    },
    8: {
      title: "第八关：黑骑士兄长",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "hill", "linghan", "redflame", "stormLich", "vUnit", "zeus"],
      playerStart: ["miner", "miner", "vUnit", "zeus", "windElement"],
      enemyRoster: ["miner", "machete", "undead", "poisonZombie", "deadCorpse", "undeadMage", "bomber", "darkKnight", "chaosGiant", "creeper"],
      enemyStart: ["miner", "miner", "miner", "miner", "machete", "machete", "machete", "darkKnightBrother", "darkKnightBrother"],
      enemyFaction: "chaos",
      startGold: 260,
      enemyGold: 300,
      stormClouds: { every: 20, duration: 15, strikeEvery: 5, bolts: 5, hitChance: 0.7, damage: 15, healWindFused: 8 },
      rewardText: "其他未解锁的所有单位",
      objective: "本关相当于混沌帝国第八关双方互换；敌方黑骑士兄长成对参战，其中一人倒下时，另一人狂暴 60 秒，攻速与移速翻倍",
    },
  },
  swarm: {
    1: {
      title: "第一关：生命之心",
      playerRoster: ["crawler", "poisonBug", "ironAnt", "swarmWorm", "antQueen", "heavyAnt", "gnawMiner"],
      playerStart: ["crawler", "crawler", "ironAnt", "poisonBug"],
      enemyRoster: ["earthElement", "waterElement", "fireElement", "windElement", "rog", "treeEnt", "hurricane", "dreadfire"],
      enemyStart: ["earthElement", "waterElement", "fireElement", "windElement"],
      enemyFaction: "element",
      playerBaseHp: 2500,
      playerBaseLabel: "虫群之心",
      heartSummon: { type: "ironAnt", every: 8 },
      campaignAcidTower: {
        side: "player",
        label: "酸蚀炮塔",
        x: CENTER_TOWER.x,
        hp: CAMPAIGN_ACID_TOWER.hp,
      },
      startGold: 200,
      enemyGold: 220,
      rewardText: "正式战役开启",
      objective: "保护生命值 2500 的虫群之心并摧毁元素基地；虫群之心每 8 秒召唤 1 个铁蚁。中心酸蚀炮塔生命值 1000，攻击 30，攻速 2 秒，攻击会生成减速 50% 的粘液，被摧毁后消失",
    },
  },
};
let activeCampaign = null;
let pendingCampaignBriefing = null;

function opponentFaction() {
  return enemyFaction;
}

function factionForSide(side) {
  if (FOUR_WAY_SIDES.includes(side)) return side;
  return side === "player" ? selectedFaction : opponentFaction();
}

function isDuoBattle() {
  if (selectedMode === "campaign" || activeCampaign) return false;
  return selectedTeamMode === "duo";
}

function getFactionKey(side) {
  return side === "undeadEmpire" ? "undead" : side;
}

function getFactionEconomyUnit(faction) {
  if (faction === "undeadEmpire") return "summoner";
  if (faction === "swarm") return "gnawMiner";
  return "miner";
}

function isFactionUnavailableForMode(faction, mode, controlMode = selectedControlMode) {
  return faction === "swarm" && (mode === "quad" || (controlMode === "ai" && mode !== "campaign"));
}

function chooseUnusedFaction(excluded = []) {
  const blocked = new Set(excluded.filter(Boolean));
  const available = Object.keys(FACTIONS).filter((faction) => !blocked.has(faction));
  return available[Math.floor(Math.random() * available.length)] ?? "chaos";
}

function setupTeamFactions() {
  playerAllyFaction = null;
  enemyAllyFaction = null;
  enemyFaction = activeCampaign?.enemyFaction ?? chooseUnusedFaction([selectedFaction]);
  if (!isDuoBattle()) return;
  playerAllyFaction = chooseUnusedFaction([selectedFaction, enemyFaction]);
  enemyAllyFaction = chooseUnusedFaction([selectedFaction, playerAllyFaction, enemyFaction]);
}

function getFourWayTeam(side) {
  if (!state?.fourWayTeams) return side;
  return state.fourWayTeams[side] ?? side;
}

function areFourWayEnemies(a, b) {
  if (!a || !b || a === b) return false;
  return getFourWayTeam(a) !== getFourWayTeam(b);
}

function getPlayerControlledSide() {
  return state?.fourWay ? state.fourWayPlayerSide : "player";
}

function isPlayerControlledSide(side) {
  return Boolean(getPlayerControlledSide()) && side === getPlayerControlledSide();
}

function isFourWayPlayerSide(side) {
  return Boolean(state?.fourWay && side === getPlayerControlledSide());
}

function areHostileSides(a, b) {
  if (!a || !b || a === b) return false;
  return state?.fourWay ? areFourWayEnemies(a, b) : a !== b;
}

function getPreferredFourWayAlly(side) {
  const pairs = {
    order: "undeadEmpire",
    undeadEmpire: "order",
    chaos: "element",
    element: "chaos",
  };
  return pairs[side] ?? chooseUnusedFaction([side]);
}

function createFourWayTeams(playerSide) {
  if (!isDuoBattle()) return Object.fromEntries(FOUR_WAY_SIDES.map((side) => [side, side]));
  const allySide = getPreferredFourWayAlly(playerSide);
  const teamA = `team-${playerSide}`;
  const teamB = "team-rival";
  return Object.fromEntries(FOUR_WAY_SIDES.map((side) => [side, side === playerSide || side === allySide ? teamA : teamB]));
}

function getUnitCost(type, faction, side = null) {
  if (faction === "element" && MERGE_UNITS.has(type)) return getElementMergeCost(type, side);
  return UNIT[type].cost;
}

function getUnitMagicCost(type, faction, side = null) {
  if (faction === "element" && MERGE_UNITS.has(type)) return getElementMergeMagicCost(type, side);
  return UNIT[type]?.magicCost ?? 0;
}

function formatUnitCost(type, faction, side = null) {
  const gold = getUnitCost(type, faction, side);
  const magic = getUnitMagicCost(type, faction, side);
  return magic > 0 ? `${gold} 金币 · ${magic} 魔力` : `${gold} 金币`;
}

function getSideMagic(side) {
  if (side === "player") return state.magic ?? 0;
  if (side === "enemy") return state.enemyMagic ?? 0;
  return state.fourWaySides?.find((ai) => ai.side === side)?.magic ?? 0;
}

function addSideMagic(side, amount) {
  if (side === "player") state.magic = (state.magic ?? 0) + amount;
  else if (side === "enemy") state.enemyMagic = (state.enemyMagic ?? 0) + amount;
  else {
    const ai = state.fourWaySides?.find((item) => item.side === side);
    if (ai) ai.magic = (ai.magic ?? 0) + amount;
  }
}

function addSideGold(side, amount) {
  if (side === "player") state.gold += amount;
  else if (side === "enemy") state.enemyGold += amount;
  else {
    const ai = state.fourWaySides?.find((item) => item.side === side);
    if (ai) ai.gold += amount;
  }
}

function canAffordUnit(type, faction, side, gold) {
  return gold >= getUnitCost(type, faction, side) && getSideMagic(side) >= getUnitMagicCost(type, faction, side);
}

function spendUnitCost(type, faction, side, gold) {
  const cost = getUnitCost(type, faction, side);
  const magicCost = getUnitMagicCost(type, faction, side);
  if (side === "player") {
    state.gold -= cost;
    state.magic -= magicCost;
  } else if (side === "enemy") {
    state.enemyGold -= cost;
    state.enemyMagic -= magicCost;
  } else {
    const ai = state.fourWaySides?.find((item) => item.side === side);
    if (ai) {
      ai.gold -= cost;
      ai.magic = (ai.magic ?? 0) - magicCost;
    }
  }
  return cost;
}

function getElementMergeCost(type, side = null) {
  void type;
  void side;
  return 0;
}

function getElementMergeMagicCost(type, side = null) {
  void side;
  if (FREE_MERGE_UNITS.has(type)) return 0;
  return ELEMENT_MERGE_MAGIC_COSTS[type] ?? 0;
}

function canAffordElementMerge(type, side = "player") {
  return getSideMagic(side) >= getElementMergeMagicCost(type, side);
}

function getFourWayUnitCost(type, faction, side = null) {
  if (faction === "element" && MERGE_UNITS.has(type)) return FOUR_WAY_MERGE_VALUES[type] ?? getUnitCost(type, faction, side);
  return getUnitCost(type, faction, side);
}

function getFourWayUnitValue(type, faction, side = null) {
  if (faction === "element" && MERGE_UNITS.has(type)) return FOUR_WAY_MERGE_VALUES[type] ?? 180;
  return getFourWayUnitCost(type, faction, side);
}

function getFourWayFactionRoster(faction) {
  return [...new Set([...(FACTIONS[faction]?.roster ?? []), ...(FOUR_WAY_AI_ROSTER[faction] ?? [])])].filter((type) => {
    const data = UNIT[type];
    return data && !data.hero && !data.statueOnly && !data.summonOnly;
  });
}

function currentPlayerRoster() {
  if (activeCampaign) return activeCampaign.playerRoster;
  if (selectedMode === "quad" || state?.fourWay) return getFourWayFactionRoster(selectedFaction);
  if (selectedFaction === "element") return ["earthElement", "waterElement", "fireElement", "windElement"];
  return FACTIONS[selectedFaction].roster;
}

function loadCampaignSave() {
  try {
    const raw = localStorage.getItem(CAMPAIGN_SAVE_KEY);
    if (!raw) return;
    const save = JSON.parse(raw);
    Object.entries(save.progress ?? {}).forEach(([faction, level]) => {
      if (campaignProgressByFaction[faction]) {
        campaignProgressByFaction[faction] = Math.max(campaignProgressByFaction[faction], Number(level) || 1);
      }
    });
    if (save.abilities?.element) {
      campaignAbilities.element.earthMiner = Boolean(save.abilities.element.earthMiner);
    }
  } catch {
    localStorage.removeItem(CAMPAIGN_SAVE_KEY);
  }
}

function saveCampaignProgress() {
  try {
    localStorage.setItem(
      CAMPAIGN_SAVE_KEY,
      JSON.stringify({
        progress: campaignProgressByFaction,
        abilities: campaignAbilities,
      }),
    );
  } catch {
    statusEl.textContent = "浏览器暂时无法保存战役进度";
  }
}

function getCampaignUnitLimit(type) {
  return activeCampaign?.limitedUnits?.[type] ?? Infinity;
}

function getCampaignQueuedCount(type) {
  if (!state?.campaignTrainCounts) return 0;
  return state.campaignTrainCounts[type] ?? 0;
}

function canQueueCampaignUnit(type) {
  return getCampaignQueuedCount(type) < getCampaignUnitLimit(type);
}

function canUseEarthMinerConversion() {
  if (selectedFaction !== "element") return false;
  if (!activeCampaign) return true;
  return campaignAbilities.element.earthMiner || activeCampaign.allowEarthMinerConversion;
}

function currentEnemyRoster() {
  if (activeCampaign?.secondPhase && state?.campaignPhase === 2) return activeCampaign.secondPhase.enemyRoster;
  if (activeCampaign) return activeCampaign.enemyRoster;
  return FACTIONS[opponentFaction()].roster;
}

function formatSpecial(type) {
  const data = UNIT[type];
  const notes = [];
  if (type === "miner") notes.push("每次采 25，满 100 入库");
  if (type === "gnawMiner") notes.push("虫群矿工；挖 4 次带回 100 金");
  if (type === "crawler") notes.push("可免费原地进化成咀矿者");
  if (type === "poisonBug") notes.push("攻击自爆，最多 5 人受到伤害并被腐蚀：减速25%，每秒伤害递增，持续5秒");
  if (type === "swarmWorm") notes.push("沙虫：移动时潜地隐形，停下钻出；击杀敌人会转化为沙虫；可进化为虫母或灰烬");
  if (type === "broodMother") notes.push("每12.5秒召唤7个飞行蝗虫");
  if (type === "locust") notes.push("飞行召唤单位，会俯冲攻击敌人");
  if (type === "ashWorm") notes.push("不会攻击；每10秒召唤6个自爆虫");
  if (type === "blastBug") notes.push("靠近敌人后自爆，造成40范围伤害，最多5人");
  if (type === "ironAnt") notes.push("免疫小于15的伤害最多15次；可花100金币和100魔力原地进化为重蚁或蚁后");
  if (type === "heavyAnt") notes.push("远程小于35的伤害免疫35次；技能开启后6秒内免疫直射攻击，不消耗次数");
  if (type === "antQueen") notes.push("每8秒召唤4个铁蚁，召唤后自身眩晕2秒");
  if (type === "spider") notes.push("消耗100魔力训练；可进化巨蛛；技能生成蛛网，减速敌人50%，加速蜘蛛50%");
  if (type === "giantSpider") notes.push("每10秒召唤5个蜘蛛");
  if (type === "caterpillar") notes.push("每2.5秒射出神经炸弹，范围35伤害，并让敌人后撤5秒；可进化毛帽虫");
  if (type === "hoodCaterpillar") notes.push("进化单位；一次散射6枚神经炸弹，单枚20伤害，射程500");
  if (type === "corrosiveSpitter") notes.push("远程腐蚀6秒；攻击叠加5%易伤，最多50%；20%概率范围伤并生成减速粘液");
  if (type === "boneStinger") notes.push("骨刺最多穿透2名敌人；可钻地10秒，伤害变8且不穿透，受到伤害减半；可进化潜伏者");
  if (type === "lurker") notes.push("进化单位；不可移动，钻地攻击，地刺距离100并穿透，受到伤害减半");
  if (type === "summoner") notes.push(`矿工类单位；出场 ${data.firstSummonDelay}秒后召唤 ${data.summonCount} 个亡魂挖矿，之后每 ${data.summonEvery}秒再次召唤；场上亡魂数量无限制`);
  if (type === "wraithMiner") notes.push(`召唤单位，矿工类指令；每秒挖 ${data.goldPerSwing} 金或 ${data.magicPerSwing} 魔力，生命每秒减少 ${data.lifeDrainPerSecond}`);
  if (data.splash) notes.push(`范围 ${data.splash}`);
  if (data.splashDamage) notes.push(`溅射 ${data.splashDamage}`);
  if (data.flying) notes.push("飞行");
  if (data.giant) notes.push("巨大体型");
  if (data.freezeImmune) notes.push("无法被冰冻");
  if (data.stunImmune) notes.push("免疫眩晕");
  if (data.slayImmune) notes.push("免疫秒杀");
  if (data.controlImmune) notes.push("免疫控制");
  if (data.antiAir) notes.push("近战可攻击空中");
  if (type === "swordsman") notes.push(`手动技能愤怒：消耗 ${data.selfRageHpCost} 生命，自身移速/攻速 x1.5，持续 ${data.selfRageDuration}秒，冷却 ${data.selfRageEvery}秒`);
  if (type === "spartan") notes.push(`举盾时无法移动或攻击，受伤降低 ${Math.round(data.shieldStanceReduction * 100)}%，并为后方 ${data.shieldProtectBehind} 距离内友军抵挡直射攻击`);
  if (type === "spearman") notes.push(`首次接敌投矛 ${data.throwDamage} 伤害，${data.throwRecover}秒后换副矛近战`);
  if (type === "shotgunner") notes.push(`每 ${data.cooldown}秒散射 ${data.pellets} 发散弹，单颗 ${data.damage} 伤害；技能召唤 ${data.bombCount} 个小炸弹，冷却 ${data.bombSkillCooldown}秒`);
  if (type === "monk") notes.push(`每 ${data.healEvery}秒为一名友军恢复 ${data.healAmount}；技能释放面积 ${data.fieldArea} 的回血区，每秒治疗友军 ${data.fieldHeal}，持续 ${data.fieldDuration}秒，冷却 ${data.fieldCooldown}秒`);
  if (type === "ironCavalry") notes.push(`每 ${data.chargeCooldown}秒冲刺 ${data.chargeDuration}秒，冲刺移速 ${data.chargeSpeed}；仅冲刺中使用 ${data.musketRange} 射程火枪 ${data.musketDamage} 伤害/${data.musketCooldown}秒，并在 ${data.bombRange} 距离内投炸弹 ${data.bombDamage} 范围伤害，冷却 ${data.bombCooldown}秒；平时移速 ${data.speed}，近身长枪 ${data.spearDamage} 伤害/${data.spearCooldown}秒`);
  if (type === "deadCorpse") notes.push(`毒爆不造成直接伤害，范围中毒 ${data.poisonDps}/秒并减速；中毒目标受伤翻倍，死亡变亡灵`);
  if (type === "undead" || type === "poisonZombie" || type === "deadCorpse") notes.push("免疫中毒");
  if (type === "javelinThrower") notes.push(`每次攻击有 ${Math.round(data.poisonChance * 100)}% 概率投出毒矛`);
  if (type === "undeadVulture") notes.push(`飞行单位，吐出能量球造成 ${data.damage} 范围伤害，最多 ${data.aoeLimit} 人；死亡坠落造成 ${data.crashDamage} 范围伤害，最多 ${data.crashLimit} 人`);
  if (type === "goblin") notes.push(`没有普攻；每 ${data.mineEvery}秒花 ${data.minePlantDuration}秒安放地雷，最多携带 ${data.mineAmmo} 个；地雷最多存在 ${data.mineLife}秒，到期自动爆炸，对 ${data.mineBlastRadius} 范围内最多 ${data.mineAoeLimit} 个敌人造成 ${data.mineDamage} 伤害；遁地时原地不动并减伤 ${Math.round(data.burrowReduction * 100)}%`);
  if (type === "goblinExpert") notes.push(`没有普攻；每 ${data.armorEvery}秒为 ${data.armorRange} 范围内最多 ${data.armorLimit} 个非地精专家友军穿护甲，先给范围内单位穿轻甲 ${Math.round(data.armorStepReduction * 100)}% 减伤，再给重要单位二次升级为中甲 ${Math.round(data.armorMaxReduction * 100)}% 减伤；技能给一位友军重甲 ${Math.round(data.heavyArmorReduction * 100)}% 减伤 ${data.heavyArmorDuration}秒`);
  if (type === "shaman") notes.push(`没有普攻；每 ${data.thornEvery}秒生成面积 ${data.thornArea} 的荆棘，持续 ${data.thornDuration}秒，每秒 ${data.thornDps} 伤害并减速 ${Math.round((1 - data.thornSlow) * 100)}%；每秒为一名友军恢复 ${data.healAmount} 生命`);
  if (type === "priest") notes.push(`死亡敌人可被祭祀为祭品，收集 ${data.sacrificeNeeded} 个祭品召唤较弱猿人；技能抽取生命值不超过 ${data.siphonMaxHp} 的敌人，造成 ${data.siphonDamage} 伤害并治疗前线；血祭一名生物友军，将其当前生命值 x${data.bloodSacrificeFactor} 治疗前线，冷却 ${data.bloodSacrificeCooldown}秒`);
  if (type === "apeMan" || type === "summonedApeMan") notes.push(`攻击击退敌人 ${data.knockback} 距离并眩晕 ${data.stunDuration}秒`);
  if (type === "scimitarWarrior") notes.push(`大盾与大砍刀；战吼眩晕 ${data.roarRadius} 范围内敌人 ${data.roarStun}秒，冷却 ${data.roarCooldown}秒`);
  if (type === "minotaur") notes.push(`生命分为巨角兽 ${data.hp} 与兽人骑士 ${data.riderHp}；骑乘时巨角顶撞 ${data.beastDamage} 伤害/${data.beastCooldown}秒，骑士双短斧每把 ${data.riderDamage} 伤害/${data.riderCooldown}秒；巨角兽死亡后骑士下马作战；技能冲撞 ${data.chargeDistance} 距离并眩晕 ${data.chargeStun}秒，冷却 ${data.chargeCooldown}秒，不造成伤害`);
  if (type === "hornKnightRider") notes.push(`巨角兽死亡后下马作战；双短斧每把 ${data.damage} 伤害，攻速 ${data.cooldown}秒`);
  if (type === "rhinoMan") notes.push(`持有大盾；免疫伤害小于等于 ${data.rangedShieldThreshold} 的远程攻击；${data.deathRageRange} 范围内犀牛人死亡会狂暴，移速/攻速 x${data.deathRageMoveFactor}`);
  if (type === "candlelight") notes.push(`默认冰矩形态，攻击减速 ${Math.round((1 - data.slowFactor) * 100)}% ${data.slowDuration}秒；可切火焰形态，灼烧可叠加`);
  if (type === "reaper") notes.push(`连续攻击同一目标每次伤害 +${Math.round(data.stackBonus * 100)}%，最高 +${Math.round(data.maxStackBonus * 100)}%；隐形 ${data.stealthDuration}秒，移速 ${data.stealthSpeed}，破隐攻击 ${data.ambushDamage} 伤害`);
  if (type === "darkKnight") notes.push(`技能冲刺 ${data.chargeDistance} 距离，眩晕路径敌人 ${data.chargeStun}秒，冷却 ${data.chargeCooldown}秒，不造成伤害`);
  if (type === "necromancer") notes.push(`每 ${data.convertEvery}秒消耗魔力转化敌方尸体；远程尸体转毒尸，生命 ${NECROMANCER_DARK_KNIGHT_HP_THRESHOLD} 以上转黑骑士；技能召唤 ${data.summonCount} 只移速 ${data.summonedSpeed} 的冲锋丧尸，冷却 ${data.summonCooldown}秒`);
  if (type === "necromancer") notes.push(`手动死灵爆炸：${data.plagueRadius} 范围造成 ${data.plagueDamage} 伤害并中毒 ${data.plaguePoisonDps}/秒；中毒单位死亡会继续爆炸，冷却 ${data.plagueCooldown}秒`);
  if (type === "boneThrower") notes.push(`骷髅远程单位；携带 ${data.maxBoneAmmo} 根骨头，每次攻击消耗 1 根；手动取骨可将敌方尸体 ${Math.round(data.corpseBoneRatio * 100)}% 转化为骨头`);
  if (type === "deathGod") notes.push(`技能尖刺：${data.spikeRadius} 范围内长出 ${data.spikeCount} 根尖刺，每根 ${data.spikeDamage} 伤害，冷却 ${data.spikeCooldown}秒；技能分身：召唤不可移动分身 ${UNIT.deathGodClone.duration}秒，生命 ${UNIT.deathGodClone.hp}，攻击 ${UNIT.deathGodClone.damage}`);
  if (type === "goblinVulture") notes.push("飞行单位，背上哥布林使用短弩攻击");
  if (type === "griffinBomber") notes.push(`飞行轰炸单位，不停前进循环补弹；每轮 ${data.ammo} 颗炸弹，${data.cooldown}秒投 1 颗，${data.damage} 范围伤害，最多 ${data.bombLimit} 人；飞过基地时剩余炸弹砸向基地`);
  if (data.poisonDps) notes.push(data.poisonDuration === Infinity ? `中毒 ${data.poisonDps}/秒，直到解毒或死亡` : `中毒 ${data.poisonDps}/秒 ${data.poisonDuration}秒`);
  if (data.burnDps) notes.push(`灼烧 ${data.burnDps}/秒 ${data.burnDuration}秒`);
  if (data.stunDuration) notes.push(`眩晕 ${data.stunDuration}秒`);
  if (data.healOnDeath) notes.push(`死亡治疗 ${data.healOnDeath}`);
  if (type === "waterElement") notes.push(`冰冻敌人 ${data.freezeDps}/秒`);
  if (data.lightning) notes.push("必中闪电");
  if (type === "dreadfire") notes.push(`拥有合成入口后可直接融合；火龙标记/爆发；流星雨 ${data.meteorCount} 颗`);
  if (type === "redflame") notes.push(`拥有合成入口后可直接融合；大火球 ${data.fireballDamage} 并灼烧；五段熔岩柱 ${data.pillarDamage} 并眩晕 ${data.pillarStun}秒`);
  if (type === "stormLich") notes.push(`拥有合成入口后可直接融合；乌云 ${data.cloudDuration}秒内落 ${data.boltCount} 道闪电，每道 ${data.boltDamage} 并减速25%；死亡后 ${data.deathRainDrops} 滴治疗雨`);
  if (type === "hurricane") notes.push(`拥有合成入口后可直接融合；每 ${data.cooldown}秒发射龙卷风 ${data.damage} 伤害，眩晕 ${data.stunDuration}秒；每 ${data.shieldEvery}秒给友军护盾`);
  if (type === "hill") notes.push(`拥有合成入口后可直接融合；周围 ${data.jumpRadius} 有敌人时每 ${data.jumpEvery}秒大跳，造成 ${data.jumpDamage} 伤害并眩晕 ${data.jumpStun}秒`);
  if (type === "linghan") notes.push(`拥有合成入口后可直接融合；远程冰冻 ${data.freezeCount} 名敌人 ${data.freezeDuration}秒，冻伤 ${data.freezeDps}/秒；死亡生成减速冰地`);
  if (type === "scaldStrike") notes.push(`拥有合成入口后可直接释放；一次性爆炸 ${data.damage}；眩晕 ${data.stunDuration}秒；灼烧 ${data.burnDps}/秒 ${data.burnDuration}秒`);
  if (type === "electricGate") notes.push(`拥有合成入口后可直接融合；持续 ${data.duration}秒，每秒闪电 ${data.damage}，消失后重生土元素`);
  if (type === "mage") notes.push(`手动技能：魔爆 / 冰地 / 电墙 / 化石，全部冷却 ${data.skillCooldown}秒；化石可将生命低于 ${data.stoneGolemMaxHp} 的生物敌人暂变我方石头人 ${data.stoneGolemDuration}秒，石头人范围攻击最多3人`);
  if (type === "goldenSpartan") notes.push(`英雄单位；双击后向最前方敌人投出一次黄金长矛，造成 ${data.goldenSpearDamage} 点伤害`);
  if (type === "berserker") notes.push(`英雄单位；每 ${data.rageEvery}秒使自己和周围剑士/大剑兵狂暴 ${data.rageDuration}秒`);
  if (type === "archmage") notes.push(`英雄单位；连锁闪电 ${data.chainDamages.join("/")}; 每 ${data.fireballEvery}秒召唤 ${data.fireballCount} 个大火球；五次普攻后近距离奥术爆炸`);
  if (type === "prometheus") notes.push(`英雄单位；每 ${data.spellEvery}秒轮流释放火龙、小火人和 ${data.meteorCount} 发神火流星`);
  if (type === "darkKnightBrother") notes.push("英雄单位；兄弟之一阵亡时，另一位狂暴60秒，攻速和移速翻倍");
  if (type === "superGiant") notes.push("只攻击基地，击杀后通关");
  if (data.shieldHp) notes.push(`大盾 ${data.shieldHp} 生命，先承受伤害`);
  if (data.blindSpot) notes.push(`盲区 ${data.blindSpot}，敌人太近时会后撤`);
  if (type === "undeadCatapult") notes.push(`攻击后留下地火 ${data.groundFireDuration}秒，每秒 ${data.groundFireDps} 伤害`);
  if (type === "rocketCart") notes.push(`本轮 ${data.ammoPerReload} 发箭射完后装填 ${data.reloadEvery}秒；有目标时每 ${data.fireInterval}秒发射一发小范围爆炸箭`);
  if (type === "crossbow") notes.push(`每秒发射一箭造成 ${data.damage} 伤害，并绑定炸弹；${data.bombDelay}秒后爆炸造成 ${data.splashDamage} 范围伤害，最多 ${data.bombLimit} 个敌人；死亡坠地造成 ${data.deathCrashDamage} 范围伤害，最多 ${data.deathCrashLimit} 个敌人`);
  if (type === "treeEnt") notes.push(`不推进，每 ${data.summonEvery}秒召唤水蝎子，上限 ${data.summonLimit}；命中回血 ${data.healOnHit}`);
  if (type === "waterScorpion") notes.push("由树精召唤；攻击使敌人中毒");
  if (type === "rog") notes.push(`每 ${data.magmaEvery}秒岩浆灼烧`);
  if (type === "undeadMage") notes.push(`普攻法杖砸地，范围 ${data.staffRadius}；手动骨刺 ${data.boneSpikeRange} 距离；手动勾引一名敌人向我方前进 ${data.lureDuration}秒，造成 ${data.lureDamage} 伤害，冷却 ${data.lureCooldown}秒；手动召唤 ${data.skeletonSummonCount} 个骷髅兵，冷却 ${data.skeletonSummonCooldown}秒`);
  if (type === "bannerBearer") notes.push(`每 ${data.inspireEvery}秒原地举旗 ${data.inspireDuration}秒，可手动切换激励骷髅/丧尸/亡灵；骷髅死亡复活一次，丧尸移速翻倍并前三击眩晕，亡灵类吸血`);
  if (type === "graveDigger") notes.push(`每 ${data.reviveEvery}秒消耗魔力复活范围内一个基础单位尸体；每 ${data.ghostEvery}秒放出 ${data.ghostCount} 个幽灵，经过敌人使其恐惧并受伤翻倍`);
  if (type === "ghoul") notes.push(`手动技能：扑向最近敌方尸体，啃食 ${data.devourDuration}秒后恢复尸体原生命值一半，最多回满`);
  if (type === "boneGiant") notes.push(`巨斧范围攻击最多 ${data.aoeLimit} 人；受到远程伤害降低 ${Math.round(data.rangedReduction * 100)}%`);
  if (type === "berserker") notes.push(`附近至少 ${data.rageEnemyCount} 名敌人时释放狂暴`);
  if (type === "suikai") notes.push(`英雄单位；骨刺后召唤 ${data.summonCount} 只毒亡灵；每 ${data.corpseEvery}秒召唤死尸；每 ${data.hookEvery}秒钩走高威胁目标`);
  if (type === "zeus") notes.push(`英雄单位；头顶雷云自动攻击；每 ${data.cloudEvery}秒召唤移动乌云；每 ${data.columnEvery}秒召唤电墙；每 ${data.gateEvery}秒召唤电门`);
  if (type === "medusa") notes.push(`英雄单位；每 ${data.poisonEvery}秒喷毒并释放 ${data.corpseReleaseCount} 只死尸；双击后点敌人可秒杀非巨人/V/攻城器械单位，冷却 ${data.slayCooldown}秒`);
  if (type === "vUnit") notes.push(`出场 3 秒后召唤分身；双击后手动选择控制目标；控制期间无法行动；手动闪现后撤，冷却 ${data.blinkCooldown}秒`);
  if (type === "vClone") notes.push("由 V 召唤，近战攻击");
  return notes.join("；") || "无";
}

function renderStatsTable() {
  const columns = ["单位", "价格", "生命", "攻击", "射程", "速度", "攻速", "特殊"];
  statsTable.innerHTML = STAT_GROUPS.map(([groupName, types]) => {
    const rows = types
      .map((type) => {
        const data = UNIT[type];
        const faction = groupName === "秩序帝国" ? "order" : groupName === "混沌帝国" ? "chaos" : groupName === "亡灵帝国" ? "undeadEmpire" : "element";
        return [
          data.name,
          formatUnitCost(type, faction),
          data.hp,
          data.damage,
          data.range,
          data.speed,
          `${data.cooldown ?? 0.9}s`,
          formatSpecial(type),
        ];
      })
      .map((row) => row.map((cell, index) => `<div class="stats-cell ${index === 0 ? "name" : ""}">${cell}</div>`).join(""))
      .join("");

    return `
      <section class="stats-group">
        <h3>${groupName}</h3>
        <div class="stats-grid">
          ${columns.map((column) => `<div class="stats-cell header">${column}</div>`).join("")}
          ${rows}
        </div>
      </section>
    `;
  }).join("");
}

function newGame() {
  resetManualKeys();
  applyFieldMode(selectedMode === "quad");
  resetBattlefieldView();
  if (selectedMode === "quad") {
    newFourWayGame();
    return;
  }
  setupTeamFactions();
  renderFactionUi();
  renderShop();
  controlDeck?.classList.remove("hidden");
  homeBtn.classList.add("hidden");
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停";
  const startGold = activeCampaign ? (activeCampaign.startGold ?? CAMPAIGN_START_GOLD) : (MODE_START_GOLD[selectedMode] ?? MODE_START_GOLD.versus);
  const enemyStartGold = activeCampaign ? (activeCampaign.enemyGold ?? CAMPAIGN_START_GOLD) : startGold;
  const sideMines = createSideMines();

  state = createBaseState(startGold, enemyStartGold, sideMines);

  const playerStart = activeCampaign?.playerStart ?? FACTIONS[selectedFaction].startingUnits;
  const enemyStart = activeCampaign?.enemyStart ?? FACTIONS[opponentFaction()].startingUnits;

  playerStart.forEach((type, index) => {
    spawnTrainedUnit(type, "player", index);
  });
  if (isDuoBattle() && playerAllyFaction) {
    FACTIONS[playerAllyFaction].startingUnits.forEach((type, index) => {
      spawnTrainedUnit(type, "player", index + playerStart.length + 4);
    });
  }
  enemyStart.forEach((type, index) => {
    spawnTrainedUnit(type, "enemy", index);
  });
  if (isDuoBattle() && enemyAllyFaction) {
    FACTIONS[enemyAllyFaction].startingUnits.forEach((type, index) => {
      spawnTrainedUnit(type, "enemy", index + enemyStart.length + 4);
    });
  }
  if (isDuoBattle()) {
    state.teamAi = [
      playerAllyFaction ? createTeamAiState("player", playerAllyFaction, startGold * 0.65) : null,
      enemyAllyFaction ? createTeamAiState("enemy", enemyAllyFaction, enemyStartGold * 0.65) : null,
    ].filter(Boolean);
  }
  spawnCampaignCenterElectricGate();
  spawnCampaignHighWalls();
  spawnCampaignControlTower();
  spawnCampaignAcidTower();
  setCommand("guard");
  setMinerCommand("mine");
  if (activeCampaign) statusEl.textContent = activeCampaign.title;
  if (selectedMode === "brawl") statusEl.textContent = "淘金热：双方 1500 金币开局，中央金矿可争夺";
  if (isDuoBattle() && !activeCampaign) statusEl.textContent = `${selectedMode === "brawl" ? "淘金热" : "对战"} 2 打 2：AI 队友会自动出兵`;
  updateHud();
}

function createTeamAiState(side, faction, gold) {
  return {
    side,
    faction,
    gold,
    magic: 0,
    spawnTimer: 2 + Math.random() * 1.6,
    minerTimer: 7,
  };
}

function applyFieldMode(fourWay) {
  const source = fourWay ? createFourWayFieldConfig() : DEFAULT_FIELD;
  currentFieldModeFourWay = fourWay;
  document.body.classList.toggle("quad-watch", fourWay);
  FIELD.width = source.width;
  FIELD.height = source.height;
  FIELD.ground = source.ground ?? DEFAULT_FIELD.ground;
  FIELD.playerBase = source.playerBase ?? DEFAULT_FIELD.playerBase;
  FIELD.enemyBase = source.enemyBase ?? DEFAULT_FIELD.enemyBase;
  FIELD.playerGate = source.playerGate ?? DEFAULT_FIELD.playerGate;
  FIELD.enemyGate = source.enemyGate ?? DEFAULT_FIELD.enemyGate;
  FIELD.playerMineX = source.playerMineX ?? DEFAULT_FIELD.playerMineX;
  FIELD.enemyMineX = source.enemyMineX ?? DEFAULT_FIELD.enemyMineX;
  FIELD.mineDistance = source.mineDistance ?? DEFAULT_FIELD.mineDistance;
  if (fourWay) configureFourWayLayout(source);
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  battlefieldZoom = getDefaultBattlefieldZoom(fourWay);
  applyBattlefieldZoom(false);
}

function createFourWayFieldConfig() {
  const width = FOUR_WAY_FIELD.width;
  const height = FOUR_WAY_FIELD.height;
  const marginX = 330;
  const marginY = 250;
  return {
    ...FOUR_WAY_FIELD,
    width,
    height,
    ground: FOUR_WAY_FIELD.ground,
    playerBase: FOUR_WAY_FIELD.playerBase,
    enemyBase: FOUR_WAY_FIELD.enemyBase,
    playerGate: FOUR_WAY_FIELD.playerGate,
    enemyGate: FOUR_WAY_FIELD.enemyGate,
    playerMineX: FOUR_WAY_FIELD.playerMineX,
    enemyMineX: FOUR_WAY_FIELD.enemyMineX,
    mineDistance: FOUR_WAY_FIELD.mineDistance,
    baseMarginX: marginX,
    baseMarginY: marginY,
    minY: FOUR_WAY_FIELD.minY,
    maxY: FOUR_WAY_FIELD.maxY,
  };
}

function configureFourWayLayout(source) {
  const x = source.baseMarginX ?? 250;
  const y = source.baseMarginY ?? 250;
  FOUR_WAY_BASES.order.x = x;
  FOUR_WAY_BASES.order.y = y;
  FOUR_WAY_BASES.chaos.x = source.width - x;
  FOUR_WAY_BASES.chaos.y = y;
  FOUR_WAY_BASES.undeadEmpire.x = x;
  FOUR_WAY_BASES.undeadEmpire.y = source.height - y;
  FOUR_WAY_BASES.element.x = source.width - x;
  FOUR_WAY_BASES.element.y = source.height - y;
  FOUR_WAY_FIELD.minY = source.minY;
  FOUR_WAY_FIELD.maxY = source.maxY;
}

function createBaseState(startGold, enemyStartGold, sideMines = createSideMines()) {
  const playerMaxHp = activeCampaign?.playerBaseHp ?? STATUE_MAX_HP;
  const enemyMaxHp = activeCampaign?.enemyBaseHp ?? STATUE_MAX_HP;
  return {
    gold: startGold,
    enemyGold: enemyStartGold,
    magic: 0,
    enemyMagic: 0,
    command: "guard",
    attackIntent: "tower",
    commandLevel: 0,
    minerCommand: "mine",
    minerResource: "gold",
    paused: false,
    over: false,
    winner: null,
    playerMaxHp,
    enemyMaxHp,
    playerHp: playerMaxHp,
    enemyHp: enemyMaxHp,
    units: [],
    arrows: [],
    blasts: [],
    lightning: [],
    iceFields: [],
    spikes: [],
    delayedSpells: [],
    meteors: [],
    stormClouds: [],
    tornadoes: [],
    electricColumns: [],
    groundFires: [],
    thornFields: [],
    healingFields: [],
    landMines: [],
    barricades: [],
    slimeFields: [],
    webFields: [],
    swarmEggs: [],
    corpses: [],
    ghosts: [],
    pendingMerges: [],
    factionTraitTimers: {},
    floaters: [],
    spawnQueue: [],
    enemySpawnTimer: 0,
    enemyMinerTimer: 4,
    enemyAttackMood: 4,
    enemyCommand: "guard",
    enemyCommandTimer: 0,
    enemyLineX: getEnemyRallyBaseX(sideMines),
    enemyCounterPushTimer: 0,
    enemyCounterTargetX: null,
    enemyCounterCooldown: 0,
    enemyHoldTimer: 10,
    enemyAttackWaveTimer: 0,
    playerBaseAttackTimer: 0,
    enemyBaseAttackTimer: 0,
    pendingVControlId: null,
    pendingMedusaSlayId: null,
    inspectedUnitId: null,
    inspectedUnitTimer: 0,
    controlledUnitId: null,
    pendingManualAction: null,
    manualMoveTarget: null,
    selectedGroupIds: [],
    selectedGroupType: null,
    pendingGroupAction: null,
    groupAttackTargetId: null,
    groupMoveTarget: null,
    passiveGoldTimer: 2,
    towerOwner: activeCampaign?.initialTowerOwner ?? null,
    towerCaptureSide: null,
    towerCaptureTimer: 0,
    towerIncomeTimer: 1,
    campaignReinforcementTimer: activeCampaign?.enemyReinforcement?.every ?? 0,
    campaignHeartSummonTimer: activeCampaign?.heartSummon?.every ?? 0,
    campaignTrainCounts: {},
    arrowRainTimer: activeCampaign?.arrowRain?.every ?? 0,
    arrowRainRemaining: 0,
    arrowRainDropCarry: 0,
    magmaGroundTimer: activeCampaign?.magmaGround?.every ?? 0,
    magmaGroundRemaining: 0,
    magmaGroundTick: 0,
    undeadMineWaveTimer: activeCampaign?.undeadMineWave?.every ?? 0,
    undeadMineWaveElapsed: 0,
    campaignMeteorTimer: activeCampaign?.campaignMeteor?.every ?? 0,
    campaignMeteorCooldownDelay: 0,
    campaignMissileTimer: activeCampaign?.campaignMissiles ? Math.max(0, activeCampaign.campaignMissiles.every - activeCampaign.campaignMissiles.warning) : 0,
    campaignMissileWarning: 0,
    sideMines,
    goldRushMines: createGoldRushMines(getActiveGoldRushConfig()),
    enemyHealthGrowthTimer: activeCampaign?.enemyHealthGrowth?.every ?? 0,
    stormCloudTimer: activeCampaign?.stormClouds?.every ?? 0,
    stormCloudRemaining: 0,
    stormCloudStrikeTimer: 0,
    stormCloudHealTick: 0,
    campaignPhase: 1,
    secondPhaseReinforcementTimers: [],
    campaignElapsed: 0,
    delayedEnemyReinforcementsDone: [],
    campaignDarknessElapsed: 0,
    screenShake: 0,
    playerGodVAssigned: false,
    enemyGodVAssigned: false,
    teamAi: [],
    nextId: 1,
  };
}

function newFourWayGame() {
  activeCampaign = null;
  enemyFaction = "chaos";
  renderFactionUi();
  renderShop();
  controlDeck?.classList.remove("hidden");
  homeBtn.classList.add("hidden");
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停";
  state = createBaseState(0, 0, createFourWaySideMines());
  state.fourWay = true;
  state.fourWayElapsed = 0;
  state.fourWayPlayerSide = selectedControlMode === "ai" ? null : selectedFaction;
  state.fourWayTeams = createFourWayTeams(state.fourWayPlayerSide ?? selectedFaction);
  state.fourWayPressure = Object.fromEntries(FOUR_WAY_SIDES.map((side) => [side, 0]));
  state.fourWaySkillCooldowns = Object.fromEntries(Object.keys(FOUR_WAY_FACTION_SKILL).map((side, index) => [side, 4 + index * 3]));
  state.fourWaySkillEffects = Object.fromEntries(Object.keys(FOUR_WAY_FACTION_SKILL).map((side) => [side, 0]));
  state.fourWaySides = FOUR_WAY_SIDES.map((side) => ({
    side,
    faction: side,
    gold: FOUR_WAY_START_GOLD,
    magic: 0,
    hp: STATUE_MAX_HP,
    spawnTimer: 1 + Math.random() * 1.2,
    incomeTimer: 2,
    alive: true,
  }));
  state.fourWayBaseHp = Object.fromEntries(FOUR_WAY_SIDES.map((side) => [side, STATUE_MAX_HP]));
  FOUR_WAY_SIDES.forEach((side) => {
    FOUR_WAY_STARTERS[side].forEach((type, index) => spawnFourWayUnit(type, side, index));
  });
  statusEl.textContent = selectedControlMode === "ai"
    ? "四国 AI 对战：四方 AI 自动作战，你负责观战"
    : isDuoBattle()
      ? `四国 2 打 2：你负责${FACTIONS[selectedFaction].name}出兵与指挥，队友自动作战`
      : `四国对战：你负责${FACTIONS[selectedFaction].name}出兵与指挥，三方由 AI 控制`;
  updateHud();
  requestAnimationFrame(centerFourWayView);
}

function resetManualKeys() {
  manualKeys.up = false;
  manualKeys.down = false;
  manualKeys.left = false;
  manualKeys.right = false;
  manualJoystick.pointerId = null;
  manualJoystick.active = false;
  manualJoystick.center = null;
  manualJoystick.knob = null;
  manualJoystick.vector = { x: 0, y: 0 };
}

function resetBattlefieldView() {
  if (!battlefieldWrap) return;
  battlefieldWrap.scrollLeft = 0;
  battlefieldWrap.scrollTop = 0;
}

function centerFourWayView() {
  if (!battlefieldWrap) return;
  battlefieldWrap.scrollLeft = Math.max(0, (FIELD.width * battlefieldZoom - battlefieldWrap.clientWidth) / 2);
  battlefieldWrap.scrollTop = Math.max(0, (FIELD.height * battlefieldZoom - battlefieldWrap.clientHeight) / 2);
}

function getFitBattlefieldZoom() {
  if (!battlefieldWrap) return 1;
  if (battlefieldWrap.clientWidth <= 0 || battlefieldWrap.clientHeight <= 0) return BATTLEFIELD_MIN_ZOOM;
  const fitX = battlefieldWrap.clientWidth / Math.max(1, FIELD.width);
  const fitY = battlefieldWrap.clientHeight / Math.max(1, FIELD.height);
  return Math.max(BATTLEFIELD_MIN_ZOOM, Math.min(1, fitX, fitY));
}

function getDefaultBattlefieldZoom(fourWay) {
  return 1;
}

function canZoomBattlefield() {
  return currentFieldModeFourWay;
}

function clampBattlefieldZoom(value) {
  if (!canZoomBattlefield()) return 1;
  return Math.max(getFitBattlefieldZoom(), Math.min(BATTLEFIELD_MAX_ZOOM, value));
}

function applyBattlefieldZoom(preserveCenter = true) {
  if (!battlefieldWrap) return;
  const oldWidth = Math.max(1, canvas.getBoundingClientRect().width || FIELD.width * battlefieldZoom);
  const oldHeight = Math.max(1, canvas.getBoundingClientRect().height || FIELD.height * battlefieldZoom);
  const centerX = (battlefieldWrap.scrollLeft + battlefieldWrap.clientWidth / 2) / oldWidth;
  const centerY = (battlefieldWrap.scrollTop + battlefieldWrap.clientHeight / 2) / oldHeight;
  battlefieldZoom = clampBattlefieldZoom(battlefieldZoom);
  const normalScale = !canZoomBattlefield() && battlefieldWrap.clientHeight > 0
    ? battlefieldWrap.clientHeight / Math.max(1, FIELD.height)
    : battlefieldZoom;
  const displayWidth = Math.max(1, FIELD.width * normalScale);
  const displayHeight = Math.max(1, FIELD.height * normalScale);
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  updateZoomButtons();
  if (!preserveCenter) {
    if (!canZoomBattlefield()) battlefieldWrap.scrollTop = 0;
    return;
  }
  battlefieldWrap.scrollLeft = Math.max(0, centerX * displayWidth - battlefieldWrap.clientWidth / 2);
  battlefieldWrap.scrollTop = canZoomBattlefield()
    ? Math.max(0, centerY * displayHeight - battlefieldWrap.clientHeight / 2)
    : 0;
}

function setBattlefieldZoom(nextZoom) {
  if (!canZoomBattlefield()) {
    battlefieldZoom = 1;
    applyBattlefieldZoom(false);
    return;
  }
  battlefieldZoom = nextZoom;
  applyBattlefieldZoom(true);
}

function fitBattlefieldToView() {
  if (!canZoomBattlefield()) {
    setBattlefieldZoom(1);
    resetBattlefieldView();
    return;
  }
  setBattlefieldZoom(getFitBattlefieldZoom());
  resetBattlefieldView();
}

function updateZoomButtons() {
  if (!zoomOutBtn || !zoomInBtn || !zoomFitBtn) return;
  const enabled = canZoomBattlefield();
  zoomOutBtn.hidden = !enabled;
  zoomInBtn.hidden = !enabled;
  zoomFitBtn.hidden = !enabled;
  if (!enabled) {
    zoomOutBtn.disabled = true;
    zoomInBtn.disabled = true;
    zoomFitBtn.disabled = true;
    zoomFitBtn.textContent = "100%";
    zoomFitBtn.title = "4国对战可缩放";
    return;
  }
  const minZoom = getFitBattlefieldZoom();
  zoomOutBtn.disabled = battlefieldZoom <= minZoom + 0.001;
  zoomInBtn.disabled = battlefieldZoom >= BATTLEFIELD_MAX_ZOOM - 0.001;
  zoomFitBtn.disabled = Math.abs(battlefieldZoom - minZoom) <= 0.001;
  zoomFitBtn.textContent = `${Math.round(battlefieldZoom * 100)}%`;
  zoomFitBtn.title = "全图观看";
}

function spawnCampaignCenterElectricGate() {
  if (!activeCampaign?.centerElectricGate) return;
  const gate = spawnUnit("electricGate", "player", FIELD.width / 2);
  gate.maxHp = 999999;
  gate.hp = gate.maxHp;
  gate.electricGateTimer = Infinity;
  gate.campaignCenterGate = true;
  popText(gate.x, gate.y - 120, "无敌电门", "#9ee8ff");
}

function spawnCampaignHighWalls() {
  const walls = activeCampaign?.campaignHighWalls;
  if (!walls?.length) return;
  walls.forEach((wall, index) => {
    const x = Math.max(FIELD.playerGate + 220, Math.min(FIELD.enemyGate - 260, wall.x ?? FIELD.playerBase + 800));
    state.barricades.push({
      id: `campaign-high-wall-${index}-${state.nextId++}`,
      ownerId: null,
      side: "player",
      x,
      y: wall.y ?? FIELD.ground - 28,
      hp: wall.hp ?? CAMPAIGN_HIGH_WALL.hp,
      maxHp: wall.hp ?? CAMPAIGN_HIGH_WALL.hp,
      length: wall.length ?? CAMPAIGN_HIGH_WALL.length,
      width: wall.width ?? CAMPAIGN_HIGH_WALL.width,
      life: Infinity,
      duration: Infinity,
      tick: wall.archerCooldown ?? CAMPAIGN_HIGH_WALL.archerCooldown,
      tickEvery: wall.archerCooldown ?? CAMPAIGN_HIGH_WALL.archerCooldown,
      damage: 0,
      slow: 0,
      highWall: true,
      label: "高城",
      archerCount: wall.archerCount ?? CAMPAIGN_HIGH_WALL.archerCount,
      archerDamage: wall.archerDamage ?? CAMPAIGN_HIGH_WALL.archerDamage,
      archerRange: wall.archerRange ?? CAMPAIGN_HIGH_WALL.archerRange,
    });
  });
}

function spawnCampaignControlTower() {
  const tower = activeCampaign?.campaignControlTower;
  if (!tower) return;
  state.barricades.push({
    id: `campaign-control-tower-${state.nextId++}`,
    ownerId: null,
    side: tower.side ?? "enemy",
    x: Math.max(FIELD.playerGate + 260, Math.min(FIELD.enemyGate - 260, tower.x ?? CENTER_TOWER.x)),
    y: tower.y ?? CENTER_TOWER.y + 32,
    hp: tower.hp ?? CAMPAIGN_CONTROL_TOWER.hp,
    maxHp: tower.hp ?? CAMPAIGN_CONTROL_TOWER.hp,
    length: tower.length ?? CAMPAIGN_CONTROL_TOWER.length,
    width: tower.width ?? CAMPAIGN_CONTROL_TOWER.width,
    life: Infinity,
    duration: Infinity,
    tick: 1,
    tickEvery: 1,
    damage: 0,
    slow: 0,
    controlTower: true,
    label: tower.label ?? "控制之塔",
    resourceTick: 1,
    spawnTick: tower.spawnEvery ?? CAMPAIGN_CONTROL_TOWER.spawnEvery,
    spawnEvery: tower.spawnEvery ?? CAMPAIGN_CONTROL_TOWER.spawnEvery,
    spawnTypes: tower.spawnTypes ?? CAMPAIGN_CONTROL_TOWER.spawnTypes,
    gold: tower.startGold ?? 0,
    magic: tower.startMagic ?? 0,
    goldPerSecond: tower.goldPerSecond ?? CAMPAIGN_CONTROL_TOWER.goldPerSecond,
    magicPerSecond: tower.magicPerSecond ?? CAMPAIGN_CONTROL_TOWER.magicPerSecond,
  });
}

function spawnCampaignAcidTower() {
  const tower = activeCampaign?.campaignAcidTower;
  if (!tower) return;
  state.barricades.push({
    id: `campaign-acid-tower-${state.nextId++}`,
    ownerId: null,
    side: tower.side ?? "player",
    x: Math.max(FIELD.playerGate + 260, Math.min(FIELD.enemyGate - 260, tower.x ?? CENTER_TOWER.x)),
    y: tower.y ?? CENTER_TOWER.y + 32,
    hp: tower.hp ?? CAMPAIGN_ACID_TOWER.hp,
    maxHp: tower.hp ?? CAMPAIGN_ACID_TOWER.hp,
    length: tower.length ?? CAMPAIGN_ACID_TOWER.length,
    width: tower.width ?? CAMPAIGN_ACID_TOWER.width,
    life: Infinity,
    duration: Infinity,
    tick: tower.cooldown ?? CAMPAIGN_ACID_TOWER.cooldown,
    tickEvery: tower.cooldown ?? CAMPAIGN_ACID_TOWER.cooldown,
    damage: 0,
    slow: 0,
    acidTower: true,
    label: tower.label ?? "酸蚀炮塔",
    acidDamage: tower.damage ?? CAMPAIGN_ACID_TOWER.damage,
    acidRange: tower.range ?? CAMPAIGN_ACID_TOWER.range,
    slimeRadius: tower.slimeRadius ?? CAMPAIGN_ACID_TOWER.slimeRadius,
    slimeSlow: tower.slimeSlow ?? CAMPAIGN_ACID_TOWER.slimeSlow,
    slimeDuration: tower.slimeDuration ?? CAMPAIGN_ACID_TOWER.slimeDuration,
  });
}

function spawnFourWayUnit(type, side, index = 0) {
  const base = FOUR_WAY_BASES[side];
  const unit = spawnUnit(type, side, base.x);
  const center = { x: FIELD.width / 2, y: FIELD.height / 2 };
  const dx = center.x - base.x;
  const dy = center.y - base.y;
  const distance = Math.hypot(dx, dy) || 1;
  const nx = dx / distance;
  const ny = dy / distance;
  const px = -ny;
  const py = nx;
  const row = index % 5;
  const column = Math.floor(index / 5);
  const sideOffset = (row - 2) * 28;
  const forward = 70 + column * 34;
  unit.x = base.x + nx * forward + px * sideOffset;
  unit.y = base.y + ny * forward + py * sideOffset;
  unit.rallyX = unit.x;
  unit.rallyY = unit.y;
  unit.facingDir = nx >= 0 ? 1 : -1;
  unit.forceCharge = true;
  unit.inCastle = false;
  clampUnitPosition(unit);
  return unit;
}

function sendUnitOutOfBase(unit, dt) {
  if (!unit.spawnExitTimer || unit.spawnExitTimer <= 0) return false;
  unit.spawnExitTimer = Math.max(0, unit.spawnExitTimer - dt);
  const targetX = unit.spawnExitTargetX ?? unit.x;
  const targetY = unit.spawnExitTargetY ?? unit.y;
  const speed = Math.max(70, (unit.speed ?? UNIT[unit.type]?.speed ?? 40) * 1.35);
  moveUnitTowardPoint(unit, targetX, targetY, speed, dt, 4);
  if (unit.spawnExitTimer <= 0 || distanceTo(unit.x, unit.y, targetX, targetY) <= 5) {
    unit.x = targetX;
    unit.y = targetY;
    unit.spawnExitTimer = 0;
    unit.spawnExitTargetX = null;
    unit.spawnExitTargetY = null;
  }
  return true;
}

function openCampaignMap() {
  renderFactionUi();
  renderCampaignMap();
  closeCampaignBriefing();
  factionSelect.classList.add("hidden");
  campaignMap.classList.remove("hidden");
}

function renderCampaignMap() {
  const faction = selectedFaction;
  const progress = campaignProgressByFaction[faction] ?? 1;
  const unlocks = CAMPAIGN_UNLOCKS[faction];
  const configuredLevels = Math.min(CAMPAIGN_LEVEL_COUNT, Object.keys(CAMPAIGN_LEVELS[faction] ?? {}).length);

  campaignTitle.textContent = `${FACTIONS[faction].name}战役`;
  campaignProgress.textContent = configuredLevels
    ? `第 ${Math.min(progress, configuredLevels)} 关可挑战，共 ${CAMPAIGN_LEVEL_COUNT} 关`
    : `正式战役暂未开放，共 ${CAMPAIGN_LEVEL_COUNT} 关`;
  campaignPath.innerHTML = Array.from({ length: CAMPAIGN_LEVEL_COUNT }, (_, index) => {
    const level = index + 1;
    const unitType = unlocks[index];
    const unitName = UNIT[unitType]?.name ?? "终章军团";
    const config = CAMPAIGN_LEVELS[faction]?.[level];
    const available = Boolean(config) && level <= progress;
    const rewardText = config?.rewardText === "" ? "无" : (config?.rewardText ?? unitName);
    const titleText = HIDE_EXISTING_CAMPAIGNS ? `隐藏关 ${level}` : (config?.title ?? (available ? "可挑战" : "未解锁"));
    const unlockText = HIDE_EXISTING_CAMPAIGNS ? "隐藏奖励" : rewardText;
    const hintText = HIDE_EXISTING_CAMPAIGNS
      ? (available ? (config ? "点击进入隐藏关" : "隐藏关暂未开放") : `完成第 ${level - 1} 关后发现`)
      : (available ? (config ? "点击开始战斗" : "关卡暂未设计") : `完成第 ${level - 1} 关后开启`);
    return `
      <button class="campaign-node ${available ? "available" : "locked"}" data-level="${level}" ${available ? "" : "disabled"}>
        <span class="level-tag">第 ${level} 关</span>
        <strong>${titleText}</strong>
        <small>通关后解锁：${unlockText}</small>
        <small>${hintText}</small>
      </button>
    `;
  }).join("");

  [...campaignPath.querySelectorAll(".campaign-node.available")].forEach((button) => {
    button.addEventListener("click", () => {
      startCampaignLevel(faction, Number(button.dataset.level));
    });
  });
}

function closeCampaignMap() {
  closeCampaignBriefing();
  campaignMap.classList.add("hidden");
  factionSelect.classList.remove("hidden");
}

function startCampaignLevel(faction, level) {
  const config = CAMPAIGN_LEVELS[faction]?.[level];
  if (!config) {
    statusEl.textContent = `战役第 ${level} 关暂未开放`;
    return;
  }

  selectedMode = "campaign";
  selectedFaction = faction;
  pendingCampaignBriefing = { faction, level, ...config };
  renderCampaignBriefing(pendingCampaignBriefing);
}

function launchCampaignBriefing() {
  if (!pendingCampaignBriefing) return;
  activeCampaign = pendingCampaignBriefing;
  pendingCampaignBriefing = null;
  hideCampaignBriefing();
  campaignMap.classList.add("hidden");
  newGame();
}

function closeCampaignBriefing() {
  pendingCampaignBriefing = null;
  hideCampaignBriefing();
}

function hideCampaignBriefing() {
  campaignBriefing.classList.add("hidden");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function countUnitList(types = []) {
  if (!types.length) return "无";
  const counts = new Map();
  types.forEach((type) => counts.set(type, (counts.get(type) ?? 0) + 1));
  return [...counts.entries()]
    .map(([type, count]) => `${getUnitDisplayName(type)}${count > 1 ? ` ×${count}` : ""}`)
    .join("、");
}

function uniqueUnitList(types = []) {
  const unique = [...new Set(types)];
  return unique.length ? unique.map(getUnitDisplayName).join("、") : "无";
}

function getUnitDisplayName(type) {
  if (type === "godVUnit") return "神明V";
  return UNIT[type]?.name ?? type;
}

function formatBriefingLine(label, value) {
  return `
    <div class="briefing-line">
      <p><strong>${escapeHtml(label)}：</strong>${escapeHtml(value)}</p>
    </div>
  `;
}

function getCampaignRewardText(config) {
  const unlocks = CAMPAIGN_UNLOCKS[config.faction] ?? [];
  const fallbackType = unlocks[config.level - 1];
  const fallbackName = UNIT[fallbackType]?.name ?? "终章军团";
  return config.rewardText === "" ? "无" : (config.rewardText ?? fallbackName);
}

function describeCampaignMechanics(config) {
  const mechanics = [];
  if (config.objective && !config.hideObjectiveMechanic) mechanics.push(config.objective);
  if (config.failOnDeath) mechanics.push(`${UNIT[config.failOnDeath]?.name ?? "英雄"}死亡则挑战失败`);
  if (config.enemyReinforcement) {
    const count = config.enemyReinforcement.count ?? 1;
    mechanics.push(`敌方每 ${config.enemyReinforcement.every} 秒增援 ${count} 个${UNIT[config.enemyReinforcement.type]?.name ?? "单位"}`);
  }
  if (config.disableEnemyBaseAttack) mechanics.push("敌方不会主动进攻我方基地");
  if (config.delayedEnemyReinforcements?.length) {
    config.delayedEnemyReinforcements.forEach((wave) => {
      const units = (wave.units ?? [])
        .map((entry) => `${entry.count ?? 1} 个${UNIT[entry.type]?.name ?? entry.type}`)
        .join("、");
      mechanics.push(`${Math.round((wave.at ?? 0) / 60)} 分钟后敌方支援到来：${units}`);
    });
  }
  if (config.timeLimit) mechanics.push(`${Math.round(config.timeLimit / 60)} 分钟内未摧毁敌方基地则失败`);
  if (config.arrowRain) mechanics.push(`每 ${config.arrowRain.every} 秒落下箭雨，总计 ${config.arrowRain.total} 支，每支 ${config.arrowRain.damage} 点伤害`);
  if (config.arrowRain?.side === "player") mechanics.push("本关箭雨只攻击敌方单位");
  if (config.goldRush) mechanics.push(`淘金热：中央共有 ${config.goldRush.columns * config.goldRush.rows} 个金矿，每个最多 ${config.goldRush.mineGold} 金币`);
  if (config.playerDeathBlast) mechanics.push(`我方单位阵亡时爆炸，对周围友军造成 ${config.playerDeathBlast.damage} 点伤害，最多 ${config.playerDeathBlast.limit} 名`);
  if (config.magmaGround) mechanics.push(`每 ${config.magmaGround.every} 秒地面变成岩浆，持续 ${config.magmaGround.duration} 秒，每秒造成 ${config.magmaGround.damage} 点伤害，火元素合成单位免疫`);
  if (config.playerDeathsBecomeEnemySpearman) mechanics.push("我方单位阵亡后会在原地转化为敌方长矛兵");
  if (config.enemySpartanDamageReduction) mechanics.push(`敌方斯巴达减伤 ${Math.round(config.enemySpartanDamageReduction * 100)}%`);
  if (config.undeadMineWave) mechanics.push(`每 ${config.undeadMineWave.every} 秒从矿区刷出亡灵，每 ${config.undeadMineWave.increaseEvery} 秒数量增加`);
  if (config.darkeningSky) mechanics.push(`天色每 ${config.darkeningSky.tick} 秒变暗，${Math.round(config.darkeningSky.duration / 60)} 分钟后达到最暗`);
  if (config.enemyHealthGrowth) mechanics.push(`敌方单位每 ${config.enemyHealthGrowth.every} 秒增加 ${Math.round(config.enemyHealthGrowth.percent * 100)}% 生命值`);
  if (config.enemyDeathsBecomePlayerUndead) mechanics.push("敌方阵亡后会在原地转化为我方亡灵");
  if (config.enemyDeathsBecomeWaterScorpion) mechanics.push("敌方阵亡后会在原地转化为水蝎子");
  const hasPlayerGodV = config.godV || config.playerStart?.includes("godVUnit");
  if (hasPlayerGodV) mechanics.push(`神明 V 加入我方战斗，控制距离 ${GOD_V_CONTROL_RANGE}，若神明 V 死亡则挑战失败`);
  if (config.enemyGodV) mechanics.push(`敌方英雄单位神明 V 加入战斗，控制距离 ${GOD_V_CONTROL_RANGE}，被击败后会退出战场`);
  if (config.allowEarthMinerConversion) mechanics.push("土元素可以转化为矿工");
  if (config.campaignMeteor) mechanics.push(`每 ${config.campaignMeteor.every} 秒有 ${config.campaignMeteor.count} 颗陨石砸向金矿之间，每颗 ${config.campaignMeteor.damage} 点范围伤害`);
  if (config.campaignMissiles) {
    const sideText = config.campaignMissiles.side === "player" ? "我方火箭弹支援" : "敌方导弹来袭";
    const targetText = config.campaignMissiles.side === "player" ? "敌方最前线" : "我方最前线";
    mechanics.push(`每 ${config.campaignMissiles.every} 秒${sideText}：提前 ${config.campaignMissiles.warning} 秒警告，随后 ${config.campaignMissiles.count} 发轰击${targetText}，每发 ${config.campaignMissiles.damage} 点范围伤害，最多命中 ${config.campaignMissiles.limit} 名单位`);
  }
  if (config.iceRoad) {
    const slow = Math.round((1 - (config.iceRoad.slowFactor ?? 1)) * 100);
    const sides = config.iceRoad.affectedSides?.includes("player") && config.iceRoad.affectedSides.length === 1 ? "只影响我方" : "影响场上单位";
    mechanics.push(`冰地：${sides}，移动速度降低 ${slow}%`);
  }
  if (config.stormClouds) {
    const durationText = config.stormClouds.duration ? `，持续 ${config.stormClouds.duration} 秒，结束后再冷却` : "";
    const strikeText = config.stormClouds.duration ? `期间每 ${config.stormClouds.strikeEvery ?? 5} 秒` : `每 ${config.stormClouds.every} 秒`;
    mechanics.push(`${strikeText}雷云落下 ${config.stormClouds.bolts} 道闪电，命中率 ${Math.round(config.stormClouds.hitChance * 100)}%，每道 ${config.stormClouds.damage} 伤害${durationText}`);
    if (config.stormClouds.healWindFused) mechanics.push(`乌云出现时，风元素合成单位与宙斯每秒恢复 ${config.stormClouds.healWindFused} 点生命值`);
  }
  if (config.centerElectricGate) mechanics.push("地图中间存在无敌电门，敌人会无视它继续前进");
  if (config.campaignControlTower) mechanics.push(`中心控制之塔每秒积累 ${config.campaignControlTower.goldPerSecond ?? CAMPAIGN_CONTROL_TOWER.goldPerSecond} 金币、${config.campaignControlTower.magicPerSecond ?? CAMPAIGN_CONTROL_TOWER.magicPerSecond} 魔力，并消耗这些资源周期建造被控制的元素单位；摧毁后这些元素单位会归我方使用`);
  if (config.snow) mechanics.push(`雪地：单位移速降低 ${Math.round((1 - config.snow.moveFactor) * 100)}%`);
  if (config.secondPhase) {
    mechanics.push(config.secondPhase.message ?? "摧毁第一座基地后进入第二阶段");
    if (config.secondPhase.killPlayerArmy) mechanics.push("第二阶段开始时，全场普通友军会被秒杀");
    if (config.secondPhase.stunPlayerArmy) mechanics.push(`第二阶段开始时，我方单位眩晕 ${config.secondPhase.stunPlayerArmy} 秒`);
    if (config.secondPhase.reinforcements?.length) {
      const text = config.secondPhase.reinforcements
        .map((reinforcement) => `${reinforcement.count ?? 1} 个${UNIT[reinforcement.type]?.name ?? reinforcement.type}/${reinforcement.every}秒`)
        .join("、");
      mechanics.push(`第二阶段敌方持续增援：${text}`);
    }
    if (config.secondPhase.winByKillingType) mechanics.push(`击杀${UNIT[config.secondPhase.winByKillingType]?.name ?? "指定单位"}后通关`);
  }
  return mechanics.length ? mechanics : ["无特殊机制"];
}

function renderCampaignBriefing(config) {
  const rewardText = getCampaignRewardText(config);
  const secondPhaseEnemyUnits = config.secondPhase ? [...(config.secondPhase.enemyRoster ?? []), ...(config.secondPhase.enemyStart ?? [])] : [];
  const secondPhaseLine = secondPhaseEnemyUnits.length
    ? formatBriefingLine("第二阶段敌方", uniqueUnitList(secondPhaseEnemyUnits))
    : "";
  const mechanics = describeCampaignMechanics(config);

  briefingTitle.textContent = config.title;
  briefingReward.textContent = `通关后解锁：${rewardText}`;
  briefingContent.innerHTML = `
    <section class="briefing-section">
      <h4>敌方单位</h4>
      ${formatBriefingLine("主要单位", uniqueUnitList([...(config.enemyRoster ?? []), ...(config.enemyStart ?? [])]))}
      ${formatBriefingLine("开局单位", countUnitList(config.enemyStart))}
      ${formatBriefingLine("初始金币", `${config.enemyGold ?? CAMPAIGN_START_GOLD}`)}
      ${secondPhaseLine}
    </section>
    <section class="briefing-section">
      <h4>我方单位</h4>
      ${formatBriefingLine("可用单位", config.playerRoster?.length ? uniqueUnitList(config.playerRoster) : "本关无法建造单位")}
      ${formatBriefingLine("开局单位", countUnitList(config.playerStart))}
      ${formatBriefingLine("初始金币", `${config.startGold ?? CAMPAIGN_START_GOLD}`)}
    </section>
    <section class="briefing-section">
      <h4>特殊机制</h4>
      ${mechanics.map((item, index) => formatBriefingLine(`机制 ${index + 1}`, item)).join("")}
    </section>
  `;
  campaignBriefing.classList.remove("hidden");
}

function renderFactionUi() {
  if (selectedMode === "quad") {
    playerNameEl.textContent = selectedControlMode === "ai" ? "AI 对战观战" : FACTIONS[selectedFaction].name;
    enemyNameEl.textContent = selectedControlMode === "ai" ? "四方 AI" : isDuoBattle() ? "敌方同盟" : "三方 AI";
    playerCard.classList.remove("order", "chaos", "undead", "element", "swarm");
    enemyCard.classList.remove("order", "chaos", "undead", "element", "swarm");
    if (selectedControlMode !== "ai") playerCard.classList.add(getFactionKey(selectedFaction));
    enemyCard.classList.add("element");
    return;
  }
  playerNameEl.textContent = FACTIONS[selectedFaction].name;
  enemyNameEl.textContent = FACTIONS[opponentFaction()].name;
  playerCard.classList.remove("order", "chaos", "undead", "element", "swarm");
  enemyCard.classList.remove("order", "chaos", "undead", "element", "swarm");
  playerCard.classList.add(getFactionKey(selectedFaction));
  enemyCard.classList.add(getFactionKey(opponentFaction()));
}

const ELEMENT_MERGE_ACTIONS = [
  { type: "treeEnt", action: "mergeTreeEnt" },
  { type: "rog", action: "mergeRog" },
  { type: "dreadfire", action: "mergeDreadfire" },
  { type: "hurricane", action: "mergeHurricane" },
  { type: "stormLich", action: "mergeStormLich" },
  { type: "redflame", action: "mergeRedflame" },
  { type: "hill", action: "mergeHill" },
  { type: "linghan", action: "mergeLinghan" },
  { type: "scaldStrike", action: "mergeScaldStrike" },
  { type: "electricGate", action: "mergeElectricGate" },
  { type: "vUnit", action: "mergeV" },
];
const ELEMENT_MERGE_ACTION_BY_TYPE = Object.fromEntries(ELEMENT_MERGE_ACTIONS.map((merge) => [merge.type, merge.action]));
const ELEMENT_MERGE_TYPE_BY_ACTION = Object.fromEntries(ELEMENT_MERGE_ACTIONS.map((merge) => [merge.action, merge.type]));
const ELEMENT_SHOP_LAYOUT = [
  ["earthElement", "hill", "treeEnt"],
  ["waterElement", "linghan", "rog"],
  ["electricGate", "vUnit", "scaldStrike"],
  ["fireElement", "redflame", "dreadfire"],
  ["windElement", "stormLich", "hurricane"],
];
const UNDEAD_SHOP_LAYOUT = [
  ["summoner", "undead", "candlelight"],
  ["machete", "ghoul", "reaper"],
  ["undeadVulture", "boneThrower", "deathGod"],
  ["darkKnight", "poisonZombie", "deadCorpse"],
  ["undeadMage", "necromancer", null],
  ["graveDigger", null, null],
  ["boneGiant", null, null],
  ["bannerBearer", null, null],
];
const SWARM_EVOLUTION_SOURCE_BY_TYPE = {
  gnawMiner: "crawler",
  broodMother: "swarmWorm",
  ashWorm: "swarmWorm",
  heavyAnt: "ironAnt",
  antQueen: "ironAnt",
  giantSpider: "spider",
  hoodCaterpillar: "caterpillar",
  lurker: "boneStinger",
};
const SWARM_EVOLVE_ACTION_BY_TYPE = Object.fromEntries(
  Object.keys(SWARM_EVOLUTION_SOURCE_BY_TYPE).map((type) => [type, `evolve${type[0].toUpperCase()}${type.slice(1)}`])
);
const SWARM_EVOLVE_TYPE_BY_ACTION = Object.fromEntries(
  Object.entries(SWARM_EVOLVE_ACTION_BY_TYPE).map(([type, action]) => [action, type])
);
const SWARM_SHOP_LAYOUT = [
  ["crawler", "gnawMiner", null],
  ["ironAnt", "heavyAnt", "antQueen"],
  ["poisonBug", "corrosiveSpitter", null],
  ["swarmWorm", "broodMother", "ashWorm"],
  ["spider", "giantSpider", null],
  ["boneStinger", "lurker", null],
  ["caterpillar", "hoodCaterpillar", null],
];

function shopGroupClass(type) {
  if (type === "summoner") return "shop-group-economy";
  if (SKELETON_UNITS.has(type)) return "shop-group-skeleton";
  if (ZOMBIE_UNITS.has(type)) return "shop-group-zombie";
  if (SPIRIT_UNITS.has(type)) return "shop-group-spirit";
  return "";
}

function getAvailableElementMerges() {
  if (selectedFaction !== "element") return [];
  if (!activeCampaign) return ELEMENT_MERGE_ACTIONS;
  const roster = currentPlayerRoster();
  return ELEMENT_MERGE_ACTIONS.filter((merge) => roster.includes(merge.type));
}

function renderShop() {
  mobileUnitsToggle.classList.remove("hidden");
  const showElementConvertButton = selectedFaction === "element" && selectedMode !== "quad" && (!activeCampaign || canUseEarthMinerConversion());
  const allowedElementMerges = getAvailableElementMerges();
  const shopRoster = currentPlayerRoster().filter((type) => !MERGE_UNITS.has(type));
  const allowedElementMergeTypes = new Set(allowedElementMerges.map((merge) => merge.type));
  const elementShopItems = selectedFaction === "element"
    ? ELEMENT_SHOP_LAYOUT.flatMap((column) => column).filter((type) => shopRoster.includes(type) || allowedElementMergeTypes.has(type))
    : [];
  const undeadShopItems = selectedFaction === "undeadEmpire"
    ? UNDEAD_SHOP_LAYOUT.flatMap((column) => column).filter((type) => type === null || shopRoster.includes(type))
    : [];
  const swarmShopItems = selectedFaction === "swarm"
    ? SWARM_SHOP_LAYOUT.flatMap((column) => column).filter((type) => {
      if (type === null || shopRoster.includes(type)) return true;
      const source = SWARM_EVOLUTION_SOURCE_BY_TYPE[type];
      return Boolean(source && shopRoster.includes(source));
    })
    : [];
  const elementShopItemCount = elementShopItems.length + (showElementConvertButton ? 1 : 0);

  const renderTrainButton = (type) => {
    if (!type) return `<span class="shop-spacer" aria-hidden="true"></span>`;
    const data = UNIT[type];
    return `
      <button class="train-btn ${shopGroupClass(type)}" data-unit="${type}">
        <span class="unit-icon ${UNIT_ICON[type]}"></span>
        <strong>${data.name}</strong>
        <small>${formatUnitCost(type, selectedFaction, "player")}${Number.isFinite(getCampaignUnitLimit(type)) ? ` · 本关限 ${getCampaignUnitLimit(type)}` : ""}</small>
      </button>
    `;
  };
  const renderElementButton = (type) => {
    if (!MERGE_UNITS.has(type)) return renderTrainButton(type);
    const mergeMagicCost = getElementMergeMagicCost(type, state?.fourWay ? getPlayerControlledSide() : "player");
    return `
      <button class="train-btn" data-action="${ELEMENT_MERGE_ACTION_BY_TYPE[type]}">
        <span class="unit-icon ${UNIT_ICON[type]}"></span>
        <strong>合成${UNIT[type].name}</strong>
        <small>${mergeMagicCost > 0 ? `${mergeMagicCost} 魔力` : "无需魔力"}</small>
      </button>
    `;
  };
  const renderSwarmButton = (type) => {
    if (!type) return renderTrainButton(type);
    if (!SWARM_EVOLUTION_SOURCE_BY_TYPE[type]) return renderTrainButton(type);
    const sourceType = SWARM_EVOLUTION_SOURCE_BY_TYPE[type];
    const cost = getSwarmEvolutionCostForSource(sourceType, type);
    const costText = [
      cost.gold > 0 ? `${cost.gold} 金` : "",
      cost.magic > 0 ? `${cost.magic} 魔力` : "",
    ].filter(Boolean).join(" · ") || "无需资源";
    return `
      <button class="train-btn" data-action="${SWARM_EVOLVE_ACTION_BY_TYPE[type]}">
        <span class="unit-icon ${UNIT_ICON[type]}"></span>
        <strong>进化${UNIT[type].name}</strong>
        <small>${UNIT[sourceType].name} · ${costText}</small>
      </button>
    `;
  };
  const elementConvertButton = showElementConvertButton
    ? `
      <button class="train-btn" data-action="convertEarth">
        <span class="unit-icon miner"></span>
        <strong>土化矿工</strong>
        <small>选择一名土元素</small>
      </button>
    `
    : "";

  unitShop.classList.toggle("element-shop", selectedFaction === "element");
  unitShop.classList.toggle("element-shop-expanded", selectedFaction === "element" && elementShopItemCount > 12);
  unitShop.classList.toggle("undead-shop", selectedFaction === "undeadEmpire");

  unitShop.innerHTML = selectedFaction === "element"
      ? elementShopItems.map(renderElementButton).join("") + elementConvertButton
      : selectedFaction === "undeadEmpire"
      ? undeadShopItems.map(renderTrainButton).join("")
      : selectedFaction === "swarm"
      ? swarmShopItems.map(renderSwarmButton).join("")
      : shopRoster.map(renderTrainButton).join("");

  trainButtons = [...document.querySelectorAll(".train-btn")];
  trainButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const actionSide = getPlayerControlledSide();
      if (button.dataset.action === "convertEarth") {
        convertEarthToMiner(actionSide);
        return;
      }
      if (button.dataset.action === "mergeTreeEnt") {
        mergeTreeEnt(actionSide);
        return;
      }
      if (button.dataset.action === "mergeRog") {
        mergeRog(actionSide);
        return;
      }
      if (button.dataset.action === "mergeDreadfire") {
        mergeDreadfire(actionSide);
        return;
      }
      if (button.dataset.action === "mergeRedflame") {
        mergeRedflame(actionSide);
        return;
      }
      if (button.dataset.action === "mergeStormLich") {
        mergeStormLich(actionSide);
        return;
      }
      if (button.dataset.action === "mergeHurricane") {
        mergeHurricane(actionSide);
        return;
      }
      if (button.dataset.action === "mergeHill") {
        mergeHill(actionSide);
        return;
      }
      if (button.dataset.action === "mergeLinghan") {
        mergeLinghan(actionSide);
        return;
      }
      if (button.dataset.action === "mergeScaldStrike") {
        mergeScaldStrike(actionSide);
        return;
      }
      if (button.dataset.action === "mergeElectricGate") {
        mergeElectricGate(actionSide);
        return;
      }
      if (button.dataset.action === "mergeV") {
        mergeV(actionSide);
        return;
      }
      const swarmEvolveType = SWARM_EVOLVE_TYPE_BY_ACTION[button.dataset.action];
      if (swarmEvolveType) {
        evolveFirstSwarmUnit(actionSide, swarmEvolveType);
        return;
      }
      queueUnit(button.dataset.unit);
      closeMobileUnitShop();
    });
  });
}

function closeMobileUnitShop() {
  unitShop?.classList.remove("mobile-open");
  mobileUnitsToggle?.setAttribute("aria-expanded", "false");
}

function toggleMobileUnitShop() {
  if (!unitShop || !mobileUnitsToggle) return;
  const isOpen = unitShop.classList.toggle("mobile-open");
  mobileUnitsToggle.setAttribute("aria-expanded", String(isOpen));
}

function setCommand(command) {
  if (command === "attack") {
    state.commandLevel = Math.min(2, (state.commandLevel ?? getCommandLevelFromState()) + 1);
    applyCommandLevel();
  } else if (command === "guard") {
    state.commandLevel = Math.max(0, (state.commandLevel ?? getCommandLevelFromState()) - 1);
    applyCommandLevel();
  } else if (command === "retreat") {
    state.command = "retreat";
    state.attackIntent = "tower";
    state.commandLevel = 0;
  } else {
    state.command = command;
    state.attackIntent = "tower";
    state.commandLevel = getCommandLevelFromState();
  }
  if (state.command !== "retreat") {
    state.units.forEach((unit) => {
      if (unit.side === "player" && unit.inCastle) unit.inCastle = false;
    });
  }
  armyCommandButtons.forEach((button) => {
    const active = button.dataset.command === "attack"
      ? state.command === "attack"
      : button.dataset.command === state.command;
    button.classList.toggle("active", active);
  });

  if (!state.over) {
    statusEl.textContent = getCommandStatusText();
  }
}

function getCommandLevelFromState() {
  if (state.command === "attack" && state.attackIntent === "statue") return 2;
  if (state.command === "attack" && state.attackIntent === "tower") return 1;
  return 0;
}

function applyCommandLevel() {
  if ((state.commandLevel ?? 0) <= 0) {
    state.command = "guard";
    state.attackIntent = "tower";
  } else {
    state.command = "attack";
    state.attackIntent = state.commandLevel >= 2 ? "statue" : "tower";
  }
}

function getCommandStatusText() {
  if (state.command === "retreat") return "撤退！部队回到城堡内";
  if (state.command === "guard") return "部队回到城堡前防守";
  if (state.command === "attack" && state.attackIntent === "statue") return "全军进攻，目标敌方基地";
  return "部队前往中心塔，占领范围防守";
}

function setMinerCommand(command) {
  state.minerCommand = command;
  if (command !== "retreat" && state.command !== "retreat") {
    state.units.forEach((unit) => {
      if (unit.side === "player" && (unit.type === "miner" || unit.type === "gnawMiner" || unit.type === "summoner" || unit.type === "wraithMiner") && unit.inCastle) unit.inCastle = false;
    });
  }
  minerCommandButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.minerCommand === command);
  });

  if (!state.over) {
    const label = { retreat: "矿工撤退进城", mine: "矿工开始挖矿", attack: "矿工加入进攻" };
    statusEl.textContent = label[command];
  }
}

function spawnUnit(type, side, x) {
  const forceGodV = type === "godVUnit";
  const unitType = normalizeUnitType(type);
  const data = UNIT[unitType];
  const lane = Math.random() * 34 - 17;
  state.units.push({
    id: state.nextId++,
    type: unitType,
    side,
    x,
    y: FIELD.ground + lane,
    hp: data.hp,
    maxHp: data.hp,
    shieldHp: data.shieldHp ?? 0,
    maxShieldHp: data.shieldHp ?? 0,
    arrowBoardHp: data.arrowBoardHp ?? 0,
    maxArrowBoardHp: data.arrowBoardHp ?? 0,
    cooldown: 0,
    mineTimer: 0,
    mineSlotId: null,
    mineWorkSlot: null,
    carry: 0,
    carryResource: "gold",
    lastDamageSide: null,
    lastDamageUnitId: null,
    poisonTimer: 0,
    poisonDps: 0,
    poisonTick: 0,
    poisonSlow: 1,
    poisonRaisesUndead: false,
    poisonSourceSide: null,
    poisonSourceUnitId: null,
    corrosionTimer: 0,
    corrosionDps: 0,
    corrosionDpsGrowth: 0,
    corrosionTick: 0,
    corrosionSlow: 1,
    vulnerabilityTimer: 0,
    vulnerabilityBonus: 0,
    necroPlague: null,
    stormSlowTimer: 0,
    stormSlowFactor: 1,
    burnTimer: 0,
    burnDps: 0,
    burnTick: 0,
    stackedBurns: [],
    healTimer: data.healEvery ?? 0,
    stunTimer: 0,
    frozenBy: null,
    frozenTimer: 0,
    frozenTick: 0,
    freezeDps: 0,
    boundTargetId: null,
    summonTimer: unitType === "summoner" ? data.firstSummonDelay : (data.summonEvery ?? 0),
    magmaTimer: data.magmaEvery ?? 0,
    summonCooldown: data.summonEvery ?? 0,
    controlTimer: data.controlEvery ?? 0,
    controlLockTimer: 0,
    blinkTimer: 0,
    blinkUsed: false,
    cloneSpawnTimer: unitType === "vUnit" ? UNIT.vUnit.cloneReleaseDelay : 0,
    prometheusSpellTimer: data.spellEvery ?? 0,
    prometheusSpellIndex: 0,
    electricGateTimer: data.duration ?? 0,
    electricGateTick: 1,
    spearThrown: false,
    goldenSpearThrown: false,
    spearRecoverTimer: 0,
    ironCavalryBombedTargetId: null,
    ironCavalryChargeTimer: 0,
    ironCavalryChargeCooldown: 0,
    ironCavalryBombCooldown: 0,
    initialClonesReleased: false,
    controlledTargetId: null,
    controlledBy: null,
    originalSide: null,
    nextSpell: "blast",
    nextDreadfireSpell: "dragon",
    nextRedflameSpell: "fireball",
    medusaPoisonTimer: data.poisonEvery ?? 0,
    medusaSlayTimer: 0,
    suikaiCorpseTimer: data.corpseEvery ?? 0,
    suikaiHookTimer: data.hookEvery ?? 0,
    archmageFireballTimer: data.fireballEvery ?? 0,
    archmageAttackCount: 0,
    zeusOverheadTimer: data.overheadEvery ?? 0,
    zeusCloudTimer: data.cloudEvery ?? 0,
    zeusColumnTimer: data.columnEvery ?? 0,
    zeusGateTimer: data.gateEvery ?? 0,
    berserkerRageTimer: data.rageEvery ?? 0,
    swordsmanSelfRageTimer: 0,
    spartanShieldTimer: 0,
    spartanShieldCooldown: 0,
    orderMarkTimer: 0,
    orderMarkSide: null,
    barricadeBuildTimer: 0,
    barricadeBuildPending: null,
    barricadeBuildCooldown: 0,
    covenantSaveTimer: 0,
    covenantDamageReductionTimer: 0,
    covenantDamageReduction: 0,
    undeadBoneTimer: data.boneSpikeEvery ?? 0,
    hillJumpTimer: data.jumpEvery ?? 0,
    linghanFreezeTimer: 0,
    rageTimer: 0,
    rocketAmmo: data.ammoPerReload ?? 0,
    boneAmmo: data.boneAmmo ?? 0,
    rocketReloadTimer: 0,
    rocketFireTimer: 0,
    griffinAmmo: data.ammo ?? 0,
    scimitarRoarTimer: data.roarCooldown ?? 0,
    goblinMineTimer: data.mineEvery ?? 0,
    goblinPlantTimer: 0,
    goblinMineAmmo: data.mineAmmo ?? 0,
    goblinBurrowed: false,
    boneStingerBurrowTimer: 0,
    boneStingerBurrowCooldown: 0,
    heavyAntDodge: false,
    heavyAntDodgeTimer: 0,
    swarmEvolutionTimer: 0,
    swarmEvolutionTarget: null,
    swarmEvolutionOriginalMaxHp: 0,
    swarmEvolutionForceCharge: false,
    spiderWebCooldown: 0,
    ironAntShieldCharges: data.lowDamageShieldCharges ?? 0,
    heavyAntRangedShieldCharges: data.rangedShieldCharges ?? 0,
    goblinExpertArmorTimer: data.armorEvery ?? 0,
    shamanThornTimer: data.thornEvery ?? 0,
    shamanRegenTimer: data.healEvery ?? 0,
    monkFieldTimer: data.fieldCooldown ?? 0,
    regenLife: 0,
    regenHps: 0,
    regenTick: 0,
    priestSiphonTimer: data.siphonCooldown ?? 0,
    priestBloodTimer: data.bloodSacrificeCooldown ?? 0,
    priestSacrificeCount: 0,
    undeadLureTimer: data.lureCooldown ?? 0,
    necromancerConvertTimer: data.convertEvery ?? 0,
    luredTimer: 0,
    luredBySide: null,
    armorReduction: 0,
    heavyArmorTimer: 0,
    heavyArmorReduction: 0,
    minotaurRage: false,
    minotaurLeapTimer: data.chargeCooldown ?? data.leapCooldown ?? 0,
    darkKnightChargeTimer: 0,
    hornBeastAttackTimer: 0,
    hornRiderAttackTimer: 0,
    rhinoRage: false,
    shieldCastTimer: data.shieldEvery ?? 0,
    shieldTimer: 0,
    shieldReduction: 0,
    inspireTimer: data.inspireEvery ?? 0,
    inspiringTimer: 0,
    inspiredReviveTimer: 0,
    inspiredReviveReady: false,
    inspiredZombieTimer: 0,
    inspiredZombieHits: 0,
    inspiredLifestealTimer: 0,
    graveReviveTimer: data.reviveEvery ?? 0,
    graveGhostTimer: data.ghostEvery ?? 0,
    candleForm: data.defaultForm ?? "ice",
    reaperTargetId: null,
    reaperStackBonus: 0,
    reaperStealthTimer: 0,
    devourTargetCorpseId: null,
    devourTimer: 0,
    siegeBlindTargetId: null,
    fearTimer: 0,
    fearDamageMultiplier: 1,
    neuralRetreatTimer: 0,
    neuralRetreatFromSide: null,
    stoneGolemTimer: 0,
    stoneGolemOriginal: null,
    hero: Boolean(data.hero),
    spawnedClones: false,
    summonerId: null,
    forceCharge: false,
    merging: false,
    mergeId: null,
    earthMiner: false,
    rooted: unitType === "treeEnt" ? false : null,
    inCastle: false,
    spawnExitTimer: 0,
    spawnExitTargetX: null,
    spawnExitTargetY: null,
    combatTimer: 0,
    chaosRegenTick: 0,
    chaosCleanseTimer: 10,
    chaosSurvivalTimer: 0,
    chaosSurvivalStacks: 0,
    exploded: false,
    anim: Math.random() * 10,
  });

  const unit = state.units[state.units.length - 1];
  applyCampaignUnitModifiers(unit, { forceGodV });
  return unit;
}

function getBaseSpawnPoint(side, index = 0) {
  if (state?.fourWay && FOUR_WAY_BASES[side]) {
    const base = FOUR_WAY_BASES[side];
    const center = { x: FIELD.width / 2, y: FIELD.height / 2 };
    const dx = center.x - base.x;
    const dy = center.y - base.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = dx / len;
    const ny = dy / len;
    const px = -ny;
    const py = nx;
    const offset = (index % 7 - 3) * 13;
    return {
      x: base.x - nx * 48 + px * offset,
      y: base.y - ny * 48 + py * offset,
      targetX: base.x + nx * (92 + Math.floor(index / 7) * 18) + px * offset,
      targetY: base.y + ny * (92 + Math.floor(index / 7) * 18) + py * offset,
    };
  }
  const isPlayerSide = side === "player";
  const baseX = isPlayerSide ? FIELD.playerBase : FIELD.enemyBase;
  const gateX = isPlayerSide ? FIELD.playerGate : FIELD.enemyGate;
  const dir = isPlayerSide ? 1 : -1;
  const lane = ((index % 5) - 2) * 12;
  const exitStagger = (index % 5) * 42 + Math.floor(index / 5) * 18;
  return {
    x: baseX + dir * (28 + (index % 3) * 10),
    y: FIELD.ground + lane,
    targetX: gateX + dir * (18 + exitStagger),
    targetY: FIELD.ground + lane,
  };
}

function spawnTrainedUnit(type, side, index = 0) {
  const point = getBaseSpawnPoint(side, index);
  const unit = spawnUnit(type, side, point.x);
  unit.y = point.y;
  unit.spawnExitTimer = 1.4;
  unit.spawnExitTargetX = point.targetX;
  unit.spawnExitTargetY = point.targetY;
  return unit;
}

function applyCampaignUnitModifiers(unit, { forceGodV = false } = {}) {
  const isForcedGodV = forceGodV && unit.type === "vUnit";
  const isPlayerGodV = (isForcedGodV && unit.side === "player") || (activeCampaign?.godV && unit.side === "player" && unit.type === "vUnit");
  const isEnemyGodV = (isForcedGodV && unit.side === "enemy") || (activeCampaign?.enemyGodV && unit.side === "enemy" && unit.type === "vUnit");
  if (!isPlayerGodV && !isEnemyGodV) return;
  if (isPlayerGodV) state.playerGodVAssigned = true;
  if (isEnemyGodV) state.enemyGodVAssigned = true;
  unit.nameOverride = "神明V";
  unit.godV = true;
  unit.hero = true;
  unit.maxHp = 1275;
  unit.hp = 1275;
  unit.cloneSpawnTimer = 5;
  unit.cloneLimit = 3;
  unit.blinkHpThreshold = 350;
  unit.blinkThreatHp = 1000;
  unit.blinkDistance = 600;
  unit.controlRange = GOD_V_CONTROL_RANGE;
  unit.canControlAll = true;
}

function convertEarthToMiner(side) {
  const unit = findConvertibleEarthElement(side);
  if (!unit) {
    const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;
    popText(x, FIELD.ground - 100, "没有可转化的土元素", "#e8c66a");
    return false;
  }

  const hpRatio = Math.max(0.35, unit.hp / unit.maxHp);
  unit.type = "miner";
  unit.maxHp = UNIT.miner.hp;
  unit.hp = Math.round(UNIT.miner.hp * hpRatio);
  unit.cooldown = 0;
  unit.mineTimer = 0;
  unit.carry = 0;
  unit.stunTimer = 0;
  unit.boundTargetId = null;
  unit.earthMiner = true;
  popText(unit.x, unit.y - 78, "转化矿工", "#8ee0cf");
  return true;
}

function findConvertibleEarthElement(side) {
  return state.units.find((candidate) => (
    candidate.side === side
    && candidate.type === "earthElement"
    && candidate.hp > 0
    && !candidate.spawnExitTimer
    && !candidate.merging
    && !isUnitHidden(candidate)
  ));
}

function mergeTreeEnt(side) {
  return beginDirectElementMerge(side, "treeEnt", "合成树精", "#8ee0cf");
}

function mergeRog(side) {
  return beginDirectElementMerge(side, "rog", "合成罗格", "#ff9b45");
}

function mergeDreadfire(side) {
  return beginDirectElementMerge(side, "dreadfire", "合成厄火", "#ff7a3d");
}

function mergeRedflame(side) {
  return beginDirectElementMerge(side, "redflame", "合成赤炎", "#ff6a3d");
}

function mergeStormLich(side) {
  return beginDirectElementMerge(side, "stormLich", "合成风暴巫妖", "#9ee8ff");
}

function mergeHurricane(side) {
  return beginDirectElementMerge(side, "hurricane", "合成飓风", "#9ee8ff");
}

function mergeHill(side) {
  return beginDirectElementMerge(side, "hill", "合成山丘", "#c0a36d");
}

function mergeLinghan(side) {
  return beginDirectElementMerge(side, "linghan", "合成凌寒", "#9ee8ff");
}

function mergeScaldStrike(side) {
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;
  if (!payMergeCost(side, x, "#ffb36e", "scaldStrike")) return false;
  const target = findFrontEnemyForGoldenSpear(side);
  const front = getFrontX(side);
  const dir = side === "player" ? 1 : -1;
  const blastX = target?.x ?? front ?? x + dir * 220;
  const mergeX = Math.max(FIELD.playerGate + 38, Math.min(FIELD.enemyGate - 38, blastX));
  detonateScaldStrike(side, mergeX, FIELD.ground);
  return true;
}

function mergeElectricGate(side) {
  return beginDirectElementMerge(side, "electricGate", "合成电门", "#9ee8ff");
}

function mergeV(side) {
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;
  const materials = getVMaterials(side);
  if (!materials) {
    popText(x, FIELD.ground - 100, "需要土水火风各 1 个", "#d7ceff");
    return false;
  }
  if (!payMergeCost(side, x, "#d7ceff", "vUnit")) return false;
  return beginElementMerge(side, materials, "vUnit", "合成 V", "#d7ceff");
}

function payMergeCost(side, x, color, mergeType = null) {
  const magicCost = mergeType ? getElementMergeMagicCost(mergeType, side) : 0;
  if (magicCost <= 0) return true;
  if (getSideMagic(side) < magicCost) {
    popText(x, FIELD.ground - 100, `融合需要 ${magicCost} 魔力`, color);
    return false;
  }
  addSideMagic(side, -magicCost);
  return true;
}

function refundMergeCost(side, mergeType) {
  const magicCost = mergeType ? getElementMergeMagicCost(mergeType, side) : 0;
  if (magicCost <= 0) return;
  addSideMagic(side, magicCost);
}

function beginDirectElementMerge(side, resultType, text, color) {
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;
  if (!payMergeCost(side, x, color, resultType)) return false;
  const dir = side === "player" ? 1 : -1;
  const spawnX = x + dir * 60;
  const result = spawnUnit(resultType, side, spawnX);
  popText(result.x, result.y - 95, text, color);
  triggerElementMergeBlastTrait(side, resultType, result.x, result.y, color);
  return true;
}

function beginElementMerge(side, materials, resultType, text, color, options = {}) {
  const liveMaterials = materials.filter((unit) => unit?.hp > 0 && !isUnitHidden(unit));
  if (liveMaterials.length !== materials.length) {
    refundMergeCost(side, resultType);
    return false;
  }

  const id = state.nextId++;
  const targetX = liveMaterials.reduce((sum, unit) => sum + unit.x, 0) / liveMaterials.length;
  const targetY = liveMaterials.reduce((sum, unit) => sum + unit.y, 0) / liveMaterials.length;
  liveMaterials.forEach((unit) => {
    unit.merging = true;
    unit.mergeId = id;
    unit.cooldown = 0;
    unit.stunTimer = 0;
    unit.combatTimer = 0;
    unit.targetX = targetX;
    unit.targetY = targetY;
  });
  state.pendingMerges.push({
    id,
    side,
    materialIds: liveMaterials.map((unit) => unit.id),
    resultType,
    text,
    color,
    targetX,
    targetY,
    elapsed: 0,
    onComplete: options.onComplete ?? null,
  });
  popText(targetX, targetY - 95, "元素靠拢", color);
  return true;
}

function updatePendingMerges(dt) {
  if (!state.pendingMerges.length) return;
  const remaining = [];
  for (const merge of state.pendingMerges) {
    merge.elapsed = (merge.elapsed ?? 0) + dt;
    const materials = merge.materialIds
      .map((id) => state.units.find((unit) => unit.id === id && unit.hp > 0))
      .filter(Boolean);
    if (materials.length !== merge.materialIds.length || merge.elapsed > 8) {
      materials.forEach((unit) => {
        unit.merging = false;
        unit.mergeId = null;
        unit.targetX = null;
        unit.targetY = null;
      });
      if (merge.elapsed > 8) {
        refundMergeCost(merge.side, merge.resultType);
        popText(merge.targetX, merge.targetY - 95, "融合中断", merge.color);
      }
      continue;
    }

    const targetX = materials.reduce((sum, unit) => sum + unit.x, 0) / materials.length;
    const targetY = materials.reduce((sum, unit) => sum + unit.y, 0) / materials.length;
    merge.targetX = targetX;
    merge.targetY = targetY;
    materials.forEach((unit) => {
      moveUnitTowardPoint(unit, targetX, targetY, Math.max(72, (UNIT[unit.type]?.speed ?? 36) * 1.8), dt, 2);
      clampUnitPosition(unit);
      unit.targetX = targetX;
      unit.targetY = targetY;
    });

    const aligned = materials.every((unit) => distanceTo(unit.x, unit.y, targetX, targetY) <= 6);
    if (aligned) {
      completeElementMerge(merge, materials, targetX, targetY);
    } else {
      remaining.push(merge);
    }
  }
  state.pendingMerges = remaining;
}

function completeElementMerge(merge, materials, x, y) {
  const hpRatio = Math.max(0.05, materials.reduce((sum, unit) => sum + unit.hp / unit.maxHp, 0) / materials.length);
  materials.forEach(releaseFrozenTarget);
  materials.forEach((unit) => {
    unit.merging = false;
    unit.mergeId = null;
    unit.targetX = null;
    unit.targetY = null;
  });
  state.units = state.units.filter((unit) => !materials.includes(unit));

  if (merge.onComplete) {
    merge.onComplete(merge, x, y, hpRatio);
    popText(x, y - 95, merge.text, merge.color);
    triggerElementMergeBlastTrait(merge.side, merge.resultType, x, y, merge.color);
    return;
  }

  const result = spawnUnit(merge.resultType, merge.side, x);
  result.y = y;
  result.hp = Math.max(1, Math.round(result.maxHp * hpRatio));
  popText(x, y - 95, `${merge.text} ${Math.round(hpRatio * 100)}%`, merge.color);
  triggerElementMergeBlastTrait(merge.side, merge.resultType, x, y, merge.color);
}

function triggerElementMergeBlastTrait(side, resultType, x, y, color = "#d7ceff") {
  if (factionForSide(side) !== "element") return false;
  if (ELEMENT_MERGE_BLAST_EXCLUDED_UNITS.has(resultType)) return false;
  if (Math.random() >= ELEMENT_MERGE_BLAST_CHANCE) return false;
  const targets = getUnitsInRadius(x, ELEMENT_MERGE_BLAST_RADIUS, side, Number.POSITIVE_INFINITY, null, y);
  targets.forEach((enemy) => {
    applyUnitDamage(enemy, ELEMENT_MERGE_BLAST_DAMAGE, {
      label: "融合",
      color,
      yOffset: -82,
      sourceSide: side,
    });
  });
  state.blasts.push({ x, y: y - 30, radius: ELEMENT_MERGE_BLAST_RADIUS, life: 0.36, duration: 0.36, color });
  popText(x, y - 118, "融合冲击", color);
  return true;
}

function spawnVClones(v) {
  const dir = v.side === "player" ? -1 : 1;
  for (let i = 0; i < 3; i += 1) {
    spawnVClone(v, dir * (34 + i * 24));
  }
  popText(v.x, v.y - 120, "分身降临", "#d7ceff");
}

function spawnVClone(v, offset) {
  const clone = spawnUnit("vClone", v.side, v.x + offset);
  clone.summonerId = v.id;
  if (v.godV) {
    clone.godVClone = true;
    clone.maxHp = 300;
    clone.hp = 300;
    clone.damage = 20;
  }
  return clone;
}

function isMergeMaterial(unit, side, type) {
  return unit.side === side && unit.type === type && unit.hp > 0 && !unit.merging && !unit.spawnExitTimer && !isUnitHidden(unit);
}

function getVMaterials(side) {
  const required = ["earthElement", "waterElement", "fireElement", "windElement"];
  const picked = [];

  for (const type of required) {
    const unit = state.units.find((candidate) => {
      if (candidate.side !== side || candidate.type !== type || candidate.hp <= 0 || candidate.merging || isUnitHidden(candidate) || picked.includes(candidate)) return false;
      if (candidate.type === "waterElement" && candidate.boundTargetId) return false;
      return true;
    });
    if (!unit) return null;
    picked.push(unit);
  }

  return picked;
}

function canMergeTreeEnt(side) {
  return true;
}

function canMergeRog(side) {
  return true;
}

function canMergeDreadfire(side) {
  return true;
}

function canMergeRedflame(side) {
  return true;
}

function canMergeStormLich(side) {
  return true;
}

function canMergeHurricane(side) {
  return true;
}

function canMergeScaldStrike(side) {
  return true;
}

function canMergeElectricGate(side) {
  return true;
}

function canMergeHill(side) {
  return true;
}

function canMergeLinghan(side) {
  return true;
}

function canMergeV(side) {
  return Boolean(getVMaterials(side));
}

function queueUnit(type) {
  if (state.over) return;
  if (state.fourWay) {
    queueFourWayPlayerUnit(type);
    return;
  }
  if (MERGE_UNITS.has(type)) {
    popText(FIELD.playerGate, FIELD.ground - 95, "进阶单位需要融合", "#f3c963");
    return;
  }
  if (!currentPlayerRoster().includes(type)) return;
  if (!canQueueCampaignUnit(type)) {
    popText(FIELD.playerGate, FIELD.ground - 95, "本关数量已满", "#f3c963");
    return;
  }
  const data = UNIT[type];
  const cost = getUnitCost(type, selectedFaction, "player");
  const magicCost = getUnitMagicCost(type, selectedFaction, "player");
  if (state.gold < cost || (state.magic ?? 0) < magicCost) {
    popText(FIELD.playerGate, FIELD.ground - 95, state.gold < cost ? "金币不足" : "魔力不足", "#f3c963");
    return;
  }

  spendUnitCost(type, selectedFaction, "player", state.gold);
  state.campaignTrainCounts[type] = getCampaignQueuedCount(type) + 1;
  state.spawnQueue.push({ type, side: "player", timer: data.train, duration: data.train });
  popText(FIELD.playerGate, FIELD.ground - 118, `训练 ${data.name}`, "#d9e8ff");
  updateHud();
}

function queueFourWayPlayerUnit(type) {
  const side = state.fourWayPlayerSide;
  if (!side) return;
  if (!getFourWayFactionRoster(factionForSide(side)).includes(type)) return;
  if (MERGE_UNITS.has(type)) {
    popText(FOUR_WAY_BASES[side].x, FOUR_WAY_BASES[side].y - 95, "进阶单位需要融合", "#f3c963");
    return;
  }
  const faction = factionForSide(side);
  const gold = getSideGoldAmount(side);
  if (!canAffordUnit(type, faction, side, gold)) {
    const cost = getUnitCost(type, faction, side);
    const magicCost = getUnitMagicCost(type, faction, side);
    popText(FOUR_WAY_BASES[side].x, FOUR_WAY_BASES[side].y - 95, gold < cost ? "金币不足" : `魔力不足 ${magicCost}`, "#f3c963");
    return;
  }
  spendUnitCost(type, faction, side, gold);
  const data = UNIT[type];
  state.spawnQueue.push({ type, side, timer: data.train, duration: data.train });
  popText(FOUR_WAY_BASES[side].x, FOUR_WAY_BASES[side].y - 118, `训练 ${data.name}`, "#d9e8ff");
  updateHud();
}

function update(dt) {
  if (!state) return;
  if (state.paused) return;

  if (state.over) {
    updateParticles(dt);
    return;
  }

  if (state.fourWay) {
    updateFourWayBattle(dt);
    return;
  }

  updateManualControlState();
  updateGroupSelectionState();

  updateQueue(dt);
  updatePassiveGold(dt);
  updateFactionTraits(dt);
  updateTeamAi(dt);
  updateCenterTower(dt);
  updateCampaignRules(dt);
  updateEnemyAi(dt);
  updatePendingMerges(dt);
  updateUnits(dt);
  updateBaseAttacks(dt);
  updateChaosRecovery(dt);
  updateArrows(dt);
  updateStickyBombs(dt);
  updateFrozenDamage(dt);
  updatePoison(dt);
  updateCorrosion(dt);
  updateBurn(dt);
  updateCorpses(dt);
  updateLandMines(dt);
  updateBarricades(dt);
  updateSlimeFields(dt);
  updateWebFields(dt);
  updateGhosts(dt);
  updateDelayedSpells(dt);
  updateMeteors(dt);
  updateStormClouds(dt);
  updateTornadoes(dt);
  updateElectricWalls(dt);
  updateGroundFires(dt);
  updateThornFields(dt);
  updateHealingFields(dt);
  updateIceFieldEffects(dt);
  updateParticles(dt);
  removeDead();
  checkWin();
  updateHud();
}

function updateFourWayBattle(dt) {
  state.fourWayElapsed += dt;
  updateManualControlState();
  updateGroupSelectionState();
  updateQueue(dt);
  updateFactionTraits(dt);
  updateFourWayFactionSkills(dt);
  updateFourWayAi(dt);
  decayFourWayPressure(dt);
  updateUnits(dt);
  updateChaosRecovery(dt);
  updateArrows(dt);
  updateStickyBombs(dt);
  updateFrozenDamage(dt);
  updatePoison(dt);
  updateCorrosion(dt);
  updateBurn(dt);
  updateCorpses(dt);
  updateLandMines(dt);
  updateBarricades(dt);
  updateSlimeFields(dt);
  updateWebFields(dt);
  updateGhosts(dt);
  updateDelayedSpells(dt);
  updateMeteors(dt);
  updateStormClouds(dt);
  updateTornadoes(dt);
  updateElectricWalls(dt);
  updateGroundFires(dt);
  updateThornFields(dt);
  updateHealingFields(dt);
  updateIceFieldEffects(dt);
  updateParticles(dt);
  removeDead();
  checkFourWayWin();
  updateHud();
}

function updateFourWayFactionSkills(dt) {
  if (!state.fourWaySkillCooldowns || !state.fourWaySkillEffects) return;
  Object.keys(state.fourWaySkillCooldowns).forEach((side) => {
    state.fourWaySkillCooldowns[side] = Math.max(0, state.fourWaySkillCooldowns[side] - dt);
  });
  Object.keys(state.fourWaySkillEffects).forEach((side) => {
    state.fourWaySkillEffects[side] = Math.max(0, state.fourWaySkillEffects[side] - dt);
  });
}

function decayFourWayPressure(dt) {
  if (!state.fourWayPressure) return;
  Object.keys(state.fourWayPressure).forEach((side) => {
    state.fourWayPressure[side] = Math.max(0, state.fourWayPressure[side] - dt * 0.18);
  });
}

function updateFourWayAi(dt) {
  state.fourWaySides.forEach((ai) => {
    if (!ai.alive) return;
    ai.incomeTimer -= dt;
    while (ai.incomeTimer <= 0) {
      ai.incomeTimer += 2;
      ai.gold += 10;
      ai.magic = (ai.magic ?? 0) + 5;
    }
    if (isFourWayPlayerSide(ai.side)) return;
    tryCastFourWayFactionSkill(ai);
    ai.spawnTimer -= dt;
    if (ai.spawnTimer > 0) return;
    const roster = getFourWayFactionRoster(ai.faction).filter((type) => {
      if (UNIT[type]?.hero || UNIT[type]?.statueOnly || UNIT[type]?.summonOnly) return false;
      return ai.gold >= getFourWayUnitCost(type, ai.faction, ai.side) && (ai.magic ?? 0) >= getUnitMagicCost(type, ai.faction, ai.side);
    });
    const livingCount = state.units.filter((unit) => unit.side === ai.side && unit.hp > 0 && !isUnitHidden(unit)).length;
    const type = chooseFourWayAiUnit(ai, roster, livingCount);
    if (!type) {
      ai.spawnTimer = 0.85;
      return;
    }
    const cost = getFourWayUnitCost(type, ai.faction, ai.side);
    ai.gold -= cost;
    ai.magic = (ai.magic ?? 0) - getUnitMagicCost(type, ai.faction, ai.side);
    const isHighTier = getFourWayUnitValue(type, ai.faction, ai.side) >= FOUR_WAY_HIGH_TIER_COST;
    ai.spawnTimer = isHighTier ? 2.15 + Math.random() * 1.25 : 1.05 + Math.random() * 1.1;
    spawnFourWayUnit(type, ai.side, Math.floor(Math.random() * 12));
  });
}

function tryCastFourWayFactionSkill(ai) {
  const side = ai.side;
  if (!FOUR_WAY_FACTION_SKILL[side]) return false;
  if ((state.fourWaySkillCooldowns?.[side] ?? 0) > 0) return false;
  if (side === "order") return castFourWayOrderSkill(side);
  if (side === "chaos") return castFourWayChaosSkill(side);
  if (side === "undeadEmpire") return castFourWayUndeadSkill(side);
  if (side === "element") return castFourWayElementSkill(side);
  if (side === "swarm") return castFourWaySwarmSkill(side);
  return false;
}

function castFourWayOrderSkill(side) {
  const config = FOUR_WAY_FACTION_SKILL.order;
  const base = FOUR_WAY_BASES[side];
  const spartan = spawnFourWayUnit("goldenSpartan", side, 14);
  const archer = spawnFourWayUnit("goldenArcher", side, 15);
  const archers = [archer];
  [spartan, ...archers].forEach((unit) => {
    unit.timedLife = config.duration;
    unit.noCorpse = true;
    unit.forceCharge = true;
  });
  spartan.spartanShieldCooldownDuration = 20;
  state.fourWaySkillCooldowns[side] = config.cooldown;
  state.fourWaySkillEffects[side] = config.duration;
  state.blasts.push({ x: base.x, y: base.y, radius: 92, life: 0.45, duration: 0.45, color: "#ffe08a" });
  popText(base.x, base.y - 128, "秩序援军", "#ffe08a");
  return true;
}

function castFourWayChaosSkill(side) {
  const config = FOUR_WAY_FACTION_SKILL.chaos;
  const type = config.summons[Math.floor(Math.random() * config.summons.length)];
  const summons = summonFourWaySkillUnits(side, [type], config.duration, 18);
  state.fourWaySkillCooldowns[side] = config.cooldown;
  state.fourWaySkillEffects[side] = 0;
  const base = FOUR_WAY_BASES[side];
  state.blasts.push({ x: base.x, y: base.y, radius: 104, life: 0.45, duration: 0.45, color: "#ff6a3d" });
  popText(base.x, base.y - 128, `${UNIT[type].name}降临 x${summons.length}`, "#ff8a3d");
  return true;
}

function castFourWayUndeadSkill(side) {
  const config = FOUR_WAY_FACTION_SKILL.undeadEmpire;
  const summons = summonFourWaySkillUnits(side, config.summons, config.duration, 20);
  state.fourWaySkillCooldowns[side] = config.cooldown;
  state.fourWaySkillEffects[side] = 0;
  const base = FOUR_WAY_BASES[side];
  state.blasts.push({ x: base.x, y: base.y, radius: 96, life: 0.45, duration: 0.45, color: "#b8b0e8" });
  popText(base.x, base.y - 128, `亡灵增援 x${summons.length}`, "#d8c8ff");
  return true;
}

function castFourWayElementSkill(side) {
  const config = FOUR_WAY_FACTION_SKILL.element;
  const summons = summonFourWaySkillUnits(side, config.summons, config.duration, 18);
  state.fourWaySkillCooldowns[side] = config.cooldown;
  state.fourWaySkillEffects[side] = config.duration;
  const base = FOUR_WAY_BASES[side];
  state.blasts.push({ x: base.x, y: base.y, radius: 110, life: 0.45, duration: 0.45, color: "#9ee8ff" });
  popText(base.x, base.y - 128, `元素降临 x${summons.length}`, "#bff7ff");
  return true;
}

function castFourWaySwarmSkill(side) {
  const config = FOUR_WAY_FACTION_SKILL.swarm;
  const summons = summonFactionSkillUnits(side, config.summons, config.duration, 22);
  state.fourWaySkillCooldowns[side] = config.cooldown;
  state.fourWaySkillEffects[side] = 0;
  const point = getSideTraitTextPoint(side);
  state.blasts.push({ x: point.x, y: point.y + 78, radius: 96, life: 0.45, duration: 0.45, color: "#d7f59b" });
  popText(point.x, point.y, `虫群增援 x${summons.length}`, "#d7f59b");
  return true;
}

function summonFourWaySkillUnits(side, types, duration, startIndex = 0) {
  return types.map((type, offset) => {
    const unit = spawnFourWayUnit(type, side, startIndex + offset);
    unit.timedLife = duration;
    unit.noCorpse = true;
    unit.forceCharge = true;
    return unit;
  });
}

function summonFactionSkillUnits(side, types, duration, startIndex = 0) {
  return types.map((type, offset) => {
    const unit = state.fourWay && FOUR_WAY_BASES[side]
      ? spawnFourWayUnit(type, side, startIndex + offset)
      : spawnTraitUnit(type, side, startIndex + offset);
    unit.timedLife = duration;
    unit.noCorpse = true;
    unit.forceCharge = true;
    return unit;
  });
}

function countNearbyAllies(unit, radius) {
  return state.units.filter((ally) => (
    ally.side === unit.side
    && ally.hp > 0
    && !isUnitHidden(ally)
    && !UNIT[ally.type]?.untargetable
    && distanceTo(unit.x, unit.y, ally.x, ally.y) <= radius
  )).length;
}

function chooseFourWayAiUnit(ai, affordableRoster, livingCount) {
  const fullRoster = getFourWayFactionRoster(ai.faction).filter((type) => {
    if (UNIT[type]?.hero || UNIT[type]?.statueOnly || UNIT[type]?.summonOnly) return false;
    return Boolean(UNIT[type]);
  });
  const strategic = chooseStrategicAiUnit({
    side: ai.side,
    faction: ai.faction,
    affordableRoster,
    fullRoster,
    livingCount,
    gold: ai.gold,
    magic: ai.magic ?? 0,
    elapsed: state.fourWayElapsed,
    fourWay: true,
  });
  if (strategic !== undefined) return strategic;
  const highTargets = fullRoster
    .filter((type) => getFourWayUnitValue(type, ai.faction, ai.side) >= FOUR_WAY_HIGH_TIER_COST)
    .sort((a, b) => getFourWayUnitValue(b, ai.faction, ai.side) - getFourWayUnitValue(a, ai.faction, ai.side));
  const cheapestHigh = highTargets[highTargets.length - 1];
  const shouldTech = state.fourWayElapsed >= FOUR_WAY_TECH_UNLOCK && livingCount >= 5 && cheapestHigh;
  if (shouldTech && (ai.gold < getFourWayUnitCost(cheapestHigh, ai.faction, ai.side) || (ai.magic ?? 0) < getUnitMagicCost(cheapestHigh, ai.faction, ai.side))) return null;
  if (!affordableRoster.length) return null;

  const affordable = affordableRoster
    .slice()
    .sort((a, b) => getFourWayUnitValue(b, ai.faction, ai.side) - getFourWayUnitValue(a, ai.faction, ai.side));
  const highAffordable = affordable.filter((type) => getFourWayUnitValue(type, ai.faction, ai.side) >= FOUR_WAY_HIGH_TIER_COST);
  const midAffordable = affordable.filter((type) => {
    const cost = getFourWayUnitValue(type, ai.faction, ai.side);
    return cost >= 110 && cost < FOUR_WAY_HIGH_TIER_COST;
  });
  const cheapAffordable = affordable.filter((type) => getFourWayUnitValue(type, ai.faction, ai.side) < 110);

  if (state.fourWayElapsed >= FOUR_WAY_TECH_UNLOCK && highAffordable.length && Math.random() < 0.68) {
    return highAffordable[Math.floor(Math.random() * highAffordable.length)];
  }
  if (livingCount < 5 && cheapAffordable.length) {
    return cheapAffordable[Math.floor(Math.random() * cheapAffordable.length)];
  }
  const weighted = [
    ...highAffordable,
    ...highAffordable,
    ...midAffordable,
    ...midAffordable,
    ...cheapAffordable,
  ];
  return weighted[Math.floor(Math.random() * weighted.length)] ?? affordable[0];
}

function chooseStrategicAiUnit(context) {
  if (context.faction === "chaos") return chooseChaosStrategicUnit(context);
  const profile = AI_ROLE_PROFILES[context.faction];
  if (!profile || !context.affordableRoster.length) return undefined;
  const { side, affordableRoster, livingCount } = context;
  const frontlineAffordable = getPreferredAvailable(affordableRoster, profile.frontline ?? []);
  const rangedAffordable = getPreferredAvailable(affordableRoster, profile.ranged ?? []);
  const supportAffordable = getPreferredAvailable(affordableRoster, profile.support ?? []);
  const raiderAffordable = getPreferredAvailable(affordableRoster, profile.raider ?? []);
  const highAffordable = getPreferredAvailable(affordableRoster, profile.highPriority ?? []);
  const frontlineCount = countRoleUnits(side, profile.frontline);
  const rangedCount = countRoleUnits(side, profile.ranged);
  const supportCount = countRoleUnits(side, profile.support);
  const hasHighThreat = hasHostileHighValueThreat(side);

  if (context.faction === "element") {
    const missingBasic = ["earthElement", "waterElement", "fireElement", "windElement"].find((type) => countUnits(side, type) < 2 && affordableRoster.includes(type));
    if (missingBasic && (context.elapsed < FOUR_WAY_TECH_UNLOCK || Math.random() < 0.55)) return missingBasic;
  }

  if (livingCount <= 2 && frontlineAffordable.length) return pickWeightedChaosUnit(frontlineAffordable, getProfileWeights(context.faction, "frontline"));

  const desiredFrontline = Math.min(context.faction === "undeadEmpire" ? 7 : 5, Math.max(3, Math.ceil(livingCount * 0.38)));
  if (frontlineCount < desiredFrontline && frontlineAffordable.length) {
    return pickWeightedChaosUnit(frontlineAffordable, getProfileWeights(context.faction, "frontline"));
  }

  const desiredRanged = Math.min(4, Math.max(1, Math.floor(frontlineCount * 0.75)));
  if (rangedCount < desiredRanged && rangedAffordable.length && Math.random() < 0.78) {
    return pickWeightedChaosUnit(rangedAffordable, getProfileWeights(context.faction, "ranged"));
  }

  const desiredSupport = Math.min(context.faction === "undeadEmpire" ? 3 : 2, Math.floor(frontlineCount / 3));
  if (supportCount < desiredSupport && supportAffordable.length && Math.random() < 0.72) {
    return pickWeightedChaosUnit(supportAffordable, getProfileWeights(context.faction, "support"));
  }

  if (hasHighThreat && raiderAffordable.length && Math.random() < 0.62) {
    return pickWeightedChaosUnit(raiderAffordable, getProfileWeights(context.faction, "raider"));
  }

  if (shouldFactionAiSaveForTech(context)) return null;
  if (highAffordable.length && context.elapsed >= (context.fourWay ? FOUR_WAY_TECH_UNLOCK : 24) && Math.random() < 0.7) return highAffordable[0];

  const weighted = [
    ...frontlineAffordable,
    ...frontlineAffordable,
    ...rangedAffordable,
    ...rangedAffordable,
    ...supportAffordable,
    ...raiderAffordable,
    ...highAffordable,
  ];
  return weighted[Math.floor(Math.random() * weighted.length)] ?? affordableRoster[0];
}

function chooseChaosStrategicUnit({ side, faction, affordableRoster, fullRoster, livingCount, gold, magic, elapsed, fourWay }) {
  if (!affordableRoster.length) return null;
  const frontlineAffordable = getPreferredAvailable(affordableRoster, ["orc", "creeper", "berserkOrc", "apeMan", "minotaur", "rhinoMan", "arrowShieldCart"]);
  const supportAffordable = getPreferredAvailable(affordableRoster, ["goblinExpert", "shaman", "priest", "goblin"]);
  const raiderAffordable = getPreferredAvailable(affordableRoster, ["bomber", "javelinThrower", "goblinVulture", "griffinBomber", "minotaur", "rhinoMan"]);
  const highAffordable = getPreferredAvailable(affordableRoster, CHAOS_AI_HIGH_TIER_PRIORITY);
  const frontlineCount = countChaosRoleUnits(side, CHAOS_AI_FRONTLINE_UNITS);
  const supportCount = countChaosRoleUnits(side, CHAOS_AI_SUPPORT_UNITS);
  const raiderCount = countChaosRoleUnits(side, CHAOS_AI_RAIDER_UNITS);
  const hasHighThreat = hasHostileHighValueThreat(side);

  if (livingCount <= 2 && frontlineAffordable.length) {
    return pickWeightedChaosUnit(frontlineAffordable, { orc: 2.2, creeper: 1.8, berserkOrc: 1.2 });
  }

  const desiredFrontline = Math.min(5, Math.max(3, Math.ceil(livingCount * 0.42)));
  if (frontlineCount < desiredFrontline && frontlineAffordable.length) {
    return pickWeightedChaosUnit(frontlineAffordable, {
      orc: 2.1,
      creeper: 1.7,
      berserkOrc: 1.35,
      apeMan: 1.1,
      arrowShieldCart: 0.95,
      minotaur: 0.9,
      rhinoMan: 0.85,
    });
  }

  if (hasHighThreat && raiderAffordable.length && (raiderCount < 3 || Math.random() < 0.58)) {
    return pickWeightedChaosUnit(raiderAffordable, {
      bomber: 1.35,
      javelinThrower: 1.25,
      goblinVulture: 1.15,
      griffinBomber: 0.95,
      minotaur: 0.8,
      rhinoMan: 0.75,
    });
  }

  const desiredSupport = Math.min(2, Math.floor(frontlineCount / 3));
  if (supportCount < desiredSupport && supportAffordable.length && Math.random() < 0.72) {
    return pickWeightedChaosUnit(supportAffordable, {
      goblinExpert: 1.35,
      shaman: 1.2,
      priest: 1.1,
      goblin: 0.7,
    });
  }

  const shouldTech = elapsed >= (fourWay ? FOUR_WAY_TECH_UNLOCK : 24) && frontlineCount >= 3 && livingCount >= 5;
  if (shouldTech) {
    if (highAffordable.length && Math.random() < 0.76) return highAffordable[0];
    if (shouldFactionAiSaveForTech({ side, faction, fullRoster, livingCount, gold, magic, elapsed, fourWay })) return null;
  }

  const weighted = [
    ...frontlineAffordable,
    ...frontlineAffordable,
    ...raiderAffordable,
    ...supportAffordable,
    ...highAffordable,
  ];
  return weighted[Math.floor(Math.random() * weighted.length)] ?? affordableRoster[0];
}

function shouldFactionAiSaveForTech({ side, faction, fullRoster, livingCount, gold, magic, elapsed, fourWay }) {
  const profile = AI_ROLE_PROFILES[faction];
  if (!profile?.highPriority?.length) return false;
  if (elapsed < (fourWay ? FOUR_WAY_TECH_UNLOCK : 24)) return false;
  if (livingCount < 5 || countRoleUnits(side, profile.frontline) < 3) return false;
  const target = profile.highPriority
    .filter((type) => fullRoster.includes(type))
    .find((type) => !canFactionAiPayForType(type, faction, side, gold, magic, fourWay));
  if (!target) return false;
  const goldCost = fourWay ? getFourWayUnitCost(target, faction, side) : getUnitCost(target, faction, side);
  const magicCost = getUnitMagicCost(target, faction, side);
  const closeToGold = gold >= goldCost * (faction === "chaos" || faction === "order" ? 0.62 : 0.72);
  const closeToMagic = magicCost <= 0 || magic >= magicCost * 0.55 || getFactionMagicDemand(faction, side) > 0;
  return closeToGold && closeToMagic;
}

function canFactionAiPayForType(type, faction, side, gold, magic, fourWay) {
  const goldCost = fourWay ? getFourWayUnitCost(type, faction, side) : getUnitCost(type, faction, side);
  return gold >= goldCost && magic >= getUnitMagicCost(type, faction, side);
}

function getPreferredAvailable(available, preferred) {
  return preferred.filter((type) => available.includes(type));
}

function pickWeightedChaosUnit(types, weights = {}) {
  const total = types.reduce((sum, type) => sum + (weights[type] ?? 1), 0);
  let roll = Math.random() * total;
  for (const type of types) {
    roll -= weights[type] ?? 1;
    if (roll <= 0) return type;
  }
  return types[0] ?? null;
}

function getProfileWeights(faction, role) {
  const table = {
    order: {
      frontline: { swordsman: 1.45, spearman: 1.2, greatsword: 1.1, spartan: 1, ironCavalry: 0.9, archon: 0.75 },
      ranged: { archer: 1, crossbow: 1.05, musketeer: 0.95, shotgunner: 1.05, mage: 1.15 },
      support: { monk: 1.15, commander: 1.05, barricadeEngineer: 0.95 },
      raider: { ironCavalry: 1.35, shotgunner: 0.85, swordsman: 0.75, spearman: 0.7 },
    },
    undeadEmpire: {
      frontline: { machete: 1.2, undead: 1.45, ghoul: 1.05, darkKnight: 0.9, boneGiant: 0.75 },
      ranged: { boneThrower: 1.15, poisonZombie: 1.15, candlelight: 1, undeadVulture: 0.9 },
      support: { necromancer: 1.35, graveDigger: 1.15, undeadMage: 1.05, bannerBearer: 0.95 },
      raider: { reaper: 1.25, darkKnight: 1.1, undeadVulture: 0.95 },
    },
    element: {
      frontline: { earthElement: 1.35, waterElement: 1.1, hill: 1.05, treeEnt: 0.95, rog: 0.9, vUnit: 0.65 },
      ranged: { fireElement: 1.2, windElement: 1.1, linghan: 1.05, redflame: 0.95, stormLich: 0.95, hurricane: 0.9, dreadfire: 0.85 },
      support: { waterElement: 1.25, electricGate: 0.9 },
      raider: { windElement: 1.25, scaldStrike: 1.05, vUnit: 0.8 },
    },
    swarm: {
      frontline: { crawler: 1.4, ironAnt: 1.25, swarmWorm: 1.05, heavyAnt: 0.95, giantSpider: 0.85, broodMother: 0.75 },
      ranged: { corrosiveSpitter: 1.25, boneStinger: 1.15, caterpillar: 1.05, lurker: 0.95, hoodCaterpillar: 0.85 },
      support: { spider: 1.1, antQueen: 1, ashWorm: 0.9 },
      raider: { poisonBug: 1.25, blastBug: 1.05, locust: 0.8 },
    },
  };
  return table[faction]?.[role] ?? {};
}

function countRoleUnits(side, roleList = []) {
  const roleSet = new Set(roleList);
  if (!roleSet.size) return 0;
  return state.units.filter((unit) =>
    unit.side === side &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    roleSet.has(unit.type)
  ).length;
}

function countChaosRoleUnits(side, roleSet) {
  return state.units.filter((unit) =>
    unit.side === side &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    roleSet.has(unit.type)
  ).length;
}

function hasHostileHighValueThreat(side) {
  return state.units.some((unit) =>
    areHostileSides(side, unit.side) &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !ECONOMY_UNITS.has(unit.type) &&
    !UNIT[unit.type]?.untargetable &&
    getAiThreatValue(unit) >= 260
  );
}

function getAiThreatValue(unit) {
  const data = UNIT[unit.type] ?? {};
  const faction = factionForSide(unit.side);
  const cost = getUnitCost(unit.type, faction, unit.side) + getUnitMagicCost(unit.type, faction, unit.side) * 1.4;
  const damage = unit.damage ?? data.damage ?? 0;
  const rangeBonus = (data.range ?? 0) > 100 ? 55 : 0;
  const hp = unit.maxHp ?? data.hp ?? unit.hp ?? 0;
  return cost + hp * 0.28 + damage * 8 + rangeBonus;
}

function updatePassiveGold(dt) {
  state.passiveGoldTimer -= dt;
  if (state.passiveGoldTimer > 0) return;

  state.passiveGoldTimer += 2;
  state.gold += 10;
  state.enemyGold += 10;
}

function updateFactionTraits(dt) {
  const fourWaySides = state.fourWaySides?.map((ai) => ai.side) ?? [];
  const sides = state.fourWay ? [...new Set([...FOUR_WAY_SIDES, ...fourWaySides])] : ["player", "enemy"];
  sides.forEach((side) => {
    const faction = factionForSide(side);
    if (faction === "undeadEmpire") updateUndeadSkeletonTrait(side, dt);
    if (faction === "order") updateOrderArmorTrait(side, dt);
    if (faction === "swarm") updateSwarmEggTrait(side, dt);
  });
  updateSwarmEggs(dt);
}

function getFactionTraitTimer(side) {
  state.factionTraitTimers[side] = state.factionTraitTimers[side] ?? {
    undeadSkeletonTimer: UNDEAD_SKELETON_TRAIT.interval,
    undeadSkeletonElapsed: 0,
    orderLightArmorTimer: ORDER_ARMOR_TRAIT.light.interval,
    orderMediumArmorTimer: ORDER_ARMOR_TRAIT.medium.interval,
    swarmEggTimer: 20,
  };
  return state.factionTraitTimers[side];
}

function canSwarmUnitLayEgg(unit) {
  if (!unit || unit.hp <= 0 || factionForSide(unit.side) !== "swarm") return false;
  if (isUnitHidden(unit) || UNIT[unit.type]?.untargetable || UNIT[unit.type]?.statueOnly) return false;
  if (unit.timedLife !== undefined || unit.swarmEvolutionTimer > 0) return false;
  if (SWARM_EVOLUTION_SOURCE_BY_TYPE[unit.type]) return false;
  const data = UNIT[unit.type];
  return Boolean(data && !data.summonOnly && !data.hero);
}

function updateSwarmEggTrait(side, dt) {
  const timer = getFactionTraitTimer(side);
  timer.swarmEggTimer -= dt;
  if (timer.swarmEggTimer > 0) return;
  timer.swarmEggTimer += 20;
  const eggs = state.units.filter((unit) => unit.side === side && canSwarmUnitLayEgg(unit)).map((unit) => ({
    side,
    type: unit.type,
    x: unit.x,
    y: unit.y,
    life: 5,
    healthFactor: Math.max(
      SWARM_HATCH_MIN_HEALTH_FACTOR,
      (unit.swarmHatchHealthFactor ?? 1) * SWARM_HATCH_HEALTH_FACTOR,
    ),
  }));
  if (!eggs.length) return;
  state.swarmEggs.push(...eggs);
  const point = getSideTraitTextPoint(side);
  popText(point.x, point.y, `虫卵 x${eggs.length}`, "#d7f59b");
}

function updateSwarmEggs(dt) {
  if (!state.swarmEggs?.length) return;
  const remaining = [];
  state.swarmEggs.forEach((egg) => {
    egg.life -= dt;
    if (egg.life > 0) {
      remaining.push(egg);
      return;
    }
    const data = UNIT[egg.type];
    if (!data) return;
    const hatch = spawnUnit(egg.type, egg.side, egg.x);
    hatch.y = egg.y;
    const healthFactor = egg.healthFactor ?? SWARM_HATCH_HEALTH_FACTOR;
    hatch.maxHp = Math.max(1, Math.round((data.hp ?? hatch.maxHp) * healthFactor));
    hatch.hp = hatch.maxHp;
    if (Number.isFinite(data.damage)) hatch.damage = Math.max(1, Math.round(data.damage * SWARM_HATCH_DAMAGE_FACTOR * 10) / 10);
    hatch.forceCharge = true;
    hatch.swarmHatched = true;
    hatch.swarmHatchHealthFactor = healthFactor;
    state.blasts.push({ x: hatch.x, y: hatch.y - 32, radius: 38, life: 0.3, duration: 0.3, color: "#d7f59b" });
    popText(hatch.x, hatch.y - 86, "孵化", "#d7f59b");
  });
  state.swarmEggs = remaining;
}

function updateUndeadSkeletonTrait(side, dt) {
  const trait = state.fourWay ? FOUR_WAY_UNDEAD_SKELETON_TRAIT : UNDEAD_SKELETON_TRAIT;
  const timer = getFactionTraitTimer(side);
  timer.undeadSkeletonElapsed += dt;
  timer.undeadSkeletonTimer -= dt;
  if (timer.undeadSkeletonTimer > 0) return;
  const count = Math.min(
    trait.maxCount,
    1 + Math.floor(timer.undeadSkeletonElapsed / trait.rampEvery),
  );
  timer.undeadSkeletonTimer += trait.interval + Math.max(0, count - 1) * (trait.intervalPerExtra ?? 0);
  for (let i = 0; i < count; i += 1) {
    const skeleton = spawnTraitUnit("machete", side, i);
    skeleton.forceCharge = true;
  }
  const point = getSideTraitTextPoint(side);
  popText(point.x, point.y, `骷髅增援 x${count}`, "#d8d0ff");
}

function updateOrderArmorTrait(side, dt) {
  const timer = getFactionTraitTimer(side);
  timer.orderLightArmorTimer -= dt;
  timer.orderMediumArmorTimer -= dt;
  const lightReady = timer.orderLightArmorTimer <= 0;
  const mediumReady = timer.orderMediumArmorTimer <= 0;
  if (!lightReady && !mediumReady) return;
  if (lightReady) timer.orderLightArmorTimer += ORDER_ARMOR_TRAIT.light.interval;
  if (mediumReady) timer.orderMediumArmorTimer += ORDER_ARMOR_TRAIT.medium.interval;
  let lightArmored = 0;
  let mediumArmored = 0;
  state.units.forEach((unit) => {
    if (unit.side !== side || unit.hp <= 0 || isUnitHidden(unit) || UNIT[unit.type]?.untargetable) return;
    const maxHp = unit.maxHp ?? UNIT[unit.type]?.hp ?? 0;
    if (lightReady && maxHp < ORDER_ARMOR_TRAIT.light.hpBelow) {
      const before = unit.armorReduction ?? 0;
      unit.armorReduction = Math.min(ORDER_ARMOR_TRAIT.light.maxReduction, before + ORDER_ARMOR_TRAIT.light.reductionStep);
      if (unit.armorReduction > before) lightArmored += 1;
      return;
    }
    if (mediumReady && maxHp >= ORDER_ARMOR_TRAIT.medium.hpMin && maxHp <= ORDER_ARMOR_TRAIT.medium.hpMax) {
      const before = unit.armorReduction ?? 0;
      unit.armorReduction = Math.min(ORDER_ARMOR_TRAIT.medium.maxReduction, before + ORDER_ARMOR_TRAIT.medium.reductionStep);
      if (unit.armorReduction > before) mediumArmored += 1;
    }
  });
  const point = getSideTraitTextPoint(side);
  if (lightArmored) popText(point.x, point.y, `轻甲 +${Math.round(ORDER_ARMOR_TRAIT.light.reductionStep * 100)}%`, "#dfe8ff");
  if (mediumArmored) popText(point.x, point.y + (lightArmored ? 24 : 0), `中甲 +${Math.round(ORDER_ARMOR_TRAIT.medium.reductionStep * 100)}%`, "#dfe8ff");
}

function spawnTraitUnit(type, side, index = 0) {
  if (state.fourWay && FOUR_WAY_BASES[side]) return spawnFourWayUnit(type, side, index + 24);
  const x = side === "player" ? FIELD.playerGate + 58 + index * 18 : FIELD.enemyGate - 58 - index * 18;
  return spawnUnit(type, side, x);
}

function getSideTraitTextPoint(side) {
  if (state.fourWay && FOUR_WAY_BASES[side]) {
    const base = FOUR_WAY_BASES[side];
    return { x: base.x, y: base.y + (base.y < FIELD.height / 2 ? -145 : 165) };
  }
  return {
    x: side === "player" ? FIELD.playerGate + 78 : FIELD.enemyGate - 78,
    y: FIELD.ground - 130,
  };
}

function updateCenterTower(dt) {
  if (activeCampaign?.campaignControlTower || activeCampaign?.campaignAcidTower) return;
  state.towerIncomeTimer -= dt;
  if (state.towerIncomeTimer <= 0) {
    state.towerIncomeTimer += 1;
    if (state.towerOwner === "player") state.gold += CENTER_TOWER.income;
    if (state.towerOwner === "enemy") state.enemyGold += CENTER_TOWER.income;
  }

  const playerNearby = getTowerUnits("player").length > 0;
  const enemyNearby = getTowerUnits("enemy").length > 0;

  if (playerNearby === enemyNearby) {
    return;
  }

  const capturingSide = playerNearby ? "player" : "enemy";
  if (state.towerOwner === capturingSide) {
    state.towerCaptureSide = null;
    state.towerCaptureTimer = 0;
    return;
  }

  if (state.towerCaptureSide !== capturingSide) {
    state.towerCaptureSide = capturingSide;
    state.towerCaptureTimer = 0;
  }
  state.towerCaptureTimer += dt;
  if (state.towerCaptureTimer >= CENTER_TOWER.captureTime) {
    if (state.towerOwner && state.towerOwner !== capturingSide) {
      state.towerOwner = null;
      state.towerCaptureTimer = 0;
      popText(CENTER_TOWER.x, CENTER_TOWER.y - 85, "中心塔回到中立", capturingSide === "player" ? "#9fc0ff" : "#ff9b8d");
      return;
    }
    state.towerOwner = capturingSide;
    state.towerCaptureSide = null;
    state.towerCaptureTimer = 0;
    popText(CENTER_TOWER.x, CENTER_TOWER.y - 85, `${capturingSide === "player" ? "我方" : "敌方"}占领中心塔`, capturingSide === "player" ? "#9fc0ff" : "#ff9b8d");
    if (capturingSide === "player") statusEl.textContent = "中心塔已占领，每秒 +6 金币；再次点击进攻可冲击敌方基地";
  }
}

function getTowerUnits(side) {
  return state.units.filter((unit) => (
    unit.side === side
    && unit.hp > 0
    && !isUnitHidden(unit)
    && !ECONOMY_UNITS.has(unit.type)
    && unit.type !== "wraithMiner"
    && !UNIT[unit.type]?.untargetable
    && isInsideTowerCaptureArea(unit)
  ));
}

function updateQueue(dt) {
  const activeTrainingKeys = new Set();
  for (const item of state.spawnQueue) {
    item.duration = item.duration ?? UNIT[item.type]?.train ?? item.timer;
    const key = `${item.side ?? "player"}:${item.type}`;
    if (activeTrainingKeys.has(key)) continue;
    activeTrainingKeys.add(key);
    item.timer -= dt;
  }
  const ready = state.spawnQueue.filter((item) => item.timer <= 0);
  state.spawnQueue = state.spawnQueue.filter((item) => item.timer > 0);
  ready.forEach((item, index) => {
    if (state.fourWay && item.side) {
      spawnTrainedUnit(item.type, item.side, index + Math.floor(Math.random() * 8));
      return;
    }
    const side = item.side ?? "player";
    spawnTrainedUnit(item.type, side, index);
  });
}

function updateCampaignRules(dt) {
  updateCampaignTimeLimit(dt);
  updateCampaignHeartSummon(dt);
  updateCampaignReinforcements(dt);
  updateDelayedEnemyReinforcements(dt);
  updateSecondPhaseReinforcements(dt);
  updateCampaignArrowRain(dt);
  updateCampaignUndeadMineWave(dt);
  updateCampaignMeteor(dt);
  updateCampaignMissiles(dt);
  updateCampaignMagmaGround(dt);
  updateCampaignDarkness(dt);
  updateCampaignEnemyHealthGrowth(dt);
  updateCampaignStormClouds(dt);
}

function updateCampaignHeartSummon(dt) {
  const heart = activeCampaign?.heartSummon;
  if (!heart || state.over || state.playerHp <= 0) return;
  state.campaignHeartSummonTimer -= dt;
  if (state.campaignHeartSummonTimer > 0) return;
  state.campaignHeartSummonTimer += heart.every ?? 8;
  const type = heart.type ?? "ironAnt";
  const count = heart.count ?? 1;
  for (let i = 0; i < count; i += 1) {
    spawnTraitUnit(type, "player", countUnits("player", type) + i);
  }
  const point = getSideTraitTextPoint("player");
  popText(point.x, point.y, `虫群之心孵化${UNIT[type]?.name ?? "铁蚁"}`, "#cde69b");
}

function updateCampaignTimeLimit(dt) {
  if (!activeCampaign) return;
  state.campaignElapsed = (state.campaignElapsed ?? 0) + dt;
  const limit = activeCampaign.timeLimit;
  if (!limit || state.over || state.campaignElapsed < limit) return;
  state.over = true;
  state.winner = "enemy";
  statusEl.textContent = activeCampaign.timeLimitFailText ?? "失败，未能在时限内摧毁敌方基地";
  homeBtn.classList.remove("hidden");
}

function updateCampaignDarkness(dt) {
  if (!activeCampaign?.darkeningSky) return;
  state.campaignDarknessElapsed = Math.min(activeCampaign.darkeningSky.duration, state.campaignDarknessElapsed + dt);
}

function updateCampaignEnemyHealthGrowth(dt) {
  const growth = activeCampaign?.enemyHealthGrowth;
  if (!growth) return;
  state.enemyHealthGrowthTimer -= dt;
  if (state.enemyHealthGrowthTimer > 0) return;
  state.enemyHealthGrowthTimer += growth.every;
  state.units.forEach((unit) => {
    if (unit.side !== "enemy" || unit.hp <= 0 || isUnitHidden(unit)) return;
    const gain = Math.max(1, Math.round(unit.maxHp * growth.percent));
    unit.maxHp += gain;
    unit.hp += gain;
    if (unit.type === "chaosGiant" || unit.x < FIELD.enemyGate - 260) {
      popText(unit.x, unit.y - 92, `生命 +${gain}`, "#b7f56e");
    }
  });
}

function updateCampaignStormClouds(dt) {
  const storm = activeCampaign?.stormClouds;
  if (!storm) return;

  if (storm.duration) {
    if (state.stormCloudRemaining > 0) {
      state.stormCloudRemaining = Math.max(0, state.stormCloudRemaining - dt);
      state.stormCloudStrikeTimer -= dt;
      while (state.stormCloudStrikeTimer <= 0 && state.stormCloudRemaining > 0) {
        state.stormCloudStrikeTimer += storm.strikeEvery ?? 5;
        for (let i = 0; i < storm.bolts; i += 1) {
          strikeStormBolt(storm);
        }
      }
      healStormFavoredUnits(storm, dt);
      if (state.stormCloudRemaining <= 0) {
        state.stormCloudTimer = storm.every;
        state.stormCloudHealTick = 0;
        popText(FIELD.width / 2, FIELD.ground - 190, "乌云散去", "#d7f6ff");
      }
      return;
    }

    state.stormCloudTimer -= dt;
    if (state.stormCloudTimer > 0) return;
    state.stormCloudRemaining = storm.duration;
    state.stormCloudStrikeTimer = 0;
    state.stormCloudHealTick = 0;
    popText(FIELD.width / 2, FIELD.ground - 190, "雷云压境", "#d7f6ff");
    return;
  }

  state.stormCloudTimer -= dt;
  if (state.stormCloudTimer > 0) return;
  state.stormCloudTimer += storm.every;
  for (let i = 0; i < storm.bolts; i += 1) {
    strikeStormBolt(storm);
  }
}

function healStormFavoredUnits(storm, dt) {
  if (!storm.healWindFused) return;
  state.stormCloudHealTick += dt;
  while (state.stormCloudHealTick >= 1) {
    state.stormCloudHealTick -= 1;
    state.units.forEach((unit) => {
      if (unit.hp <= 0 || isUnitHidden(unit) || !isStormFavoredUnit(unit) || unit.hp >= unit.maxHp) return;
      const healed = Math.min(storm.healWindFused, unit.maxHp - unit.hp);
      unit.hp += healed;
      popText(unit.x, unit.y - 108, `雷云恢复 +${healed}`, "#b7f6ff");
    });
  }
}

function isStormFavoredUnit(unit) {
  return WIND_MERGED_UNITS.has(unit.type) || unit.type === "zeus";
}

function strikeStormBolt(storm) {
  const targetSide = Math.random() < 0.5 ? "player" : "enemy";
  const candidates = state.units.filter((unit) => unit.side === targetSide && unit.hp > 0 && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable);
  if (!candidates.length) return;
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const hit = Math.random() < storm.hitChance;
  const x2 = hit ? target.x : target.x + (Math.random() * 130 - 65);
  const y2 = hit ? target.y - 52 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground + 8;
  state.lightning.push({
    x1: x2 + (Math.random() * 120 - 60),
    y1: 38,
    x2,
    y2,
    life: 0.32,
    duration: 0.32,
  });
  if (!hit) {
    popText(x2, FIELD.ground - 70, "闪电落空", "#d7f6ff");
    return;
  }
  applyDamage(target, storm.damage, "neutral");
  popText(target.x, target.y - 105, `雷击 -${storm.damage}`, "#d7f6ff");
}

function createGoldRushMines(config) {
  if (!config) return [];
  const columns = config.columns ?? config.mineCount ?? 10;
  const rows = config.rows ?? 1;
  const center = FIELD.width / 2;
  const columnSpacing = config.columnSpacing ?? 170;
  const laneY = rows === 4 ? MINE_LANES : Array.from({ length: rows }, (_, index) => (index - (rows - 1) / 2) * 48);
  const left = center - ((columns - 1) * columnSpacing) / 2;
  const mines = [];

  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      mines.push({
        id: `goldRush-${column}-${row}`,
        x: left + column * columnSpacing,
        y: FIELD.ground + laneY[row],
        remaining: config.mineGold ?? NORMAL_MINE_CAPACITY,
        capacity: config.mineGold ?? NORMAL_MINE_CAPACITY,
      });
    }
  }

  return mines;
}

function getActiveGoldRushConfig() {
  return activeCampaign?.goldRush ?? MODE_GOLD_RUSH[selectedMode] ?? null;
}

function isGoldRushActive() {
  return Boolean(getActiveGoldRushConfig() && state.goldRushMines?.length);
}

function createSideMines() {
  return {
    player: createMinesForSide("player"),
    enemy: createMinesForSide("enemy"),
  };
}

function createFourWaySideMines() {
  return Object.fromEntries(FOUR_WAY_SIDES.map((side) => [side, createFourWayMinesForSide(side)]));
}

function createFourWayMinesForSide(side) {
  const base = FOUR_WAY_BASES[side];
  if (!base) return [];
  const center = { x: FOUR_WAY_FIELD.width / 2, y: FOUR_WAY_FIELD.height / 2 };
  const dx = center.x - base.x;
  const dy = center.y - base.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = dx / length;
  const ny = dy / length;
  const px = -ny;
  const py = nx;
  const mines = [];
  [-1, 1].forEach((sideSign) => {
    const lateral = sideSign * FOUR_WAY_MINE_SIDE_OFFSET;
    for (let index = 0; index < 4; index += 1) {
      const distance = FOUR_WAY_MINE_BACK_DISTANCE + index * FOUR_WAY_MINE_LINE_SPACING;
      mines.push({
        id: `${side}-gold-${sideSign}-${index}`,
        resource: "gold",
        x: base.x + nx * distance + px * lateral,
        y: base.y + ny * distance + py * lateral,
        remaining: NORMAL_MINE_CAPACITY,
        capacity: NORMAL_MINE_CAPACITY,
      });
    }
    const magicDistance = FOUR_WAY_MINE_BACK_DISTANCE + 4 * FOUR_WAY_MINE_LINE_SPACING;
    mines.push({
      id: `${side}-magic-${sideSign}`,
      resource: "magic",
      x: base.x + nx * magicDistance + px * lateral,
      y: base.y + ny * magicDistance + py * lateral,
      remaining: MAGIC_MINE_CAPACITY,
      capacity: MAGIC_MINE_CAPACITY,
    });
  });
  return mines;
}

function createMinesForSide(side) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  const dir = side === "player" ? 1 : -1;
  const goldMines = MINE_LANES.flatMap((laneY, rowIndex) => (
    NORMAL_MINE_COLUMNS.map((columnOffset, columnIndex) => ({
      id: `${side}-mine-${rowIndex}-${columnIndex}`,
      resource: "gold",
      x: baseX + dir * (Math.sqrt(Math.max(0, FIELD.mineDistance ** 2 - laneY ** 2)) + columnOffset),
      y: FIELD.ground + laneY,
      remaining: NORMAL_MINE_CAPACITY,
      capacity: NORMAL_MINE_CAPACITY,
    }))
  ));
  const magicMines = MINE_LANES.map((laneY, rowIndex) => ({
    id: `${side}-magic-${rowIndex}`,
    resource: "magic",
    x: baseX + dir * (Math.sqrt(Math.max(0, FIELD.mineDistance ** 2 - laneY ** 2)) + MAGIC_MINE_COLUMN_OFFSET),
    y: FIELD.ground + laneY,
    remaining: MAGIC_MINE_CAPACITY,
    capacity: MAGIC_MINE_CAPACITY,
  }));
  return [...goldMines, ...magicMines];
}

function getSideMines(side) {
  if (state?.sideMines?.[side]) return state.sideMines[side];
  if (FOUR_WAY_BASES[side]) return createFourWayMinesForSide(side);
  return state?.sideMines?.[side] ?? createMinesForSide(side);
}

function getMineForMiner(unit) {
  const resource = getMinerResource(unit);
  const mines = getSideMines(unit.side).filter((mine) => (mine.resource ?? "gold") === resource);
  const current = mines.find((mine) => mine.id === unit.mineSlotId && canUseNormalMine(unit, mine));
  if (current) return current;
  const mine = mines
    .filter((candidate) => canUseNormalMine(unit, candidate))
    .map((candidate) => ({
      mine: candidate,
      score: distanceTo(unit.x, unit.y, candidate.x, candidate.y) + getMineOccupancy(unit.side, candidate.id) * 80,
    }))
    .sort((a, b) => a.score - b.score)[0]?.mine;
  unit.mineSlotId = mine?.id ?? null;
  unit.mineWorkSlot = mine ? getAvailableMineWorkSlot(unit.side, mine.id) : null;
  if (mine && unit.carry <= 0) unit.carryResource = mine.resource ?? "gold";
  return mine;
}

function canUseNormalMine(unit, mine) {
  if (!mine || mine.remaining <= 0) return false;
  if (unit.mineSlotId === mine.id && unit.mineWorkSlot !== null && unit.mineWorkSlot !== undefined) return true;
  return getMineOccupancy(unit.side, mine.id) < MINE_WORKER_LIMIT;
}

function getMineOccupancy(side, mineId) {
  return state.units.filter((unit) => (
    unit.side === side
    && isMiningWorker(unit)
    && unit.hp > 0
    && !isUnitHidden(unit)
    && unit.mineSlotId === mineId
    && unit.carry < getMiningBagSize(unit)
  )).length;
}

function getAvailableMineWorkSlot(side, mineId) {
  for (let slot = 0; slot < MINE_WORKER_LIMIT; slot += 1) {
    const occupied = state.units.some((unit) => (
      unit.side === side
      && isMiningWorker(unit)
      && unit.hp > 0
      && !isUnitHidden(unit)
      && unit.mineSlotId === mineId
      && unit.mineWorkSlot === slot
      && unit.carry < getMiningBagSize(unit)
    ));
    if (!occupied) return slot;
  }
  return 0;
}

function getMineWorkPoint(unit, mine) {
  if (state?.fourWay && FOUR_WAY_BASES[unit.side]) {
    const base = FOUR_WAY_BASES[unit.side];
    const dx = mine.x - base.x;
    const dy = mine.y - base.y;
    const distance = Math.hypot(dx, dy) || 1;
    const px = -dy / distance;
    const py = dx / distance;
    const slot = unit.mineWorkSlot ?? 0;
    const offset = slot === 0 ? 18 : -18;
    return {
      x: mine.x + px * offset,
      y: mine.y + py * offset,
    };
  }
  const dir = unit.side === "player" ? 1 : -1;
  const slot = unit.mineWorkSlot ?? 0;
  const xOffset = slot === 0 ? 20 : -22;
  const yOffset = slot === 0 ? 0 : 18;
  return {
    x: mine.x + dir * xOffset,
    y: mine.y + yOffset,
  };
}

function getMiningHomePoint(side) {
  if (state?.fourWay && FOUR_WAY_BASES[side]) {
    const base = FOUR_WAY_BASES[side];
    return { x: base.x, y: base.y };
  }
  return side === "player"
    ? { x: FIELD.playerGate - 36, y: FIELD.ground }
    : { x: FIELD.enemyGate + 36, y: FIELD.ground };
}

function isMiningWorker(unit) {
  return unit.type === "miner" || unit.type === "gnawMiner" || unit.type === "wraithMiner";
}

function getMiningBagSize(unit) {
  if (getCarryResource(unit) === "magic") return UNIT[unit.type]?.magicBagSize ?? UNIT.miner.magicBagSize;
  return UNIT[unit.type]?.bagSize ?? UNIT.miner.bagSize;
}

function getMiningGoldPerSwing(unit) {
  if (getCarryResource(unit) === "magic") return UNIT[unit.type]?.magicPerSwing ?? UNIT.miner.magicPerSwing;
  return UNIT[unit.type]?.goldPerSwing ?? UNIT.miner.goldPerSwing;
}

function getCarryResource(unit) {
  return unit.carry > 0 ? (unit.carryResource ?? "gold") : getMinerResource(unit);
}

function getMinerResource(unit) {
  if (unit.type !== "miner" && unit.type !== "gnawMiner" && unit.type !== "wraithMiner") return "gold";
  if (unit.miningResource) return unit.miningResource;
  if (unit.side === "player") return state.minerResource ?? "gold";
  return getSideMagic(unit.side) < getFactionMagicDemand(factionForSide(unit.side), unit.side) ? "magic" : "gold";
}

function getFactionMagicDemand(faction, side = null) {
  const roster = side === "player"
    ? currentPlayerRoster()
    : side === "enemy"
      ? currentEnemyRoster()
      : state?.fourWay ? getFourWayFactionRoster(faction) : FACTIONS[faction]?.roster ?? [];
  const magicRoster = faction === "element" ? [...new Set([...roster, ...FOUR_WAY_AI_ROSTER.element])] : roster;
  return Math.max(0, ...magicRoster.map((type) => getUnitMagicCost(type, faction)));
}

function depositMinerCarry(unit, isPlayer) {
  const resource = getCarryResource(unit);
  if (resource === "magic") {
    addSideMagic(unit.side, unit.carry);
  } else {
    addSideGold(unit.side, unit.carry);
  }
  popText(unit.x, unit.y - 52, `入库 ${getResourceLabel(resource)} +${formatResourceAmount(unit.carry)}`, getResourceColor(resource, isPlayer));
}

function getResourceLabel(resource) {
  return resource === "magic" ? "魔力" : "金币";
}

function getResourceColor(resource, isPlayer = true) {
  if (resource === "magic") return "#b88cff";
  return isPlayer ? "#f5c542" : "#b7f56e";
}

function formatResourceAmount(value) {
  return Number.isInteger(value) ? value : Math.round(value * 10) / 10;
}

function distanceTo(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function moveUnitTowardPoint(unit, targetX, targetY, speed, dt, tolerance = 5) {
  const beforeX = unit.x;
  const beforeY = unit.y;
  const dx = targetX - unit.x;
  const dy = targetY - unit.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= tolerance) return false;
  const step = Math.min(distance, speed * getMoveFactor(unit) * dt);
  unit.x += (dx / distance) * step;
  unit.y += (dy / distance) * step;
  stopAtBlockingBarricade(unit, beforeX, beforeY);
  return true;
}

function stopAtBlockingBarricade(unit, beforeX, beforeY) {
  if (!unit || unit.hp <= 0 || UNIT[unit.type]?.flying) return;
  const blocker = getBlockingBarricadeAt(unit, unit.x, unit.y, beforeX, beforeY);
  if (!blocker) return;
  unit.y = beforeY;
  if (beforeX < blocker.x) unit.x = blocker.x - blocker.length / 2 - 8;
  else unit.x = blocker.x + blocker.length / 2 + 8;
}

function updateCampaignReinforcements(dt) {
  if (!activeCampaign?.enemyReinforcement) return;
  const reinforcement = activeCampaign.enemyReinforcement;
  if (reinforcement.phase && reinforcement.phase !== state.campaignPhase) return;
  state.campaignReinforcementTimer -= dt;
  if (state.campaignReinforcementTimer > 0) return;
  state.campaignReinforcementTimer += reinforcement.every;
  const count = reinforcement.count ?? 1;
  for (let i = 0; i < count; i += 1) {
    const unit = spawnUnit(reinforcement.type, "enemy", FIELD.enemyGate + 12 - i * 24);
    unit.forceCharge = true;
  }
  popText(FIELD.enemyGate - 60, FIELD.ground - 112, `${UNIT[reinforcement.type].name}增援 x${count}`, "#ffb0a3");
}

function updateDelayedEnemyReinforcements(dt) {
  const reinforcements = activeCampaign?.delayedEnemyReinforcements;
  if (!reinforcements?.length) return;
  state.delayedEnemyReinforcementsDone = state.delayedEnemyReinforcementsDone ?? [];
  reinforcements.forEach((wave, index) => {
    if (state.delayedEnemyReinforcementsDone.includes(index)) return;
    if ((state.campaignElapsed ?? 0) < wave.at) return;
    state.delayedEnemyReinforcementsDone.push(index);
    spawnEnemyReinforcementWave(wave);
  });
}

function spawnEnemyReinforcementWave(wave) {
  let offset = 0;
  (wave.units ?? []).forEach((entry) => {
    const count = entry.count ?? 1;
    for (let i = 0; i < count; i += 1) {
      const unit = spawnUnit(entry.type, "enemy", FIELD.enemyGate + 18 - offset * 22);
      unit.forceCharge = Boolean(wave.forceCharge);
      offset += 1;
    }
  });
  popText(FIELD.enemyGate - 80, FIELD.ground - 130, wave.message ?? "敌方支援到来", "#ffb0a3");
  if (wave.statusText) statusEl.textContent = wave.statusText;
}

function updateSecondPhaseReinforcements(dt) {
  const reinforcements = activeCampaign?.secondPhase?.reinforcements;
  if (!reinforcements || state.campaignPhase !== 2) return;

  reinforcements.forEach((reinforcement, index) => {
    state.secondPhaseReinforcementTimers[index] -= dt;
    if (state.secondPhaseReinforcementTimers[index] > 0) return;

    state.secondPhaseReinforcementTimers[index] += reinforcement.every;
    const count = reinforcement.count ?? 1;
    for (let i = 0; i < count; i += 1) {
      const unit = spawnUnit(reinforcement.type, "enemy", FIELD.enemyGate + 18 + i * 26);
      unit.forceCharge = true;
    }
    popText(FIELD.enemyGate - 70, FIELD.ground - 112, `${UNIT[reinforcement.type].name}进攻`, "#ffb0a3");
  });
}

function updateCampaignArrowRain(dt) {
  const rain = activeCampaign?.arrowRain;
  if (!rain) return;

  if (state.arrowRainRemaining <= 0) {
    state.arrowRainTimer -= dt;
    if (state.arrowRainTimer > 0) return;
    if (!rain.cooldownAfterComplete) state.arrowRainTimer += rain.every;
    state.arrowRainRemaining = rain.total;
    state.arrowRainDropCarry = 0;
    popText(FIELD.width / 2, FIELD.ground - 165, "箭雨来袭", "#f5f0df");
  }

  if (state.arrowRainRemaining <= 0) return;
  state.arrowRainDropCarry += rain.perSecond * dt;
  const drops = Math.min(state.arrowRainRemaining, Math.floor(state.arrowRainDropCarry));
  if (drops <= 0) return;

  state.arrowRainDropCarry -= drops;
  for (let i = 0; i < drops; i += 1) {
    spawnCampaignRainArrow(rain);
  }
  if (rain.cooldownAfterComplete && state.arrowRainRemaining <= 0) {
    state.arrowRainTimer = rain.every;
  }
}

function spawnCampaignRainArrow(rain) {
  const dropped = rain.total - state.arrowRainRemaining;
  state.arrowRainRemaining -= 1;
  const lane = dropped % rain.perSecond;
  const secondBand = Math.floor(dropped / rain.perSecond);
  const xStep = FIELD.width / rain.perSecond;
  const x = lane * xStep + xStep * 0.5 + (Math.random() - 0.5) * xStep * 0.45 + secondBand * 13;
  const tx = Math.max(40, Math.min(FIELD.width - 40, x % FIELD.width));
  state.arrows.push({
    x: tx + (Math.random() - 0.5) * 28,
    y: -50 - Math.random() * 80,
    tx,
    ty: FIELD.ground - 18,
    side: rain.side === "player" ? "player" : "enemy",
    damage: rain.damage,
    radius: rain.radius,
    life: 0.9,
    type: "campaignRain",
  });
}

function updateCampaignUndeadMineWave(dt) {
  const wave = activeCampaign?.undeadMineWave;
  if (!wave) return;

  state.undeadMineWaveElapsed += dt;
  state.undeadMineWaveTimer -= dt;
  if (state.undeadMineWaveTimer > 0) return;

  state.undeadMineWaveTimer += wave.every;
  const bonus = Math.floor(state.undeadMineWaveElapsed / wave.increaseEvery);
  const count = wave.baseCount + bonus;
  for (let i = 0; i < count; i += 1) {
    const x = FIELD.width / 2 + Math.random() * (FIELD.enemyMineX - FIELD.width / 2);
    const undead = spawnUnit("undead", "enemy", x);
    undead.forceCharge = true;
  }
  popText((FIELD.enemyMineX + FIELD.width / 2) / 2, FIELD.ground - 130, `亡灵涌出 x${count}`, "#b8b0a5");
}

function updateCampaignMeteor(dt) {
  const meteor = activeCampaign?.campaignMeteor;
  if (!meteor) return;

  if (state.campaignMeteorCooldownDelay > 0) {
    state.campaignMeteorCooldownDelay = Math.max(0, state.campaignMeteorCooldownDelay - dt);
    if (state.campaignMeteorCooldownDelay <= 0) {
      state.campaignMeteorTimer = meteor.every;
    }
    return;
  }

  state.campaignMeteorTimer -= dt;
  if (state.campaignMeteorTimer > 0) return;

  if (!meteor.cooldownAfterComplete) state.campaignMeteorTimer += meteor.every;
  const minX = Math.min(FIELD.playerMineX, FIELD.enemyMineX);
  const maxX = Math.max(FIELD.playerMineX, FIELD.enemyMineX);
  const count = meteor.count ?? 1;
  const segmentWidth = (maxX - minX) / count;
  for (let i = 0; i < count; i += 1) {
    const segmentStart = minX + segmentWidth * i;
    const x = segmentStart + segmentWidth * (0.22 + Math.random() * 0.56);
    state.meteors.push({
      x,
      y: FIELD.ground - 20,
      side: "neutral",
      damage: meteor.damage,
      radius: meteor.radius,
      life: meteor.duration + i * 0.18,
      duration: meteor.duration + i * 0.18,
      size: meteor.size,
      campaign: true,
    });
    popText(x, FIELD.ground - 160, "巨大陨石", "#ffb45e");
  }
  if (meteor.cooldownAfterComplete) {
    state.campaignMeteorTimer = 0;
    state.campaignMeteorCooldownDelay = meteor.duration + (count - 1) * 0.18;
  }
}

function updateCampaignMagmaGround(dt) {
  const magma = activeCampaign?.magmaGround;
  if (!magma) return;

  if (state.magmaGroundRemaining > 0) {
    state.magmaGroundRemaining = Math.max(0, state.magmaGroundRemaining - dt);
    state.magmaGroundTick += dt;
    while (state.magmaGroundTick >= 1) {
      state.magmaGroundTick -= 1;
      damageMagmaGround(magma);
    }
    if (state.magmaGroundRemaining <= 0) {
      state.magmaGroundTimer = magma.every;
      state.magmaGroundTick = 0;
      popText(FIELD.width / 2, FIELD.ground - 118, "岩浆冷却", "#ffb45e");
    }
    return;
  }

  state.magmaGroundTimer -= dt;
  if (state.magmaGroundTimer > 0) return;

  state.magmaGroundRemaining = magma.duration;
  state.magmaGroundTick = 0;
  popText(FIELD.width / 2, FIELD.ground - 128, "岩浆地喷发", "#ff6a3d");
}

function damageMagmaGround(magma) {
  state.units.forEach((unit) => {
    if (unit.hp <= 0 || isUnitHidden(unit) || UNIT[unit.type]?.untargetable) return;
    if (isMagmaImmune(unit)) return;
    applyUnitDamage(unit, magma.damage, { label: "岩浆", color: "#ff6a3d", yOffset: -96 });
  });
}

function isMagmaImmune(unit) {
  return ["fireElement", "fireImp", "rog", "dreadfire", "redflame", "scaldStrike", "prometheus"].includes(unit.type);
}

function updateCampaignMissiles(dt) {
  const missile = activeCampaign?.campaignMissiles;
  if (!missile) return;

  if (state.campaignMissileWarning > 0) {
    const previousSecond = Math.ceil(state.campaignMissileWarning);
    state.campaignMissileWarning = Math.max(0, state.campaignMissileWarning - dt);
    const nextSecond = Math.ceil(state.campaignMissileWarning);
    if (nextSecond > 0 && nextSecond !== previousSecond) {
      popText(getMissileTargetX(missile), FIELD.ground - 190, `${getMissileLabel(missile)} ${nextSecond}`, "#ffdf6b");
    }
    if (state.campaignMissileWarning <= 0) {
      launchCampaignMissiles(missile);
      state.campaignMissileTimer = Math.max(0, missile.every - missile.warning);
    }
    return;
  }

  state.campaignMissileTimer -= dt;
  if (state.campaignMissileTimer > 0) return;

  state.campaignMissileWarning = missile.warning;
  state.campaignMissileTimer = 0;
  popText(getMissileTargetX(missile), FIELD.ground - 190, `${getMissileLabel(missile)} ${missile.warning}`, "#ffdf6b");
}

function getMissileSide(missile) {
  return missile.side === "player" ? "player" : "enemy";
}

function getMissileLabel(missile) {
  return missile.label ?? (getMissileSide(missile) === "player" ? "火箭弹支援" : "导弹来袭");
}

function getMissileTargetX(missile) {
  return getMissileTargetInfo(missile).x;
}

function getMissileTargetInfo(missile) {
  const attackerSide = getMissileSide(missile);
  const targetSide = attackerSide === "player" ? "enemy" : "player";
  const candidates = state.units.filter((unit) => unit.side === targetSide && unit.hp > 0 && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable);
  if (!candidates.length) {
    return {
      x: attackerSide === "player" ? FIELD.enemyGate - 260 : FIELD.playerGate + 260,
      target: null,
    };
  }
  const target = candidates.reduce((front, unit) => {
    if (!front) return unit;
    return attackerSide === "player"
      ? (unit.x < front.x ? unit : front)
      : (unit.x > front.x ? unit : front);
  }, null);
  return { x: target.x, target };
}

function launchCampaignMissiles(missile) {
  const missileSide = getMissileSide(missile);
  const targetInfo = getMissileTargetInfo(missile);
  const frontX = targetInfo.x;
  const count = missile.count ?? 12;
  const laneSpread = 180;
  const startX = missileSide === "player" ? -130 : FIELD.width + 130;
  const speedPerSecond = missile.speedPerSecond ?? 0;
  for (let i = 0; i < count; i += 1) {
    const offset = ((i / Math.max(1, count - 1)) - 0.5) * laneSpread + (Math.random() - 0.5) * 36;
    const ty = FIELD.ground - 38 + (Math.random() - 0.5) * 46;
    const x = startX + (missileSide === "player" ? -i * 12 : i * 12);
    const y = FIELD.ground - 250 + (i % 4) * 16;
    const rawTx = frontX + offset;
    const distanceToCurrent = Math.hypot(rawTx - x, ty - y);
    const travelToCurrent = speedPerSecond > 0 ? Math.max(0.1, distanceToCurrent / speedPerSecond) : missile.speed;
    const predictedX = predictMissileTargetX(targetInfo.target, travelToCurrent, rawTx);
    const tx = Math.max(FIELD.playerGate + 40, Math.min(FIELD.enemyGate - 80, predictedX));
    const distance = Math.hypot(tx - x, ty - y);
    const duration = speedPerSecond > 0 ? Math.max(0.1, distance / speedPerSecond) : missile.speed;
    state.arrows.push({
      x,
      y,
      tx,
      ty,
      side: missileSide,
      damage: missile.damage,
      radius: missile.radius,
      limit: missile.limit,
      life: duration,
      duration,
      type: "campaignMissile",
    });
  }
  state.screenShake = Math.max(state.screenShake ?? 0, 0.45);
  popText(frontX, FIELD.ground - 190, getMissileSide(missile) === "player" ? "火箭弹齐射" : "导弹齐射", "#ff6b4a");
}

function predictMissileTargetX(target, travelTime, fallbackX) {
  if (!target || !Number.isFinite(travelTime)) return fallbackX;
  const velocityX = Number.isFinite(target.velocityX) ? target.velocityX : 0;
  if (Math.abs(velocityX) < 5) return fallbackX;
  const leadX = velocityX * Math.min(travelTime, 3);
  return fallbackX + leadX;
}

function updateEnemyAi(dt) {
  state.enemySpawnTimer -= dt;
  state.enemyMinerTimer -= dt;
  state.enemyAttackMood += dt;
  state.enemyCommandTimer -= dt;
  state.enemyCounterPushTimer = Math.max(0, (state.enemyCounterPushTimer ?? 0) - dt);
  state.enemyCounterCooldown = Math.max(0, (state.enemyCounterCooldown ?? 0) - dt);
  state.enemyHoldTimer = Math.max(0, (state.enemyHoldTimer ?? 0) - dt);
  state.enemyAttackWaveTimer = Math.max(0, (state.enemyAttackWaveTimer ?? 0) - dt);
  if (state.enemyCounterPushTimer <= 0) state.enemyCounterTargetX = null;
  updateEnemyCommand();
  updateEnemyBattleLine(dt);
  if (activeCampaign?.secondPhase?.disableEnemyTraining && state.campaignPhase === 2) return;

  const enemyEconomyType = getFactionEconomyUnit(opponentFaction());
  const enemyMiners = state.units.filter((unit) => unit.side === "enemy" && unit.type === enemyEconomyType).length;
  const savingForV = shouldEnemySaveForV();
  const targetEnemyMiners = getEnemyTargetMinerCount();

  if (opponentFaction() === "element" && state.enemyAttackMood > 34 && canMergeV("enemy") && mergeV("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 5);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 18 && canMergeTreeEnt("enemy") && mergeTreeEnt("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 24 && canMergeRog("enemy") && mergeRog("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 28 && canMergeDreadfire("enemy") && mergeDreadfire("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 26 && canMergeRedflame("enemy") && mergeRedflame("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 27 && canMergeStormLich("enemy") && mergeStormLich("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 32 && canMergeHurricane("enemy") && mergeHurricane("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 20 && canMergeHill("enemy") && mergeHill("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 30 && canMergeScaldStrike("enemy") && mergeScaldStrike("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 30 && canMergeElectricGate("enemy") && mergeElectricGate("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }

  if (opponentFaction() === "element" && enemyMiners < 2 && state.enemyMinerTimer <= 0 && (!savingForV || countUnits("enemy", "earthElement") > 2) && convertEarthToMiner("enemy")) {
    state.enemyMinerTimer = 8;
  }

  if (state.enemyMinerTimer <= 0 && enemyMiners < targetEnemyMiners && canAffordUnit(enemyEconomyType, opponentFaction(), "enemy", state.enemyGold)) {
    spendUnitCost(enemyEconomyType, opponentFaction(), "enemy", state.enemyGold);
    state.enemyMinerTimer = enemyMiners < 3 ? 8 : 11;
    spawnTrainedUnit(enemyEconomyType, "enemy", enemyMiners);
  }

  if (state.enemySpawnTimer <= 0) {
    const enemyRoster = currentEnemyRoster().filter((type) => !ECONOMY_UNITS.has(type) && !UNIT[type]?.hero && !MERGE_UNITS.has(type));
    if (shouldFactionAiSaveForTech({
      side: "enemy",
      faction: opponentFaction(),
      fullRoster: enemyRoster,
      livingCount: countFighters("enemy"),
      gold: state.enemyGold,
      magic: state.enemyMagic ?? 0,
      elapsed: state.enemyAttackMood,
      fourWay: false,
    })) {
      state.enemySpawnTimer = 0.8;
      return;
    }
    const affordable = enemyRoster.filter((type) => canAffordUnit(type, opponentFaction(), "enemy", state.enemyGold));
    if (!affordable.length) {
      state.enemySpawnTimer = 0.8;
      return;
    }

    const type = chooseEnemyUnit(affordable);
    if (!type) {
      state.enemySpawnTimer = 0.8;
      return;
    }
    spendUnitCost(type, opponentFaction(), "enemy", state.enemyGold);
    state.enemySpawnTimer = opponentFaction() === "element" ? 1.8 + Math.random() * 2.1 : 1.35 + Math.random() * 1.55;
    spawnTrainedUnit(type, "enemy", Math.floor(Math.random() * 8));
  }
}

function updateTeamAi(dt) {
  if (!state.teamAi?.length || state.over) return;
  state.teamAi.forEach((ai) => {
    ai.gold += 5 * dt;
    if (getFactionMagicDemand(ai.faction, ai.side) > 0) ai.magic = (ai.magic ?? 0) + MAGIC_INCOME_PER_SECOND * dt;
    ai.minerTimer -= dt;
    ai.spawnTimer -= dt;
    const economyType = getFactionEconomyUnit(ai.faction);
    const miners = state.units.filter((unit) => unit.side === ai.side && unit.type === economyType && unit.hp > 0).length;
    if (ai.minerTimer <= 0 && miners < 5 && canTeamAiAffordUnit(ai, economyType)) {
      spendTeamAiUnitCost(ai, economyType);
      ai.minerTimer = miners < 3 ? 9 : 13;
      spawnTrainedUnit(economyType, ai.side, miners);
      return;
    }
    if (ai.spawnTimer > 0) return;
    const roster = FACTIONS[ai.faction].roster
      .filter((type) => !ECONOMY_UNITS.has(type) && !UNIT[type]?.hero && !MERGE_UNITS.has(type) && !UNIT[type]?.summonOnly && !UNIT[type]?.statueOnly);
    if (shouldFactionAiSaveForTech({
      side: ai.side,
      faction: ai.faction,
      fullRoster: roster,
      livingCount: countFighters(ai.side),
      gold: ai.gold,
      magic: ai.magic ?? 0,
      elapsed: state.enemyAttackMood ?? 0,
      fourWay: false,
    })) {
      ai.spawnTimer = 0.9;
      return;
    }
    const affordable = roster.filter((type) => canTeamAiAffordUnit(ai, type));
    if (!affordable.length) {
      ai.spawnTimer = 0.9;
      return;
    }
    const type = chooseStrategicAiUnit({
      side: ai.side,
      faction: ai.faction,
      affordableRoster: affordable,
      fullRoster: roster,
      livingCount: countFighters(ai.side),
      gold: ai.gold,
      magic: ai.magic ?? 0,
      elapsed: state.enemyAttackMood ?? 0,
      fourWay: false,
    });
    if (!type) {
      ai.spawnTimer = 0.9;
      return;
    }
    spendTeamAiUnitCost(ai, type);
    ai.spawnTimer = ai.faction === "element" ? 2.2 + Math.random() * 2.4 : 1.6 + Math.random() * 1.8;
    spawnTrainedUnit(type, ai.side, Math.floor(Math.random() * 8));
  });
}

function canTeamAiAffordUnit(ai, type) {
  return ai.gold >= getUnitCost(type, ai.faction, ai.side)
    && (ai.magic ?? 0) >= getUnitMagicCost(type, ai.faction, ai.side);
}

function spendTeamAiUnitCost(ai, type) {
  ai.gold -= getUnitCost(type, ai.faction, ai.side);
  ai.magic = (ai.magic ?? 0) - getUnitMagicCost(type, ai.faction, ai.side);
}

function getEnemyTargetMinerCount() {
  const pressure = countCombatThreatsNear("player", FIELD.enemyGate - 520, "right");
  const enemyFighters = countFighters("enemy");
  if (pressure >= 5 && enemyFighters < 5) return 3;
  if (state.enemyGold > 260 || state.enemyAttackMood > 42) return 5;
  if (state.enemyGold > 150 || state.enemyAttackMood > 24) return 4;
  return 3;
}

function isAiCombatThreat(unit) {
  return Boolean(
    unit &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !UNIT[unit.type]?.untargetable &&
    !ECONOMY_UNITS.has(unit.type) &&
    unit.type !== "wraithMiner",
  );
}

function countCombatThreatsNear(side, x, direction = "right") {
  return state.units.filter((unit) => {
    if (unit.side !== side || !isAiCombatThreat(unit)) return false;
    return direction === "left" ? unit.x < x : unit.x > x;
  }).length;
}

function updateEnemyCommand() {
  if (activeCampaign?.disableEnemyBaseAttack) {
    if (state.enemyCommand !== "guard") {
      state.enemyCommand = "guard";
      popText(FIELD.enemyGate - 90, FIELD.ground - 135, "敌方固守基地", "#ffb0a3");
    }
    state.enemyCommandTimer = Math.max(state.enemyCommandTimer, 2);
    return;
  }
  if (state.enemyCommandTimer > 0) return;

  const enemyPower = getArmyPower("enemy");
  const playerPower = getArmyPower("player");
  const enemyFighters = countFighters("enemy");
  const playerPressure = countCombatThreatsNear("player", FIELD.enemyGate - 430, "right");
  const playerAtGate = countCombatThreatsNear("player", FIELD.enemyGate - 260, "right");
  const underAttack = (state.enemyCounterPushTimer ?? 0) > 0;
  const committedAttack = state.enemyCommand === "attack" && (state.enemyAttackWaveTimer ?? 0) > 0;
  const canStartWave = state.enemyHoldTimer <= 0 && state.enemyAttackWaveTimer <= 0 && state.enemyAttackMood >= 18;
  const waveReady = enemyFighters >= 5 && enemyPower >= Math.max(300, playerPower * 0.98);
  const badlyOutmatched = enemyPower < playerPower * 0.62 || enemyFighters <= Math.max(1, playerPressure - 3);
  const baseUnderPressure = playerAtGate >= 2 || (playerPressure >= 4 && enemyPower < playerPower * 0.9);
  let nextCommand = "guard";

  if (committedAttack) {
    nextCommand = "attack";
  } else if ((state.enemyHp < 850 && baseUnderPressure) || (playerPressure >= 3 && badlyOutmatched) || (state.enemyHp < 360 && enemyPower < playerPower * 0.95)) {
    nextCommand = "retreat";
  } else if (underAttack && enemyFighters >= 3 && enemyPower >= playerPower * 0.62) {
    nextCommand = "guard";
  } else if (playerPressure >= 3 || enemyPower < playerPower * 0.78 || enemyFighters < 3) {
    nextCommand = "guard";
  } else if (!canStartWave) {
    nextCommand = "guard";
  } else if (waveReady) {
    nextCommand = "attack";
  } else if (enemyFighters >= 4 && Math.random() < 0.18) {
    nextCommand = "attack";
  }

  if (nextCommand !== state.enemyCommand) {
    state.enemyCommand = nextCommand;
    const label = { retreat: "敌方撤退", guard: "敌方防守", attack: "敌方进攻" };
    popText(FIELD.enemyGate - 90, FIELD.ground - 135, label[nextCommand], "#ffb0a3");
    if (nextCommand === "attack") {
      state.enemyAttackWaveTimer = 16 + Math.random() * 6;
      state.enemyHoldTimer = 14 + Math.random() * 6;
    } else if (nextCommand === "retreat") {
      state.enemyHoldTimer = 5 + Math.random() * 3;
      state.enemyAttackWaveTimer = Math.max(state.enemyAttackWaveTimer, 5);
    }
  }
  state.enemyCommandTimer = nextCommand === "attack" ? Math.min(state.enemyAttackWaveTimer ?? 6, 6 + Math.random() * 2) : nextCommand === "retreat" ? 2 + Math.random() * 1.5 : 3.5 + Math.random() * 2.5;
}

function updateEnemyBattleLine(dt) {
  const enemyPower = getArmyPower("enemy");
  const playerPower = getArmyPower("player");
  const enemyFighters = countFighters("enemy");
  const playerFront = getFrontX("player");
  let targetLine = getEnemyRallyBaseX();

  if (state.enemyCommand === "retreat") {
    targetLine = FIELD.enemyGate - 55;
  } else if (state.enemyCommand === "attack") {
    targetLine = Math.max(FIELD.playerGate + 220, playerFront ? playerFront + 210 : FIELD.playerGate + 520);
  } else if ((state.enemyCounterPushTimer ?? 0) > 0) {
    const counterX = state.enemyCounterTargetX ?? playerFront;
    targetLine = counterX ? Math.max(FIELD.playerGate + 260, counterX + 150) : getEnemyRallyBaseX();
  } else if (enemyFighters >= 4 && enemyPower >= playerPower * 0.85) {
    targetLine = Math.max(FIELD.playerGate + 340, playerFront ? playerFront + 300 : FIELD.enemyGate - 620);
  } else {
    targetLine = getEnemyRallyBaseX();
  }

  if (state.enemyCommand !== "retreat") {
    targetLine = Math.min(getEnemyRallyBaseX(), Math.max(FIELD.playerGate + 220, targetLine));
  }
  const lineSpeed = state.enemyCommand === "retreat" ? 210 : state.enemyCommand === "attack" ? 92 : (state.enemyCounterPushTimer ?? 0) > 0 ? 116 : 56;
  const step = Math.sign(targetLine - state.enemyLineX) * lineSpeed * dt;
  if (Math.abs(targetLine - state.enemyLineX) <= Math.abs(step)) state.enemyLineX = targetLine;
  else state.enemyLineX += step;
}

function getArmyPower(side) {
  return state.units.reduce((sum, unit) => {
    if (unit.side !== side || unit.hp <= 0 || isUnitHidden(unit) || ECONOMY_UNITS.has(unit.type) || unit.type === "wraithMiner") return sum;
    const data = UNIT[unit.type];
    const rangeBonus = (data.range ?? 30) > 80 ? 1.25 : 1;
    const giantBonus = data.giant ? 1.35 : 1;
    return sum + (unit.hp + (unit.damage ?? data.damage ?? 0) * 18) * rangeBonus * giantBonus;
  }, 0);
}

function countFighters(side) {
  return state.units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitHidden(unit) && !ECONOMY_UNITS.has(unit.type) && unit.type !== "wraithMiner").length;
}

function getFrontX(side) {
  const fighters = state.units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitHidden(unit) && !ECONOMY_UNITS.has(unit.type) && unit.type !== "wraithMiner");
  if (!fighters.length) return null;
  return fighters.reduce((front, unit) => {
    if (front === null) return unit.x;
    return side === "player" ? Math.max(front, unit.x) : Math.min(front, unit.x);
  }, null);
}

function chooseEnemyUnit(affordable) {
  if (state.enemyAttackMood < 12 && affordable.includes("undead")) return "undead";
  if (state.enemyAttackMood < 12 && affordable.includes("swordsman")) return "swordsman";
  if (opponentFaction() === "element" && shouldEnemySaveForV()) {
    const missing = ["earthElement", "waterElement", "fireElement", "windElement"].find((type) => countUnits("enemy", type) < 2 && affordable.includes(type));
    if (missing) return missing;
  }
  const fullRoster = currentEnemyRoster().filter((type) => !ECONOMY_UNITS.has(type) && !UNIT[type]?.hero && !MERGE_UNITS.has(type));
  const strategic = chooseStrategicAiUnit({
    side: "enemy",
    faction: opponentFaction(),
    affordableRoster: affordable,
    fullRoster,
    livingCount: countFighters("enemy"),
    gold: state.enemyGold,
    magic: state.enemyMagic ?? 0,
    elapsed: state.enemyAttackMood,
    fourWay: false,
  });
  if (strategic) return strategic;

  const weights = {
    swordsman: 1.1,
    spearman: 0.85,
    archer: 0.9,
    greatsword: 0.75,
    spartan: 0.55,
    ironCavalry: 0.38,
    monk: 0.65,
    crossbow: 0.75,
    musketeer: 0.65,
    mage: 0.6,
    catapult: 0.28,
    rocketCart: 0.32,
    earthElement: 1,
    waterElement: 0.9,
    fireElement: 0.9,
    windElement: 0.75,
    dreadfire: 0.45,
    hurricane: 0.55,
    creeper: 1.1,
    goblin: 0.72,
    goblinExpert: 0.48,
    arrowShieldCart: 0.34,
    shaman: 0.46,
    priest: 0.52,
    orc: 0.95,
    berserkOrc: 0.8,
    scimitarWarrior: 0.58,
    minotaur: 0.42,
    rhinoMan: 0.38,
    javelinThrower: 0.78,
    goblinVulture: 0.62,
    griffinBomber: 0.32,
    undead: 1.05,
    ghoul: 0.85,
    candlelight: 0.82,
    reaper: 0.72,
    undeadVulture: 0.58,
    machete: 0.9,
    boneThrower: 0.7,
    deadCorpse: 0.75,
    poisonZombie: 0.85,
    necromancer: 0.58,
    bomber: 0.85,
    demonArcher: 0.75,
    darkKnight: 0.65,
    bannerBearer: 0.45,
    graveDigger: 0.6,
    boneGiant: 0.55,
    undeadMage: 0.6,
    enslavedGiant: 0.28,
    chaosGiant: 0.28,
  };
  const total = affordable.reduce((sum, type) => sum + (weights[type] ?? 1), 0);
  let roll = Math.random() * total;

  for (const type of affordable) {
    roll -= weights[type] ?? 1;
    if (roll <= 0) return type;
  }

  return affordable[affordable.length - 1];
}

function shouldEnemySaveForV() {
  return opponentFaction() === "element" && state.enemyAttackMood > 22 && !state.units.some((unit) => unit.side === "enemy" && unit.type === "vUnit" && unit.hp > 0);
}

function countUnits(side, type) {
  return state.units.filter((unit) => unit.side === side && unit.type === type && unit.hp > 0).length;
}

function updateBaseAttacks(dt) {
  state.playerBaseAttackTimer = Math.max(0, state.playerBaseAttackTimer - dt);
  state.enemyBaseAttackTimer = Math.max(0, state.enemyBaseAttackTimer - dt);

  if (!isBaseAttackDisabled("player") && state.playerBaseAttackTimer <= 0) {
    const target = findBaseTarget("player");
    if (target) {
      launchBaseAttack("player", target);
      state.playerBaseAttackTimer = getBaseAttackProfile("player").cooldown;
    }
  }

  if (!isBaseAttackDisabled("enemy") && state.enemyBaseAttackTimer <= 0) {
    const target = findBaseTarget("enemy");
    if (target) {
      launchBaseAttack("enemy", target);
      state.enemyBaseAttackTimer = getBaseAttackProfile("enemy").cooldown;
    }
  }
}

function isBaseAttackDisabled(side) {
  if (side === "enemy" && activeCampaign?.disableEnemyBaseAttack) return true;
  return false;
}

function findBaseTarget(side) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  const profile = getBaseAttackProfile(side);
  return state.units
    .filter((unit) => unit.side !== side && unit.hp > 0 && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable && Math.abs(unit.x - baseX) <= profile.range)
    .sort((a, b) => Math.abs(a.x - baseX) - Math.abs(b.x - baseX))[0];
}

function getBaseAttackProfile(side) {
  const faction = factionForSide(side);
  if (faction === "order") {
    return { type: "orderVolley", range: BASE_ATTACK.range, cooldown: BASE_ATTACK.orderCooldown };
  }
  if (faction === "element") {
    return { type: "stormCloud", range: BASE_ATTACK.range, cooldown: BASE_ATTACK.elementStormCooldown };
  }
  return { type: "chaosBoulder", range: BASE_ATTACK.range, cooldown: BASE_ATTACK.chaosCooldown };
}

function launchBaseAttack(side, target) {
  const profile = getBaseAttackProfile(side);
  if (profile.type === "orderVolley") {
    launchBaseArrowVolley(side, target);
    return;
  }
  if (profile.type === "stormCloud") {
    summonBaseStormCloud(side, target);
    return;
  }
  launchBaseBoulder(side, target);
}

function launchBaseArrowVolley(side, target) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  const dir = side === "player" ? 1 : -1;
  for (let i = 0; i < BASE_ATTACK.orderArrowCount; i += 1) {
    const drift = (i - (BASE_ATTACK.orderArrowCount - 1) / 2) * 4 + (Math.random() - 0.5) * 18;
    state.arrows.push({
      x: baseX + dir * 10,
      y: FIELD.ground - 142 - (i % 5) * 4,
      tx: target.x + drift,
      ty: target.y ? target.y - 40 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 112,
      side,
      damage: BASE_ATTACK.orderArrowDamage,
      splash: BASE_ATTACK.orderArrowSplash,
      limit: BASE_ATTACK.orderArrowLimit,
      target,
      life: 0.52 + (i % 4) * 0.03,
      duration: 0.52 + (i % 4) * 0.03,
      type: "baseVolley",
    });
  }
  popText(baseX, FIELD.ground - 165, "基地箭雨", side === "player" ? "#9fc0ff" : "#ff9b8d");
}

function summonBaseStormCloud(side, target) {
  const data = UNIT.stormLich;
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  state.stormClouds.push({
    type: "attack",
    x: target.x,
    y: FIELD.ground - 230,
    side,
    radius: data.cloudRadius,
    life: data.cloudDuration,
    duration: data.cloudDuration,
    boltTimer: 0,
    boltsLeft: data.boltCount,
    boltEvery: data.boltEvery,
    damage: BASE_ATTACK.elementStormDamage,
    slow: data.boltSlow,
    slowDuration: data.boltSlowDuration,
  });
  popText(baseX, FIELD.ground - 165, "基地乌云", side === "player" ? "#9fc0ff" : "#ff9b8d");
}

function launchBaseBoulder(side, target) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  state.arrows.push({
    x: baseX,
    y: FIELD.ground - 130,
    tx: target.x,
    ty: target.y ? target.y - 42 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 110,
    side,
    damage: BASE_ATTACK.chaosDamage,
    splash: BASE_ATTACK.chaosSplash,
    aoeLimit: BASE_ATTACK.chaosLimit,
    stun: BASE_ATTACK.chaosStun,
    target,
    life: 0.8,
    type: "boulder",
  });
  popText(baseX, FIELD.ground - 165, "基地投石", side === "player" ? "#9fc0ff" : "#ff9b8d");
}

function updateUnits(dt) {
  for (const unit of state.units) {
    const data = UNIT[unit.type];
    const beforeX = unit.x;
    const beforeY = unit.y;
    if (unit.merging) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (sendUnitOutOfBase(unit, dt)) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (isUnitHidden(unit)) {
      if (unit.side === "player" && state.command === "retreat") continue;
      unit.inCastle = false;
    }
    updateChaosSurvivalHpTrait(unit, dt);
    unit.cooldown = Math.max(0, unit.cooldown - dt * getAttackSpeedFactor(unit));
    unit.spearRecoverTimer = Math.max(0, unit.spearRecoverTimer - dt);
    unit.medusaSlayTimer = Math.max(0, unit.medusaSlayTimer - dt);
    unit.controlTimer = Math.max(0, (unit.controlTimer ?? 0) - dt);
    unit.stunTimer = Math.max(0, unit.stunTimer - dt);
    unit.combatTimer = Math.max(0, unit.combatTimer - dt);
    if (unit.timedLife !== undefined) {
      unit.timedLife = Math.max(0, unit.timedLife - dt);
      if (unit.timedLife <= 0) {
        unit.expired = true;
        unit.noCorpse = true;
        unit.hp = 0;
      }
    }
    if (unit.type === "wraithMiner") {
      unit.hp -= (UNIT.wraithMiner.lifeDrainPerSecond ?? 2) * dt;
      if (unit.hp <= 0) {
        unit.noCorpse = true;
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
    }
    unit.chaosWarCryTimer = Math.max(0, (unit.chaosWarCryTimer ?? 0) - dt);
    unit.retaliateTimer = Math.max(0, (unit.retaliateTimer ?? 0) - dt);
    if (unit.retaliateTimer <= 0) unit.retaliateTargetId = null;
    unit.rageTimer = Math.max(0, (unit.rageTimer ?? 0) - dt);
    unit.swordsmanSelfRageTimer = Math.max(0, (unit.swordsmanSelfRageTimer ?? 0) - dt);
    unit.spartanShieldCooldown = Math.max(0, (unit.spartanShieldCooldown ?? 0) - dt);
    unit.orderMarkTimer = Math.max(0, (unit.orderMarkTimer ?? 0) - dt);
    if (unit.orderMarkTimer <= 0) unit.orderMarkSide = null;
    unit.barricadeBuildCooldown = Math.max(0, (unit.barricadeBuildCooldown ?? 0) - dt);
    unit.covenantSaveTimer = Math.max(0, (unit.covenantSaveTimer ?? 0) - dt);
    unit.covenantDamageReductionTimer = Math.max(0, (unit.covenantDamageReductionTimer ?? 0) - dt);
    if (unit.covenantDamageReductionTimer <= 0) unit.covenantDamageReduction = 0;
    if (unit.spartanShieldTimer > 0) {
      unit.spartanShieldTimer = Math.max(0, unit.spartanShieldTimer - dt);
      if (unit.spartanShieldTimer <= 0) finishSpartanShield(unit);
    }
    unit.inspiredReviveTimer = Math.max(0, (unit.inspiredReviveTimer ?? 0) - dt);
    if (unit.inspiredReviveTimer <= 0) unit.inspiredReviveReady = false;
    unit.inspiredZombieTimer = Math.max(0, (unit.inspiredZombieTimer ?? 0) - dt);
    if (unit.inspiredZombieTimer <= 0) unit.inspiredZombieHits = 0;
    unit.inspiredLifestealTimer = Math.max(0, (unit.inspiredLifestealTimer ?? 0) - dt);
    unit.fearTimer = Math.max(0, (unit.fearTimer ?? 0) - dt);
    if (unit.fearTimer <= 0) unit.fearDamageMultiplier = 1;
    unit.neuralRetreatTimer = Math.max(0, (unit.neuralRetreatTimer ?? 0) - dt);
    if (unit.neuralRetreatTimer <= 0) unit.neuralRetreatFromSide = null;
    if ((unit.stoneGolemTimer ?? 0) > 0) {
      unit.stoneGolemTimer = Math.max(0, unit.stoneGolemTimer - dt);
      if (unit.stoneGolemTimer <= 0) restoreMageStoneGolem(unit);
    }
    unit.reaperStealthTimer = Math.max(0, (unit.reaperStealthTimer ?? 0) - dt);
    unit.heavyAntDodgeTimer = Math.max(0, (unit.heavyAntDodgeTimer ?? 0) - dt);
    if (unit.heavyAntDodgeTimer <= 0) unit.heavyAntDodge = false;
    unit.scimitarRoarTimer = Math.max(0, (unit.scimitarRoarTimer ?? 0) - dt);
    unit.goblinMineTimer = Math.max(0, (unit.goblinMineTimer ?? 0) - dt);
    unit.goblinExpertArmorTimer = Math.max(0, (unit.goblinExpertArmorTimer ?? 0) - dt);
    unit.shamanThornTimer = Math.max(0, (unit.shamanThornTimer ?? 0) - dt);
    unit.shamanRegenTimer = Math.max(0, (unit.shamanRegenTimer ?? 0) - dt);
    unit.monkFieldTimer = Math.max(0, (unit.monkFieldTimer ?? 0) - dt);
    updateUnitRegen(unit, dt);
    unit.priestSiphonTimer = Math.max(0, (unit.priestSiphonTimer ?? 0) - dt);
    unit.priestBloodTimer = Math.max(0, (unit.priestBloodTimer ?? 0) - dt);
    unit.undeadLureTimer = Math.max(0, (unit.undeadLureTimer ?? 0) - dt);
    unit.luredTimer = Math.max(0, (unit.luredTimer ?? 0) - dt);
    if (unit.luredTimer <= 0) unit.luredBySide = null;
    unit.heavyArmorTimer = Math.max(0, (unit.heavyArmorTimer ?? 0) - dt);
    if (unit.heavyArmorTimer <= 0) unit.heavyArmorReduction = 0;
    unit.minotaurLeapTimer = Math.max(0, (unit.minotaurLeapTimer ?? 0) - dt);
    unit.darkKnightChargeTimer = Math.max(0, (unit.darkKnightChargeTimer ?? 0) - dt);
    unit.hornBeastAttackTimer = Math.max(0, (unit.hornBeastAttackTimer ?? 0) - dt);
    unit.hornRiderAttackTimer = Math.max(0, (unit.hornRiderAttackTimer ?? 0) - dt);
    unit.shieldTimer = Math.max(0, (unit.shieldTimer ?? 0) - dt);
    unit.stormSlowTimer = Math.max(0, (unit.stormSlowTimer ?? 0) - dt);
    if (unit.stormSlowTimer <= 0) unit.stormSlowFactor = 1;
    unit.vulnerabilityTimer = Math.max(0, (unit.vulnerabilityTimer ?? 0) - dt);
    if (unit.vulnerabilityTimer <= 0) unit.vulnerabilityBonus = 0;
    unit.boneStingerBurrowCooldown = Math.max(0, (unit.boneStingerBurrowCooldown ?? 0) - dt);
    unit.boneStingerBurrowTimer = Math.max(0, (unit.boneStingerBurrowTimer ?? 0) - dt);
    unit.spiderWebCooldown = Math.max(0, (unit.spiderWebCooldown ?? 0) - dt);
    unit.anim += dt * 8;

    if (unit.inspiringTimer > 0) {
      unit.inspiringTimer = Math.max(0, unit.inspiringTimer - dt);
      if (unit.inspiringTimer <= 0) finishBannerInspire(unit);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.barricadeBuildTimer > 0) {
      unit.barricadeBuildTimer = Math.max(0, unit.barricadeBuildTimer - dt);
      if (unit.barricadeBuildTimer <= 0) finishBuildBarricade(unit);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.stunTimer > 0 || unit.frozenBy) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.controlLockTimer > 0) {
      unit.controlLockTimer = Math.max(0, unit.controlLockTimer - dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.spartanShieldTimer > 0) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if ((unit.swarmEvolutionTimer ?? 0) > 0) {
      unit.swarmEvolutionTimer = Math.max(0, unit.swarmEvolutionTimer - dt);
      if (unit.swarmEvolutionTimer <= 0) finishSwarmEvolution(unit);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.luredTimer > 0) {
      updateLuredUnit(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.neuralRetreatTimer > 0) {
      updateNeuralRetreatUnit(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (state.fourWay) {
      if (unit.type === "goblin" && updateGoblin(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (unit.type === "goblinExpert") updateGoblinExpert(unit);
      if (unit.type === "shaman") updateShaman(unit);
      if (unit.type === "priest") updatePriest(unit);
      if (unit.type === "necromancer") updateNecromancer(unit, dt);
      if (unit.type === "bannerBearer") updateBannerBearer(unit, dt);
      if (unit.type === "graveDigger") updateGraveDigger(unit, dt);
      if (unit.type === "candlelight") updateCandlelight(unit);
      if (unit.type === "reaper") updateReaper(unit);
      if (unit.type === "antQueen") updateAntQueen(unit, dt);
      if (isSwarmSpawner(unit)) updateSwarmSpawner(unit, dt);
      if (isManuallyControlled(unit)) {
        updateManualControlledUnit(unit, dt);
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (updateGroupAttackUnit(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (unit.type === "summoner") {
        updateSummoner(unit, dt);
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (unit.type === "wraithMiner") {
        updateWraithMiner(unit, dt);
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (unit.type === "miner" || unit.type === "gnawMiner") {
        updateMiner(unit, dt);
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      updateFourWayUnit(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "goblin" && updateGoblin(unit, dt)) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "goblinExpert") {
      updateGoblinExpert(unit);
    }
    if (unit.type === "shaman") {
      updateShaman(unit);
    }
    if (unit.type === "priest") {
      updatePriest(unit);
    }
    if (unit.type === "necromancer") {
      updateNecromancer(unit, dt);
    }
    if (unit.type === "antQueen") {
      updateAntQueen(unit, dt);
    }
    if (isSwarmSpawner(unit)) {
      updateSwarmSpawner(unit, dt);
    }
    if (isManuallyControlled(unit)) {
      updateManualControlledUnit(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (updateGroupAttackUnit(unit, dt)) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (shouldEnterPlayerCastle(unit)) {
      if (moveTowardCastle(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
    }
    if (isPlayerForcedGuarding(unit)) {
      moveTowardGuardLine(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "waterElement" && unit.boundTargetId) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "treeEnt") {
      updateTreeEnt(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "rog") {
      updateRog(unit, dt);
    }
    if (unit.type === "monk") {
      updateMonk(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "vUnit") {
      if (updateV(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
    }
    if (unit.type === "medusa") {
      updateMedusa(unit, dt);
    }
    if (unit.type === "undeadMage") {
      updateUndeadMage(unit, dt);
    }
    if (unit.type === "bannerBearer") {
      updateBannerBearer(unit, dt);
    }
    if (unit.type === "graveDigger") {
      updateGraveDigger(unit, dt);
    }
    if (unit.type === "candlelight") {
      updateCandlelight(unit);
    }
    if (unit.type === "reaper") {
      updateReaper(unit);
    }
    if (unit.type === "deathGodClone") {
      updateDeathGodClone(unit, dt);
    }
    if (unit.type === "scimitarWarrior") {
      updateScimitarWarrior(unit);
    }
    if (unit.type === "griffinBomber") {
      updateGriffinBomber(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "ghoul" && updateGhoul(unit, dt)) {
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "ironCavalry") {
      updateIronCavalry(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }
    if (unit.type === "suikai") {
      updateSuikai(unit, dt);
    }
    if (unit.type === "zeus") {
      updateZeus(unit, dt);
    }
    if (unit.type === "archmage") {
      updateArchmage(unit, dt);
    }
    if (unit.type === "prometheus") {
      updatePrometheus(unit, dt);
    }
    if (unit.type === "berserker") {
      updateBerserker(unit, dt);
    }
    if (unit.type === "linghan") {
      updateLinghan(unit, dt);
    }
    if (unit.type === "hurricane") {
      updateHurricane(unit, dt);
    }
    if (unit.type === "hill") {
      updateHill(unit, dt);
    }
    if (unit.type === "electricGate") {
      updateElectricGate(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "summoner") {
      updateSummoner(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "wraithMiner") {
      updateWraithMiner(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "miner" || unit.type === "gnawMiner") {
      updateMiner(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (unit.type === "swarmWorm") {
      updateSwarmWorm(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    const target = isPlayerRetreating(unit) ? null : findTarget(unit);
    updateSiegeBlindTarget(unit, target);
    const statueTarget = getForcedStatueTarget(unit, target);
    const activeTarget = statueTarget ?? target;
    const desiredX = getDesiredX(unit, activeTarget);
    const desiredPoint = getDesiredPoint(unit, activeTarget, desiredX);
    const distance = distanceTo(unit.x, unit.y, desiredPoint.x, desiredPoint.y);
    const moveTolerance = getMoveTolerance(unit, activeTarget, desiredX);

    const range = getUnitRange(unit);
    const mustReachTowerRally = isTowerRallyCommand(unit) && !isInsideTowerCaptureArea(unit);

    if (unit.type === "rocketCart") {
      if (!mustReachTowerRally && updateRocketCart(unit, activeTarget, range, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
        continue;
      }
      if (distance > moveTolerance) {
        moveRocketCartToward(unit, desiredPoint, dt);
      }
      updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
      continue;
    }

    if (!mustReachTowerRally && activeTarget && canAttackFromDistance(unit, activeTarget, range)) {
      attack(unit, activeTarget);
    } else if (!mustReachTowerRally && activeTarget && activeTarget.kind === "statue" && Math.abs(unit.x - activeTarget.x) <= getStatueAttackReach(unit)) {
      attack(unit, activeTarget);
    } else if (unit.side === "enemy" && state.enemyCommand === "guard") {
      moveTowardGuardLine(unit, dt);
    } else if (distance > moveTolerance) {
      const tolerance = unit.side === "player" && state.command === "attack" && state.attackIntent === "tower" && !activeTarget
        ? getTowerPointTolerance(unit)
        : 5;
      moveUnitTowardPoint(unit, desiredPoint.x, desiredPoint.y, unit.speed ?? data.speed, dt, tolerance);
    }
    updateIceRoadMoveTimer(unit, beforeX, beforeY, dt);
  }
  if (state.inspectedUnitTimer > 0) {
    if (state.inspectedUnitId !== state.controlledUnitId) {
      state.inspectedUnitTimer = Math.max(0, state.inspectedUnitTimer - dt);
    }
    const inspected = state.units.find((unit) => unit.id === state.inspectedUnitId && unit.hp > 0);
    if (!inspected || isUnitHidden(inspected)) {
      state.inspectedUnitId = null;
      state.inspectedUnitTimer = 0;
    }
  }
}

function updateChaosSurvivalHpTrait(unit, dt) {
  if (!unit || unit.hp <= 0 || factionForSide(unit.side) !== "chaos") return;
  if (isUnitHidden(unit) || UNIT[unit.type]?.untargetable || unit.timedLife !== undefined) return;
  unit.chaosSurvivalTimer = (unit.chaosSurvivalTimer ?? 0) + dt;
  while (unit.chaosSurvivalTimer >= CHAOS_SURVIVAL_HP_TRAIT.interval) {
    unit.chaosSurvivalTimer -= CHAOS_SURVIVAL_HP_TRAIT.interval;
    const oldMax = unit.maxHp;
    unit.maxHp = Math.max(1, Math.round(unit.maxHp * CHAOS_SURVIVAL_HP_TRAIT.factor));
    unit.hp = Math.max(1, Math.round(unit.hp * CHAOS_SURVIVAL_HP_TRAIT.factor));
    unit.chaosSurvivalStacks = (unit.chaosSurvivalStacks ?? 0) + 1;
    const gained = unit.maxHp - oldMax;
    if (gained > 0) popText(unit.x, unit.y - 112, `混沌成长 +${gained}`, "#ff8a3d");
  }
}

function updateManualControlState() {
  if (!state.controlledUnitId) return;
  const unit = getControlledUnit();
  if (unit && !isUnitHidden(unit)) return;
  state.controlledUnitId = null;
  state.pendingManualAction = null;
  state.manualMoveTarget = null;
  stopManualJoystick();
}

function updateFourWayUnit(unit, dt) {
  const data = UNIT[unit.type] ?? {};
  if (unit.type === "treeEnt" && unit.rooted) return;
  if (unit.type === "electricGate" || data.immobile) return;
  if (UNIT[unit.type]?.statueOnly) return;

  const target = findFourWayTarget(unit);
  if (!target) return;
  unit.fourWayFocusSide = target.kind === "statue" ? target.side : target.side ?? null;
  const range = target.kind === "statue" ? getStatueAttackReach(unit) : getUnitRange(unit);
  if (canAttackFromDistance(unit, target, range)) {
    attack(unit, target);
    return;
  }
  const point = getFourWayApproachPoint(unit, target, range);
  unit.facingDir = point.x >= unit.x ? 1 : -1;
  moveUnitTowardPoint(unit, point.x, point.y, unit.speed ?? data.speed ?? 0, dt, 6);
  clampUnitPosition(unit);
}

function findFourWayTarget(unit) {
  if (isUnitHidden(unit) || isReaperStealthed(unit)) return null;
  if (unit.type === "goblin" || unit.type === "goblinExpert" || unit.type === "shaman") return findNearestEnemyBaseTarget(unit);
  let nearest = null;
  let nearestDistance = Infinity;
  for (const other of state.units) {
    if (!areFourWayEnemies(unit.side, other.side) || other.hp <= 0 || isUnitHidden(other) || !canTarget(unit, other)) continue;
    const distance = distanceTo(unit.x, unit.y, other.x, other.y);
    if (distance < nearestDistance) {
      nearest = other;
      nearestDistance = distance;
    }
  }
  const baseTarget = findNearestEnemyBaseTarget(unit);
  if (!nearest) return baseTarget;
  if (!baseTarget) return nearest;
  const baseDistance = distanceTo(unit.x, unit.y, baseTarget.x, baseTarget.y);
  return nearestDistance <= Math.max(360, getUnitRange(unit) + 60) || nearestDistance < baseDistance ? nearest : baseTarget;
}

function findNearestEnemyBaseTarget(unit) {
  const enemies = state.fourWaySides.filter((ai) => areFourWayEnemies(unit.side, ai.side) && ai.alive);
  const target = enemies
    .map((ai) => ({ ai, base: FOUR_WAY_BASES[ai.side], hp: state.fourWayBaseHp[ai.side] ?? 0 }))
    .filter((item) => item.hp > 0)
    .sort((a, b) => getFourWayBaseTargetScore(unit, a) - getFourWayBaseTargetScore(unit, b))[0];
  if (!target) return null;
  state.fourWayPressure[target.ai.side] = (state.fourWayPressure[target.ai.side] ?? 0) + 0.02;
  return { kind: "statue", side: target.ai.side, x: target.base.x, y: target.base.y };
}

function getFourWayBaseTargetScore(unit, item) {
  const distance = distanceTo(unit.x, unit.y, item.base.x, item.base.y);
  const hpRatio = Math.max(0, Math.min(1, item.hp / STATUE_MAX_HP));
  const pressure = state.fourWayPressure?.[item.ai.side] ?? 0;
  const teamCount = state.units.filter((other) => other.side === unit.side && other.hp > 0 && other.fourWayFocusSide === item.ai.side).length;
  return distance + hpRatio * 180 + pressure * 90 + teamCount * 75 + getStableFourWayTargetJitter(unit, item.ai.side);
}

function getStableFourWayTargetJitter(unit, targetSide) {
  const sideIndex = FOUR_WAY_SIDES.indexOf(targetSide);
  const seed = (unit.id * 37 + Math.max(0, sideIndex) * 53) % 97;
  return seed * 0.82;
}

function getFourWayApproachPoint(unit, target, range) {
  const dx = target.x - unit.x;
  const dy = (target.y ?? unit.y) - unit.y;
  const distance = Math.hypot(dx, dy) || 1;
  const stop = Math.max(24, Math.min(range - 4, target.kind === "statue" ? 85 : 70));
  return {
    x: target.x - (dx / distance) * stop,
    y: (target.y ?? unit.y) - (dy / distance) * stop,
  };
}

function isManuallyControlled(unit) {
  return Boolean(unit?.id && state.controlledUnitId === unit.id);
}

function getControlledUnit() {
  if (!state?.controlledUnitId) return null;
  return state.units.find((unit) => unit.id === state.controlledUnitId && unit.hp > 0) ?? null;
}

function updateManualControlledUnit(unit, dt) {
  const data = UNIT[unit.type] ?? {};
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  Object.keys(unit.manualSkillCooldowns).forEach((key) => {
    unit.manualSkillCooldowns[key] = Math.max(0, unit.manualSkillCooldowns[key] - dt);
  });
  if (unit.type === "ghoul" && updateGhoul(unit, dt)) return;
  if (unit.type === "vUnit") {
    updateVClones(unit, dt);
    updateVControlLink(unit);
  }
  if (unit.type === "archmage") updateHeroBlink(unit, UNIT.archmage);
  if (unit.type === "treeEnt" && unit.rooted) return;
  if (unit.type === "electricGate" || data.immobile) return;

  const joystickX = Math.abs(manualJoystick.vector.x) > 0.05 ? manualJoystick.vector.x : 0;
  const joystickY = Math.abs(manualJoystick.vector.y) > 0.05 ? manualJoystick.vector.y : 0;
  const dx = (manualKeys.right ? 1 : 0) - (manualKeys.left ? 1 : 0) + joystickX;
  const dy = (manualKeys.down ? 1 : 0) - (manualKeys.up ? 1 : 0) + joystickY;
  const speed = isMiningWorker(unit) ? getMinerMoveSpeed(unit) : (unit.speed ?? data.speed ?? 0);
  unit.inCastle = false;
  unit.mineSlotId = null;
  unit.mineWorkSlot = null;
  unit.goldRushMineId = null;
  if (!dx && !dy) {
    if (!state.manualMoveTarget) return;
    unit.facingDir = state.manualMoveTarget.x >= unit.x ? 1 : -1;
    const moving = moveUnitTowardPoint(unit, state.manualMoveTarget.x, state.manualMoveTarget.y, speed, dt, 6);
    clampUnitPosition(unit);
    if (!moving) state.manualMoveTarget = null;
    return;
  }

  state.manualMoveTarget = null;
  if (Math.abs(dx) > 0.05) unit.facingDir = dx >= 0 ? 1 : -1;
  const distance = Math.hypot(dx, dy) || 1;
  unit.x += (dx / distance) * speed * getMoveFactor(unit) * dt;
  unit.y += (dy / distance) * speed * getMoveFactor(unit) * dt;
  clampUnitPosition(unit);
}

function stopManualJoystick() {
  manualJoystick.pointerId = null;
  manualJoystick.active = false;
  manualJoystick.center = null;
  manualJoystick.knob = null;
  manualJoystick.vector = { x: 0, y: 0 };
}

function getSelectedGroupUnits() {
  if (!state?.selectedGroupIds?.length) return [];
  const ids = new Set(state.selectedGroupIds);
  return state.units.filter((unit) =>
    ids.has(unit.id) &&
    unit.hp > 0 &&
    isPlayerControlledSide(unit.side) &&
    !isUnitHidden(unit) &&
    !UNIT[unit.type]?.untargetable &&
    (!state.selectedGroupType || unit.type === state.selectedGroupType)
  );
}

function clearSelectedGroup() {
  if (!state) return;
  state.selectedGroupIds = [];
  state.selectedGroupType = null;
  state.pendingGroupAction = null;
  state.groupAttackTargetId = null;
  state.groupMoveTarget = null;
}

function updateGroupSelectionState() {
  if (!state.selectedGroupIds?.length) return;
  const units = getSelectedGroupUnits();
  if (!units.length) {
    clearSelectedGroup();
    return;
  }
  state.selectedGroupIds = units.map((unit) => unit.id);
  const target = getGroupAttackTarget();
  if (state.groupAttackTargetId && !target) state.groupAttackTargetId = null;
}

function getGroupAttackTarget() {
  if (!state?.groupAttackTargetId) return null;
  return state.units.find((unit) =>
    unit.id === state.groupAttackTargetId &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !UNIT[unit.type]?.untargetable
  ) ?? null;
}

function isSelectedGroupUnit(unit) {
  return Boolean(unit?.id && state.selectedGroupIds?.includes(unit.id));
}

function updateGroupAttackUnit(unit, dt) {
  if (!isSelectedGroupUnit(unit) || !isPlayerControlledSide(unit.side)) return false;
  const target = getGroupAttackTarget();
  if (!target || target.side === unit.side) return updateGroupMoveUnit(unit, dt);
  if (!canTarget(unit, target)) return updateGroupMoveUnit(unit, dt);

  unit.inCastle = false;
  unit.mineSlotId = null;
  unit.mineWorkSlot = null;
  unit.goldRushMineId = null;

  const range = getUnitRange(unit);
  if (canAttackFromDistance(unit, target, range)) {
    attack(unit, target);
    return true;
  }

  const data = UNIT[unit.type] ?? {};
  const direction = state?.fourWay ? (unit.x <= target.x ? -1 : 1) : (unit.side === "player" ? -1 : 1);
  const approach = Math.max(24, Math.min(Math.max(range - 8, 28), 90));
  const x = target.x + direction * approach;
  unit.facingDir = target.x >= unit.x ? 1 : -1;
  moveUnitTowardPoint(unit, x, target.y, unit.speed ?? data.speed ?? 0, dt, 8);
  return true;
}

function updateGroupMoveUnit(unit, dt) {
  if (!state.groupMoveTarget) return false;
  const data = UNIT[unit.type] ?? {};
  if ((unit.type === "treeEnt" && unit.rooted) || unit.type === "electricGate" || data.immobile) return true;
  unit.inCastle = false;
  unit.mineSlotId = null;
  unit.mineWorkSlot = null;
  unit.goldRushMineId = null;
  const point = getGroupMovePoint(unit);
  unit.facingDir = point.x >= unit.x ? 1 : -1;
  const reached = !moveUnitTowardPoint(unit, point.x, point.y, unit.speed ?? data.speed ?? 0, dt, 8);
  if (reached && getSelectedGroupUnits().every((ally) => distanceTo(ally.x, ally.y, getGroupMovePoint(ally).x, getGroupMovePoint(ally).y) <= 14)) {
    state.groupMoveTarget = null;
  }
  return true;
}

function getGroupMovePoint(unit) {
  const target = state.groupMoveTarget ?? { x: unit.x, y: unit.y };
  const units = getSelectedGroupUnits();
  const index = Math.max(0, units.findIndex((ally) => ally.id === unit.id));
  const column = index % 5;
  const row = Math.floor(index / 5);
  return {
    x: target.x + (column - 2) * 18,
    y: target.y + (row - 1) * 22,
  };
}

function getCollisionRadius(unit) {
  const data = UNIT[unit.type] ?? {};
  if (data.collisionRadius) return data.collisionRadius;
  if (data.giant) return 24;
  if (unit.type === "treeEnt") return 25;
  if (unit.type === "rocketCart" || unit.type === "catapult" || unit.type === "undeadCatapult") return 28;
  return 12 * (data.visualScale ?? 1);
}

function clampUnitPosition(unit) {
  const pad = getCollisionRadius(unit);
  if (state?.fourWay) {
    unit.x = Math.max(pad + 30, Math.min(FIELD.width - pad - 30, unit.x));
    unit.y = Math.max(FOUR_WAY_FIELD.minY, Math.min(FOUR_WAY_FIELD.maxY, unit.y));
    return;
  }
  unit.x = Math.max(FIELD.playerBase + pad, Math.min(FIELD.enemyBase - pad, unit.x));
  unit.y = Math.max(FIELD.ground - 170, Math.min(FIELD.ground + 150, unit.y));
}

function updateHurricane(unit, dt) {
  const data = UNIT.hurricane;
  unit.shieldCastTimer = Math.max(0, (unit.shieldCastTimer ?? data.shieldEvery) - dt);
  if (unit.shieldCastTimer > 0) return;

  const candidates = state.units
    .filter((ally) => ally.side === unit.side && ally.hp > 0 && !isUnitHidden(ally) && !UNIT[ally.type]?.untargetable && ally.shieldTimer <= 0)
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
  const target = candidates[0];
  if (!target) {
    unit.shieldCastTimer = 1;
    return;
  }

  target.shieldTimer = data.shieldDuration;
  target.shieldReduction = data.shieldReduction;
  unit.shieldCastTimer = data.shieldEvery;
  popText(target.x, target.y - 105, "风盾", "#9ee8ff");
}

function updateLinghan(unit, dt) {
  const data = UNIT.linghan;
  unit.linghanFreezeTimer = Math.max(0, (unit.linghanFreezeTimer ?? 0) - dt);
  if (unit.linghanFreezeTimer > 0) return;

  const targets = state.units
    .filter((enemy) => canLinghanFreeze(unit, enemy))
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))
    .slice(0, data.freezeCount);
  if (!targets.length) return;

  targets.forEach((target) => applyTimedFreeze(unit, target, data.freezeDuration, data.freezeDps));
  unit.linghanFreezeTimer = data.freezeDuration + data.freezeCooldown;
  popText(unit.x, unit.y - 116, `凌寒冰封 x${targets.length}`, "#9ee8ff");
}

function canLinghanFreeze(unit, target) {
  if (!target || target.kind === "statue" || target.side === unit.side || target.hp <= 0 || isUnitHidden(target)) return false;
  const data = UNIT[target.type];
  if (!data || target.frozenBy || data.freezeImmune || data.giant || isHeroUnit(target)) return false;
  if (isSiegeUnit(target) || target.type === "electricGate") return false;
  if (!isAheadOf(unit, target)) return false;
  return Math.abs(target.x - unit.x) <= UNIT.linghan.range;
}

function applyTimedFreeze(source, target, duration, dps) {
  target.frozenBy = source.id;
  target.frozenTimer = duration;
  target.frozenTick = 0;
  target.freezeDps = dps;
  popText(target.x, target.y - 92, "远程冰冻", "#9ee8ff");
}

function healLinghanFromDamage(source, damage) {
  const data = UNIT.linghan;
  let remaining = damage;
  if (source.hp < source.maxHp) {
    const healed = Math.min(remaining, source.maxHp - source.hp);
    source.hp += healed;
    remaining -= healed;
    if (healed > 0) popText(source.x, source.y - 110, `寒愈 +${healed}`, "#9ee8ff");
  }
  if (remaining <= 0) return;

  const allies = state.units
    .filter((ally) => ally.side === source.side && ally !== source && ally.hp > 0 && ally.hp < ally.maxHp && !isUnitHidden(ally) && Math.abs(ally.x - source.x) <= data.healRadius)
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
  for (const ally of allies) {
    if (remaining <= 0) break;
    const healed = Math.min(remaining, ally.maxHp - ally.hp);
    ally.hp += healed;
    remaining -= healed;
    if (healed > 0) popText(ally.x, ally.y - 94, `寒愈 +${healed}`, "#9ee8ff");
  }
}

function updateRocketCart(unit, target, range, dt) {
  const data = UNIT.rocketCart;
  if (unit.rocketAmmo <= 0) {
    if (unit.rocketReloadTimer <= 0) {
      unit.rocketReloadTimer = data.reloadEvery;
      popText(unit.x, unit.y - 112, "开始装填", "#ffce7a");
    }
    unit.rocketReloadTimer = Math.max(0, unit.rocketReloadTimer - dt);
    if (unit.rocketReloadTimer <= 0) {
      unit.rocketAmmo = data.ammoPerReload;
      popText(unit.x, unit.y - 112, `装填 ${unit.rocketAmmo}`, "#ffce7a");
    }
    return false;
  }

  unit.rocketFireTimer = Math.max(0, (unit.rocketFireTimer ?? 0) - dt);
  if (!target || !canAttackFromDistance(unit, target, range) || unit.rocketFireTimer > 0) return false;

  fireRocketArrow(unit, target);
  unit.rocketAmmo -= 1;
  unit.rocketFireTimer = data.fireInterval;
  unit.combatTimer = 3;
  return true;
}

function updateHill(unit, dt) {
  const data = UNIT.hill;
  unit.hillJumpTimer = Math.max(0, (unit.hillJumpTimer ?? data.jumpEvery) - dt);
  if (unit.hillJumpTimer > 0) return;

  const enemies = getUnitsInRadius(unit.x, data.jumpRadius, unit.side, AOE_TARGET_LIMIT);
  if (!enemies.length) return;

  unit.hillJumpTimer = data.jumpEvery;
  enemies.forEach((enemy) => {
    applyDamage(enemy, data.jumpDamage, unit.side);
    applyStun(enemy, data.jumpStun);
  });
  state.blasts.push({ x: unit.x, y: unit.y - 26, radius: data.jumpRadius, life: 0.42, duration: 0.42, color: "#c0a36d" });
  popText(unit.x, unit.y - 118, "大跳", "#c0a36d");
}

function moveRocketCartToward(unit, desiredPoint, dt) {
  const data = UNIT.rocketCart;
  const minX = FIELD.playerBase + 18;
  const maxX = FIELD.enemyBase - 18;
  const targetX = Math.max(minX, Math.min(maxX, desiredPoint.x));
  moveUnitTowardPoint(unit, targetX, desiredPoint.y, unit.speed ?? data.speed, dt, 5);
  unit.x = Math.max(minX, Math.min(maxX, unit.x));
}

function updateTreeEnt(unit, dt) {
  if (unit.side === "enemy") updateEnemyTreeRoot(unit);

  if (unit.rooted) {
    unit.summonTimer -= dt;
    const activeScorpions = state.units.filter(
      (candidate) => candidate.side === unit.side && candidate.type === "waterScorpion" && candidate.summonerId === unit.id && candidate.hp > 0,
    ).length;

    if (unit.summonTimer <= 0 && activeScorpions < UNIT.treeEnt.summonLimit) {
      const spawnX = unit.x + (unit.side === "player" ? 34 : -34);
      spawnUnit("waterScorpion", unit.side, spawnX);
      state.units[state.units.length - 1].summonerId = unit.id;
      unit.hp -= UNIT.treeEnt.summonDamage;
      unit.summonTimer = UNIT.treeEnt.summonEvery;
      popText(unit.x, unit.y - 105, `召唤水蝎子 -${UNIT.treeEnt.summonDamage}生命`, "#8ee0cf");
    }
  }

  const target = findTarget(unit);
  if (target && Math.abs(unit.x - target.x) <= UNIT.treeEnt.range) {
    attack(unit, target);
    return;
  }

  if (!unit.rooted) {
    const desiredX = getDesiredX(unit, target);
    if (Math.abs(unit.x - desiredX) > 4) {
      unit.x += Math.sign(desiredX - unit.x) * UNIT.treeEnt.speed * getMoveFactor(unit) * dt;
    }
  }
}

function updateEnemyTreeRoot(unit) {
  const nearbyEnemy = state.units.some((target) => target.side !== unit.side && target.hp > 0 && Math.abs(target.x - unit.x) <= UNIT.treeEnt.range + 35);
  const activeScorpions = state.units.filter(
    (candidate) => candidate.side === unit.side && candidate.type === "waterScorpion" && candidate.summonerId === unit.id && candidate.hp > 0,
  ).length;
  const shouldRoot = nearbyEnemy || (activeScorpions < UNIT.treeEnt.summonLimit && state.enemyGold >= UNIT.treeEnt.summonDamage && state.enemyAttackMood > 18);

  if (shouldRoot && !unit.rooted) {
    unit.rooted = true;
    unit.summonTimer = Math.min(unit.summonTimer, UNIT.treeEnt.summonEvery);
    popText(unit.x, unit.y - 120, "扎根召唤", "#8ee0cf");
  } else if (!shouldRoot && unit.rooted) {
    unit.rooted = false;
    killTreeScorpions(unit);
    popText(unit.x, unit.y - 120, "拔根前进", "#8ee0cf");
  }
}

function updateRog(unit, dt) {
  unit.magmaTimer -= dt;
  if (unit.magmaTimer > 0) return;

  unit.magmaTimer = UNIT.rog.magmaEvery;
  getUnitsInRadius(unit.x, UNIT.rog.magmaRadius, unit.side).forEach((target) => {
    applyBurn(target, UNIT.rog.burnDps, UNIT.rog.burnDuration);
  });
  state.blasts.push({ x: unit.x, y: unit.y - 22, radius: UNIT.rog.magmaRadius, life: 0.5, duration: 0.5, color: "#ff7a3d" });
  popText(unit.x, unit.y - 115, "岩浆喷发", "#ff7a3d");
}

function updateMedusa(unit, dt) {
  unit.medusaPoisonTimer -= dt;
  if (unit.medusaPoisonTimer > 0) return;

  unit.medusaPoisonTimer = UNIT.medusa.poisonEvery;
  sprayMedusaPoison(unit);
  releaseMedusaCorpses(unit);
}

function sprayMedusaPoison(unit) {
  const data = UNIT.medusa;
  const dir = unit.side === "player" ? 1 : -1;
  const start = Math.min(unit.x, unit.x + dir * data.poisonRange);
  const end = Math.max(unit.x, unit.x + dir * data.poisonRange);
  const targets = state.units.filter((target) => {
    if (target.side === unit.side || target.hp <= 0 || isUnitHidden(target)) return false;
    return target.x >= start && target.x <= end;
  });

  targets.forEach((target) => applyPoison(target, data.poisonDps, data.poisonDuration));
  state.blasts.push({ x: unit.x + dir * data.poisonRange * 0.5, y: unit.y - 42, radius: data.poisonRange * 0.45, life: 0.38, duration: 0.38, color: "#93d96b" });
  popText(unit.x, unit.y - 112, "石蛇毒雾", "#93d96b");
}

function releaseMedusaCorpses(unit) {
  const data = UNIT.medusa;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < data.corpseReleaseCount; i += 1) {
    const corpse = spawnUnit("deadCorpse", unit.side, unit.x + dir * (34 + i * 22));
    corpse.y = unit.y + (i === 0 ? -10 : 10);
    corpse.summonerId = unit.id;
    corpse.forceCharge = true;
  }
  popText(unit.x, unit.y - 132, "释放死尸", "#93d96b");
}

function updateElectricGate(unit, dt) {
  const data = UNIT.electricGate;
  unit.electricGateTimer -= dt;
  unit.electricGateTick -= dt;

  if (unit.electricGateTimer <= 0) {
    unit.expired = true;
    unit.noCorpse = true;
    unit.hp = 0;
    return;
  }

  if (unit.electricGateTick > 0) return;
  unit.electricGateTick += data.cooldown;
  const target = findTarget(unit);
  if (!target || Math.abs(target.x - unit.x) > data.range) return;

  applyDamage(target, data.damage, unit.side);
  state.lightning.push({
    x1: unit.x,
    y1: unit.y - 86,
    x2: target.x,
    y2: target.y ? target.y - 44 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 120,
    life: 0.2,
    duration: 0.2,
  });
}

function updateMonk(unit, dt) {
  unit.healTimer -= dt;
  if (unit.healTimer <= 0) {
    const target = findWoundedAlly(unit);
    if (target) {
      target.hp = Math.min(target.maxHp, target.hp + UNIT.monk.healAmount);
      clearPoison(target);
      popText(target.x, target.y - 95, `治疗 +${UNIT.monk.healAmount}`, "#b8f6c1");
      state.blasts.push({ x: target.x, y: target.y - 45, radius: 44, life: 0.35, duration: 0.35, color: "#8ff0b2" });
    }
    unit.healTimer = UNIT.monk.healEvery;
  }

  const desiredX = getMonkDesiredX(unit);
  if (Math.abs(unit.x - desiredX) > 4) {
    unit.x += Math.sign(desiredX - unit.x) * UNIT.monk.speed * getMoveFactor(unit) * dt;
  }
}

function castMonkHealingField(unit) {
  const data = UNIT.monk;
  if ((unit.monkFieldTimer ?? 0) > 0) return false;
  const radius = Math.max(12, Math.sqrt(data.fieldArea / Math.PI));
  const front = getFrontAlly(unit.side);
  const x = front ? front.x : unit.x;
  const y = front ? front.y : unit.y;
  state.healingFields.push({
    side: unit.side,
    x,
    y,
    radius,
    heal: data.fieldHeal,
    life: data.fieldDuration,
    duration: data.fieldDuration,
    tick: 0,
  });
  unit.monkFieldTimer = data.fieldCooldown;
  state.blasts.push({ x, y: y - 30, radius: radius + 36, life: 0.42, duration: 0.42, color: "#b8f6c1" });
  popText(unit.x, unit.y - 118, "回血区", "#b8f6c1");
  return true;
}

function findWoundedAlly(unit) {
  let best = null;
  let bestMissingHp = 0;

  state.units.forEach((target) => {
    if (target.side !== unit.side || target === unit || target.hp <= 0) return;
    if (isUnitHidden(target)) return;
    if (target.hp >= target.maxHp && !isPoisoned(target)) return;
    if (Math.abs(target.x - unit.x) > UNIT.monk.healRange) return;
    const missingHp = target.maxHp - target.hp;
    const score = missingHp + (isPoisoned(target) ? 30 : 0);
    if (score > bestMissingHp) {
      best = target;
      bestMissingHp = score;
    }
  });

  return best;
}

function getMonkDesiredX(unit) {
  if (unit.side === "player") {
    if (state.command === "retreat") return FIELD.playerBase + 44;
    if (state.command === "guard") return getPlayerRallyX(unit);
    const front = getFrontAlly(unit.side);
    return front ? Math.max(getPlayerRallyBaseX() - 40, front.x - 85) : getPlayerRallyX(unit);
  }

  if (state.enemyAttackMood < 16) return getEnemyRallyX(unit);
  const front = getFrontAlly(unit.side);
  return front ? Math.min(getEnemyRallyBaseX() + 40, front.x + 85) : getEnemyRallyX(unit);
}

function getFrontAlly(side) {
  const allies = state.units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitHidden(unit) && unit.type !== "monk" && unit.type !== "miner");
  if (!allies.length) return null;
  return allies.reduce((front, unit) => {
    if (!front) return unit;
    return side === "player" ? (unit.x > front.x ? unit : front) : (unit.x < front.x ? unit : front);
  }, null);
}

function updateV(unit, dt) {
  updateVClones(unit, dt);
  updateVControlLink(unit);

  if (unit.controlledTargetId) return true;

  if (unit.side !== "enemy" || unit.controlTimer > 0) return false;

  const target = findMostThreateningEnemy(unit);
  return controlTargetWithV(unit, target);
}

function controlTargetWithV(v, target) {
  if (v.controlledTargetId || v.controlTimer > 0 || !canVControl(v, target)) return false;
  v.controlTimer = UNIT.vUnit.controlEvery;
  v.controlLockTimer = UNIT.vUnit.controlLock;
  v.controlledTargetId = target.id;
  convertUnitSide(target, v.side, v.id);
  popText(v.x, v.y - 125, "精神控制", "#d7ceff");
  popText(target.x, target.y - 95, "倒戈", "#d7ceff");
  return true;
}

function updateVClones(unit, dt) {
  unit.cloneSpawnTimer = Math.max(0, unit.cloneSpawnTimer - dt);
  const cloneLimit = unit.cloneLimit ?? UNIT.vUnit.cloneLimit;
  const cloneRespawnDelay = unit.cloneRespawnDelay ?? UNIT.vUnit.cloneRespawnDelay;
  const activeClones = state.units.filter(
    (candidate) => candidate.type === "vClone" && candidate.summonerId === unit.id && candidate.hp > 0,
  ).length;

  if (unit.cloneSpawnTimer > 0 || activeClones >= cloneLimit) return;

  if (!unit.initialClonesReleased) {
    spawnVClones(unit);
    unit.initialClonesReleased = true;
    unit.cloneSpawnTimer = cloneRespawnDelay;
    return;
  }

  const dir = unit.side === "player" ? -1 : 1;
  spawnVClone(unit, dir * (34 + activeClones * 24));
  unit.cloneSpawnTimer = cloneRespawnDelay;
  popText(unit.x, unit.y - 120, "补充分身", "#d7ceff");
}

function updateVControlLink(unit) {
  if (!unit.controlledTargetId) return;
  const target = state.units.find((candidate) => candidate.id === unit.controlledTargetId && candidate.hp > 0);
  if (target && target.controlledBy === unit.id) return;
  unit.controlledTargetId = null;
}

function nearbyEnemyHp(unit, range) {
  return state.units.reduce((sum, target) => {
    if (target.side === unit.side || target.hp <= 0) return sum;
    if (isUnitHidden(target)) return sum;
    if (Math.abs(target.x - unit.x) > range) return sum;
    return sum + target.hp;
  }, 0);
}

function findMostThreateningEnemy(unit) {
  let best = null;
  let bestScore = -Infinity;

  state.units.forEach((target) => {
    if (!canVControl(unit, target)) return;
    const data = UNIT[target.type];
    const distancePenalty = Math.abs(target.x - unit.x) / 20;
    const score = data.damage * 4 + target.hp * 0.35 + (data.range ?? 0) * 0.08 - distancePenalty;
    if (score > bestScore) {
      best = target;
      bestScore = score;
    }
  });

  return best;
}

function findSuikaiHookTarget(unit) {
  let best = null;
  let bestScore = -Infinity;
  const range = UNIT.suikai.range + 180;

  state.units.forEach((target) => {
    if (!canSuikaiHook(unit, target)) return;
    if (Math.abs(target.x - unit.x) > range) return;
    const data = UNIT[target.type];
    const distancePenalty = Math.abs(target.x - unit.x) / 35;
    const score = (data.damage ?? 0) * 6 + target.hp * 0.25 + (data.range ?? 0) * 0.12 - distancePenalty;
    if (score > bestScore) {
      best = target;
      bestScore = score;
    }
  });

  return best;
}

function canSuikaiHook(unit, target) {
  if (!unit || !target || unit.hp <= 0 || target.hp <= 0) return false;
  if (target.side === unit.side || isUnitHidden(target)) return false;
  if (!isAheadOf(unit, target)) return false;
  if (UNIT[target.type]?.untargetable) return false;
  if (isHeroUnit(target) || UNIT[target.type]?.giant || target.type === "vClone") return false;
  return true;
}

function convertUnitSide(unit, side, controllerId = null) {
  unit.originalSide = unit.side;
  unit.side = side;
  unit.controlledBy = controllerId;
  unit.frozenBy = null;
  unit.boundTargetId = null;
  unit.stunTimer = 0;
  unit.forceCharge = false;
  unit.summonerId = null;
}

function releaseVControl(v, manual = false) {
  if (!v.controlledTargetId) return false;
  const target = state.units.find((unit) => unit.id === v.controlledTargetId && unit.hp > 0);
  if (target && target.controlledBy === v.id) {
    if (target.type === "treeEnt") killTreeScorpions(target);
    if (target.type === "undeadMage") killSummonedUndead(target);
    target.side = target.originalSide ?? target.side;
    target.controlledBy = null;
    target.originalSide = null;
    popText(target.x, target.y - 92, "控制解除", "#d7ceff");
  }
  v.controlledTargetId = null;
  if (state.pendingVControlId === v.id) state.pendingVControlId = null;
  if (manual) {
    v.controlTimer = UNIT.vUnit.controlEvery;
    popText(v.x, v.y - 125, "解除控制", "#d7ceff");
  }
  return true;
}

function killTreeScorpions(tree) {
  let killed = 0;
  state.units.forEach((unit) => {
    if (unit.type !== "waterScorpion" || unit.summonerId !== tree.id || unit.hp <= 0) return;
    unit.noCorpse = true;
    unit.hp = 0;
    killed += 1;
    popText(unit.x, unit.y - 70, "失去首领", "#8ee0cf");
  });
  if (killed > 0) popText(tree.x, tree.y - 120, "水蝎子溃散", "#8ee0cf");
}

function killSummonedUndead(mage) {
  let killed = 0;
  state.units.forEach((unit) => {
    if (unit.type !== "undead" || unit.summonerId !== mage.id || unit.hp <= 0) return;
    unit.noCorpse = true;
    unit.hp = 0;
    killed += 1;
    popText(unit.x, unit.y - 70, "召唤消散", "#b8b0a5");
  });
  if (killed > 0) popText(mage.x, mage.y - 120, "亡灵消散", "#b8b0a5");
}

function updateBannerBearer(unit, dt) {
  const data = UNIT.bannerBearer;
  if (unit.inspiringTimer > 0) return;
  unit.inspireTimer = Math.max(0, (unit.inspireTimer ?? data.inspireEvery) - dt);
  if (unit.inspireTimer > 0) return;
  const candidates = state.units
    .filter((ally) => ally.side === unit.side && ally !== unit && ally.type !== "bannerBearer" && ally.hp > 0 && !isUnitHidden(ally) && isUndeadEmpireUnit(ally.type))
    .filter((ally) => distanceTo(ally.x, ally.y, unit.x, unit.y) <= data.inspireRadius);
  if (!candidates.length) {
    unit.inspireTimer = 1;
    return;
  }
  const groupKey = unit.bannerInspireGroup ?? "skeleton";
  const group = { key: groupKey, units: candidates.filter((ally) => isBannerGroupUnit(groupKey, ally.type)) };
  if (!group.units.length) {
    unit.inspireTimer = 1;
    return;
  }
  unit.inspiringTimer = data.inspireDuration;
  unit.inspireTimer = data.inspireEvery + data.inspireDuration;
  unit.inspireGroup = group.key;
  popText(unit.x, unit.y - 128, `举旗激励${BANNER_INSPIRE_LABELS[group.key]}`, "#d8d0ff");
  state.blasts.push({ x: unit.x, y: unit.y - 38, radius: data.inspireRadius, life: data.inspireDuration, duration: data.inspireDuration, color: "#d8d0ff" });
}

function isBannerGroupUnit(groupKey, type) {
  if (groupKey === "skeleton") return SKELETON_UNITS.has(type);
  if (groupKey === "zombie") return ZOMBIE_UNITS.has(type);
  if (groupKey === "spirit") return SPIRIT_UNITS.has(type);
  return false;
}

function cycleBannerInspireGroup(unit) {
  const current = unit.bannerInspireGroup ?? "skeleton";
  const index = BANNER_INSPIRE_GROUPS.indexOf(current);
  unit.bannerInspireGroup = BANNER_INSPIRE_GROUPS[(index + 1) % BANNER_INSPIRE_GROUPS.length];
  popText(unit.x, unit.y - 116, `激励目标：${BANNER_INSPIRE_LABELS[unit.bannerInspireGroup]}`, "#d8d0ff");
}

function finishBannerInspire(unit) {
  const data = UNIT.bannerBearer;
  const allies = state.units.filter((ally) => (
    ally.side === unit.side
    && ally !== unit
    && ally.type !== "bannerBearer"
    && ally.hp > 0
    && !isUnitHidden(ally)
    && distanceTo(ally.x, ally.y, unit.x, unit.y) <= data.inspireRadius
  ));
  allies.forEach((ally) => {
    if (unit.inspireGroup === "skeleton" && SKELETON_UNITS.has(ally.type)) {
      ally.inspiredReviveTimer = data.inspireBuffDuration;
      ally.inspiredReviveReady = true;
      popText(ally.x, ally.y - 94, "骷髅不灭", "#d8d0ff");
    } else if (unit.inspireGroup === "zombie" && ZOMBIE_UNITS.has(ally.type)) {
      ally.inspiredZombieTimer = data.inspireBuffDuration;
      ally.inspiredZombieHits = 3;
      popText(ally.x, ally.y - 94, "丧尸狂热", "#93d96b");
    } else if (unit.inspireGroup === "spirit" && SPIRIT_UNITS.has(ally.type)) {
      ally.inspiredLifestealTimer = data.inspireUndeadDuration;
      popText(ally.x, ally.y - 94, "亡灵吸血", "#b8b0e8");
    }
  });
  unit.inspireGroup = null;
}

function updateGraveDigger(unit, dt) {
  const data = UNIT.graveDigger;
  unit.graveReviveTimer = Math.max(0, (unit.graveReviveTimer ?? data.reviveEvery) - dt);
  if (unit.graveReviveTimer <= 0) {
    unit.graveReviveTimer = data.reviveEvery;
    reviveNearestCorpse(unit);
  }
  unit.graveGhostTimer = Math.max(0, (unit.graveGhostTimer ?? data.ghostEvery) - dt);
  if (unit.graveGhostTimer <= 0) {
    unit.graveGhostTimer = data.ghostEvery;
    releaseGraveGhosts(unit);
  }
}

function reviveNearestCorpse(unit) {
  const data = UNIT.graveDigger;
  const corpse = state.corpses
    .filter((item) => item.side === unit.side && item.reviveable && item.revives < 3 && !UNDEAD_CORPSE_EXCLUDED.has(item.type))
    .filter((item) => distanceTo(item.x, item.y, unit.x, unit.y) <= data.reviveRadius)
    .sort((a, b) => distanceTo(a.x, a.y, unit.x, unit.y) - distanceTo(b.x, b.y, unit.x, unit.y))[0];
  if (!corpse) return;
  corpse.revives += 1;
  const revived = spawnUnit(corpse.type, corpse.side, corpse.x);
  revived.y = corpse.y;
  const hpRatios = [0.75, 0.5, 0.25];
  revived.hp = Math.max(1, Math.round(revived.maxHp * hpRatios[corpse.revives - 1]));
  revived.corpseRevives = corpse.revives;
  state.corpses = state.corpses.filter((item) => item !== corpse);
  popText(revived.x, revived.y - 100, `掘墓复活 ${Math.round(hpRatios[corpse.revives - 1] * 100)}%`, "#b8b0a5");
}

function releaseGraveGhosts(unit) {
  const data = UNIT.graveDigger;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < data.ghostCount; i += 1) {
    state.ghosts.push({
      x: unit.x + dir * (18 + i * 8),
      y: unit.y - 36 + (i - 1) * 26,
      side: unit.side,
      dir,
      speed: data.ghostSpeed,
      life: data.ghostDuration,
      duration: data.ghostDuration,
      fearDuration: data.ghostFearDuration,
      hitIds: new Set(),
    });
  }
  popText(unit.x, unit.y - 122, "幽灵出土", "#d8d0ff");
}

function updateGhoul(unit, dt) {
  if (unit.devourTimer > 0) {
    unit.devourTimer = Math.max(0, unit.devourTimer - dt);
    if (unit.devourTimer <= 0) finishGhoulDevour(unit);
    return true;
  }

  if (!unit.devourTargetCorpseId) return false;
  const corpse = state.corpses.find((item) => item.id === unit.devourTargetCorpseId && item.side !== unit.side);
  if (!corpse) {
    unit.devourTargetCorpseId = null;
    return false;
  }

  const distance = distanceTo(unit.x, unit.y, corpse.x, corpse.y);
  if (distance > 12) {
    moveUnitTowardPoint(unit, corpse.x, corpse.y, unit.speed ?? UNIT.ghoul.speed, dt, 8);
    return true;
  }

  unit.devourTimer = UNIT.ghoul.devourDuration;
  unit.cooldown = Math.max(unit.cooldown ?? 0, UNIT.ghoul.devourDuration);
  popText(unit.x, unit.y - 102, "啃食尸体", "#93d96b");
  return true;
}

function commandGhoulDevour(unit) {
  const corpse = findNearestEnemyCorpse(unit);
  if (!corpse) {
    popText(unit.x, unit.y - 116, "没有敌方尸体", "#d9d0b8");
    return false;
  }
  unit.devourTargetCorpseId = corpse.id;
  unit.devourTimer = 0;
  unit.inCastle = false;
  unit.mineSlotId = null;
  unit.mineWorkSlot = null;
  state.manualMoveTarget = null;
  popText(unit.x, unit.y - 116, "扑向尸体", "#93d96b");
  return true;
}

function findNearestEnemyCorpse(unit) {
  return state.corpses
    .filter((corpse) => corpse.side !== unit.side)
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y))[0] ?? null;
}

function finishGhoulDevour(unit) {
  const corpse = state.corpses.find((item) => item.id === unit.devourTargetCorpseId && item.side !== unit.side);
  unit.devourTargetCorpseId = null;
  if (!corpse) return;
  const healed = Math.min(Math.round((corpse.maxHp ?? UNIT[corpse.type]?.hp ?? 0) * 0.5), unit.maxHp - unit.hp);
  if (healed > 0) {
    unit.hp += healed;
    popText(unit.x, unit.y - 104, `啃食 +${healed}`, "#93d96b");
  } else {
    popText(unit.x, unit.y - 104, "啃食", "#93d96b");
  }
  state.corpses = state.corpses.filter((item) => item !== corpse);
}

function isUndeadEmpireUnit(type) {
  return UNDEAD_BASE_UNITS.has(type) || SKELETON_UNITS.has(type) || ZOMBIE_UNITS.has(type) || SPIRIT_UNITS.has(type);
}

function updateIronCavalry(unit, dt) {
  const data = UNIT.ironCavalry;
  unit.ironCavalryChargeTimer = Math.max(0, (unit.ironCavalryChargeTimer ?? 0) - dt);
  unit.ironCavalryChargeCooldown = Math.max(0, (unit.ironCavalryChargeCooldown ?? 0) - dt);
  unit.ironCavalryBombCooldown = Math.max(0, (unit.ironCavalryBombCooldown ?? 0) - dt);

  const target = isPlayerRetreating(unit) ? null : findTarget(unit);
  if (!target) {
    unit.ironCavalryBombedTargetId = null;
    moveUnitTowardPoint(unit, getDefaultAdvanceX(unit), unit.y, getIronCavalryMoveSpeed(unit), dt, 5);
    return;
  }

  const distance = Math.abs(unit.x - target.x);
  if (unit.ironCavalryChargeTimer <= 0 && unit.ironCavalryChargeCooldown <= 0 && distance <= data.musketRange) {
    beginIronCavalryCharge(unit);
  }
  if (target.kind !== "statue" && distance > data.musketRange + 80) {
    unit.ironCavalryBombedTargetId = null;
  }

  if (unit.cooldown <= 0 && distance <= getIronCavalryAttackRange(unit)) {
    attackIronCavalry(unit, target, distance);
  }

  if (target.kind === "statue") {
    const desiredX = unit.side === "player" ? target.x - data.spearRange + 8 : target.x + data.spearRange - 8;
    moveUnitTowardPoint(unit, desiredX, unit.y, getIronCavalryMoveSpeed(unit), dt, 5);
    return;
  }

  if (distance > data.spearRange) {
    const desiredX = unit.side === "player" ? target.x - data.spearRange + 8 : target.x + data.spearRange - 8;
    moveUnitTowardPoint(unit, desiredX, target.y ?? unit.y, getIronCavalryMoveSpeed(unit), dt, 5);
  }
}

function isIronCavalryCharging(unit) {
  return (unit.ironCavalryChargeTimer ?? 0) > 0;
}

function beginIronCavalryCharge(unit) {
  const data = UNIT.ironCavalry;
  unit.ironCavalryChargeTimer = data.chargeDuration;
  unit.ironCavalryChargeCooldown = data.chargeCooldown + data.chargeDuration;
  unit.ironCavalryBombedTargetId = null;
  popText(unit.x, unit.y - 116, "铁骑冲刺", "#dbe8ff");
}

function getIronCavalryMoveSpeed(unit) {
  return isIronCavalryCharging(unit) ? UNIT.ironCavalry.chargeSpeed : UNIT.ironCavalry.speed;
}

function getIronCavalryAttackRange(unit) {
  return isIronCavalryCharging(unit) ? UNIT.ironCavalry.musketRange : UNIT.ironCavalry.spearRange;
}

function getDefaultAdvanceX(unit) {
  if (unit.side === "player") {
    if (state.command === "retreat") return FIELD.playerBase + 42;
    if (state.command === "guard") return getPlayerRallyX(unit);
    if (state.command === "attack" && state.attackIntent === "tower") return getTowerRallyX(unit, "player");
    return FIELD.enemyBase;
  }
  if (state.enemyCommand === "retreat") return FIELD.enemyBase - 42;
  if (state.enemyCommand === "guard") return getEnemyFormationX(unit);
  if (state.enemyCommand === "attack" && state.towerOwner !== "enemy") return getTowerRallyX(unit, "enemy");
  return FIELD.playerBase;
}

function attackIronCavalry(unit, target, distance) {
  const data = UNIT.ironCavalry;
  unit.combatTimer = 3;
  markRetaliationTarget(target, unit);

  if (distance <= data.spearRange) {
    const critical = shouldTriggerOrderMeleeCritical(unit, target);
    const damage = data.spearDamage * (critical ? ORDER_COMBAT_TRAIT.meleeDamageFactor : 1);
    const dealt = applyDamage(target, damage, unit.side);
    handleDamageDealt(unit, target, dealt);
    unit.cooldown = data.spearCooldown;
    popText(unit.x, unit.y - 98, critical ? "长枪重击" : "长枪突刺", critical ? "#fff1a8" : "#dfe8ff");
    return;
  }

  if (
    isIronCavalryCharging(unit)
    && target.kind !== "statue"
    && distance <= data.bombRange
    && unit.ironCavalryBombCooldown <= 0
    && unit.ironCavalryBombedTargetId !== target.id
  ) {
    unit.ironCavalryBombedTargetId = target.id;
    throwIronCavalryBomb(unit, target);
    unit.cooldown = data.bombCooldown;
    unit.ironCavalryBombCooldown = data.bombCooldown;
    return;
  }

  if (!isIronCavalryCharging(unit)) return;
  fireIronCavalryMusket(unit, target);
  unit.cooldown = data.musketCooldown;
}

function fireIronCavalryMusket(unit, target) {
  const data = UNIT.ironCavalry;
  state.arrows.push({
    x: unit.x,
    y: unit.y - 56,
    tx: target.x,
    ty: target.y ? target.y - 38 + (UNIT[target.type]?.flying ? -42 : 0) : unit.y - 52,
    side: unit.side,
    damage: data.musketDamage,
    sourceId: unit.id,
    sourceType: unit.type,
    target,
    life: 0.45,
    type: "ironCavalryMusket",
  });
}

function throwIronCavalryBomb(unit, target) {
  const data = UNIT.ironCavalry;
  state.arrows.push({
    x: unit.x,
    y: unit.y - 62,
    tx: target.x,
    ty: target.y ? target.y - 24 : FIELD.ground - 92,
    side: unit.side,
    damage: data.bombDamage,
    splash: data.bombSplash,
    limit: data.bombLimit,
    sourceId: unit.id,
    sourceType: unit.type,
    target,
    life: 0.5,
    duration: 0.5,
    type: "ironCavalryBomb",
  });
  popText(unit.x, unit.y - 112, "投掷炸弹", "#ffce7a");
}

function updateUndeadMage(unit, dt) {
  void unit;
  void dt;
}

function updateNecromancer(unit, dt) {
  const data = UNIT.necromancer;
  unit.necromancerConvertTimer = Math.max(0, (unit.necromancerConvertTimer ?? data.convertEvery) - dt);
  if (unit.necromancerConvertTimer > 0) return;
  if (convertEnemyCorpseWithNecromancer(unit)) {
    unit.necromancerConvertTimer = data.convertEvery;
  } else {
    unit.necromancerConvertTimer = 0.6;
  }
}

function convertEnemyCorpseWithNecromancer(unit) {
  const corpse = state.corpses
    .filter((item) => item.side !== unit.side)
    .filter((item) => canNecromancerConvertCorpse(item))
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y))[0];
  if (!corpse) return false;
  const type = getNecromancerConversionType(corpse);
  const converted = spawnUnit(type, unit.side, corpse.x);
  converted.y = corpse.y;
  const hpRatio = UNIT.necromancer.corpseHpRatio;
  if (type !== "darkKnight") {
    converted.maxHp = Math.max(1, Math.round((corpse.maxHp ?? UNIT[corpse.type]?.hp ?? UNIT.undead.hp) * hpRatio));
  }
  converted.hp = converted.maxHp;
  converted.forceCharge = true;
  converted.summonerId = unit.id;
  state.corpses = state.corpses.filter((item) => item !== corpse);
  state.blasts.push({ x: converted.x, y: converted.y - 36, radius: 46, life: 0.32, duration: 0.32, color: "#b8b0e8" });
  popText(converted.x, converted.y - 106, getNecromancerConversionText(type), "#b8b0e8");
  return true;
}

function canNecromancerConvertCorpse(corpse) {
  return !NECROMANCER_CONVERSION_BLOCKED_UNITS.has(corpse.type);
}

function getNecromancerConversionType(corpse) {
  const maxHp = corpse.maxHp ?? UNIT[corpse.type]?.hp ?? 0;
  if (maxHp >= NECROMANCER_DARK_KNIGHT_HP_THRESHOLD) return "darkKnight";
  return isRangedCorpse(corpse) ? "poisonZombie" : "undead";
}

function getNecromancerConversionText(type) {
  if (type === "darkKnight") return "尸体转化黑骑士";
  return type === "poisonZombie" ? "尸体转化毒尸" : "尸体转化丧尸";
}

function isRangedCorpse(corpse) {
  const data = UNIT[corpse.type] ?? {};
  return (data.range ?? 0) > 60;
}

function summonNecromancerZombies(unit) {
  const data = UNIT.necromancer;
  const dir = getUnitFacingDirection(unit);
  for (let i = 0; i < data.summonCount; i += 1) {
    const zombie = spawnUnit("undead", unit.side, unit.x + dir * (26 + i * 18));
    zombie.y = unit.y + (i - (data.summonCount - 1) / 2) * 14;
    zombie.speed = data.summonedSpeed;
    zombie.forceCharge = true;
    zombie.summonerId = unit.id;
  }
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.necromancerSummon = data.summonCooldown;
  state.blasts.push({ x: unit.x, y: unit.y - 48, radius: 58, life: 0.34, duration: 0.34, color: "#b8b0e8" });
  popText(unit.x, unit.y - 122, "召唤冲锋丧尸", "#b8b0e8");
  return true;
}

function summonUndeadMageSkeletons(unit) {
  const data = UNIT.undeadMage;
  const dir = getUnitFacingDirection(unit);
  for (let i = 0; i < data.skeletonSummonCount; i += 1) {
    const skeleton = spawnUnit("machete", unit.side, unit.x + dir * (28 + i * 18));
    skeleton.y = unit.y + (i - (data.skeletonSummonCount - 1) / 2) * 14;
    skeleton.forceCharge = true;
    skeleton.summonerId = unit.id;
  }
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.undeadSkeletons = data.skeletonSummonCooldown;
  state.blasts.push({ x: unit.x, y: unit.y - 48, radius: 54, life: 0.32, duration: 0.32, color: "#d8c8e8" });
  popText(unit.x, unit.y - 122, "召唤骷髅兵", "#d8c8e8");
  return true;
}

function castNecromancerPlague(unit, target) {
  const data = UNIT.necromancer;
  if (!target || target.kind === "statue" || !areHostileSides(unit.side, target.side)) {
    popText(unit.x, unit.y - 116, "无法引爆", "#93d96b");
    return false;
  }
  if (distanceTo(unit.x, unit.y, target.x, target.y) > data.plagueRange) {
    popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
    return false;
  }
  explodeNecromancerPlague(unit.side, target.x, target.y, unit.id);
  return true;
}

function explodeNecromancerPlague(side, x, y, sourceUnitId = null, exclude = null) {
  const data = UNIT.necromancer;
  const source = sourceUnitId ? state.units.find((unit) => unit.id === sourceUnitId && unit.hp > 0) : null;
  getUnitsInRadius(x, data.plagueRadius, side, Infinity, exclude, y).forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, data.plagueDamage, {
      label: "死灵爆炸",
      color: "#93d96b",
      yOffset: -84,
      sourceSide: side,
      ranged: false,
    });
    if (dealt > 0) {
      enemy.lastDamageSide = side;
      if (sourceUnitId) enemy.lastDamageUnitId = sourceUnitId;
      handleDamageDealt(source, enemy, dealt);
    }
    applyPoison(enemy, data.plaguePoisonDps, data.plaguePoisonDuration, {
      sourceSide: side,
      sourceUnitId,
      necroPlague: { side, sourceUnitId },
    });
  });
  state.blasts.push({ x, y: y - 36, radius: data.plagueRadius, life: 0.36, duration: 0.36, color: "#93d96b" });
  popText(x, y - 112, "死灵爆炸", "#93d96b");
}

function triggerNecroPlagueDeath(unit) {
  const plague = unit.necroPlague;
  if (!plague?.side || plague.side === unit.side) return false;
  explodeNecromancerPlague(plague.side, unit.x, unit.y, plague.sourceUnitId ?? null, unit);
  unit.necroPlague = null;
  return true;
}

function findBoneHarvestCorpse(unit) {
  const data = UNIT.boneThrower;
  return state.corpses
    .filter((corpse) => corpse.side !== unit.side)
    .filter((corpse) => distanceTo(unit.x, unit.y, corpse.x, corpse.y) <= data.boneHarvestRange)
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y))[0] ?? null;
}

function canBoneHarvest(unit) {
  const data = UNIT.boneThrower;
  return (unit.boneAmmo ?? 0) < data.maxBoneAmmo && Boolean(findBoneHarvestCorpse(unit));
}

function harvestBonesFromCorpse(unit) {
  const data = UNIT.boneThrower;
  if ((unit.boneAmmo ?? 0) >= data.maxBoneAmmo) {
    popText(unit.x, unit.y - 116, "骨头已满", "#d9d0b8");
    return false;
  }
  const corpse = findBoneHarvestCorpse(unit);
  if (!corpse) {
    popText(unit.x, unit.y - 116, "附近没有敌方尸体", "#d9d0b8");
    return false;
  }
  const gained = Math.max(1, Math.ceil((corpse.maxHp ?? UNIT[corpse.type]?.hp ?? 20) * data.corpseBoneRatio));
  const before = unit.boneAmmo ?? 0;
  unit.boneAmmo = Math.min(data.maxBoneAmmo, before + gained);
  state.corpses = state.corpses.filter((item) => item !== corpse);
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.boneHarvest = data.boneHarvestCooldown;
  state.blasts.push({ x: corpse.x, y: corpse.y - 30, radius: 40, life: 0.28, duration: 0.28, color: "#d8d0c8" });
  popText(unit.x, unit.y - 116, `取骨 +${unit.boneAmmo - before}`, "#d8d0c8");
  return true;
}

function findUndeadBoneTarget(unit) {
  const data = UNIT.undeadMage;
  return state.units
    .filter((enemy) => {
      if (enemy.side === unit.side || enemy.hp <= 0 || isUnitHidden(enemy) || UNIT[enemy.type]?.untargetable) return false;
      if (!isAheadOf(unit, enemy)) return false;
      return distanceTo(unit.x, unit.y, enemy.x, enemy.y) <= data.boneSpikeRange;
    })
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y))[0] ?? null;
}

function updateSuikai(unit, dt) {
  const data = UNIT.suikai;
  unit.suikaiCorpseTimer -= dt;
  unit.suikaiHookTimer -= dt;

  if (unit.suikaiCorpseTimer <= 0) {
    unit.suikaiCorpseTimer += data.corpseEvery;
    summonSuikaiCorpses(unit);
  }

  if (unit.suikaiHookTimer <= 0) {
    const target = findSuikaiHookTarget(unit);
    if (target) {
      unit.suikaiHookTimer += data.hookEvery;
      hookTargetWithSuikai(unit, target);
    } else {
      unit.suikaiHookTimer = Math.min(unit.suikaiHookTimer + 1.2, data.hookEvery);
    }
  }
}

function updateZeus(unit, dt) {
  const data = UNIT.zeus;
  unit.zeusOverheadTimer -= dt;
  unit.zeusCloudTimer -= dt;
  unit.zeusColumnTimer -= dt;
  unit.zeusGateTimer -= dt;

  if (unit.zeusOverheadTimer <= 0) {
    unit.zeusOverheadTimer += data.overheadEvery;
    strikeZeusOverhead(unit);
  }

  if (unit.zeusCloudTimer <= 0) {
    const target = findTarget(unit);
    if (target) {
      unit.zeusCloudTimer += data.cloudEvery;
      summonZeusCloud(unit, target);
    } else {
      unit.zeusCloudTimer = Math.min(unit.zeusCloudTimer + 1, data.cloudEvery);
    }
  }

  if (unit.zeusColumnTimer <= 0) {
    const target = findTarget(unit);
    if (target) {
      unit.zeusColumnTimer += data.columnEvery;
      summonZeusElectricWall(unit, target);
    } else {
      unit.zeusColumnTimer = Math.min(unit.zeusColumnTimer + 1, data.columnEvery);
    }
  }

  if (unit.zeusGateTimer <= 0) {
    const target = findTarget(unit);
    if (target) {
      unit.zeusGateTimer += data.gateEvery;
      summonZeusElectricGate(unit, target);
    } else {
      unit.zeusGateTimer = Math.min(unit.zeusGateTimer + 1, data.gateEvery);
    }
  }
}

function strikeZeusOverhead(unit) {
  const data = UNIT.zeus;
  const target = getUnitsInRadius(unit.x, data.overheadRadius, unit.side, Infinity)
    .filter((enemy) => Math.abs(enemy.x - unit.x) <= data.overheadRadius)
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0];
  if (!target) return;
  applyDamage(target, data.boltDamage, unit.side);
  applyStun(target, data.boltStun);
  state.lightning.push({
    x1: unit.x + (Math.random() * 80 - 40),
    y1: unit.y - 158,
    x2: target.x,
    y2: target.y - 48 + (UNIT[target.type]?.flying ? -42 : 0),
    life: 0.22,
    duration: 0.22,
  });
}

function summonZeusCloud(unit, target) {
  const data = UNIT.zeus;
  state.stormClouds.push({
    type: "attack",
    x: target.x,
    y: FIELD.ground - 230,
    side: unit.side,
    radius: data.cloudRadius,
    life: data.cloudDuration,
    duration: data.cloudDuration,
    boltTimer: 0,
    boltsLeft: Math.ceil(data.cloudDuration / data.boltEvery),
    boltEvery: data.boltEvery,
    damage: data.boltDamage,
    stun: data.boltStun,
    slow: 1,
    slowDuration: 0,
    moveSpeed: data.cloudMoveSpeed,
    moveDir: unit.side === "player" ? 1 : -1,
  });
  popText(target.x, FIELD.ground - 132, "宙斯雷云", "#d7f6ff");
}

function summonZeusElectricWall(unit, target) {
  const data = UNIT.zeus;
  const x = Math.max(FIELD.playerGate + 90, Math.min(FIELD.enemyGate - 90, target.x));
  state.electricColumns.push({
    x,
    side: unit.side,
    life: data.columnDuration,
    duration: data.columnDuration,
    damage: data.columnDamage,
    slow: data.gateSlow,
    slowDuration: data.gateSlowDuration,
    tick: 0,
    width: data.columnWidth,
  });
  popText(x, FIELD.ground - 150, "电墙", "#d7f6ff");
}

function summonZeusElectricGate(unit, target) {
  const x = Math.max(FIELD.playerGate + 90, Math.min(FIELD.enemyGate - 90, target.x));
  const gate = spawnUnit("electricGate", unit.side, x);
  gate.y = target.y ?? FIELD.ground;
  gate.summonerId = unit.id;
  gate.noRespawn = true;
  popText(x, FIELD.ground - 150, "召唤电门", "#d7f6ff");
}

function summonSuikaiCorpses(unit) {
  const data = UNIT.suikai;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < data.corpseCount; i += 1) {
    const corpse = spawnUnit("deadCorpse", unit.side, unit.x - dir * (24 + i * 16));
    corpse.forceCharge = true;
    corpse.summonerId = unit.id;
  }
  popText(unit.x, unit.y - 118, "死尸出笼", "#93d96b");
}

function updateArchmage(unit, dt) {
  const data = UNIT.archmage;
  updateHeroBlink(unit, data);
  unit.archmageFireballTimer -= dt;
  if (unit.archmageFireballTimer <= 0) {
    unit.archmageFireballTimer += data.fireballEvery;
    castArchmageFireballs(unit);
  }

  if ((unit.archmageAttackCount ?? 0) >= data.arcaneEvery) {
    const target = nearestEnemy(unit, data.arcaneTriggerRange);
    if (target) {
      unit.archmageAttackCount = 0;
      castArcaneExplosion(unit);
    }
  }
}

function updatePrometheus(unit, dt) {
  const data = UNIT.prometheus;
  unit.prometheusSpellTimer -= dt;
  if (unit.prometheusSpellTimer > 0) return;

  const target = findTarget(unit);
  if (!target) {
    unit.prometheusSpellTimer = Math.min(unit.prometheusSpellTimer + 1, data.spellEvery);
    return;
  }

  unit.prometheusSpellTimer += data.spellEvery;
  castPrometheusSpell(unit, target);
}

function updateHeroBlink(unit, data) {
  if (unit.blinkUsed) return;
  if (unit.hp > (data.blinkHpThreshold ?? UNIT.vUnit.blinkHpThreshold)) return;
  if (nearbyEnemyHp(unit, 165) < (data.blinkThreatHp ?? UNIT.vUnit.blinkThreatHp)) return;
  const dir = unit.side === "player" ? -1 : 1;
  const baseLimit = unit.side === "player" ? FIELD.playerGate - 80 : FIELD.enemyGate + 80;
  unit.x += dir * (data.blinkDistance ?? UNIT.vUnit.blinkDistance);
  unit.x = unit.side === "player" ? Math.max(baseLimit, unit.x) : Math.min(baseLimit, unit.x);
  unit.blinkUsed = true;
  popText(unit.x, unit.y - 125, "闪现后撤", "#d7ceff");
}

function updateBerserker(unit, dt) {
  const data = UNIT.berserker;
  unit.berserkerRageTimer -= dt;
  if (unit.berserkerRageTimer > 0) return;
  const nearbyEnemies = state.units.filter((enemy) => {
    if (enemy.side === unit.side || enemy.hp <= 0 || isUnitHidden(enemy) || UNIT[enemy.type]?.untargetable) return false;
    return distanceTo(unit.x, unit.y, enemy.x, enemy.y) <= data.rageRange;
  }).length;
  if (nearbyEnemies < data.rageEnemyCount) {
    unit.berserkerRageTimer = 1;
    return;
  }

  unit.berserkerRageTimer += data.rageEvery;
  const candidates = state.units
    .filter((ally) => ally.side === unit.side && ally.hp > 0 && !isUnitHidden(ally))
    .filter((ally) => ally === unit || ally.type === "swordsman" || ally.type === "greatsword")
    .filter((ally) => Math.abs(ally.x - unit.x) <= data.rageRange)
    .sort((a, b) => (a === unit ? -1 : b === unit ? 1 : Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x)));
  candidates.slice(0, data.rageLimit + 1).forEach((ally) => {
    ally.rageTimer = data.rageDuration;
  });
  popText(unit.x, unit.y - 130, "狂暴", "#ff5a45");
}

function updateSummoner(unit, dt) {
  const danger = nearestEnemy(unit, getUnitRange(unit));
  if (danger && unit.cooldown <= 0) attack(unit, danger);
  const point = getSummonerDefensePoint(unit);
  if (!danger || distanceTo(unit.x, unit.y, point.x, point.y) > getGuardPointTolerance(unit)) {
    moveUnitTowardPoint(unit, point.x, point.y, unit.speed ?? UNIT.summoner.speed, dt, getGuardPointTolerance(unit));
  }
  const data = UNIT.summoner;
  unit.summonTimer -= dt;
  if (unit.summonTimer > 0) return;
  unit.summonTimer += data.summonEvery;
  summonWraithMiners(unit);
}

function updateSummonerMinePatrol(unit, dt) {
  const mines = getSideMines(unit.side).filter((mine) => mine.remaining > 0);
  const mine = mines
    .map((candidate) => ({ mine: candidate, distance: distanceTo(unit.x, unit.y, candidate.x, candidate.y) }))
    .sort((a, b) => a.distance - b.distance)[0]?.mine;
  if (!mine) return;
  if (!unit.summonerPatrolOffset || Math.abs(unit.x - (mine.x + unit.summonerPatrolOffset)) < 8) {
    unit.summonerPatrolOffset = (Math.random() < 0.5 ? -1 : 1) * (16 + Math.random() * 22);
  }
  moveUnitTowardPoint(unit, mine.x + unit.summonerPatrolOffset, mine.y, unit.speed ?? UNIT.summoner.speed, dt, 6);
}

function updateRangedEconomyAttack(unit, target, dt) {
  if (!target) return;
  const range = getUnitRange(unit);
  const desiredX = unit.side === "player" ? target.x - range + 8 : target.x + range - 8;
  if (Math.abs(unit.x - target.x) <= range) {
    if (unit.cooldown <= 0) attack(unit, target);
    return;
  }
  moveUnitTowardPoint(unit, desiredX, target.y ?? FIELD.ground, unit.speed ?? UNIT[unit.type].speed, dt, 6);
}

function summonWraithMiners(summoner) {
  const data = UNIT.summoner;
  const count = data.summonCount;
  if (count <= 0) return;
  const dir = summoner.side === "player" ? 1 : -1;
  for (let i = 0; i < count; i += 1) {
    const wraith = spawnUnit("wraithMiner", summoner.side, summoner.x + dir * (24 + i * 18));
    wraith.y = summoner.y + (i === 0 ? -12 : 12);
    wraith.summonerId = summoner.id;
    wraith.summoned = true;
  }
  popText(summoner.x, summoner.y - 108, `召唤亡魂 x${count}`, "#7ed8ff");
}

function getSummonerDefensePoint(unit) {
  if (state?.fourWay && FOUR_WAY_BASES[unit.side]) {
    const base = FOUR_WAY_BASES[unit.side];
    const center = { x: FIELD.width / 2, y: FIELD.height / 2 };
    const dx = center.x - base.x;
    const dy = center.y - base.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = dx / len;
    const ny = dy / len;
    const px = -ny;
    const py = nx;
    const index = getSideUnitOrdinal(unit);
    return {
      x: base.x + nx * 145 + px * ((index % 5) - 2) * 24,
      y: base.y + ny * 145 + py * ((index % 5) - 2) * 24,
    };
  }
  return getGuardFormationPoint(unit, unit.side, unit.side === "enemy" ? state.enemyLineX : null);
}

function getSideUnitOrdinal(unit) {
  const index = state.units
    .filter((candidate) => candidate.side === unit.side && candidate.hp > 0 && candidate.type === unit.type)
    .sort((a, b) => a.id - b.id)
    .findIndex((candidate) => candidate.id === unit.id);
  return Math.max(0, index);
}

function updateWraithMiner(unit, dt) {
  updateMiner(unit, dt);
}

function updateMiner(unit, dt) {
  const isPlayer = isPlayerControlledSide(unit.side);
  const minerCommand = isPlayer && isMiningWorker(unit) ? state.minerCommand : "mine";

  if (shouldEnterPlayerCastle(unit) || (isPlayer && minerCommand === "retreat")) {
    moveTowardCastle(unit, dt);
    return;
  }

  if (unit.forceCharge || (isPlayer && minerCommand === "attack")) {
    updateAttackingMiner(unit, dt);
    return;
  }

  const danger = nearestEnemy(unit, 42);
  const canFight = unit.side === "enemy" || state.command !== "retreat";
  if (isMiningWorker(unit) && danger && canFight) {
    if (unit.cooldown <= 0) attack(unit, danger);
    return;
  }

  if (isGoldRushActive()) {
    updateGoldRushMiner(unit, dt);
    return;
  }

  const home = getMiningHomePoint(unit.side);
  const mine = getMineForMiner(unit);
  const bagSize = getMiningBagSize(unit);
  const mustDeposit = unit.carry >= bagSize;
  const forcedHome = isPlayer && state.command === "retreat";
  const workPoint = mine ? getMineWorkPoint(unit, mine) : null;
  const returningHome = forcedHome || mustDeposit || !workPoint;
  const targetX = returningHome ? home.x : workPoint.x;
  const targetY = returningHome ? home.y : workPoint.y;

  if (returningHome) {
    unit.mineSlotId = null;
    unit.mineWorkSlot = null;
  }
  if (moveUnitTowardPoint(unit, targetX, targetY, getMinerMoveSpeed(unit), dt, 5)) {
    return;
  }

  if (returningHome && unit.carry > 0) {
    depositMinerCarry(unit, isPlayer);
    unit.carry = 0;
    unit.carryResource = getMinerResource(unit);
    unit.mineTimer = 0;
    return;
  }

  if (!forcedHome && mine && mine.remaining > 0) {
    unit.mineTimer += dt;
    if (unit.mineTimer >= 1) {
      unit.mineTimer = 0;
      const space = bagSize - unit.carry;
      const mined = Math.min(getMiningGoldPerSwing(unit), space, mine.remaining);
      if (mined <= 0) {
        unit.mineSlotId = null;
        unit.mineWorkSlot = null;
        return;
      }
      unit.carryResource = mine.resource ?? "gold";
      unit.carry += mined;
      mine.remaining -= mined;
      popText(unit.x, unit.y - 52, `${getResourceLabel(unit.carryResource)} ${formatResourceAmount(unit.carry)}/${formatResourceAmount(bagSize)}`, getResourceColor(unit.carryResource, isPlayer));
      if (mine.remaining <= 0) {
        popText(mine.x, mine.y - 72, `${getResourceLabel(mine.resource)}枯竭`, getResourceColor(mine.resource, isPlayer));
        unit.mineSlotId = null;
        unit.mineWorkSlot = null;
      }
    }
  }
}

function updateSwarmWorm(unit, dt) {
  const data = UNIT.swarmWorm;
  const wasBurrowed = unit.wormBurrowed;
  unit.wormBurrowed = false;
  const target = isPlayerRetreating(unit) ? null : findTarget(unit);
  const range = getUnitRange(unit);
  if (target && canAttackFromDistance(unit, target, range)) {
    if (wasBurrowed) popText(unit.x, unit.y - 78, "钻出地面", "#cde69b");
    attack(unit, target);
    return;
  }

  const statueTarget = getForcedStatueTarget(unit, target);
  const activeTarget = statueTarget ?? target;
  const desiredX = getDesiredX(unit, activeTarget);
  const desiredPoint = getDesiredPoint(unit, activeTarget, desiredX);
  const moving = distanceTo(unit.x, unit.y, desiredPoint.x, desiredPoint.y) > getMoveTolerance(unit, activeTarget, desiredX);
  if (moving) {
    unit.wormBurrowed = true;
    moveUnitTowardPoint(unit, desiredPoint.x, desiredPoint.y, data.speed, dt, 5);
    return;
  }
  if (wasBurrowed) popText(unit.x, unit.y - 78, "钻出地面", "#cde69b");
}

function updateAntQueen(unit, dt) {
  const data = UNIT.antQueen;
  unit.summonTimer = Math.max(0, (unit.summonTimer ?? data.summonEvery) - dt);
  if (unit.summonTimer > 0) return;
  unit.summonTimer = data.summonEvery;
  const dir = getUnitFacingDirection(unit);
  const summonCount = getSwarmEvolutionSummonCount(unit);
  for (let i = 0; i < summonCount; i += 1) {
    const ant = spawnUnit("ironAnt", unit.side, clampWorldX(unit.x - dir * (28 + i * 22)));
    ant.y = unit.y + (i % 2 ? 14 : -8);
    ant.forceCharge = true;
    ant.summonedByQueen = true;
  }
  applyStun(unit, data.summonStun);
  state.blasts.push({ x: unit.x, y: unit.y - 42, radius: 56, life: 0.32, duration: 0.32, color: "#cde69b" });
  popText(unit.x, unit.y - 116, `产出铁蚁 x${summonCount}`, "#cde69b");
}

function isSwarmSpawner(unit) {
  return unit?.type === "broodMother" || unit?.type === "ashWorm" || unit?.type === "giantSpider";
}

function getSwarmEvolutionSummonCount(unit) {
  const data = UNIT[unit?.type] ?? {};
  const baseCount = data.summonCount ?? 0;
  return SWARM_EVOLUTION_SOURCE_BY_TYPE[unit?.type] && baseCount > 0 ? baseCount + 2 : baseCount;
}

function updateSwarmSpawner(unit, dt) {
  const data = UNIT[unit.type];
  unit.summonTimer = Math.max(0, (unit.summonTimer ?? data.summonEvery) - dt);
  if (unit.summonTimer > 0) return;
  unit.summonTimer = data.summonEvery;
  const summonType = unit.type === "broodMother" ? "locust" : unit.type === "ashWorm" ? "blastBug" : "spider";
  const label = unit.type === "broodMother" ? "蝗虫" : unit.type === "ashWorm" ? "自爆虫" : "蜘蛛";
  const dir = getUnitFacingDirection(unit);
  const summonCount = getSwarmEvolutionSummonCount(unit);
  for (let i = 0; i < summonCount; i += 1) {
    const spawn = spawnUnit(summonType, unit.side, clampWorldX(unit.x - dir * (30 + i * 18)));
    spawn.y = unit.y + (i - (summonCount - 1) / 2) * 9;
    spawn.forceCharge = true;
    spawn.summonerId = unit.id;
  }
  state.blasts.push({ x: unit.x, y: unit.y - 42, radius: 58, life: 0.32, duration: 0.32, color: "#cde69b" });
  popText(unit.x, unit.y - 116, `召唤${label} x${summonCount}`, "#cde69b");
}

function getMinerMoveSpeed(unit) {
  return unit.speed ?? UNIT.miner.speed;
}

function updateGoldRushMiner(unit, dt) {
  const isPlayer = unit.side === "player";
  unit.carryResource = "gold";
  const home = isPlayer ? FIELD.playerGate - 36 : FIELD.enemyGate + 36;
  const bagSize = UNIT[unit.type]?.bagSize ?? UNIT.miner.bagSize;
  const mustDeposit = unit.carry >= bagSize;

  if (mustDeposit) {
    unit.goldRushMineId = null;
    if (moveUnitTowardPoint(unit, home, FIELD.ground, getMinerMoveSpeed(unit), dt, 5)) {
      return;
    }
    if (isPlayer) state.gold += unit.carry;
    else state.enemyGold += unit.carry;
    popText(unit.x, unit.y - 52, `入库 +${unit.carry}`, isPlayer ? "#f5c542" : "#b7f56e");
    unit.carry = 0;
    unit.mineTimer = 0;
    updateHud();
    return;
  }

  const mine = getGoldRushMineForMiner(unit);
  if (!mine) {
    unit.goldRushMineId = null;
    if (unit.carry > 0) {
      if (moveUnitTowardPoint(unit, home, FIELD.ground, getMinerMoveSpeed(unit), dt, 5)) {
        return;
      }
      if (isPlayer) state.gold += unit.carry;
      else state.enemyGold += unit.carry;
      popText(unit.x, unit.y - 52, `入库 +${unit.carry}`, isPlayer ? "#f5c542" : "#b7f56e");
      unit.carry = 0;
      unit.mineTimer = 0;
      updateHud();
    } else {
      moveUnitTowardPoint(unit, home, FIELD.ground, getMinerMoveSpeed(unit), dt, 5);
    }
    return;
  }

  if (moveUnitTowardPoint(unit, mine.x, mine.y ?? FIELD.ground, getMinerMoveSpeed(unit), dt, 5)) {
    return;
  }

  unit.mineTimer += dt;
  if (unit.mineTimer < 1) return;
  unit.mineTimer = 0;
  const space = bagSize - unit.carry;
  const mined = Math.min(getMiningGoldPerSwing(unit), space, mine.remaining);
  if (mined <= 0) {
    unit.goldRushMineId = null;
    return;
  }
  unit.carry += mined;
  mine.remaining -= mined;
  popText(unit.x, unit.y - 52, `袋 ${unit.carry}/${bagSize}`, isPlayer ? "#f5c542" : "#b7f56e");
  if (mine.remaining <= 0) {
    popText(mine.x, (mine.y ?? FIELD.ground) - 72, "金矿枯竭", "#d8c7a0");
    unit.goldRushMineId = null;
  }
}

function getGoldRushMineForMiner(unit) {
  const current = state.goldRushMines.find((mine) => mine.id === unit.goldRushMineId && canMineGoldRushMine(unit, mine));
  if (current) return current;
  const available = state.goldRushMines
    .filter((mine) => canMineGoldRushMine(unit, mine))
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y ?? FIELD.ground) - distanceTo(unit.x, unit.y, b.x, b.y ?? FIELD.ground));
  const mine = available[0];
  unit.goldRushMineId = mine?.id ?? null;
  return mine;
}

function canMineGoldRushMine(unit, mine) {
  if (!mine || mine.remaining <= 0) return false;
  const occupyingSide = getGoldRushMineOccupyingSide(mine);
  return !occupyingSide || occupyingSide === unit.side;
}

function getGoldRushMineOccupyingSide(mine) {
  const miner = state.units.find((candidate) => (
    isMiningWorker(candidate)
    && candidate.hp > 0
    && !isUnitHidden(candidate)
    && candidate.goldRushMineId === mine.id
    && distanceTo(candidate.x, candidate.y, mine.x, mine.y ?? FIELD.ground) <= 10
    && candidate.carry < getMiningBagSize(candidate)
  ));
  return miner?.side ?? null;
}

function updateAttackingMiner(unit, dt) {
  const data = UNIT.miner;
  const range = getUnitRange(unit);
  const statue = unit.side === "player"
    ? { kind: "statue", side: "enemy", x: FIELD.enemyBase, y: FIELD.ground - 80 }
    : { kind: "statue", side: "player", x: FIELD.playerBase, y: FIELD.ground - 80 };
  const target = nearestEnemy(unit, 230) ?? statue;
  const desiredX = unit.side === "player" ? target.x - range + 8 : target.x + range - 8;

  if (target && Math.abs(unit.x - target.x) <= range) {
    attack(unit, target);
    return;
  }
  if (target.kind === "statue" && Math.abs(unit.x - target.x) <= range + 12) {
    attack(unit, target);
    return;
  }
  if (Math.abs(unit.x - desiredX) > 4) {
    unit.x += Math.sign(desiredX - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
  }
}

function canEnterCastle(unit) {
  return unit.side === "player" && (unit.type === "miner" || unit.type === "gnawMiner" || unit.type === "summoner" || unit.type === "wraithMiner");
}

function isUnitHidden(unit) {
  return (unit.inCastle && canEnterCastle(unit)) || (unit.type === "swarmWorm" && unit.wormBurrowed);
}

function isReaperStealthed(unit) {
  return unit?.type === "reaper" && (unit.reaperStealthTimer ?? 0) > 0;
}

function shouldEnterPlayerCastle(unit) {
  return canEnterCastle(unit) && state.command === "retreat";
}

function isPlayerRetreating(unit) {
  return unit.side === "player" && state.command === "retreat";
}

function moveTowardCastle(unit, dt) {
  const data = UNIT[unit.type];
  const castleX = FIELD.playerBase + 42;

  if (unit.type === "treeEnt" && unit.rooted) {
    unit.rooted = false;
    killTreeScorpions(unit);
    popText(unit.x, unit.y - 120, "拔根撤退", "#8ee0cf");
  }
  if (unit.type === "waterElement" && unit.boundTargetId) releaseFrozenTarget(unit);

  if (distanceTo(unit.x, unit.y, castleX, FIELD.ground) > 6) {
    const speed = isMiningWorker(unit) ? getMinerMoveSpeed(unit) : (unit.speed ?? data.speed);
    moveUnitTowardPoint(unit, castleX, FIELD.ground, speed, dt, 6);
    return true;
  }

  unit.x = castleX;
  unit.y = FIELD.ground;
  unit.inCastle = true;
  unit.cooldown = 0;
  if (unit.carry > 0) {
    depositMinerCarry(unit, true);
    unit.carry = 0;
    unit.carryResource = getMinerResource(unit);
    unit.mineTimer = 0;
  }
  clearPoison(unit, "进城解毒");
  unit.burnTimer = 0;
  unit.burnDps = 0;
  unit.burnTick = 0;
  popText(unit.x, unit.y - 78, "进入城堡", "#d9e8ff");
  return true;
}

function getMoveFactor(unit) {
  let factor = 1;
  if (isPoisoned(unit)) factor = Math.min(factor, unit.poisonSlow ?? 1);
  if ((unit.corrosionTimer ?? 0) > 0) factor = Math.min(factor, unit.corrosionSlow ?? 1);
  if (unit.stormSlowTimer > 0) factor = Math.min(factor, unit.stormSlowFactor ?? 1);
  for (const field of state.iceFields) {
    if (field.side === unit.side) continue;
    if (Math.abs(unit.x - field.x) <= field.radius) factor = Math.min(factor, field.slow);
  }
  for (const field of state.thornFields) {
    if (field.side === unit.side) continue;
    if (Math.abs(unit.x - field.x) <= field.radius && Math.abs((unit.y ?? FIELD.ground) - field.y) <= field.radius) {
      factor = Math.min(factor, field.slow);
    }
  }
  for (const barricade of state.barricades ?? []) {
    if (!areHostileSides(barricade.side, unit.side)) continue;
    if (isPointInsideBarricade(unit.x, unit.y ?? FIELD.ground, barricade)) {
      factor = Math.min(factor, barricade.slow);
    }
  }
  for (const slime of state.slimeFields ?? []) {
    if (!areHostileSides(slime.side, unit.side)) continue;
    if (distanceTo(unit.x, unit.y ?? FIELD.ground, slime.x, slime.y) <= slime.radius) {
      factor = Math.min(factor, slime.slow);
    }
  }
  for (const web of state.webFields ?? []) {
    if (distanceTo(unit.x, unit.y ?? FIELD.ground, web.x, web.y) > web.radius) continue;
    if (areHostileSides(web.side, unit.side)) {
      factor = Math.min(factor, web.enemySlow);
    } else if (isSpiderUnit(unit.type)) {
      factor *= web.spiderBoost;
    }
  }
  if (activeCampaign?.iceRoad) factor *= getIceRoadMoveFactor(unit);
  if (activeCampaign?.snow && !(activeCampaign.snow.ignoreGiant && UNIT[unit.type]?.giant)) {
    factor *= activeCampaign.snow.moveFactor ?? 1;
  }
  if (unit.inspiredZombieTimer > 0 && ZOMBIE_UNITS.has(unit.type)) factor *= 2;
  if (unit.rageTimer > 0) factor *= 2;
  if (unit.swordsmanSelfRageTimer > 0) factor *= 1.5;
  if (unit.type === "minotaur" && unit.minotaurRage) factor *= UNIT.minotaur.deathRageMoveFactor;
  if (unit.type === "rhinoMan" && unit.rhinoRage) factor *= UNIT.rhinoMan.deathRageMoveFactor;
  if (isReaperStealthed(unit)) factor *= UNIT.reaper.stealthSpeed / UNIT.reaper.speed;
  return factor;
}

function isSpiderUnit(type) {
  return type === "spider" || type === "giantSpider";
}

function getIceRoadMoveFactor(unit) {
  const road = activeCampaign?.iceRoad;
  if (!road) return 1;
  if (road.affectedSides && !road.affectedSides.includes(unit.side)) return 1;
  if (road.fastFactor === road.slowFactor || road.slowDuration === undefined) return road.slowFactor ?? 1;
  return (unit.iceRoadMoveTimer ?? 0) >= road.slowDuration ? road.fastFactor : road.slowFactor;
}

function updateIceRoadMoveTimer(unit, beforeX, beforeY, dt) {
  const dx = unit.x - beforeX;
  const dy = unit.y - beforeY;
  unit.velocityX = dt > 0 ? dx / dt : 0;
  unit.velocityY = dt > 0 ? dy / dt : 0;
  if (Math.abs(dx) > 0.05) unit.lastMoveDir = Math.sign(dx);
  if (!activeCampaign?.iceRoad) return;
  if (Math.hypot(dx, dy) > 0.1) unit.iceRoadMoveTimer = (unit.iceRoadMoveTimer ?? 0) + dt;
  else unit.iceRoadMoveTimer = 0;
}

function getAttackSpeedFactor(unit) {
  let factor = 1;
  for (const field of state.iceFields) {
    if (field.side === unit.side) continue;
    if (Math.abs(unit.x - field.x) <= field.radius) factor = Math.min(factor, field.attackSlow ?? 1);
  }
  if (unit.rageTimer > 0) factor *= 2;
  if (unit.swordsmanSelfRageTimer > 0) factor *= 1.5;
  if (unit.type === "minotaur" && unit.minotaurRage) factor *= UNIT.minotaur.deathRageAttackFactor;
  if (unit.type === "rhinoMan" && unit.rhinoRage) factor *= UNIT.rhinoMan.deathRageAttackFactor;
  return factor;
}

function getDesiredX(unit, target) {
  const range = getUnitRange(unit);
  if (target && target.kind !== "statue" && isInsideBlindSpot(unit, target)) {
    const dir = unit.side === "player" ? -1 : 1;
    const retreatX = target.x + dir * (UNIT[unit.type].blindSpot + 18);
    return Math.max(FIELD.playerGate + 34, Math.min(FIELD.enemyGate - 34, retreatX));
  }
  if (target && target.kind !== "statue" && isIgnoringBlindTarget(unit, target)) {
    return unit.x;
  }
  if (unit.side === "player") {
    if (unit.forceCharge) return FIELD.enemyBase;
    if (state.command === "retreat") return UNIT[unit.type]?.giant ? FIELD.playerGate + 58 : FIELD.playerBase + 42;
    if (target && isRetaliationTarget(unit, target)) return target.x - range + 8;
    if (target && target.kind !== "statue" && state.command === "attack") return target.x - range + 8;
    if (state.command === "guard") return getPlayerRallyX(unit);
    if (state.command === "attack" && state.attackIntent === "tower") return getTowerRallyX(unit, "player");
    if (target && target.kind !== "statue") return target.x - range + 8;
    if (target) return target.x - range + 8;
    return FIELD.enemyBase;
  }

  if (unit.forceCharge) return FIELD.playerBase;
  if (state.enemyCommand === "retreat") return FIELD.enemyBase - 42;
  if (target && isRetaliationTarget(unit, target) && !isEnemyCounterPushing()) return target.x + range - 8;
  if (state.enemyCommand === "guard") return getEnemyFormationX(unit);
  if (state.enemyCommand === "attack" && state.towerOwner !== "enemy") return getTowerRallyX(unit, "enemy");
  if (target && target.kind !== "statue") return target.x + range - 8;
  if (target) return target.x + range - 8;
  return FIELD.playerBase;
}

function getDesiredPoint(unit, target, desiredX) {
  if (target && target.kind !== "statue") {
    return { x: desiredX, y: target.y ?? unit.y };
  }
  if (unit.side === "player") {
    if (state.command === "guard" && !target) return getGuardFormationPoint(unit, "player");
    if (state.command === "attack" && state.attackIntent === "tower") return getTowerRallyPoint(unit, "player");
  }
  if (unit.side === "enemy" && state.enemyCommand === "attack" && state.towerOwner !== "enemy") {
    return getTowerRallyPoint(unit, "enemy");
  }
  return { x: desiredX, y: unit.y };
}

function getMoveTolerance(unit, target, desiredX) {
  if (isTowerRallyCommand(unit)) return getTowerPointTolerance(unit);
  if (target?.kind === "statue") return 4;
  if (target && target.kind !== "statue") return 4;
  if ((unit.side === "player" && state.command === "guard") || (unit.side === "enemy" && state.enemyCommand === "guard")) {
    return getGuardPointTolerance(unit);
  }
  const enemyBase = unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase;
  if (Math.abs(desiredX - enemyBase) < 2) return 4;
  return getCommandPointTolerance(unit);
}

function getForcedStatueTarget(unit, target) {
  if (!isStatueAttackCommand(unit)) return null;
  const baseX = unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase;
  if (Math.abs(unit.x - baseX) > getStatueAttackReach(unit) + 80) return null;
  if (target?.kind === "statue") return target;
  return {
    kind: "statue",
    side: unit.side === "player" ? "enemy" : "player",
    x: baseX,
    y: FIELD.ground - 80,
  };
}

function isStatueAttackCommand(unit) {
  if (UNIT[unit.type]?.statueOnly) return true;
  if (unit.side === "player") return state.command === "attack" && state.attackIntent === "statue";
  return unit.side === "enemy" && state.enemyCommand === "attack" && state.towerOwner === "enemy";
}

function getStatueAttackReach(unit) {
  return Math.max(getUnitRange(unit) + 16, getCollisionRadius(unit) + 40);
}

function getCommandPointTolerance(unit) {
  return UNIT[unit.type]?.giant ? 110 : 150;
}

function getTowerPointTolerance(unit) {
  return UNIT[unit.type]?.giant ? 12 : 8;
}

function getGuardPointTolerance(unit) {
  return UNIT[unit.type]?.giant ? 36 : 24;
}

function isTowerRallyCommand(unit) {
  if (unit.side === "player") {
    return state.command === "attack" && state.attackIntent === "tower";
  }
  return unit.side === "enemy" && state.enemyCommand === "attack" && state.towerOwner !== "enemy";
}

function isEnemyCounterPushing() {
  return (state.enemyCounterPushTimer ?? 0) > 0;
}

function isInsideTowerCaptureArea(unit) {
  return Math.abs(unit.x - CENTER_TOWER.x) <= CENTER_TOWER.radiusX
    && Math.abs(unit.y - CENTER_TOWER.y) <= CENTER_TOWER.radiusY;
}

function isPlayerForcedGuarding(unit) {
  if (unit.side !== "player" || state.command !== "guard") return false;
  if (unit.forceCharge || unit.type === "miner" || unit.type === "electricGate") return false;
  const point = getGuardFormationPoint(unit, "player");
  return distanceTo(unit.x, unit.y, point.x, point.y) > getGuardPointTolerance(unit);
}

function moveTowardGuardLine(unit, dt) {
  const data = UNIT[unit.type];
  const baseX = unit.side === "enemy" ? state.enemyLineX : null;
  const point = getGuardFormationPoint(unit, unit.side, baseX);
  moveUnitTowardPoint(unit, point.x, point.y, unit.speed ?? data.speed, dt, getGuardPointTolerance(unit));
}

function getEnemyFormationX(unit) {
  const point = getGuardFormationPoint(unit, "enemy", state.enemyLineX);
  return Math.min(getEnemyRallyBaseX() + RALLY.maxSpread, Math.max(FIELD.playerGate + 220, point.x));
}

function getPlayerRallyBaseX(sideMines = null) {
  return getFrontMineColumnX("player", sideMines) + RALLY.guardForwardFromMine;
}

function getEnemyRallyBaseX(sideMines = null) {
  return getFrontMineColumnX("enemy", sideMines) - RALLY.guardForwardFromMine;
}

function getFrontMineColumnX(side, sideMines = null) {
  const mines = (sideMines?.[side] ?? getSideMines(side)).filter((mine) => (mine.resource ?? "gold") === "gold");
  if (!mines.length) return side === "player" ? FIELD.playerMineX : FIELD.enemyMineX;
  return mines.reduce((frontX, mine) => (
    side === "player" ? Math.max(frontX, mine.x) : Math.min(frontX, mine.x)
  ), mines[0].x);
}

function getPlayerRallyX(unit) {
  return getGuardFormationPoint(unit, "player").x;
}

function getEnemyRallyX(unit) {
  return getGuardFormationPoint(unit, "enemy").x;
}

function getGuardFormationPoint(unit, side, baseOverride = null) {
  const index = getGuardFormationIndex(unit, side);
  const rowOffsets = [-124, -88, -52, -16, 20, 56, 92, 128];
  const rows = rowOffsets.length;
  const row = index % rows;
  const column = Math.floor(index / rows) % 5;
  const rowStagger = (row % 4) * 78;
  const columnSpacing = 220;
  const baseX = baseOverride ?? (side === "player" ? getPlayerRallyBaseX() : getEnemyRallyBaseX());
  const direction = side === "player" ? 1 : -1;
  return {
    x: baseX + direction * (column * columnSpacing + rowStagger),
    y: FIELD.ground + rowOffsets[row],
  };
}

function getGuardFormationIndex(unit, side) {
  const units = state.units
    .filter((candidate) => candidate.side === side && candidate.hp > 0 && !isUnitHidden(candidate))
    .filter((candidate) => candidate.type !== "miner" && candidate.type !== "electricGate" && !candidate.forceCharge)
    .sort((a, b) => a.id - b.id);
  const index = units.findIndex((candidate) => candidate.id === unit.id);
  return index >= 0 ? index : Math.abs(unit.id);
}

function getTowerRallyX(unit, side) {
  return getTowerRallyPoint(unit, side).x;
}

function getTowerRallyPoint(unit, side) {
  const column = unit.id % 5;
  const row = Math.floor(unit.id / 5) % 5;
  const direction = side === "player" ? -1 : 1;
  const xOffsets = [8, 26, 44, 62, 80];
  const yOffsets = [-54, -27, 0, 27, 54];
  return {
    x: CENTER_TOWER.x + direction * xOffsets[column],
    y: CENTER_TOWER.y + yOffsets[row],
  };
}

function getUnitRange(unit) {
  if (unit.type === "spearman" && !unit.spearThrown) return UNIT.spearman.throwRange;
  return UNIT[unit.type]?.range ?? 0;
}

function isInsideBlindSpot(unit, target) {
  const blindSpot = UNIT[unit.type]?.blindSpot;
  if (!blindSpot || !target || target.kind === "statue") return false;
  return Math.abs(unit.x - target.x) <= blindSpot;
}

function isSiegeUnit(unit) {
  return unit?.type === "catapult" || unit?.type === "rocketCart" || unit?.type === "undeadCatapult";
}

function updateSiegeBlindTarget(unit, target) {
  if (!isSiegeUnit(unit)) return;
  if (unit.siegeBlindTargetId) {
    const ignored = state.units.find((candidate) => candidate.id === unit.siegeBlindTargetId && candidate.hp > 0);
    if (!ignored || Math.abs(unit.x - ignored.x) > getUnitRange(unit)) {
      unit.siegeBlindTargetId = null;
    }
  }
  if (target?.kind !== "statue" && isInsideBlindSpot(unit, target)) {
    unit.siegeBlindTargetId = target.id;
  }
}

function isIgnoringBlindTarget(unit, target) {
  if (!isSiegeUnit(unit) || !target?.id || unit.siegeBlindTargetId !== target.id) return false;
  return Math.abs(unit.x - target.x) <= getUnitRange(unit);
}

function canAttackFromDistance(unit, target, range) {
  if (!target) return false;
  if (isInsideBlindSpot(unit, target)) return false;
  if (isIgnoringBlindTarget(unit, target)) return false;
  if (state?.fourWay) return distanceTo(unit.x, unit.y, target.x, target.y ?? unit.y) <= range;
  if (target.kind !== "statue" && Math.abs((target.y ?? unit.y) - unit.y) > getAttackLaneTolerance(unit)) return false;
  return Math.abs(unit.x - target.x) <= range;
}

function getAttackLaneTolerance(unit) {
  if (UNIT[unit.type]?.giant) return 95;
  if ((UNIT[unit.type]?.range ?? 0) > 80) return 85;
  return 42;
}

function findTarget(unit) {
  if (isUnitHidden(unit)) return null;
  if (isReaperStealthed(unit)) return null;
  if (unit.type === "goblin" || unit.type === "goblinExpert" || unit.type === "shaman") return null;
  const barricadeTarget = findBlockingBarricadeTarget(unit);
  if (barricadeTarget) return barricadeTarget;
  if (UNIT[unit.type]?.statueOnly) {
    return {
      kind: "statue",
      side: unit.side === "player" ? "enemy" : "player",
      x: unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase,
      y: FIELD.ground - 80,
    };
  }
  const retaliationTarget = getRetaliationTarget(unit);
  if (retaliationTarget) return retaliationTarget;
  const priorityTarget = getAiPriorityTarget(unit);
  if (priorityTarget) return priorityTarget;

  let nearby = null;
  let nearestDistance = Infinity;

  for (const other of state.units) {
    if (other.side === unit.side || other.hp <= 0) continue;
    if (isUnitHidden(other)) continue;
    if (!canTarget(unit, other)) continue;
    if (!isAheadOf(unit, other)) continue;
    if (unit.type === "waterElement" && other.frozenBy) continue;

    const searchRange = Math.max(260, getUnitRange(unit));
    const distance = distanceTo(unit.x, unit.y, other.x, other.y);
    if (distance < searchRange && distance < nearestDistance) {
      nearby = other;
      nearestDistance = distance;
    }
  }

  if (nearby) return nearby;

  if (unit.side === "player" && state.command === "attack" && state.attackIntent === "statue") {
    return { kind: "statue", side: "enemy", x: FIELD.enemyBase, y: FIELD.ground - 80 };
  }

  if (unit.side === "enemy" && state.enemyCommand === "attack" && state.towerOwner === "enemy") {
    return { kind: "statue", side: "player", x: FIELD.playerBase, y: FIELD.ground - 80 };
  }

  return null;
}

function getAiPriorityTarget(unit) {
  if (!unit || isPlayerControlledSide(unit.side)) return null;
  const faction = factionForSide(unit.side);
  const profile = AI_ROLE_PROFILES[faction];
  if (!profile?.raider?.includes(unit.type) && !(faction === "chaos" && CHAOS_AI_RAIDER_UNITS.has(unit.type))) return null;
  const searchRange = Math.max(430, getUnitRange(unit) + 220);
  const candidates = state.units
    .filter((target) => areHostileSides(unit.side, target.side))
    .filter((target) => target.hp > 0 && !isUnitHidden(target) && canTarget(unit, target))
    .filter((target) => state?.fourWay || isAheadOf(unit, target))
    .filter((target) => distanceTo(unit.x, unit.y, target.x, target.y ?? unit.y) <= searchRange)
    .map((target) => ({
      target,
      threat: getAiThreatValue(target),
      distance: distanceTo(unit.x, unit.y, target.x, target.y ?? unit.y),
    }))
    .filter((item) => item.threat >= 260)
    .sort((a, b) => (b.threat - a.threat) || (a.distance - b.distance));
  return candidates[0]?.target ?? null;
}

function getRetaliationTarget(unit) {
  if (!unit.retaliateTargetId || unit.retaliateTimer <= 0) return null;
  const target = state.units.find((other) => other.id === unit.retaliateTargetId);
  if (!target || target.hp <= 0 || isUnitHidden(target)) return null;
  if (!canTarget(unit, target)) return null;
  return target;
}

function isRetaliationTarget(unit, target) {
  return Boolean(target?.id && unit.retaliateTargetId === target.id && unit.retaliateTimer > 0);
}

function markRetaliationTarget(target, attacker) {
  if (!target || target.kind || !attacker || attacker.kind) return;
  if (target.side === attacker.side || target.hp <= 0 || attacker.hp <= 0) return;
  if (!canTarget(target, attacker)) return;
  target.retaliateTargetId = attacker.id;
  target.retaliateTimer = 4;
  if (target.side === "enemy" && state.enemyCommand === "guard") {
    triggerEnemyCounterPush(attacker);
  }
}

function triggerEnemyCounterPush(attacker) {
  if ((state.enemyCounterCooldown ?? 0) > 0) return;
  if (!isAiCombatThreat(attacker)) return;
  const enemyFighters = countFighters("enemy");
  const enemyPower = getArmyPower("enemy");
  const playerPower = getArmyPower("player");
  if (enemyFighters < 3 || enemyPower < playerPower * 0.55) return;

  state.enemyCounterPushTimer = Math.max(state.enemyCounterPushTimer ?? 0, 4.5);
  state.enemyCounterCooldown = 5.5;
  state.enemyCounterTargetX = attacker.x;
  state.enemyCommandTimer = Math.min(state.enemyCommandTimer, 1.2);
  popText(FIELD.enemyGate - 115, FIELD.ground - 150, "敌方整队反击", "#ffb0a3");
}

function nearestEnemy(unit, range) {
  if (isUnitHidden(unit)) return null;
  let nearest = null;
  let nearestDistance = range;

  for (const other of state.units) {
    if (other.side === unit.side || other.hp <= 0) continue;
    if (isUnitHidden(other)) continue;
    if (!canTarget(unit, other)) continue;
    if (!isAheadOf(unit, other)) continue;

    const distance = Math.abs(other.x - unit.x);
    if (distance <= nearestDistance) {
      nearest = other;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function canTarget(attacker, target) {
  if (isUnitHidden(attacker) || isUnitHidden(target)) return false;
  if (isReaperStealthed(target)) return false;
  if (UNIT[target.type]?.untargetable) return false;
  return !(UNIT[target.type]?.flying && isMelee(attacker) && !UNIT[attacker.type]?.antiAir);
}

function isMelee(unit) {
  return getUnitRange(unit) <= 60;
}

function isAheadOf(unit, target) {
  if (state?.fourWay) return true;
  return unit.side === "player" ? target.x > unit.x : target.x < unit.x;
}

function attack(unit, target) {
  const data = UNIT[unit.type];
  if (isUnitHidden(unit) || isUnitHidden(target)) return;
  if (unit.type === "linghan") return;
  if (unit.type === "spearman" && unit.spearRecoverTimer > 0) return;
  if (unit.cooldown > 0) return;
  if (unit.type === "ironCavalry") {
    attackIronCavalry(unit, target, Math.abs(unit.x - target.x));
    return;
  }
  if (unit.type === "reaper" && isReaperStealthed(unit)) {
    attackReaperAmbush(unit, target);
    return;
  }
  unit.cooldown = data.cooldown ?? 0.9;
  unit.combatTimer = 3;
  markRetaliationTarget(target, unit);

  if (unit.type === "spearman" && !unit.spearThrown) {
    throwSpear(unit, target);
    return;
  }

  if (unit.type === "waterElement") {
    bindFreeze(unit, target);
    return;
  }

  if (unit.type === "poisonBug") {
    explodePoisonBug(unit, target);
    return;
  }

  if (unit.type === "blastBug") {
    explodeBlastBug(unit, target);
    return;
  }

  if (unit.type === "caterpillar" || unit.type === "hoodCaterpillar") {
    launchNeuralBombs(unit, target);
    return;
  }

  if (unit.type === "boneStinger") {
    attackBoneStinger(unit, target);
    return;
  }

  if (unit.type === "lurker") {
    attackLurker(unit, target);
    return;
  }

  if (unit.type === "bomber") {
    unit.exploded = true;
    unit.noCorpse = true;
    unit.hp = 0;
    explodeAt(target.x, unit.y - 20, unit.side, data.damage, data.splash, "轰", {
      burnDps: data.burnDps,
      burnDuration: data.burnDuration,
    });
    return;
  }

  if (unit.type === "orderMiniBomb") {
    explodeOrderMiniBomb(unit, target);
    return;
  }

  if (unit.type === "windElement") {
    strikeLightning(unit, target);
    return;
  }

  if (unit.type === "archmage") {
    castChainLightning(unit, target);
    return;
  }

  if (unit.type === "shotgunner") {
    fireShotgun(unit, target);
    return;
  }

  if (unit.type === "stoneGolem") {
    attackStoneGolem(unit, target);
    return;
  }

  if (unit.type === "dreadfire") {
    castDreadfireSpell(unit, target);
    return;
  }

  if (unit.type === "redflame") {
    castRedflameSpell(unit, target);
    return;
  }

  if (unit.type === "stormLich") {
    summonStormCloud(unit, target);
    return;
  }

  if (unit.type === "hurricane") {
    launchTornado(unit, target);
    return;
  }

  if (unit.type === "chaosGiant" || unit.type === "boneGiant") {
    smashArea(unit, target);
    return;
  }

  if (unit.type === "catapult" || unit.type === "enslavedGiant" || unit.type === "undeadCatapult") {
    throwBoulder(unit, target);
    return;
  }

  if (unit.type === "rocketCart") {
    launchRocketVolley(unit, target);
    return;
  }

  if (unit.type === "undeadMage") {
    castUndeadStaffSlam(unit, target);
    return;
  }

  if (unit.type === "candlelight") {
    attackCandlelight(unit, target);
    return;
  }

  if (unit.type === "reaper") {
    attackReaper(unit, target);
    return;
  }

  if (unit.type === "minotaur") {
    attackMinotaur(unit, target);
    return;
  }

  if (unit.type === "hornKnightRider") {
    attackHornKnightRider(unit, target);
    return;
  }

  if (unit.type === "apeMan" || unit.type === "summonedApeMan") {
    attackApeMan(unit, target);
    return;
  }

  if (unit.type === "suikai") {
    castSuikaiPierce(unit, target);
    return;
  }

  if (unit.type === "scaldStrike") {
    explodeScaldStrike(unit);
    return;
  }

  if (unit.type === "deadCorpse") {
    explodeDeadCorpse(unit);
    return;
  }

  if (unit.type === "treeEnt") {
    castTreeRoot(unit, target);
    return;
  }

  if (
    unit.type === "archer" ||
    unit.type === "goldenArcher" ||
    unit.type === "crossbow" ||
    unit.type === "poisonZombie" ||
    unit.type === "necromancer" ||
    unit.type === "summoner" ||
    unit.type === "boneThrower" ||
    unit.type === "musketeer" ||
    unit.type === "demonArcher" ||
    unit.type === "fireElement" ||
    unit.type === "javelinThrower" ||
    unit.type === "goblinVulture" ||
    unit.type === "undeadVulture" ||
    unit.type === "corrosiveSpitter" ||
    unit.type === "antQueen"
  ) {
    if (unit.type === "boneThrower") {
      if ((unit.boneAmmo ?? 0) <= 0) {
        popText(unit.x, unit.y - 96, "骨头用尽", "#d9d0b8");
        return;
      }
      unit.boneAmmo -= 1;
    }
    state.arrows.push({
      x: unit.x,
      y: unit.y - 52 + (data.flying ? -42 : 0),
      tx: target.x,
      ty: target.y ? target.y - 38 + (UNIT[target.type]?.flying ? -42 : 0) : unit.y - 52,
      side: unit.side,
      damage: getAttackDamage(unit, target, data.damage),
      sourceId: unit.id,
      sourceType: unit.type,
      target,
      life: unit.type === "crossbow" ? 0.42 : 0.55,
      type: unit.type,
      splash: data.splash,
      aoeLimit: data.aoeLimit,
      poison: unit.type === "javelinThrower" && Math.random() < data.poisonChance,
    });
    return;
  }

  const rawDamage = unit.damage ?? data.damage;
  const orderMeleeCritical = shouldTriggerOrderMeleeCritical(unit, target);
  const veteranCleave = shouldTriggerOrderVeteranCleave(unit, target);
  const attackDamage = getAttackDamage(unit, target, rawDamage)
    * (orderMeleeCritical ? ORDER_COMBAT_TRAIT.meleeDamageFactor : 1)
    * (veteranCleave ? 2 : 1);
  const dealt = applyDamage(target, attackDamage, unit.side);
  if (dealt > 0 && target.kind !== "statue") target.lastDamageUnitId = unit.id;
  handleDamageDealt(unit, target, dealt);
  if (orderMeleeCritical && dealt > 0) popText(target.x, target.y - 108, "秩序重击", "#fff1a8");
  if (veteranCleave) applyOrderVeteranCleave(unit, target, attackDamage);
  if ((unit.poisonOnHit || data.poisonOnHit) && target.kind !== "statue") {
    applyPoison(target, unit.poisonHitDps ?? data.poisonDps ?? 2, data.poisonDuration ?? Infinity, { sourceSide: unit.side, sourceUnitId: unit.id });
  }
  if (unit.type === "fireImp" && target.kind !== "statue") {
    applyBurn(target, data.burnDps, data.burnDuration);
  }
  if (data.stunDuration) applyStun(target, data.stunDuration);
}

function explodePoisonBug(unit, target) {
  const data = UNIT.poisonBug;
  unit.exploded = true;
  unit.noCorpse = true;
  unit.hp = 0;
  const targets = getUnitsInRadius(target.x, data.splash, unit.side, data.aoeLimit);
  targets.forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, data.damage, {
      label: "爆",
      color: "#b7e06b",
      yOffset: -82,
      sourceSide: unit.side,
      sourceUnitId: unit.id,
    });
    handleDamageDealt(unit, enemy, dealt);
    applyCorrosion(enemy, data.corrosionDps, data.corrosionDuration, {
      growth: data.corrosionDpsGrowth,
      slow: data.corrosionSlow,
    });
  });
  state.blasts.push({ x: target.x, y: unit.y - 24, radius: data.splash, life: 0.34, duration: 0.34, color: "#b7e06b" });
  popText(unit.x, unit.y - 84, "腐蚀自爆", "#b7e06b");
}

function explodeBlastBug(unit, target) {
  const data = UNIT.blastBug;
  unit.exploded = true;
  unit.noCorpse = true;
  unit.hp = 0;
  const targets = getUnitsInRadius(target.x, data.splash, unit.side, data.aoeLimit, null, target.y);
  targets.forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, data.damage, {
      label: "爆",
      color: "#ffb45e",
      yOffset: -82,
      sourceSide: unit.side,
      sourceUnitId: unit.id,
    });
    handleDamageDealt(unit, enemy, dealt);
  });
  state.blasts.push({ x: target.x, y: unit.y - 24, radius: data.splash, life: 0.34, duration: 0.34, color: "#ffb45e" });
  popText(unit.x, unit.y - 84, "自爆", "#ffb45e");
}

function explodeOrderMiniBomb(unit, target = unit) {
  const data = UNIT.orderMiniBomb;
  unit.exploded = true;
  unit.noCorpse = true;
  unit.hp = 0;
  const x = target?.x ?? unit.x;
  const y = target?.y ?? unit.y;
  getUnitsInRadius(x, data.splash, unit.side, data.aoeLimit, null, y).forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, data.damage, {
      label: "小炸弹",
      color: "#ffce7a",
      yOffset: -78,
      sourceSide: unit.side,
      sourceUnitId: unit.id,
    });
    handleDamageDealt(unit, enemy, dealt);
  });
  state.blasts.push({ x, y: y - 24, radius: data.splash, life: 0.3, duration: 0.3, color: "#ffce7a" });
  popText(x, y - 70, "小炸弹爆炸", "#ffce7a");
}

function fireShotgun(unit, target) {
  const data = UNIT.shotgunner;
  const dir = Math.sign((target?.x ?? unit.x) - unit.x) || getUnitFacingDirection(unit);
  const candidates = state.units
    .filter((enemy) => areHostileSides(unit.side, enemy.side))
    .filter((enemy) => enemy.hp > 0 && !isUnitHidden(enemy) && canTarget(unit, enemy))
    .filter((enemy) => Math.sign(enemy.x - unit.x || dir) === dir)
    .filter((enemy) => Math.abs(enemy.x - unit.x) <= data.range)
    .filter((enemy) => Math.abs((enemy.y ?? unit.y) - unit.y) <= data.spread);
  if (!candidates.length && target?.kind === "statue") {
    applyDamage(target, data.damage * Math.ceil(data.pellets * 0.35), unit.side);
    popText(unit.x, unit.y - 106, "散弹齐射", "#dbe8ff");
    return;
  }
  if (!candidates.length) return;
  const hits = new Map();
  for (let i = 0; i < data.pellets; i += 1) {
    const pelletY = unit.y + (Math.random() - 0.5) * data.spread * 2;
    const pelletX = unit.x + dir * (data.range * (0.55 + Math.random() * 0.42));
    const best = candidates
      .map((enemy) => ({ enemy, score: Math.abs((enemy.y ?? unit.y) - pelletY) + Math.abs(enemy.x - pelletX) * 0.18 }))
      .sort((a, b) => a.score - b.score)[0]?.enemy;
    if (!best) continue;
    hits.set(best, (hits.get(best) ?? 0) + 1);
    state.lightning.push({
      x1: unit.x + dir * 18,
      y1: unit.y - 44,
      x2: best.x + (Math.random() - 0.5) * 20,
      y2: (best.y ?? unit.y) - 46 + (Math.random() - 0.5) * 24,
      life: 0.1,
      duration: 0.1,
    });
  }
  hits.forEach((pellets, enemy) => {
    const dealt = applyDamage(enemy, data.damage * pellets, unit.side, { ranged: true });
    handleDamageDealt(unit, enemy, dealt);
    maybeApplyOrderRangedStunFromUnit(unit, enemy);
  });
  state.blasts.push({ x: unit.x + dir * 54, y: unit.y - 45, radius: 26, life: 0.16, duration: 0.16, color: "#dbe8ff" });
  popText(unit.x, unit.y - 106, "散弹齐射", "#dbe8ff");
}

function launchNeuralBombs(unit, target) {
  const data = UNIT[unit.type];
  const count = data.scatterCount ?? 1;
  const spread = data.scatterSpread ?? 0;
  for (let i = 0; i < count; i += 1) {
    const offset = (i - (count - 1) / 2) * spread;
    state.arrows.push({
      x: unit.x,
      y: unit.y - 58,
      tx: target.x + offset,
      ty: (target.y ?? unit.y) - 42 + (i % 2 ? 12 : -8),
      side: unit.side,
      damage: getAttackDamage(unit, target, data.damage),
      sourceId: unit.id,
      sourceType: unit.type,
      target,
      life: 0.72,
      duration: 0.72,
      type: "neuralBomb",
      splash: data.splash,
      aoeLimit: data.aoeLimit,
      retreatDuration: data.neuralRetreatDuration,
    });
  }
  popText(unit.x, unit.y - 112, count > 1 ? "神经散射" : "神经炸弹", "#cde69b");
}

function explodeNeuralBomb(arrow, source) {
  const targets = getUnitsInRadius(arrow.tx, arrow.splash ?? 80, arrow.side, arrow.aoeLimit ?? 5, null, arrow.ty);
  targets.forEach((target) => {
    const dealt = applyDamage(target, arrow.damage, arrow.side, { ranged: true });
    handleDamageDealt(source, target, dealt);
    applyNeuralRetreat(target, arrow.retreatDuration ?? 5, arrow.side);
  });
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.splash ?? 80, life: 0.32, duration: 0.32, color: "#cde69b" });
}

function impactCorrosiveSpit(arrow, source) {
  const data = UNIT.corrosiveSpitter;
  if (!arrow.target || arrow.target.kind === "statue" || arrow.target.hp <= 0 || isUnitHidden(arrow.target)) return;
  const splash = Math.random() < data.splashChance;
  const targets = splash
    ? getUnitsInRadius(arrow.target.x, data.splash, arrow.side, data.aoeLimit, null, arrow.target.y)
    : [arrow.target];
  targets.forEach((target) => {
    const dealt = applyDamage(target, arrow.damage, arrow.side, { ranged: true });
    handleDamageDealt(source, target, dealt);
    maybeApplyOrderRangedStun(arrow, target, source);
    applyCorrosion(target, data.corrosionDps, data.corrosionDuration, {
      slow: 1,
      sourceSide: arrow.side,
      sourceUnitId: arrow.sourceId,
    });
    applyVulnerability(target, data.vulnerabilityBonus, data.vulnerabilityMax, data.vulnerabilityDuration);
  });
  if (splash) {
    createSlimeField({
      x: arrow.target.x,
      y: arrow.target.y ?? FIELD.ground,
      side: arrow.side,
      radius: data.slimeRadius,
      slow: data.slimeSlow,
      duration: data.slimeDuration,
      label: "腐蚀粘液",
    });
    state.blasts.push({ x: arrow.target.x, y: (arrow.target.y ?? FIELD.ground) - 36, radius: data.splash, life: 0.3, duration: 0.3, color: "#b7e06b" });
  }
}

function applyVulnerability(target, bonus, maxBonus, duration) {
  if (!target || target.kind === "statue" || target.hp <= 0) return;
  target.vulnerabilityBonus = Math.min(maxBonus, (target.vulnerabilityBonus ?? 0) + bonus);
  target.vulnerabilityTimer = duration;
  popText(target.x, target.y - 112, `易伤 +${Math.round(target.vulnerabilityBonus * 100)}%`, "#cde69b");
}

function attackBoneStinger(unit, target) {
  const data = UNIT.boneStinger;
  const burrowed = (unit.boneStingerBurrowTimer ?? 0) > 0;
  spikePierceAttack(unit, target, burrowed ? data.burrowDamage : data.damage, burrowed ? 1 : data.pierceLimit, burrowed ? "#8d7a4a" : "#d8c87a", burrowed ? "钻刺" : "骨刺");
}

function attackLurker(unit, target) {
  const data = UNIT.lurker;
  spikePierceAttack(unit, target, data.damage, data.pierceLimit, "#cde69b", "潜刺");
}

function spikePierceAttack(unit, target, damage, limit, color, label) {
  const data = UNIT[unit.type];
  const dir = Math.sign((target?.x ?? unit.x) - unit.x) || getUnitFacingDirection(unit);
  const maxRange = getUnitRange(unit);
  const targets = state.units
    .filter((enemy) => (
      areHostileSides(unit.side, enemy.side)
      && enemy.hp > 0
      && !isUnitHidden(enemy)
      && !UNIT[enemy.type]?.untargetable
      && canTarget(unit, enemy)
      && Math.sign(enemy.x - unit.x || dir) === dir
      && Math.abs(enemy.x - unit.x) <= maxRange
      && Math.abs((enemy.y ?? FIELD.ground) - (unit.y ?? FIELD.ground)) <= 70
    ))
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))
    .slice(0, limit);
  if (!targets.length && target) targets.push(target);
  targets.forEach((enemy) => {
    const dealt = applyDamage(enemy, getAttackDamage(unit, enemy, damage), unit.side);
    if (dealt > 0) enemy.lastDamageUnitId = unit.id;
    handleDamageDealt(unit, enemy, dealt);
    state.spikes.push({
      x1: enemy.x - 8,
      x2: enemy.x + 8,
      y: (enemy.y ?? FIELD.ground) - 8,
      side: unit.side,
      life: 0.34,
      duration: 0.34,
    });
  });
  state.blasts.push({ x: unit.x + dir * Math.min(maxRange, 70), y: unit.y - 26, radius: 38, life: 0.22, duration: 0.22, color });
  popText(unit.x, unit.y - 108, label, color);
  unit.cooldown = data.cooldown ?? 1;
}

function createSlimeField({ x, y, side, radius, slow, duration, label = "粘液" }) {
  state.slimeFields = state.slimeFields ?? [];
  state.slimeFields.push({
    x,
    y,
    side,
    radius,
    slow,
    life: duration,
    duration,
  });
  popText(x, y - 64, label, "#b7e06b");
}

function shouldTriggerOrderVeteranCleave(unit, target) {
  return Boolean(
    unit?.orderMeleeVeteran &&
    target?.kind !== "statue" &&
    Math.random() < ORDER_MELEE_VETERAN_TRAIT.cleaveChance
  );
}

function shouldTriggerOrderMeleeCritical(unit, target) {
  if (!unit || target?.kind === "statue" || factionForSide(unit.side) !== "order") return false;
  if (isOrderSiegeType(unit.type)) return false;
  const range = UNIT[unit.type]?.range ?? 0;
  return range <= ORDER_MELEE_VETERAN_TRAIT.meleeRange && Math.random() < ORDER_COMBAT_TRAIT.chance;
}

function isOrderSiegeType(type) {
  return ORDER_SIEGE_UNITS.has(type);
}

function getArrowSourceType(arrow, source = getArrowSource(arrow)) {
  return arrow.sourceType ?? source?.type ?? arrow.type;
}

function isOrderRangedTraitArrow(arrow, source = getArrowSource(arrow)) {
  if (factionForSide(arrow.side) !== "order") return false;
  const sourceType = getArrowSourceType(arrow, source);
  if (isOrderSiegeType(sourceType)) return false;
  return (UNIT[sourceType]?.range ?? 0) > ORDER_MELEE_VETERAN_TRAIT.meleeRange || arrow.type === "spearThrow" || arrow.type === "goldenSpear";
}

function isOrderSiegeTraitArrow(arrow, source = getArrowSource(arrow)) {
  return factionForSide(arrow.side) === "order" && isOrderSiegeType(getArrowSourceType(arrow, source));
}

function maybeApplyOrderRangedStun(arrow, target, source = getArrowSource(arrow)) {
  if (!target || target.kind === "statue" || target.hp <= 0) return;
  if (!isOrderRangedTraitArrow(arrow, source)) return;
  if (Math.random() >= ORDER_COMBAT_TRAIT.chance) return;
  applyStun(target, ORDER_COMBAT_TRAIT.rangedStun);
  popText(target.x, target.y - 112, "秩序震慑", "#dfe8ff");
}

function maybeApplyOrderRangedStunFromUnit(unit, target) {
  if (!unit || !target || target.kind === "statue" || target.hp <= 0) return;
  if (factionForSide(unit.side) !== "order" || isOrderSiegeType(unit.type)) return;
  if ((UNIT[unit.type]?.range ?? 0) <= ORDER_MELEE_VETERAN_TRAIT.meleeRange) return;
  if (Math.random() >= ORDER_COMBAT_TRAIT.chance) return;
  applyStun(target, ORDER_COMBAT_TRAIT.rangedStun);
  popText(target.x, target.y - 112, "秩序震慑", "#dfe8ff");
}

function maybeApplyOrderSiegeKnockback(arrow, target, damage, source = getArrowSource(arrow)) {
  if (!target || target.kind === "statue" || target.hp <= 0 || damage <= 0) return;
  if (!isOrderSiegeTraitArrow(arrow, source)) return;
  if (Math.random() >= ORDER_COMBAT_TRAIT.chance) return;
  knockbackTargetFromSource(target, source, arrow.side, damage * ORDER_COMBAT_TRAIT.siegeKnockbackFactor);
}

function knockbackTargetFromSource(target, source, side, distance) {
  if (!target || target.kind === "statue" || distance <= 0) return;
  const dir = source ? Math.sign(target.x - source.x) || (side === "player" ? 1 : -1) : (side === "player" ? 1 : -1);
  const minX = state?.fourWay ? 36 : FIELD.playerGate + 28;
  const maxX = state?.fourWay ? FIELD.width - 36 : FIELD.enemyGate - 28;
  target.x = Math.max(minX, Math.min(maxX, target.x + dir * distance));
  popText(target.x, target.y - 116, `击退 ${Math.round(distance)}`, "#fff1a8");
}

function applyOrderVeteranCleave(unit, target, damage) {
  const y = target.y ?? unit.y;
  const targets = getUnitsInRadius(target.x, ORDER_MELEE_VETERAN_TRAIT.cleaveRadius, unit.side, ORDER_MELEE_VETERAN_TRAIT.cleaveLimit, target, y);
  targets.forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, damage, { label: "横扫", color: "#fff1a8", yOffset: -82, sourceSide: unit.side, sourceUnitId: unit.id });
    if (dealt > 0) enemy.lastDamageUnitId = unit.id;
  });
  state.blasts.push({ x: target.x, y: y - 30, radius: ORDER_MELEE_VETERAN_TRAIT.cleaveRadius, life: 0.24, duration: 0.24, color: "#fff1a8" });
  popText(unit.x, unit.y - 112, "老兵横扫", "#fff1a8");
}

function attackApeMan(unit, target) {
  const data = UNIT[unit.type];
  const dealt = applyDamage(target, data.damage, unit.side);
  handleDamageDealt(unit, target, dealt);
  if (target.kind === "statue") return;
  const dir = unit.side === "player" ? 1 : -1;
  target.x = Math.max(FIELD.playerGate + 28, Math.min(FIELD.enemyGate - 28, target.x + dir * data.knockback));
  applyStun(target, data.stunDuration);
  state.blasts.push({ x: target.x, y: target.y - 32, radius: 38, life: 0.22, duration: 0.22, color: "#c8a0ff" });
  popText(target.x, target.y - 104, "击退", "#c8a0ff");
}

function handleDamageDealt(attacker, target, damage) {
  if (!attacker || !target || damage <= 0) return;
  if (target.kind === "barricade") return;
  if (target.kind !== "statue") {
    target.lastDamageSide = attacker.side;
    target.lastDamageUnitId = attacker.id;
  }
  if (attacker.inspiredLifestealTimer > 0 && target.kind !== "statue") {
    const healed = Math.min(Math.round(damage * 0.5), attacker.maxHp - attacker.hp);
    if (healed > 0) {
      attacker.hp += healed;
      popText(attacker.x, attacker.y - 102, `吸血 +${healed}`, "#b8b0e8");
    }
  }
  if (attacker.inspiredZombieTimer > 0 && attacker.inspiredZombieHits > 0 && ZOMBIE_UNITS.has(attacker.type) && target.kind !== "statue") {
    attacker.inspiredZombieHits -= 1;
    applyStun(target, 2);
  }
}

function getOrderAttackDamage(attacker, target, baseDamage) {
  if (!attacker || !target || baseDamage <= 0 || factionForSide(attacker.side) !== "order") return baseDamage;
  let damage = baseDamage;
  if (hasOrderCommanderAura(attacker)) {
    damage *= 1 + UNIT.commander.commandDamageBonus;
  }
  if (target.kind !== "statue" && target.orderMarkTimer > 0 && target.orderMarkSide === attacker.side) {
    damage += UNIT.commander.markBonusDamage;
  }
  return Math.max(1, Math.round(damage * 10) / 10);
}

function getAttackDamage(attacker, target, baseDamage) {
  let damage = getOrderAttackDamage(attacker, target, baseDamage);
  if (hasChaosOrcPackBonus(attacker)) damage *= CHAOS_ORC_PACK_TRAIT.damageFactor;
  return Math.max(1, Math.round(damage * 10) / 10);
}

function hasChaosOrcPackBonus(unit) {
  if (!unit || !CHAOS_ORC_PACK_UNITS.has(unit.type) || factionForSide(unit.side) !== "chaos") return false;
  const nearbyOrcs = state.units.filter((candidate) => (
    candidate.side === unit.side &&
    CHAOS_ORC_PACK_UNITS.has(candidate.type) &&
    candidate.hp > 0 &&
    !isUnitHidden(candidate) &&
    distanceTo(candidate.x, candidate.y, unit.x, unit.y) <= CHAOS_ORC_PACK_TRAIT.radius
  ));
  return nearbyOrcs.length >= CHAOS_ORC_PACK_TRAIT.count;
}

function hasOrderCommanderAura(unit) {
  if (!unit || factionForSide(unit.side) !== "order") return false;
  const radius = UNIT.commander.commandRadius;
  return state.units.some((candidate) =>
    candidate.side === unit.side &&
    candidate.type === "commander" &&
    candidate.hp > 0 &&
    !isUnitHidden(candidate) &&
    distanceTo(candidate.x, candidate.y, unit.x, unit.y) <= radius
  );
}

function grantChaosKillRewards(unit) {
  const killerSide = unit.lastDamageSide ?? unit.poisonSourceSide;
  if (!killerSide || killerSide === unit.side) return;
  if (factionForSide(killerSide) !== "chaos") return;
  if (state.fourWay) {
    const ai = state.fourWaySides.find((item) => item.side === killerSide);
    if (ai) ai.gold += CHAOS_FOUR_WAY_KILL_GOLD;
    const base = FOUR_WAY_BASES[killerSide];
    popText(base.x, base.y + (base.y < FIELD.height / 2 ? -150 : 170), `混沌掠夺 +${CHAOS_FOUR_WAY_KILL_GOLD}`, "#ff8a3d");
  } else {
    const key = killerSide === "player" ? "gold" : "enemyGold";
    state[key] += CHAOS_KILL_GOLD;
    const labelX = killerSide === "player" ? FIELD.playerGate + 58 : FIELD.enemyGate - 58;
    popText(labelX, FIELD.ground - 128, `混沌掠夺 +${CHAOS_KILL_GOLD}`, "#ff8a3d");
  }
  const killerUnitId = unit.lastDamageUnitId ?? unit.poisonSourceUnitId;
  const killer = state.units.find((candidate) => candidate.id === killerUnitId && candidate.hp > 0 && candidate.side === killerSide);
  if (!killer || killer.hp >= killer.maxHp) return;
  const healed = Math.min(Math.round((unit.maxHp ?? UNIT[unit.type]?.hp ?? 0) * CHAOS_KILL_HEAL_RATIO), killer.maxHp - killer.hp);
  if (healed <= 0) return;
  killer.hp += healed;
  popText(killer.x, killer.y - 104, `吞噬 +${healed}`, "#ff8a3d");
}

function grantOrderMeleeVeteranKill(deadUnit) {
  const killerSide = deadUnit.lastDamageSide ?? deadUnit.poisonSourceSide;
  const killerUnitId = deadUnit.lastDamageUnitId ?? deadUnit.poisonSourceUnitId;
  if (!killerSide || !killerUnitId || killerSide === deadUnit.side || factionForSide(killerSide) !== "order") return;
  if (!areHostileSides(killerSide, deadUnit.side)) return;
  const killer = state.units.find((candidate) => candidate.id === killerUnitId && candidate.hp > 0 && candidate.side === killerSide);
  if (!isOrderLowHpMeleeUnit(killer) || killer.orderMeleeVeteran) return;
  killer.orderMeleeKills = (killer.orderMeleeKills ?? 0) + 1;
  if (killer.orderMeleeKills < ORDER_MELEE_VETERAN_TRAIT.requiredKills) {
    popText(killer.x, killer.y - 108, `历练 ${killer.orderMeleeKills}/${ORDER_MELEE_VETERAN_TRAIT.requiredKills}`, "#fff1a8");
    return;
  }
  killer.orderMeleeVeteran = true;
  killer.armorReduction = Math.max(killer.armorReduction ?? 0, ORDER_MELEE_VETERAN_TRAIT.reduction);
  state.blasts.push({ x: killer.x, y: killer.y - 38, radius: 58, life: 0.36, duration: 0.36, color: "#fff1a8" });
  popText(killer.x, killer.y - 118, "晋升老兵", "#fff1a8");
}

function isOrderLowHpMeleeUnit(unit) {
  if (!unit || factionForSide(unit.side) !== "order" || unit.hp <= 0 || UNIT[unit.type]?.untargetable) return false;
  const data = UNIT[unit.type] ?? {};
  const maxHp = unit.maxHp ?? data.hp ?? 0;
  const range = data.range ?? 0;
  return maxHp < ORDER_MELEE_VETERAN_TRAIT.hpBelow && range <= ORDER_MELEE_VETERAN_TRAIT.meleeRange && (unit.damage ?? data.damage ?? 0) > 0;
}

function attackCandlelight(unit, target) {
  const data = UNIT.candlelight;
  const dealt = applyDamage(target, data.damage, unit.side);
  handleDamageDealt(unit, target, dealt);
  if (target.kind === "statue") return;
  if (unit.candleForm === "fire") {
    applyStackedBurn(target, data.burnDps, data.burnDuration);
  } else {
    applyCandleSlow(target, data.slowDuration, data.slowFactor);
  }
}

function attackReaper(unit, target) {
  const data = UNIT.reaper;
  if (target.kind === "statue" || unit.reaperTargetId !== target.id) {
    unit.reaperTargetId = target.kind === "statue" ? null : target.id;
    unit.reaperStackBonus = 0;
  } else {
    unit.reaperStackBonus = Math.min(data.maxStackBonus, (unit.reaperStackBonus ?? 0) + data.stackBonus);
  }
  const damage = Math.round(data.damage * (1 + (unit.reaperStackBonus ?? 0)));
  const dealt = applyDamage(target, damage, unit.side);
  handleDamageDealt(unit, target, dealt);
  if ((unit.reaperStackBonus ?? 0) > 0 && target.kind !== "statue") {
    popText(target.x, target.y - 102, `收割 +${Math.round(unit.reaperStackBonus * 100)}%`, "#d8d0c8");
  }
}

function attackReaperAmbush(unit, target) {
  const data = UNIT.reaper;
  unit.reaperStealthTimer = 0;
  unit.cooldown = data.cooldown ?? 0.9;
  unit.combatTimer = 3;
  markRetaliationTarget(target, unit);
  const dealt = applyDamage(target, data.ambushDamage, unit.side);
  handleDamageDealt(unit, target, dealt);
  unit.reaperTargetId = target.kind === "statue" ? null : target.id;
  unit.reaperStackBonus = 0;
  popText(unit.x, unit.y - 112, "破隐一击", "#d8d0c8");
}

function activateReaperStealth(unit) {
  const data = UNIT.reaper;
  unit.reaperStealthTimer = data.stealthDuration;
  unit.reaperTargetId = null;
  unit.reaperStackBonus = 0;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.4);
  popText(unit.x, unit.y - 112, "隐形", "#b8b0a5");
  return true;
}

function toggleCandleForm(unit) {
  unit.candleForm = unit.candleForm === "fire" ? "ice" : "fire";
  popText(unit.x, unit.y - 112, unit.candleForm === "fire" ? "火焰形态" : "冰矩形态", unit.candleForm === "fire" ? "#ff9b45" : "#9ee8ff");
  return true;
}

function explodeDeadCorpse(unit) {
  const data = UNIT.deadCorpse;
  unit.exploded = true;
  unit.noCorpse = true;
  unit.hp = 0;
  getUnitsInRadius(unit.x, data.poisonRadius, unit.side, Infinity).forEach((enemy) => {
    applyPoison(enemy, data.poisonDps, data.poisonDuration, {
      slow: data.poisonSlow,
      raisesUndead: true,
      sourceSide: unit.side,
      sourceUnitId: unit.id,
    });
  });
  state.blasts.push({ x: unit.x, y: unit.y - 34, radius: data.poisonRadius, life: 0.34, duration: 0.34, color: "#93d96b" });
  popText(unit.x, unit.y - 92, "毒爆", "#93d96b");
}

function explodeScaldStrike(unit) {
  detonateScaldStrike(unit.side, unit.x, unit.y);
  unit.noCorpse = true;
  unit.hp = 0;
}

function detonateScaldStrike(side, x, y = FIELD.ground) {
  const data = UNIT.scaldStrike;
  getUnitsInRadius(x, data.splash, side, Infinity).forEach((enemy) => {
    applyDamage(enemy, data.damage, side);
    applyStun(enemy, data.stunDuration);
    applyBurn(enemy, data.burnDps, data.burnDuration);
  });

  if (side === "enemy" && Math.abs(FIELD.playerBase - x) <= data.splash + 28) {
    applyDamage({ kind: "statue", side: "player", x: FIELD.playerBase }, data.damage, side);
  }
  if (side === "player" && Math.abs(FIELD.enemyBase - x) <= data.splash + 28) {
    applyDamage({ kind: "statue", side: "enemy", x: FIELD.enemyBase }, data.damage, side);
  }

  state.blasts.push({ x, y: y - 28, radius: data.splash, life: 0.45, duration: 0.45, color: "#ffb36e" });
  popText(x, y - 105, "烫水爆裂", "#ffb36e");
}

function throwSpear(unit, target) {
  const data = UNIT.spearman;
  unit.spearThrown = true;
  unit.spearRecoverTimer = data.throwRecover;
  unit.cooldown = data.throwRecover;
  state.arrows.push({
    x: unit.x,
    y: unit.y - 54,
    tx: target.x,
    ty: target.y ? target.y - 38 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 118,
    side: unit.side,
    damage: data.throwDamage,
    sourceId: unit.id,
    sourceType: unit.type,
    target,
    life: 0.45,
    type: "spearThrow",
  });
  popText(unit.x, unit.y - 96, "投矛", "#dfe8ff");
}

function castTreeRoot(unit, target) {
  const data = UNIT.treeEnt;
  if (target.kind === "statue") {
    applyDamage(target, data.damage, unit.side);
    return;
  }

  const dir = unit.side === "player" ? 1 : -1;
  const x1 = unit.x;
  const x2 = unit.x + dir * data.range;
  const start = Math.min(x1, x2);
  const end = Math.max(x1, x2);
  const targets = state.units
    .filter((enemy) => enemy.side !== unit.side && enemy.hp > 0 && !isUnitHidden(enemy) && enemy.x >= start && enemy.x <= end)
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))
    .slice(0, AOE_TARGET_LIMIT);
  if (!targets.length && target.kind !== "statue") targets.push(target);
  let hitCount = 0;
  targets.forEach((enemy) => {
    const damage = applyUnitDamage(enemy, data.damage, { label: "树根", color: "#8ee0cf", yOffset: -82 });
    hitCount += 1;
  });
  state.spikes.push({
    x1,
    x2: targets.length ? targets[targets.length - 1].x : x2,
    y: FIELD.ground - 16,
    side: unit.side,
    life: 0.32,
    duration: 0.32,
  });

  const healed = Math.min(data.healOnHit * hitCount, unit.maxHp - unit.hp);
  if (healed > 0) {
    unit.hp += healed;
    popText(unit.x, unit.y - 112, `吸收 +${healed}`, "#8ee0cf");
  }
}

function castMageElectricWall(unit, target) {
  const data = UNIT.mage;
  const x = Math.max(FIELD.playerGate + 90, Math.min(FIELD.enemyGate - 90, target.x));
  state.electricColumns.push({
    x,
    side: unit.side,
    life: data.electricWallDuration,
    duration: data.electricWallDuration,
    damage: data.electricWallDamage,
    slow: 1,
    slowDuration: 0,
    tick: 0,
    width: data.electricWallWidth,
  });
  popText(x, FIELD.ground - 142, "法师电墙", "#d7f6ff");
}

function castMagicBlast(unit, target) {
  const data = UNIT.mage;
  if (target.kind === "statue") {
    applyDamage(target, data.damage, unit.side);
  }
  getUnitsInRadius(target.x, data.explosionRadius, unit.side).forEach((other) => {
    const dealt = applyUnitDamage(other, data.damage, { label: "魔爆", color: "#b88cff", yOffset: -82, sourceSide: unit.side, sourceUnitId: unit.id });
    if (dealt > 0) maybeApplyOrderRangedStunFromUnit(unit, other);
  });
  state.blasts.push({ x: target.x, y: target.y ? target.y - 28 : FIELD.ground - 120, radius: data.explosionRadius, life: 0.42, duration: 0.42, color: "#b88cff" });
}

function castIceField(unit, target) {
  const data = UNIT.mage;
  state.iceFields.push({
    x: target.x,
    y: FIELD.ground + 8,
    radius: data.iceRadius,
    slow: data.iceSlow,
    attackSlow: data.iceAttackSlow,
    damage: data.iceDps,
    tick: 0,
    side: unit.side,
    life: data.iceDuration,
    duration: data.iceDuration,
  });
  popText(target.x, FIELD.ground - 70, "冰地", "#9ee8ff");
}

function isMageStoneGolemBiologicalTarget(target) {
  if (!target || target.kind === "statue" || target.hp <= 0 || isUnitHidden(target)) return false;
  if (UNIT[target.type]?.untargetable || UNIT[target.type]?.statueOnly) return false;
  if (MAGE_STONE_GOLEM_BLOCKED_UNITS.has(target.type)) return false;
  if (BASIC_ELEMENT_UNITS.has(target.type) || MERGE_UNITS.has(target.type)) return false;
  if (isSiegeUnit(target)) return false;
  return true;
}

function canMageStoneGolem(unit, target) {
  if (!unit || unit.type !== "mage") return false;
  const data = UNIT.mage;
  if (!areHostileSides(unit.side, target?.side)) return false;
  if (!isMageStoneGolemBiologicalTarget(target)) return false;
  if ((target.hp ?? 0) >= data.stoneGolemMaxHp) return false;
  return distanceTo(unit.x, unit.y, target.x, target.y ?? unit.y) <= data.range;
}

function findMageStoneGolemTarget(unit, point = null) {
  const candidates = state.units
    .filter((target) => canMageStoneGolem(unit, target))
    .map((target) => ({
      target,
      pointDistance: point ? distanceTo(point.x, point.y, target.x, target.y - 48) : 0,
      unitDistance: distanceTo(unit.x, unit.y, target.x, target.y ?? unit.y),
    }));
  if (!candidates.length) return null;
  const nearby = point ? candidates.filter((item) => item.pointDistance <= 150) : candidates;
  const pool = nearby.length ? nearby : candidates;
  return pool
    .sort((a, b) => (b.target.hp - a.target.hp) || (a.unitDistance - b.unitDistance))[0]
    .target;
}

function castMageStoneGolem(unit, target) {
  if (!canMageStoneGolem(unit, target)) {
    popText(unit.x, unit.y - 116, "无法转化", "#b88cff");
    return false;
  }
  const data = UNIT.mage;
  const golem = UNIT.stoneGolem;
  target.stoneGolemOriginal = {
    type: target.type,
    side: target.side,
    damage: target.damage,
    range: target.range,
    speed: target.speed,
    maxHp: target.maxHp,
  };
  target.type = "stoneGolem";
  target.side = unit.side;
  target.damage = golem.damage;
  target.range = golem.range;
  target.speed = golem.speed;
  target.maxHp = Math.max(1, target.stoneGolemOriginal.maxHp ?? target.hp);
  target.hp = Math.min(target.maxHp, target.hp);
  target.stoneGolemTimer = data.stoneGolemDuration;
  target.cooldown = Math.max(target.cooldown ?? 0, 0.5);
  target.controlledBy = null;
  target.controlLockTimer = 0;
  state.blasts.push({ x: target.x, y: (target.y ?? FIELD.ground) - 32, radius: 68, life: 0.36, duration: 0.36, color: "#9f9278" });
  state.lightning.push({ x1: unit.x, y1: unit.y - 72, x2: target.x, y2: (target.y ?? FIELD.ground) - 68, life: 0.28, duration: 0.28 });
  popText(target.x, target.y - 108, "化为石头人", "#d6c090");
  return true;
}

function restoreMageStoneGolem(unit) {
  const original = unit?.stoneGolemOriginal;
  if (!unit || !original) return;
  const hp = unit.hp;
  unit.type = original.type;
  unit.side = original.side;
  unit.damage = original.damage;
  unit.range = original.range;
  unit.speed = original.speed;
  unit.maxHp = Math.max(1, original.maxHp ?? UNIT[unit.type]?.hp ?? hp);
  unit.hp = Math.min(unit.maxHp, hp);
  unit.stoneGolemOriginal = null;
  unit.stoneGolemTimer = 0;
  if (state.controlledUnitId === unit.id && !isPlayerControlledSide(unit.side)) {
    state.controlledUnitId = null;
    state.pendingManualAction = null;
    state.manualMoveTarget = null;
    stopManualJoystick();
  }
  state.blasts.push({ x: unit.x, y: (unit.y ?? FIELD.ground) - 32, radius: 54, life: 0.28, duration: 0.28, color: "#b88cff" });
  popText(unit.x, unit.y - 108, "恢复原样", "#d7ceff");
}

function attackStoneGolem(unit, target) {
  const data = UNIT.stoneGolem;
  const y = target.y ?? unit.y;
  const targets = getUnitsInRadius(target.x, data.splash, unit.side, data.aoeLimit, null, y);
  if (!targets.includes(target) && target.kind !== "statue") targets.unshift(target);
  targets.slice(0, data.aoeLimit).forEach((enemy) => {
    const dealt = applyUnitDamage(enemy, data.damage, {
      label: "石拳",
      color: "#d6c090",
      yOffset: -82,
      sourceSide: unit.side,
      sourceUnitId: unit.id,
    });
    handleDamageDealt(unit, enemy, dealt);
  });
  if (target.kind === "statue") {
    const dealt = applyDamage(target, data.damage, unit.side);
    handleDamageDealt(unit, target, dealt);
  }
  state.blasts.push({ x: target.x, y: y - 30, radius: data.splash, life: 0.24, duration: 0.24, color: "#d6c090" });
}

function castUndeadStaffSlam(unit, target) {
  const data = UNIT.undeadMage;
  const centerX = target.kind === "statue" ? target.x : target.x;
  if (target.kind === "statue") {
    applyDamage(target, data.damage, unit.side);
  }
  getUnitsInRadius(centerX, data.staffRadius, unit.side).forEach((enemy) => {
    applyUnitDamage(enemy, data.damage, { label: "杖击", color: "#b8b0a5", yOffset: -82 });
  });
  state.blasts.push({ x: centerX, y: FIELD.ground - 24, radius: data.staffRadius, life: 0.28, duration: 0.28, color: "#b8b0a5" });
  popText(unit.x, unit.y - 112, "法杖砸地", "#b8b0a5");
}

function castUndeadPierce(unit, target) {
  const data = UNIT.undeadMage;
  const damage = data.boneSpikeDamage;
  applyDamage(target, damage, unit.side);
  state.spikes.push({
    x1: unit.x,
    x2: target.x,
    y: FIELD.ground - 18,
    side: unit.side,
    life: 0.34,
    duration: 0.34,
  });
  popText(target.x, target.y ? target.y - 80 : FIELD.ground - 130, `骨刺 -${damage}`, "#b8b0a5");
}

function castUndeadLure(unit, target) {
  const data = UNIT.undeadMage;
  if ((unit.undeadLureTimer ?? 0) > 0) return false;
  if (!target || target.kind === "statue" || target.side === unit.side || target.hp <= 0 || !canTarget(unit, target)) {
    popText(unit.x, unit.y - 116, "无法勾引", "#d8c8e8");
    return false;
  }
  applyDamage(target, data.lureDamage, unit.side);
  target.luredTimer = data.lureDuration;
  target.luredBySide = unit.side;
  target.forceCharge = false;
  unit.undeadLureTimer = data.lureCooldown;
  state.lightning.push({ x1: unit.x, y1: unit.y - 74, x2: target.x, y2: target.y - 58, life: 0.3, duration: 0.3, color: "#d8c8e8" });
  popText(target.x, target.y - 106, "勾引", "#d8c8e8");
  return true;
}

function updateLuredUnit(unit, dt) {
  const dir = unit.luredBySide === "player" ? -1 : 1;
  const speed = (unit.speed ?? UNIT[unit.type]?.speed ?? 35) * getMoveFactor(unit);
  unit.x = Math.max(FIELD.playerGate + 30, Math.min(FIELD.enemyGate - 30, unit.x + dir * speed * dt));
  unit.combatTimer = Math.max(unit.combatTimer ?? 0, 0.4);
}

function castSuikaiPierce(unit, target) {
  const data = UNIT.suikai;
  const dir = unit.side === "player" ? 1 : -1;
  const x1 = unit.x;
  const targetX = target.kind === "statue" ? target.x : target.x;
  const minX = Math.min(unit.x, unit.x + dir * data.range);
  const maxX = Math.max(unit.x, unit.x + dir * data.range);
  const x2 = Math.max(minX, Math.min(maxX, targetX));
  applyDamage(target, data.damage, unit.side);
  state.spikes.push({
    x1,
    x2,
    y: FIELD.ground - 12,
    side: unit.side,
    life: 0.42,
    duration: 0.42,
  });
  popText(target.x, target.y ? target.y - 86 : FIELD.ground - 132, `骨刺 -${data.damage}`, "#d8c8e8");
  summonSuikaiUndead(unit);
}

function summonSuikaiUndead(unit) {
  const data = UNIT.suikai;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < data.summonCount; i += 1) {
    const undead = spawnUnit("undead", unit.side, unit.x - dir * (22 + i * 15));
    undead.maxHp = data.summonHp;
    undead.hp = data.summonHp;
    undead.damage = data.summonDamage;
    undead.poisonOnHit = true;
    undead.poisonHitDps = data.summonPoisonDps;
    undead.summonerId = unit.id;
    undead.forceCharge = true;
  }
  popText(unit.x, unit.y - 128, "毒亡灵 x5", "#93d96b");
}

function hookTargetWithSuikai(unit, target) {
  const data = UNIT.suikai;
  const dir = unit.side === "player" ? 1 : -1;
  const originalX = target.x;
  const frontX = unit.x + dir * 44;
  target.x = Math.max(FIELD.playerGate + 34, Math.min(FIELD.enemyGate - 34, frontX));
  target.y = unit.y + (Math.random() * 22 - 11);
  applyDamage(target, data.hookDamage, unit.side);
  target.combatTimer = 3;
  state.lightning.push({
    x1: unit.x,
    y1: unit.y - 70,
    x2: originalX,
    y2: target.y - 45,
    life: 0.28,
    duration: 0.28,
  });
  state.spikes.push({
    x1: unit.x,
    x2: originalX,
    y: FIELD.ground - 28,
    side: unit.side,
    life: 0.3,
    duration: 0.3,
  });
  popText(target.x, target.y - 96, "镰钩 -150", "#d8c8e8");
}

function castDreadfireSpell(unit, target) {
  if (unit.nextDreadfireSpell === "dragon") {
    castFireDragon(unit, target);
    unit.nextDreadfireSpell = "meteor";
    return;
  }

  castMeteorRain(unit, target);
  unit.nextDreadfireSpell = "dragon";
}

function castRedflameSpell(unit, target) {
  if (unit.nextRedflameSpell === "fireball") {
    castRedflameFireball(unit, target);
    unit.nextRedflameSpell = "pillar";
    return;
  }

  castRedflamePillars(unit, target);
  unit.nextRedflameSpell = "fireball";
}

function castPrometheusSpell(unit, target) {
  const spell = unit.prometheusSpellIndex % 3;
  unit.prometheusSpellIndex = (unit.prometheusSpellIndex + 1) % 3;
  if (spell === 0) {
    castPrometheusDragons(unit, target);
  } else if (spell === 1) {
    summonPrometheusFireImps(unit);
  } else {
    castPrometheusMeteorRain(unit, target);
  }
}

function castPrometheusDragons(unit, target) {
  const data = UNIT.prometheus;
  const dir = unit.side === "player" ? 1 : -1;
  const startX = unit.x + dir * 60;
  const targetX = target.kind === "statue" ? target.x : target.x;
  for (let i = 0; i < data.dragonCount; i += 1) {
    const rawX = startX + dir * i * 58;
    const x = dir > 0 ? Math.min(rawX, targetX) : Math.max(rawX, targetX);
    const enemies = getUnitsInRadius(x, data.dragonRadius, unit.side, data.dragonLimit);
    enemies.forEach((enemy) => {
      applyUnitDamage(enemy, data.dragonDamage, { label: "火龙", color: "#ff7a3d", yOffset: -86 });
      applyStun(enemy, data.dragonStun);
      applyBurn(enemy, data.burnDps, data.burnDuration);
    });
    state.spikes.push({
      x1: x - dir * 24,
      x2: x + dir * 44,
      y: FIELD.ground - 18,
      side: unit.side,
      life: 0.38,
      duration: 0.38,
      color: "#ff6a3d",
    });
    state.blasts.push({ x, y: FIELD.ground - 34, radius: data.dragonRadius, life: 0.32, duration: 0.32, color: "#ff4f2e" });
  }
  popText(unit.x, unit.y - 126, "火龙 x4", "#ff7a3d");
}

function summonPrometheusFireImps(unit) {
  const data = UNIT.prometheus;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < data.fireImpCount; i += 1) {
    const imp = spawnUnit("fireImp", unit.side, unit.x - dir * (26 + i * 18));
    imp.summonerId = unit.id;
    imp.forceCharge = true;
  }
  popText(unit.x, unit.y - 126, "小火人 x3", "#ff9b45");
}

function castPrometheusMeteorRain(unit, target) {
  const data = UNIT.prometheus;
  for (let i = 0; i < data.meteorCount; i += 1) {
    const ratio = (i + 0.5) / data.meteorCount;
    const offset = (ratio - 0.5) * data.meteorRadius * 2;
    state.meteors.push({
      x: target.x + offset,
      y: FIELD.ground - 30,
      side: unit.side,
      damage: data.meteorDamage,
      life: 0.3 + i * 0.035,
      duration: 0.3 + i * 0.035,
      label: "神火流星",
      color: "#ff7a3d",
    });
  }
  popText(target.x, FIELD.ground - 86, "神火流星", "#ffb45e");
}

function castRedflameFireball(unit, target) {
  const data = UNIT.redflame;
  state.meteors.push({
    x: target.x,
    y: FIELD.ground - 30,
    side: unit.side,
    damage: data.fireballDamage,
    radius: data.fireballRadius,
    burnDps: data.fireballBurnDps,
    burnDuration: data.fireballBurnDuration,
    life: 0.72,
    duration: 0.72,
    label: "赤炎火球",
    color: "#ff4f2e",
  });
  popText(target.x, FIELD.ground - 92, "赤炎火球", "#ff6a3d");
}

function castRedflamePillars(unit, target) {
  const data = UNIT.redflame;
  const dir = unit.side === "player" ? 1 : -1;
  const startX = unit.x + dir * 55;
  const targetLimit = target.kind === "statue" ? target.x : target.x;

  for (let i = 0; i < data.pillarCount; i += 1) {
    const rawX = startX + dir * i * data.pillarSpacing;
    const x = dir > 0 ? Math.min(rawX, targetLimit) : Math.max(rawX, targetLimit);
    state.delayedSpells.push({
      type: "redflamePillar",
      x,
      y: FIELD.ground - 24,
      side: unit.side,
      timer: i * 0.16,
      duration: Math.max(0.01, i * 0.16),
      radius: data.pillarRadius,
      damage: data.pillarDamage,
      stun: data.pillarStun,
    });
  }
  popText(unit.x, unit.y - 112, "熔岩柱", "#ff6a3d");
}

function summonStormCloud(unit, target) {
  const data = UNIT.stormLich;
  const from = { x: unit.x, y: unit.y - 88 };
  const to = { x: target.x, y: target.y ? target.y - 64 : FIELD.ground - 130 };
  if (tryBlockSpecialWithShieldCart(from, to, target, data.boltDamage)) {
    popText(target.x, to.y - 34, "乌云被挡", "#d7c090");
    return;
  }
  state.stormClouds.push({
    type: "attack",
    x: target.x,
    y: FIELD.ground - 230,
    side: unit.side,
    radius: data.cloudRadius,
    life: data.cloudDuration,
    duration: data.cloudDuration,
    boltTimer: 0,
    boltsLeft: data.boltCount,
    boltEvery: data.boltEvery,
    damage: data.boltDamage,
    slow: data.boltSlow,
    slowDuration: data.boltSlowDuration,
  });
  popText(target.x, FIELD.ground - 130, "乌云", "#9ee8ff");
}

function launchTornado(unit, target) {
  const data = UNIT.hurricane;
  state.tornadoes.push({
    x: unit.x,
    y: unit.y - 45,
    tx: target.x,
    ty: target.y ? target.y - 35 : FIELD.ground - 90,
    side: unit.side,
    damage: data.damage,
    stun: data.stunDuration,
    life: data.tornadoLife,
    duration: data.tornadoLife,
  });
  popText(unit.x, unit.y - 100, "龙卷风", "#d7f6ee");
}

function smashArea(unit, target) {
  const data = UNIT[unit.type];
  if (target.kind === "statue") {
    const dealt = applyDamage(target, data.damage, unit.side);
    handleDamageDealt(unit, target, dealt);
    getUnitsInRadius(target.x, data.splash, unit.side, data.aoeLimit).forEach((enemy) => {
      const splashDealt = applyUnitDamage(enemy, data.damage, { label: "震击", color: "#c7b0d8", yOffset: -82 });
      handleDamageDealt(unit, enemy, splashDealt);
    });
  } else {
    getUnitsInRadius(target.x, data.splash, unit.side, data.aoeLimit).forEach((enemy) => {
      const dealt = applyUnitDamage(enemy, data.damage, { label: "震击", color: "#c7b0d8", yOffset: -82 });
      handleDamageDealt(unit, enemy, dealt);
    });
  }
  state.blasts.push({ x: target.x, y: (target.y ?? FIELD.ground) - 30, radius: data.splash, life: 0.28, duration: 0.28, color: "#c7b0d8" });
}

function throwBoulder(unit, target) {
  const data = UNIT[unit.type];
  state.arrows.push({
    x: unit.x,
    y: unit.y - 95,
    tx: target.x,
    ty: target.y ? target.y - 42 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 115,
    side: unit.side,
    damage: data.damage,
    sourceId: unit.id,
    sourceType: unit.type,
    stun: data.stunDuration,
    splash: data.splash,
    aoeLimit: data.aoeLimit,
    groundFireDuration: data.groundFireDuration,
    groundFireDps: data.groundFireDps,
    groundFireRadius: data.groundFireRadius,
    target,
    life: 0.8,
    cannon: unit.type === "catapult",
    type: "boulder",
  });
  popText(
    unit.x,
    unit.y - 138,
    unit.type === "catapult" ? "开炮" : unit.type === "undeadCatapult" ? "鬼火投石" : "投石",
    unit.type === "catapult" ? "#ffce7a" : unit.type === "undeadCatapult" ? "#ff8a3d" : "#c0a36d",
  );
}

function launchRocketVolley(unit, target) {
  const data = UNIT.rocketCart;
  fireRocketArrow(unit, target);
  unit.rocketAmmo = Math.max(0, (unit.rocketAmmo ?? data.ammoPerReload) - 1);
}

function fireRocketArrow(unit, target) {
  const data = UNIT.rocketCart;
  const centerX = target.kind === "statue" ? target.x : target.x;
  const centerY = target.y ? target.y - 28 : FIELD.ground - 110;
  const drift = (Math.random() - 0.5) * data.volleyRadius;
  state.arrows.push({
    x: unit.x + (Math.random() - 0.5) * 14,
    y: unit.y - 82 - Math.random() * 12,
    tx: centerX + drift,
    ty: centerY + (Math.random() - 0.5) * 18,
    side: unit.side,
    damage: data.damage,
    sourceId: unit.id,
    sourceType: unit.type,
    splash: data.splash,
    target,
    life: data.arrowLife,
    duration: data.arrowLife,
    type: "rocketVolley",
  });
}

function castFireDragon(unit, target) {
  const data = UNIT.dreadfire;
  damageUnitsInRadius(target.x, data.dragonRadius, unit.side, data.dragonMarkDamage, "标记");
  state.delayedSpells.push({
    type: "fireDragon",
    x: target.x,
    y: FIELD.ground - 38,
    side: unit.side,
    timer: data.dragonDelay,
    duration: data.dragonDelay,
    radius: data.dragonRadius,
  });
  state.blasts.push({ x: target.x, y: FIELD.ground - 30, radius: data.dragonRadius, life: data.dragonDelay, duration: data.dragonDelay, color: "#ff7a3d" });
  popText(target.x, FIELD.ground - 86, "火龙标记", "#ff7a3d");
}

function castMeteorRain(unit, target) {
  const data = UNIT.dreadfire;
  const columns = Math.ceil(Math.sqrt(data.meteorCount * (data.meteorWidth / data.meteorHeight)));
  const rows = Math.ceil(data.meteorCount / columns);
  for (let i = 0; i < data.meteorCount; i += 1) {
    const column = i % columns;
    const row = Math.floor(i / columns);
    const xRatio = columns <= 1 ? 0.5 : column / (columns - 1);
    const yRatio = rows <= 1 ? 0.5 : row / (rows - 1);
    state.meteors.push({
      x: target.x + (xRatio - 0.5) * data.meteorWidth,
      y: FIELD.ground - 30 + (yRatio - 0.5) * data.meteorHeight,
      side: unit.side,
      damage: data.meteorDamage,
      life: 0.35 + i * 0.045,
      duration: 0.35 + i * 0.045,
    });
  }
  popText(target.x, FIELD.ground - 86, "流星雨", "#ffb45e");
}

function strikeLightning(unit, target) {
  const data = UNIT.windElement;
  const endY = target.y ? target.y - 44 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 120;
  const startX = target.x + (Math.random() * 34 - 17);
  const startY = Math.max(30, endY - 360);
  if (tryBlockSpecialWithShieldCart({ x: startX, y: startY }, { x: target.x, y: endY }, target, data.damage)) {
    popText(target.x, endY - 28, "闪电被挡", "#d7c090");
    return;
  }
  applyDamage(target, data.damage, unit.side);
  state.lightning.push({ x1: startX, y1: startY, x2: target.x, y2: endY, life: 0.22, duration: 0.22 });
}

function castChainLightning(unit, target) {
  const data = UNIT.archmage;
  if (target.kind === "statue") {
    applyDamage(target, data.chainDamages[0], unit.side);
    unit.archmageAttackCount = (unit.archmageAttackCount ?? 0) + 1;
    return;
  }

  const hits = [target];
  while (hits.length < data.chainDamages.length) {
    const previous = hits[hits.length - 1];
    const next = state.units
      .filter((candidate) => candidate.side !== unit.side && candidate.hp > 0 && !isUnitHidden(candidate) && !hits.includes(candidate) && canTarget(unit, candidate))
      .filter((candidate) => Math.abs(candidate.x - previous.x) <= data.chainRange)
      .sort((a, b) => Math.abs(a.x - previous.x) - Math.abs(b.x - previous.x))[0];
    if (!next) break;
    hits.push(next);
  }

  let fromX = unit.x;
  let fromY = unit.y - 92;
  hits.forEach((enemy, index) => {
    const damage = data.chainDamages[index];
    const dealt = applyDamage(enemy, damage, unit.side);
    if (dealt > 0) maybeApplyOrderRangedStunFromUnit(unit, enemy);
    state.lightning.push({
      x1: fromX,
      y1: fromY,
      x2: enemy.x,
      y2: enemy.y - 46 + (UNIT[enemy.type]?.flying ? -42 : 0),
      life: 0.26,
      duration: 0.26,
    });
    fromX = enemy.x;
    fromY = enemy.y - 46;
  });
  unit.archmageAttackCount = (unit.archmageAttackCount ?? 0) + 1;
  popText(unit.x, unit.y - 122, "连锁闪电", "#d7ceff");
}

function castArchmageFireballs(unit) {
  const data = UNIT.archmage;
  const minX = Math.min(FIELD.playerMineX, FIELD.enemyMineX);
  const maxX = Math.max(FIELD.playerMineX, FIELD.enemyMineX);
  for (let i = 0; i < data.fireballCount; i += 1) {
    state.meteors.push({
      x: minX + Math.random() * (maxX - minX),
      y: FIELD.ground - 20,
      side: unit.side,
      damage: data.fireballDamage,
      radius: data.fireballRadius,
      life: 1.15 + i * 0.16,
      duration: 1.15 + i * 0.16,
      size: 11,
      color: "#ff7a3d",
      label: "大火球",
    });
  }
  popText(unit.x, unit.y - 132, "大火球雨", "#ff9b45");
}

function castArcaneExplosion(unit) {
  const data = UNIT.archmage;
  const targets = getUnitsInRadius(unit.x, data.arcaneRadius, unit.side, Infinity);
  targets.forEach((target) => {
    const dealt = applyDamage(target, data.arcaneDamage, unit.side);
    if (dealt > 0) maybeApplyOrderRangedStunFromUnit(unit, target);
    applyStun(target, data.arcaneStun);
  });
  state.blasts.push({ x: unit.x, y: unit.y - 44, radius: data.arcaneRadius, life: 0.45, duration: 0.45, color: "#b88cff" });
  popText(unit.x, unit.y - 140, "奥术爆炸", "#d7ceff");
}

function bindFreeze(water, target) {
  if (target.kind === "statue" || target.frozenBy) return;
  if (isUnitHidden(target)) return;
  if (UNIT[target.type]?.freezeImmune) {
    popText(target.x, target.y - 92, "免疫冰冻", "#d8f8ff");
    return;
  }
  water.boundTargetId = target.id;
  target.frozenBy = water.id;
  target.frozenTimer = Infinity;
  target.frozenTick = 0;
  target.freezeDps = UNIT.waterElement.freezeDps;
  water.cooldown = 999;
  popText(target.x, target.y - 92, "冰冻", "#9ee8ff");
}

function updateFrozenDamage(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (!unit.frozenBy || unit.hp <= 0) return;
    if (unit.frozenTimer !== Infinity) {
      unit.frozenTimer = Math.max(0, (unit.frozenTimer ?? 0) - dt);
      if (unit.frozenTimer <= 0) {
        releaseFrozenUnit(unit);
        return;
      }
    }
    unit.frozenTick += dt;
    if (unit.frozenTick < 1) return;
    unit.frozenTick = 0;
    const source = state.units.find((candidate) => candidate.id === unit.frozenBy && candidate.hp > 0);
    const damage = applyUnitDamage(unit, unit.freezeDps ?? UNIT.waterElement.freezeDps, { label: "冻", color: "#9ee8ff", yOffset: -100 });
    if (source?.type === "linghan") healLinghanFromDamage(source, damage);
  });
}

function applyStun(target, duration) {
  if (target.kind === "statue") return;
  if (isUnitHidden(target)) return;
  if (UNIT[target.type]?.stunImmune) {
    popText(target.x, target.y - 92, "免疫眩晕", "#d7b978");
    return;
  }
  target.stunTimer = Math.max(target.stunTimer, duration);
  popText(target.x, target.y - 92, "眩晕", "#d7b978");
}

function getArrowDuration(arrow) {
  return arrow.duration ?? (arrow.type === "crossbow" ? 0.42 : arrow.type === "boulder" ? 0.8 : arrow.type === "spearThrow" ? 0.45 : arrow.type === "campaignRain" ? 0.9 : 0.55);
}

function getArrowArcHeight(arrow) {
  if (arrow.type === "campaignRain") return 0;
  if (arrow.type === "boulder") return 70;
  if (arrow.type === "rocketVolley") return 52;
  return 34;
}

function getArrowPosition(arrow, life = arrow.life) {
  const duration = getArrowDuration(arrow);
  const t = Math.max(0, Math.min(1, 1 - life / duration));
  return {
    x: arrow.x + (arrow.tx - arrow.x) * t,
    y: arrow.y + (arrow.ty - arrow.y) * t - Math.sin(t * Math.PI) * getArrowArcHeight(arrow),
  };
}

function isArrowShieldBlockable(arrow) {
  if (!arrow.target || arrow.target.kind === "statue") return false;
  const blockableTypes = new Set([
    "archer",
    "goldenArcher",
    "archerFire",
    "crossbow",
    "rocketVolley",
    "poisonZombie",
    "demonArcher",
    "fireElement",
    "goblinVulture",
    "undeadVulture",
    "javelinThrower",
  ]);
  if (blockableTypes.has(arrow.type)) return true;
  if (arrow.type !== "boulder") return false;
  const source = getArrowSource(arrow);
  return source?.type === "undeadCatapult";
}

function isSpartanShieldBlockable(arrow) {
  if (!arrow.target || arrow.target.kind === "statue") return false;
  const blockableTypes = new Set([
    "archer",
    "goldenArcher",
    "archerFire",
    "crossbow",
    "spearThrow",
    "goldenSpear",
    "poisonZombie",
    "necromancer",
    "summoner",
    "boneThrower",
    "musketeer",
    "demonArcher",
    "fireElement",
    "javelinThrower",
    "goblinVulture",
    "undeadVulture",
    "corrosiveSpitter",
    "antQueen",
  ]);
  return blockableTypes.has(arrow.type);
}

function getSpartanShieldRect(spartan) {
  const dir = getUnitFacingDirection(spartan);
  const centerX = spartan.x + dir * 18;
  return {
    x1: centerX - 10,
    x2: centerX + 10,
    y1: spartan.y - 92,
    y2: spartan.y - 24,
  };
}

function isTargetBehindSpartanShield(target, spartan) {
  if (!target || target.id === spartan.id) return false;
  const dir = getUnitFacingDirection(spartan);
  const behind = (target.x - spartan.x) * dir <= 0;
  const behindDistance = Math.abs(target.x - spartan.x);
  return (
    behind &&
    behindDistance <= (UNIT.spartan.shieldProtectBehind ?? 80) &&
    Math.abs((target.y ?? FIELD.ground) - (spartan.y ?? FIELD.ground)) <= 70
  );
}

function tryBlockArrowWithSpartanShield(arrow, from, to) {
  if (!isSpartanShieldBlockable(arrow)) return false;
  const protectedSide = arrow.target.side;
  const spartans = state.units.filter((unit) => (
    (unit.type === "spartan" || unit.type === "goldenSpartan") &&
    unit.side === protectedSide &&
    unit.hp > 0 &&
    unit.spartanShieldTimer > 0 &&
    !isUnitHidden(unit)
  ));
  for (const spartan of spartans) {
    if (!isTargetBehindSpartanShield(arrow.target, spartan)) continue;
    if (!segmentIntersectsRect(from, to, getSpartanShieldRect(spartan))) continue;
    state.blasts.push({ x: spartan.x + getUnitFacingDirection(spartan) * 20, y: spartan.y - 58, radius: 18, life: 0.18, duration: 0.18, color: "#d7c090" });
    popText(spartan.x, spartan.y - 126, "盾挡直射", "#d7c090");
    return true;
  }
  return false;
}

function getArrowBoardRect(cart) {
  const data = UNIT.arrowShieldCart;
  const width = data.arrowBoardWidth;
  const height = data.arrowBoardHeight;
  const centerY = cart.y - data.arrowBoardYOffset;
  return {
    x1: cart.x - width / 2,
    x2: cart.x + width / 2,
    y1: centerY - height / 2,
    y2: centerY + height / 2,
  };
}

function isPointInRect(point, rect) {
  return point.x >= rect.x1 && point.x <= rect.x2 && point.y >= rect.y1 && point.y <= rect.y2;
}

function segmentsIntersect(a, b, c, d) {
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const onSegment = (p, q, r) => (
    Math.min(p.x, r.x) <= q.x && q.x <= Math.max(p.x, r.x) &&
    Math.min(p.y, r.y) <= q.y && q.y <= Math.max(p.y, r.y)
  );
  const ab1 = cross(a, b, c);
  const ab2 = cross(a, b, d);
  const cd1 = cross(c, d, a);
  const cd2 = cross(c, d, b);
  if (ab1 === 0 && onSegment(a, c, b)) return true;
  if (ab2 === 0 && onSegment(a, d, b)) return true;
  if (cd1 === 0 && onSegment(c, a, d)) return true;
  if (cd2 === 0 && onSegment(c, b, d)) return true;
  return ab1 * ab2 <= 0 && cd1 * cd2 <= 0;
}

function segmentIntersectsRect(from, to, rect) {
  if (isPointInRect(from, rect) || isPointInRect(to, rect)) return true;
  const topLeft = { x: rect.x1, y: rect.y1 };
  const topRight = { x: rect.x2, y: rect.y1 };
  const bottomRight = { x: rect.x2, y: rect.y2 };
  const bottomLeft = { x: rect.x1, y: rect.y2 };
  return (
    segmentsIntersect(from, to, topLeft, topRight) ||
    segmentsIntersect(from, to, topRight, bottomRight) ||
    segmentsIntersect(from, to, bottomRight, bottomLeft) ||
    segmentsIntersect(from, to, bottomLeft, topLeft)
  );
}

function tryBlockArrowWithShieldCart(arrow, from, to) {
  if (!isArrowShieldBlockable(arrow)) return false;
  const protectedSide = arrow.target.side;
  const carts = state.units.filter((unit) => unit.type === "arrowShieldCart" && unit.side === protectedSide && unit.hp > 0 && unit.arrowBoardHp > 0 && !isUnitHidden(unit));
  for (const cart of carts) {
    const data = UNIT.arrowShieldCart;
    const rect = getArrowBoardRect(cart);
    if (arrow.target.x < rect.x1 - data.arrowBoardProtectPadding || arrow.target.x > rect.x2 + data.arrowBoardProtectPadding) continue;
    if (!segmentIntersectsRect(from, to, rect)) continue;

    const damage = Math.max(1, Math.round(arrow.damage ?? 1));
    damageArrowShieldBoard(cart, damage, to.x, to.y);
    return true;
  }
  return false;
}

function tryBlockSpecialWithShieldCart(from, to, target, damage) {
  if (!target || target.kind === "statue") return false;
  const protectedSide = target.side;
  const carts = state.units.filter((unit) => unit.type === "arrowShieldCart" && unit.side === protectedSide && unit.hp > 0 && unit.arrowBoardHp > 0 && !isUnitHidden(unit));
  for (const cart of carts) {
    const data = UNIT.arrowShieldCart;
    const rect = getArrowBoardRect(cart);
    if (target.x < rect.x1 - data.arrowBoardProtectPadding || target.x > rect.x2 + data.arrowBoardProtectPadding) continue;
    if (!segmentIntersectsRect(from, to, rect)) continue;

    damageArrowShieldBoard(cart, damage, to.x, to.y);
    return true;
  }
  return false;
}

function damageArrowShieldBoard(cart, damage, x = cart.x, y = cart.y - 96) {
  cart.arrowBoardHp = Math.max(0, cart.arrowBoardHp - damage);
  state.blasts.push({ x, y, radius: 18, life: 0.18, duration: 0.18, color: "#d7c090" });
  popText(cart.x, cart.y - 140, cart.arrowBoardHp > 0 ? `挡箭 -${damage}` : "遮箭板破损", "#d7c090");
}

function updateArrows(dt) {
  for (const arrow of state.arrows) {
    const from = getArrowPosition(arrow);
    arrow.life -= dt;
    const to = getArrowPosition(arrow);
    if (tryBlockArrowWithShieldCart(arrow, from, to)) {
      arrow.life = 0;
      arrow.blocked = true;
      continue;
    }
    if (tryBlockArrowWithSpartanShield(arrow, from, to)) {
      arrow.life = 0;
      arrow.blocked = true;
      continue;
    }
    if (arrow.life <= 0) {
      if (arrow.blocked) continue;
      if (arrow.type === "crossbow") {
        attachCrossbowBomb(arrow);
      } else if (arrow.type === "boulder" && arrow.splash) {
        explodeBoulder(arrow);
      } else if (arrow.type === "undeadVulture") {
        explodeUndeadVultureOrb(arrow);
      } else if (arrow.type === "poisonZombie") {
        const source = getArrowSource(arrow);
        const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
        handleDamageDealt(source, arrow.target, dealt);
        maybeApplyOrderRangedStun(arrow, arrow.target, source);
        applyPoison(arrow.target, UNIT.poisonZombie.poisonDps, UNIT.poisonZombie.poisonDuration, { sourceSide: arrow.side, sourceUnitId: arrow.sourceId });
      } else if (arrow.type === "fireElement") {
        const source = getArrowSource(arrow);
        const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
        handleDamageDealt(source, arrow.target, dealt);
        maybeApplyOrderRangedStun(arrow, arrow.target, source);
        applyBurn(arrow.target, UNIT.fireElement.burnDps, UNIT.fireElement.burnDuration);
      } else if (arrow.type === "archerFire") {
        const source = getArrowSource(arrow);
        const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
        handleDamageDealt(source, arrow.target, dealt);
        maybeApplyOrderRangedStun(arrow, arrow.target, source);
        applyBurn(arrow.target, arrow.burnDps, arrow.burnDuration);
      } else if (arrow.type === "javelinThrower") {
        const source = getArrowSource(arrow);
        const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
        handleDamageDealt(source, arrow.target, dealt);
        maybeApplyOrderRangedStun(arrow, arrow.target, source);
        if (arrow.poison) applyPoison(arrow.target, UNIT.javelinThrower.poisonDps, UNIT.javelinThrower.poisonDuration, { sourceSide: arrow.side, sourceUnitId: arrow.sourceId });
      } else if (arrow.type === "corrosiveSpitter") {
        const source = getArrowSource(arrow);
        impactCorrosiveSpit(arrow, source);
      } else if (arrow.type === "neuralBomb") {
        const source = getArrowSource(arrow);
        explodeNeuralBomb(arrow, source);
      } else if (arrow.type === "campaignRain") {
        const [target] = getUnitsInRadius(arrow.tx, arrow.radius, arrow.side, 1);
        if (target) applyDamage(target, arrow.damage, arrow.side, { ranged: true });
      } else if (arrow.type === "campaignMissile") {
        explodeCampaignMissile(arrow);
      } else if (arrow.type === "baseVolley") {
        explodeBaseVolleyArrow(arrow);
      } else if (arrow.type === "rocketVolley") {
        explodeRocketArrow(arrow);
      } else if (arrow.type === "ironCavalryBomb") {
        explodeIronCavalryBomb(arrow);
      } else {
        const source = getArrowSource(arrow);
        const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
        handleDamageDealt(source, arrow.target, dealt);
        maybeApplyOrderRangedStun(arrow, arrow.target, source);
        if (arrow.stun) applyStun(arrow.target, arrow.stun);
      }
    }
  }
  state.arrows = state.arrows.filter((arrow) => arrow.life > 0);
}

function getArrowSource(arrow) {
  if (!arrow.sourceId) return null;
  return state.units.find((unit) => unit.id === arrow.sourceId && unit.hp > 0) ?? null;
}

function attachCrossbowBomb(arrow) {
  const data = UNIT.crossbow;
  const source = getArrowSource(arrow);
  const dealt = applyDamage(arrow.target, arrow.damage, arrow.side, { ranged: true });
  handleDamageDealt(source, arrow.target, dealt);
  maybeApplyOrderRangedStun(arrow, arrow.target, source);
  if (!arrow.target || arrow.target.kind === "statue" || arrow.target.hp <= 0 || isUnitHidden(arrow.target)) return;
  arrow.target.stickyBombs = arrow.target.stickyBombs ?? [];
  arrow.target.stickyBombs.push({
    timer: data.bombDelay,
    side: arrow.side,
    damage: data.splashDamage,
    radius: data.splash,
    limit: data.bombLimit,
  });
  popText(arrow.target.x, arrow.target.y - 96, "炸弹附着", "#ffce7a");
}

function updateStickyBombs(dt) {
  state.units.forEach((unit) => {
    if (!unit.stickyBombs?.length || unit.hp <= 0 || isUnitHidden(unit)) return;
    unit.stickyBombs.forEach((bomb) => {
      bomb.timer -= dt;
    });
    const ready = unit.stickyBombs.filter((bomb) => bomb.timer <= 0);
    unit.stickyBombs = unit.stickyBombs.filter((bomb) => bomb.timer > 0);
    ready.forEach((bomb) => explodeStickyBomb(unit, bomb));
  });
}

function explodeStickyBomb(unit, bomb) {
  getUnitsInRadius(unit.x, bomb.radius, bomb.side, bomb.limit).forEach((target) => {
    applyUnitDamage(target, bomb.damage, { label: "炸弹", color: "#ffce7a", yOffset: -78 });
  });
  state.blasts.push({ x: unit.x, y: unit.y - 30, radius: bomb.radius, life: 0.32, duration: 0.32, color: "#ffce7a" });
  popText(unit.x, unit.y - 108, "爆炸", "#ffce7a");
}

function explodeBoulder(arrow) {
  const limit = arrow.aoeLimit ?? 3;
  const source = getArrowSource(arrow);
  if (arrow.target?.kind === "statue") {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  getUnitsInRadius(arrow.tx, arrow.splash, arrow.side, limit).forEach((target) => {
    const dealt = applyUnitDamage(target, arrow.damage, { label: arrow.cannon ? "炮击" : "投石", color: arrow.cannon ? "#ffce7a" : "#c0a36d", yOffset: -80, ranged: true, sourceSide: arrow.side, sourceUnitId: arrow.sourceId });
    handleDamageDealt(source, target, dealt);
    maybeApplyOrderSiegeKnockback(arrow, target, dealt, source);
    if (arrow.stun) applyStun(target, arrow.stun);
  });
  if (arrow.groundFireDuration) {
    createGroundFire(arrow.tx, arrow.ty + 18, arrow.side, arrow.groundFireDps, arrow.groundFireDuration, arrow.groundFireRadius ?? arrow.splash);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty + 18, radius: arrow.splash, life: 0.3, duration: 0.3, color: arrow.cannon ? "#ffce7a" : "#c0a36d" });
}

function explodeUndeadVultureOrb(arrow) {
  const radius = arrow.splash ?? UNIT.undeadVulture.splash;
  const limit = arrow.aoeLimit ?? UNIT.undeadVulture.aoeLimit;
  getUnitsInRadius(arrow.tx, radius, arrow.side, limit).forEach((target) => {
    const dealt = applyUnitDamage(target, arrow.damage, { label: "能量", color: "#7ed8ff", yOffset: -82, ranged: true });
    handleDamageDealt(getArrowSource(arrow), target, dealt);
  });
  if (arrow.target?.kind === "statue" && Math.abs(arrow.target.x - arrow.tx) <= radius + 28) {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius, life: 0.28, duration: 0.28, color: "#7ed8ff" });
  popText(arrow.tx, arrow.ty - 36, "能量爆裂", "#7ed8ff");
}

function createGroundFire(x, y, side, dps, duration, radius) {
  state.groundFires.push({
    x,
    y: Math.max(FIELD.ground - 150, Math.min(FIELD.ground + 130, y)),
    side,
    dps,
    radius,
    life: duration,
    duration,
    tick: 1,
  });
  popText(x, y - 34, "地火", "#ff8a3d");
}

function explodeRocketArrow(arrow) {
  const source = getArrowSource(arrow);
  const targets = getUnitsInRadius(arrow.tx, arrow.splash, arrow.side, 3, null, arrow.ty);
  targets.forEach((target) => {
    const dealt = applyUnitDamage(target, arrow.damage, { label: "火箭", color: "#ffce7a", yOffset: -78, ranged: true, sourceSide: arrow.side, sourceUnitId: arrow.sourceId });
    handleDamageDealt(source, target, dealt);
    maybeApplyOrderSiegeKnockback(arrow, target, dealt, source);
  });
  if (arrow.target?.kind === "statue" && Math.abs(arrow.target.x - arrow.tx) <= arrow.splash + 28) {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.splash, life: 0.22, duration: 0.22, color: "#ffce7a" });
}

function explodeIronCavalryBomb(arrow) {
  const source = getArrowSource(arrow);
  const targets = getUnitsInRadius(arrow.tx, arrow.splash, arrow.side, arrow.limit ?? 5, null, arrow.ty);
  targets.forEach((target) => {
    const dealt = applyUnitDamage(target, arrow.damage, { label: "炸弹", color: "#ffce7a", yOffset: -78, ranged: true, sourceSide: arrow.side, sourceUnitId: arrow.sourceId });
    handleDamageDealt(source, target, dealt);
    maybeApplyOrderRangedStun(arrow, target, source);
  });
  if (arrow.target?.kind === "statue" && Math.abs(arrow.target.x - arrow.tx) <= arrow.splash + 28) {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.splash, life: 0.3, duration: 0.3, color: "#ffce7a" });
  popText(arrow.tx, arrow.ty - 42, "炸弹爆炸", "#ffce7a");
}

function explodeBaseVolleyArrow(arrow) {
  const targets = getUnitsInRadius(arrow.tx, arrow.splash, arrow.side, arrow.limit ?? 2, null, arrow.ty);
  targets.forEach((target) => {
    applyUnitDamage(target, arrow.damage, { label: "爆箭", color: "#ffce7a", yOffset: -78 });
  });
  if (arrow.target?.kind === "statue" && Math.abs(arrow.target.x - arrow.tx) <= arrow.splash + 28) {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.splash, life: 0.18, duration: 0.18, color: "#ffce7a" });
}

function explodeCampaignMissile(arrow) {
  const targets = getUnitsInRadius(arrow.tx, arrow.radius, arrow.side, arrow.limit ?? 3, null, arrow.ty);
  targets.forEach((target) => {
    applyUnitDamage(target, arrow.damage, { label: "导弹", color: "#ff6b4a", yOffset: -82 });
  });
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.radius, life: 0.24, duration: 0.24, color: "#ff6b4a" });
  state.screenShake = Math.max(state.screenShake ?? 0, 0.18);
}

function explodeAt(x, y, attackerSide, damage, radius, label, options = {}) {
  getUnitsInRadius(x, radius, attackerSide, AOE_TARGET_LIMIT, null, y).forEach((unit) => {
    applyUnitDamage(unit, damage, { label, color: "#ffb45e", yOffset: -76 });
    if (options.burnDps) applyBurn(unit, options.burnDps, options.burnDuration);
  });

  if (attackerSide === "enemy" && Math.abs(FIELD.playerBase - x) <= radius + 28) {
    applyDamage({ kind: "statue", side: "player", x: FIELD.playerBase }, damage, attackerSide);
  }
  if (attackerSide === "player" && Math.abs(FIELD.enemyBase - x) <= radius + 28) {
    applyDamage({ kind: "statue", side: "enemy", x: FIELD.enemyBase }, damage, attackerSide);
  }

  state.blasts.push({ x, y, radius, life: 0.38, duration: 0.38 });
}

function applyPoison(target, dps, duration, options = {}) {
  if (isUnitHidden(target)) return;
  if (target.kind === "statue") {
    popText(target.x, FIELD.ground - 172, "毒雾无效", "#93d96b");
    return;
  }
  if (isPoisonImmune(target)) {
    popText(target.x, target.y - 88, "免疫中毒", "#93d96b");
    return;
  }

  target.poisonTimer = Math.max(target.poisonTimer, duration);
  target.poisonDps = Math.max(target.poisonDps, dps);
  target.poisonSlow = Math.min(target.poisonSlow ?? 1, options.slow ?? 1);
  if (options.sourceSide) target.poisonSourceSide = options.sourceSide;
  if (options.sourceUnitId) target.poisonSourceUnitId = options.sourceUnitId;
  if (options.raisesUndead) {
    target.poisonRaisesUndead = true;
  }
  if (options.necroPlague) {
    target.necroPlague = {
      side: options.necroPlague.side,
      sourceUnitId: options.necroPlague.sourceUnitId ?? options.sourceUnitId ?? null,
    };
  }
  target.poisonTick = 0;
  popText(target.x, target.y - 88, "中毒", "#93d96b");
}

function isPoisonImmune(unit) {
  return factionForSide(unit.side) === "undeadEmpire" || unit.type === "undead" || unit.type === "poisonZombie" || unit.type === "deadCorpse";
}

function clearPoison(unit, label = "解毒") {
  if (unit.poisonTimer <= 0 && unit.poisonTimer !== Infinity) return false;
  unit.poisonTimer = 0;
  unit.poisonDps = 0;
  unit.poisonTick = 0;
  unit.poisonSlow = 1;
  unit.poisonRaisesUndead = false;
  unit.poisonSourceSide = null;
  unit.poisonSourceUnitId = null;
  unit.necroPlague = null;
  popText(unit.x, unit.y - 94, label, "#b8f6c1");
  return true;
}

function applyBurn(target, dps, duration) {
  if (isUnitHidden(target)) return;
  if (target.kind === "statue") {
    popText(target.x, FIELD.ground - 172, "灼烧无效", "#ff9b45");
    return;
  }

  target.burnTimer = Math.max(target.burnTimer, duration);
  target.burnDps = Math.max(target.burnDps, dps);
  target.burnTick = 0;
  popText(target.x, target.y - 88, "灼烧", "#ff9b45");
}

function applyStackedBurn(target, dps, duration) {
  if (isUnitHidden(target)) return;
  if (target.kind === "statue") {
    popText(target.x, FIELD.ground - 172, "灼烧无效", "#ff9b45");
    return;
  }

  target.stackedBurns = target.stackedBurns ?? [];
  target.stackedBurns.push({ dps, life: duration, tick: 1 });
  popText(target.x, target.y - 88, "灼烧叠加", "#ff9b45");
}

function applyCandleSlow(target, duration, factor) {
  if (isUnitHidden(target) || target.kind === "statue") return;
  target.stormSlowTimer = Math.max(target.stormSlowTimer ?? 0, duration);
  target.stormSlowFactor = Math.min(target.stormSlowFactor ?? 1, factor);
  popText(target.x, target.y - 92, "冰光减速", "#9ee8ff");
}

function updatePoison(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (unit.poisonTimer <= 0 && unit.poisonTimer !== Infinity) return;
    if (unit.poisonTimer !== Infinity) unit.poisonTimer -= dt;
    unit.poisonTick += dt;
    if (unit.poisonTick >= 1) {
      unit.poisonTick = 0;
      applyUnitDamage(unit, unit.poisonDps, { label: "毒", color: "#93d96b", yOffset: -92, modified: false });
    }
  });
}

function applyCorrosion(target, dps, duration, options = {}) {
  if (isUnitHidden(target) || target.kind === "statue") return;
  target.corrosionTimer = Math.max(target.corrosionTimer ?? 0, duration);
  target.corrosionDps = Math.max(target.corrosionDps ?? 0, dps);
  target.corrosionDpsGrowth = Math.max(target.corrosionDpsGrowth ?? 0, options.growth ?? 0);
  target.corrosionSlow = Math.min(target.corrosionSlow ?? 1, options.slow ?? 1);
  target.corrosionTick = 0;
  popText(target.x, target.y - 94, "腐蚀", "#b7e06b");
}

function updateCorrosion(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if ((unit.corrosionTimer ?? 0) <= 0) return;
    unit.corrosionTimer -= dt;
    unit.corrosionTick += dt;
    while (unit.corrosionTick >= 1 && unit.corrosionTimer > 0) {
      unit.corrosionTick -= 1;
      const dps = unit.corrosionDps ?? 0;
      applyUnitDamage(unit, dps, { label: "蚀", color: "#b7e06b", yOffset: -100, modified: false });
      unit.corrosionDps = dps + (unit.corrosionDpsGrowth ?? 0);
    }
    if (unit.corrosionTimer <= 0) {
      unit.corrosionTimer = 0;
      unit.corrosionDps = 0;
      unit.corrosionDpsGrowth = 0;
      unit.corrosionTick = 0;
      unit.corrosionSlow = 1;
    }
  });
}

function updateBurn(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (unit.burnTimer > 0) {
      unit.burnTimer -= dt;
      unit.burnTick += dt;
      if (unit.burnTick >= 1) {
        unit.burnTick = 0;
        applyUnitDamage(unit, unit.burnDps, { label: "燃", color: "#ff9b45", yOffset: -104 });
      }
    }
    if (unit.stackedBurns?.length) {
      for (const stack of unit.stackedBurns) {
        stack.life -= dt;
        stack.tick -= dt;
        while (stack.life > 0 && stack.tick <= 0) {
          stack.tick += 1;
          applyUnitDamage(unit, stack.dps, { label: "燃", color: "#ff9b45", yOffset: -104 });
        }
      }
      unit.stackedBurns = unit.stackedBurns.filter((stack) => stack.life > 0);
    }
  });
}

function updateCandlelight(unit) {
  if (unit.side !== "enemy") return;
  const data = UNIT.candlelight;
  const enemies = state.units.filter((target) =>
    target.side !== unit.side &&
    target.hp > 0 &&
    !isUnitHidden(target) &&
    !UNIT[target.type]?.untargetable &&
    Math.abs(target.x - unit.x) <= data.range + 80
  );
  const burning = enemies.filter((target) => (target.stackedBurns?.length ?? 0) > 0 || target.burnTimer > 0).length;
  unit.candleForm = enemies.length >= 3 || burning >= 2 ? "fire" : "ice";
}

function updateReaper(unit) {
  if (unit.reaperStealthTimer > 0 && unit.side === "enemy") return;
  if (unit.side === "enemy" && unit.hp < unit.maxHp * 0.45 && (unit.cooldown ?? 0) <= 0) {
    activateReaperStealth(unit);
  }
}

function updateScimitarWarrior(unit) {
  void unit;
}

function castScimitarRoar(unit) {
  const data = UNIT.scimitarWarrior;
  if ((unit.scimitarRoarTimer ?? 0) > 0) return false;
  const enemies = getUnitsInRadius(unit.x, data.roarRadius, unit.side, Infinity);
  if (!enemies.length) {
    popText(unit.x, unit.y - 112, "范围内没有敌人", "#d9d0b8");
    return false;
  }
  enemies.forEach((enemy) => applyStun(enemy, data.roarStun));
  unit.scimitarRoarTimer = data.roarCooldown;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.55);
  state.blasts.push({ x: unit.x, y: unit.y - 45, radius: data.roarRadius, life: 0.38, duration: 0.38, color: "#d7b978" });
  popText(unit.x, unit.y - 124, "战吼", "#d7b978");
  return true;
}

function updateGoblin(unit, dt) {
  const data = UNIT.goblin;
  if (unit.goblinBurrowed) return true;

  if (unit.goblinPlantTimer > 0) {
    unit.goblinPlantTimer = Math.max(0, unit.goblinPlantTimer - dt);
    if (unit.goblinPlantTimer <= 0) finishGoblinMinePlant(unit);
    return true;
  }

  if (unit.goblinMineAmmo > 0 && unit.goblinMineTimer <= 0) {
    unit.goblinPlantTimer = data.minePlantDuration;
    unit.goblinMineTimer = data.mineEvery;
    unit.cooldown = Math.max(unit.cooldown ?? 0, data.minePlantDuration);
    popText(unit.x, unit.y - 106, "安放地雷", "#ffce7a");
    return true;
  }

  return false;
}

function finishGoblinMinePlant(unit) {
  const data = UNIT.goblin;
  if (unit.hp <= 0 || unit.goblinMineAmmo <= 0) return;
  const dir = unit.side === "player" ? 1 : -1;
  const x = Math.max(FIELD.playerGate + 80, Math.min(FIELD.enemyGate - 80, unit.x + dir * (24 + Math.random() * 22)));
  const y = unit.y + (Math.random() * 30 - 15);
  state.landMines.push({
    id: state.nextId++,
    side: unit.side,
    x,
    y,
    life: data.mineLife,
    damage: data.mineDamage,
    triggerRadius: data.mineTriggerRadius,
    blastRadius: data.mineBlastRadius,
    aoeLimit: data.mineAoeLimit,
  });
  unit.goblinMineAmmo -= 1;
  popText(x, y - 36, `地雷 ${unit.goblinMineAmmo}/${data.mineAmmo}`, "#ffce7a");
}

function toggleGoblinBurrow(unit) {
  unit.goblinBurrowed = !unit.goblinBurrowed;
  unit.goblinPlantTimer = 0;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.35);
  popText(unit.x, unit.y - 106, unit.goblinBurrowed ? "遁地" : "钻出", unit.goblinBurrowed ? "#d0b078" : "#b7f56e");
  return true;
}

function canReceiveGoblinExpertArmor(source, ally) {
  return ally &&
    ally.side === source.side &&
    ally.hp > 0 &&
    ally.id !== source.id &&
    ally.type !== "goblinExpert" &&
    !isUnitHidden(ally) &&
    !UNIT[ally.type]?.untargetable;
}

function updateGoblinExpert(unit) {
  const data = UNIT.goblinExpert;
  if (unit.goblinExpertArmorTimer > 0) return;
  const candidates = state.units
    .filter((ally) => canReceiveGoblinExpertArmor(unit, ally))
    .filter((ally) => Math.abs(ally.x - unit.x) <= data.armorRange && (ally.armorReduction ?? 0) < data.armorMaxReduction);
  const lightTargets = candidates
    .filter((ally) => (ally.armorReduction ?? 0) < data.armorStepReduction)
    .sort((a, b) => getGoblinExpertArmorPriority(b) - getGoblinExpertArmorPriority(a) || Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))
    .slice(0, data.armorLimit);
  const mediumTargets = lightTargets.length ? [] : candidates
    .filter((ally) => (ally.armorReduction ?? 0) >= data.armorStepReduction)
    .sort((a, b) => getGoblinExpertArmorPriority(b) - getGoblinExpertArmorPriority(a) || (b.hp / b.maxHp) - (a.hp / a.maxHp))
    .slice(0, data.armorLimit);
  const targets = lightTargets.length ? lightTargets : mediumTargets;
  if (!targets.length) {
    unit.goblinExpertArmorTimer = 2;
    return;
  }
  targets.forEach((target) => applyGoblinExpertArmor(unit, target));
  unit.goblinExpertArmorTimer = data.armorEvery;
}

function getGoblinExpertArmorPriority(unit) {
  const data = UNIT[unit.type] ?? {};
  const cost = data.cost ?? 0;
  const damage = data.damage ?? 0;
  const rangeBonus = (data.range ?? 0) > 80 ? 45 : 0;
  const giantBonus = data.giant ? 120 : 0;
  const rolePenalty = unit.type === "miner" || unit.type === "goblin" ? -45 : 0;
  return cost + unit.maxHp * 0.4 + damage * 12 + rangeBonus + giantBonus + rolePenalty;
}

function applyGoblinExpertArmor(source, target) {
  const data = UNIT.goblinExpert;
  target.armorReduction = Math.min(data.armorMaxReduction, (target.armorReduction ?? 0) + data.armorStepReduction);
  popText(target.x, target.y - 108, target.armorReduction >= data.armorMaxReduction ? "中型护甲" : "护甲", "#b7d38a");
  state.blasts.push({ x: target.x, y: target.y - 42, radius: 34, life: 0.28, duration: 0.28, color: "#b7d38a" });
}

function castGoblinExpertHeavyArmor(unit, target) {
  const data = UNIT.goblinExpert;
  if (!canReceiveGoblinExpertArmor(unit, target)) {
    popText(unit.x, unit.y - 116, "无法穿甲", "#d9d0b8");
    return false;
  }
  if (Math.abs(target.x - unit.x) > data.armorRange) {
    popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
    return false;
  }
  target.heavyArmorTimer = data.heavyArmorDuration;
  target.heavyArmorReduction = data.heavyArmorReduction;
  popText(target.x, target.y - 116, "重型护甲", "#ffce7a");
  state.blasts.push({ x: target.x, y: target.y - 45, radius: 52, life: 0.42, duration: 0.42, color: "#ffce7a" });
  return true;
}

function updateShaman(unit) {
  if ((unit.shamanThornTimer ?? 0) <= 0) castShamanThorns(unit);
  if ((unit.shamanRegenTimer ?? 0) <= 0) castShamanRegen(unit);
}

function castShamanThorns(unit) {
  const data = UNIT.shaman;
  const dir = unit.side === "player" ? 1 : -1;
  const radius = Math.max(10, Math.sqrt(data.thornArea / Math.PI));
  const x = Math.max(FIELD.playerGate + 28, Math.min(FIELD.enemyGate - 28, unit.x + dir * 68));
  const y = unit.y;
  state.thornFields.push({
    side: unit.side,
    x,
    y,
    radius,
    dps: data.thornDps,
    slow: data.thornSlow,
    life: data.thornDuration,
    tick: 0,
  });
  unit.shamanThornTimer = data.thornEvery;
  state.blasts.push({ x, y: y - 18, radius: radius + 24, life: 0.34, duration: 0.34, color: "#78d36b" });
  popText(unit.x, unit.y - 116, "荆棘", "#8ee88a");
  return true;
}

function castShamanRegen(unit) {
  const data = UNIT.shaman;
  const target = state.units
    .filter((candidate) =>
      candidate.side === unit.side &&
      candidate.id !== unit.id &&
      candidate.hp > 0 &&
      !isUnitHidden(candidate) &&
      candidate.hp < candidate.maxHp &&
      Math.abs(candidate.x - unit.x) <= data.healRange
    )
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  unit.shamanRegenTimer = data.healEvery;
  if (!target) return false;
  const healed = Math.min(data.healAmount, target.maxHp - target.hp);
  target.hp += healed;
  state.blasts.push({ x: target.x, y: target.y - 50, radius: 46, life: 0.38, duration: 0.38, color: "#8ee88a" });
  popText(target.x, target.y - 112, `萨满 +${healed}`, "#8ee88a");
  return true;
}

function updateUnitRegen(unit, dt) {
  if ((unit.regenLife ?? 0) <= 0) return;
  unit.regenLife = Math.max(0, unit.regenLife - dt);
  unit.regenTick = (unit.regenTick ?? 0) - dt;
  while (unit.regenTick <= 0 && unit.regenLife > 0 && unit.hp > 0) {
    unit.regenTick += 1;
    const amount = unit.regenHps ?? 0;
    if (amount > 0) {
      unit.hp = Math.min(unit.maxHp, unit.hp + amount);
      popText(unit.x, unit.y - 86, `+${amount}`, "#8ee88a");
    }
  }
  if (unit.regenLife <= 0) {
    unit.regenHps = 0;
    unit.regenTick = 0;
  }
}

function updatePriest(unit) {
  collectPriestOffering(unit);
}

function collectPriestOffering(unit) {
  const data = UNIT.priest;
  const corpse = state.corpses
    .filter((item) => item.ritual && item.side !== unit.side)
    .filter((item) => Math.abs(item.x - unit.x) <= data.ritualRange)
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0];
  if (!corpse) return false;
  state.corpses = state.corpses.filter((item) => item !== corpse);
  unit.priestSacrificeCount = (unit.priestSacrificeCount ?? 0) + 1;
  popText(unit.x, unit.y - 112, `祭品 ${unit.priestSacrificeCount}/${data.sacrificeNeeded}`, "#c8a0ff");
  state.blasts.push({ x: corpse.x, y: corpse.y - 28, radius: 42, life: 0.32, duration: 0.32, color: "#b88cff" });
  if (unit.priestSacrificeCount >= data.sacrificeNeeded) {
    unit.priestSacrificeCount -= data.sacrificeNeeded;
    summonApeMan(unit);
  }
  return true;
}

function summonApeMan(unit) {
  const dir = unit.side === "player" ? 1 : -1;
  const ape = spawnUnit("summonedApeMan", unit.side, Math.max(FIELD.playerGate + 42, Math.min(FIELD.enemyGate - 42, unit.x + dir * 42)));
  ape.y = unit.y + (Math.random() * 26 - 13);
  ape.forceCharge = unit.forceCharge;
  state.blasts.push({ x: ape.x, y: ape.y - 48, radius: 62, life: 0.42, duration: 0.42, color: "#c8a0ff" });
  popText(ape.x, ape.y - 116, "召唤猿人", "#c8a0ff");
}

function castPriestSiphon(unit, target) {
  const data = UNIT.priest;
  if ((unit.priestSiphonTimer ?? 0) > 0) return false;
  if (!target || target.kind === "statue" || target.side === unit.side || target.hp <= 0 || target.hp > data.siphonMaxHp) {
    popText(unit.x, unit.y - 116, "目标生命过高", "#d9d0b8");
    return false;
  }
  const lifePool = Math.max(0, target.hp);
  applyDamage(target, data.siphonDamage, unit.side);
  const allies = getFrontlineAllies(unit.side);
  if (allies.length && lifePool > 0) {
    const heal = Math.max(1, Math.floor(lifePool / allies.length));
    allies.forEach((ally) => {
      ally.hp = Math.min(ally.maxHp, ally.hp + heal);
      popText(ally.x, ally.y - 96, `+${heal}`, "#c8a0ff");
    });
  }
  unit.priestSiphonTimer = data.siphonCooldown;
  state.lightning.push({ x1: unit.x, y1: unit.y - 74, x2: target.x, y2: target.y - 58, life: 0.3, duration: 0.3, color: "#b88cff" });
  popText(target.x, target.y - 104, "献祭生命", "#c8a0ff");
  return true;
}

function castPriestBloodSacrifice(unit, target) {
  const data = UNIT.priest;
  if ((unit.priestBloodTimer ?? 0) > 0) return false;
  if (!canPriestSacrificeAlly(unit, target)) {
    popText(unit.x, unit.y - 116, "无法血祭", "#d9d0b8");
    return false;
  }
  const lifePool = Math.round(target.hp * data.bloodSacrificeFactor);
  target.lastDamageSide = unit.side;
  target.lastDamageUnitId = unit.id;
  target.hp = 0;
  unit.priestBloodTimer = data.bloodSacrificeCooldown;
  healFrontlineAllies(unit.side, lifePool, "血祭");
  state.blasts.push({ x: target.x, y: target.y - 42, radius: 58, life: 0.42, duration: 0.42, color: "#c8a0ff" });
  popText(target.x, target.y - 112, "血祭", "#c8a0ff");
  return true;
}

function canPriestSacrificeAlly(source, target) {
  if (!target || target.kind === "statue") return false;
  if (target.side !== source.side || target.id === source.id || target.hp <= 0 || isUnitHidden(target) || UNIT[target.type]?.untargetable) return false;
  if (factionForSide(target.side) === "undeadEmpire" || isUndeadEmpireUnit(target.type)) return false;
  if (UNIT[target.type]?.flying || UNIT[target.type]?.statueOnly) return false;
  return target.type !== "miner";
}

function findPriestSiphonTarget(unit) {
  const data = UNIT.priest;
  return state.units
    .filter((target) =>
      target.side !== unit.side &&
      target.hp > 0 &&
      target.hp <= data.siphonMaxHp &&
      !isUnitHidden(target) &&
      !isReaperStealthed(target) &&
      !UNIT[target.type]?.untargetable &&
      canTarget(unit, target)
    )
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0] ?? null;
}

function healFrontlineAllies(side, total, label) {
  const allies = getFrontlineAllies(side);
  if (!allies.length || total <= 0) return;
  const heal = Math.max(1, Math.floor(total / allies.length));
  allies.forEach((ally) => {
    const healed = Math.min(heal, ally.maxHp - ally.hp);
    if (healed <= 0) return;
    ally.hp += healed;
    popText(ally.x, ally.y - 96, `${label} +${healed}`, "#c8a0ff");
  });
}

function getFrontlineAllies(side) {
  const units = state.units.filter((unit) => unit.side === side && unit.hp > 0 && unit.type !== "miner" && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable);
  if (!units.length) return [];
  const front = side === "player"
    ? Math.max(...units.map((unit) => unit.x))
    : Math.min(...units.map((unit) => unit.x));
  return units.filter((unit) => Math.abs(unit.x - front) <= 260);
}

function getHornKnightChargeTargets(unit) {
  const data = UNIT.minotaur;
  return getChargePathTargets(unit, data.chargeDistance);
}

function getChargePathTargets(unit, distance) {
  const dir = unit.side === "player" ? 1 : -1;
  const startX = unit.x;
  const endX = unit.x + dir * distance;
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  return state.units.filter((target) =>
    target.side !== unit.side &&
    target.hp > 0 &&
    !isUnitHidden(target) &&
    !isReaperStealthed(target) &&
    !UNIT[target.type]?.untargetable &&
    target.x >= minX &&
    target.x <= maxX &&
    Math.abs(target.y - unit.y) <= 90
  );
}

function castDarkKnightCharge(unit) {
  const data = UNIT.darkKnight;
  if ((unit.darkKnightChargeTimer ?? 0) > 0) return false;
  const targets = getChargePathTargets(unit, data.chargeDistance);
  if (!targets.length && unit.side !== "player") return false;
  const dir = unit.side === "player" ? 1 : -1;
  const startX = unit.x;
  unit.x = Math.max(FIELD.playerGate + 34, Math.min(FIELD.enemyGate - 34, unit.x + dir * data.chargeDistance));
  unit.darkKnightChargeTimer = data.chargeCooldown;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.45);
  targets.forEach((target) => applyStun(target, data.chargeStun));
  state.blasts.push({ x: (startX + unit.x) / 2, y: unit.y - 26, radius: data.chargeDistance / 2, life: 0.34, duration: 0.34, color: "#7d6aa8" });
  popText(unit.x, unit.y - 126, targets.length ? "黑骑冲刺" : "冲刺", "#d8d0ff");
  return true;
}

function tryMinotaurLeap(unit) {
  if ((unit.minotaurLeapTimer ?? 0) > 0) return false;
  if (!getHornKnightChargeTargets(unit).length) return false;
  return castMinotaurLeap(unit);
}

function castMinotaurLeap(unit) {
  const data = UNIT.minotaur;
  if ((unit.minotaurLeapTimer ?? 0) > 0) return false;
  const targets = getHornKnightChargeTargets(unit);
  if (!targets.length && unit.side !== "player") return false;
  const dir = unit.side === "player" ? 1 : -1;
  const startX = unit.x;
  unit.x = Math.max(FIELD.playerGate + 34, Math.min(FIELD.enemyGate - 34, unit.x + dir * data.chargeDistance));
  unit.minotaurLeapTimer = data.chargeCooldown;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.45);
  targets.forEach((target) => applyStun(target, data.chargeStun));
  state.blasts.push({ x: (startX + unit.x) / 2, y: unit.y - 26, radius: data.chargeDistance / 2, life: 0.34, duration: 0.34, color: "#d0b078" });
  popText(unit.x, unit.y - 126, targets.length ? "巨角冲撞" : "冲刺", "#d0b078");
  return true;
}

function attackMinotaur(unit, target) {
  const data = UNIT.minotaur;
  let attacked = false;
  if ((unit.hornBeastAttackTimer ?? 0) <= 0) {
    const dealt = applyDamage(target, data.beastDamage, unit.side);
    handleDamageDealt(unit, target, dealt);
    unit.hornBeastAttackTimer = data.beastCooldown;
    attacked = true;
    if (target.kind !== "statue" && target.hp <= 0) return;
  }
  if ((unit.hornRiderAttackTimer ?? 0) <= 0) {
    for (let i = 0; i < 2; i += 1) {
      if (target.kind !== "statue" && target.hp <= 0) break;
      const dealt = applyDamage(target, data.riderDamage, unit.side);
      handleDamageDealt(unit, target, dealt);
    }
    unit.hornRiderAttackTimer = data.riderCooldown;
    attacked = true;
  }
  if (attacked && target.kind !== "statue") {
    state.blasts.push({ x: target.x, y: target.y - 36, radius: 32, life: 0.18, duration: 0.18, color: "#d0b078" });
  }
}

function attackHornKnightRider(unit, target) {
  const data = UNIT.hornKnightRider;
  for (let i = 0; i < 2; i += 1) {
    if (target.kind !== "statue" && target.hp <= 0) break;
    const dealt = applyDamage(target, data.damage, unit.side);
    handleDamageDealt(unit, target, dealt);
  }
  if (target.kind !== "statue") {
    state.blasts.push({ x: target.x, y: target.y - 34, radius: 25, life: 0.16, duration: 0.16, color: "#c89a6d" });
  }
}

function enrageNearbyMinotaurs(deadUnit) {
  const data = UNIT.minotaur;
  state.units.forEach((unit) => {
    if (unit.id === deadUnit.id || unit.type !== "minotaur" || unit.side !== deadUnit.side || unit.hp <= 0) return;
    if (Math.abs(unit.x - deadUnit.x) > data.deathRageRange) return;
    unit.minotaurRage = true;
    popText(unit.x, unit.y - 120, "牛头狂暴", "#ff8a3d");
  });
}

function enrageNearbyRhinoMen(deadUnit) {
  const data = UNIT.rhinoMan;
  state.units.forEach((unit) => {
    if (unit.id === deadUnit.id || unit.type !== "rhinoMan" || unit.side !== deadUnit.side || unit.hp <= 0) return;
    if (Math.abs(unit.x - deadUnit.x) > data.deathRageRange) return;
    unit.rhinoRage = true;
    popText(unit.x, unit.y - 120, "犀牛狂暴", "#ff8a3d");
  });
}

function updateGriffinBomber(unit, dt) {
  const data = UNIT.griffinBomber;
  const dir = unit.side === "player" ? 1 : -1;
  unit.inCastle = false;
  unit.x += dir * data.speed * dt;
  unit.y += Math.sin(unit.anim * 0.45) * 3 * dt;

  if ((unit.cooldown ?? 0) <= 0 && unit.griffinAmmo > 0) {
    const target = findGriffinBombTarget(unit);
    if (target) {
      dropGriffinBomb(unit, target);
    }
  }

  const enemyBase = unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase;
  const crossedBase = unit.side === "player" ? unit.x > enemyBase + 80 : unit.x < enemyBase - 80;
  if (!crossedBase) return;

  if (unit.griffinAmmo > 0) {
    const target = { kind: "statue", side: unit.side === "player" ? "enemy" : "player", x: enemyBase, y: FIELD.ground - 80 };
    const bombs = unit.griffinAmmo;
    for (let i = 0; i < bombs; i += 1) applyDamage(target, data.damage, unit.side);
    state.blasts.push({ x: enemyBase, y: FIELD.ground - 92, radius: data.bombRadius + 18, life: 0.45, duration: 0.45 });
    popText(enemyBase, FIELD.ground - 190, `剩余炸弹 x${bombs}`, "#ffce7a");
  }

  unit.griffinAmmo = data.ammo;
  unit.cooldown = data.cooldown;
  unit.x = unit.side === "player" ? FIELD.playerBase - 180 : FIELD.enemyBase + 180;
  unit.y = FIELD.ground + (Math.random() * 90 - 45);
  popText(unit.side === "player" ? FIELD.playerBase + 80 : FIELD.enemyBase - 80, FIELD.ground - 155, "狮鹫补弹", "#ffce7a");
}

function findGriffinBombTarget(unit) {
  const data = UNIT.griffinBomber;
  const dir = unit.side === "player" ? 1 : -1;
  const enemies = state.units
    .filter((target) =>
      target.side !== unit.side &&
      target.hp > 0 &&
      !isUnitHidden(target) &&
      !UNIT[target.type]?.untargetable &&
      Math.abs(target.x - unit.x) <= data.range &&
      Math.abs(target.y - unit.y) <= 160
    )
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x));
  if (enemies[0]) return enemies[0];

  const enemyBase = unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase;
  const approachingBase = dir * (enemyBase - unit.x) >= 0 && Math.abs(enemyBase - unit.x) <= data.range;
  if (!approachingBase) return null;
  return { kind: "statue", side: unit.side === "player" ? "enemy" : "player", x: enemyBase, y: FIELD.ground - 80 };
}

function dropGriffinBomb(unit, target) {
  const data = UNIT.griffinBomber;
  unit.griffinAmmo -= 1;
  unit.cooldown = data.cooldown;
  if (target.kind === "statue") {
    applyDamage(target, data.damage, unit.side);
    state.blasts.push({ x: target.x, y: FIELD.ground - 92, radius: data.bombRadius, life: 0.34, duration: 0.34 });
    popText(target.x, FIELD.ground - 175, "轰炸", "#ffce7a");
    return;
  }
  const from = { x: unit.x, y: unit.y - 84 };
  const to = { x: target.x, y: target.y - 24 };
  if (tryBlockSpecialWithShieldCart(from, to, target, data.damage)) {
    popText(unit.x, unit.y - 122, `投弹被挡 ${unit.griffinAmmo}/${data.ammo}`, "#d7c090");
    return;
  }
  getUnitsInRadius(target.x, data.bombRadius, unit.side, data.bombLimit).forEach((enemy) => {
    applyUnitDamage(enemy, data.damage, { label: "炸", color: "#ffce7a", yOffset: -76, ranged: true });
  });
  state.blasts.push({ x: target.x, y: target.y - 24, radius: data.bombRadius, life: 0.34, duration: 0.34 });
  popText(unit.x, unit.y - 122, `投弹 ${unit.griffinAmmo}/${data.ammo}`, "#ffce7a");
}

function updateCorpses(dt) {
  state.corpses.forEach((corpse) => {
    corpse.life -= dt;
  });
  state.corpses = state.corpses.filter((corpse) => corpse.life > 0);
}

function updateLandMines(dt = 0) {
  const triggered = new Set();
  for (const mine of state.landMines) {
    mine.life = Math.max(0, (mine.life ?? UNIT.goblin.mineLife) - dt);
    const target = state.units.find((unit) =>
      unit.side !== mine.side &&
      unit.hp > 0 &&
      !isUnitHidden(unit) &&
      !isReaperStealthed(unit) &&
      !UNIT[unit.type]?.untargetable &&
      distanceTo(unit.x, unit.y, mine.x, mine.y) <= mine.triggerRadius
    );
    if (!target && mine.life > 0) continue;
    triggered.add(mine.id);
    getUnitsInRadius(mine.x, mine.blastRadius, mine.side, mine.aoeLimit ?? AOE_TARGET_LIMIT).forEach((enemy) => {
      applyUnitDamage(enemy, mine.damage, { label: "雷", color: "#ffce7a", yOffset: -76 });
    });
    state.blasts.push({ x: mine.x, y: mine.y - 20, radius: mine.blastRadius, life: 0.32, duration: 0.32, color: "#ffce7a" });
    popText(mine.x, mine.y - 52, target ? "地雷爆炸" : "地雷自爆", "#ffce7a");
  }
  if (triggered.size) state.landMines = state.landMines.filter((mine) => !triggered.has(mine.id));
}

function updateBarricades(dt = 0) {
  for (const barricade of state.barricades) {
    if (barricade.controlTower) updateControlTowerBarricade(barricade, dt);
    barricade.life -= dt;
    barricade.tick -= dt;
    while (barricade.tick <= 0 && barricade.life > 0 && barricade.hp > 0) {
      barricade.tick += barricade.tickEvery;
      if (barricade.acidTower) fireAcidTower(barricade);
      else if (barricade.highWall) fireHighWallArchers(barricade);
      else damageBarricadeRow(barricade);
    }
  }
  state.barricades = state.barricades.filter((barricade) => barricade.life > 0 && barricade.hp > 0);
}

function updateControlTowerBarricade(tower, dt) {
  tower.resourceTick = (tower.resourceTick ?? 1) - dt;
  while (tower.resourceTick <= 0 && tower.hp > 0) {
    tower.resourceTick += 1;
    tower.gold = (tower.gold ?? 0) + (tower.goldPerSecond ?? CAMPAIGN_CONTROL_TOWER.goldPerSecond);
    tower.magic = (tower.magic ?? 0) + (tower.magicPerSecond ?? CAMPAIGN_CONTROL_TOWER.magicPerSecond);
  }
  tower.spawnTick = (tower.spawnTick ?? tower.spawnEvery ?? CAMPAIGN_CONTROL_TOWER.spawnEvery) - dt;
  if (tower.spawnTick > 0 || tower.hp <= 0) return;
  tower.spawnTick += tower.spawnEvery ?? CAMPAIGN_CONTROL_TOWER.spawnEvery;
  const pool = tower.spawnTypes?.length ? tower.spawnTypes : CAMPAIGN_CONTROL_TOWER.spawnTypes;
  const affordable = pool.filter((type) => canControlTowerAffordUnit(tower, type));
  if (!affordable.length) {
    popText(tower.x, tower.y - 170, "控制塔蓄能", "#b88cff");
    return;
  }
  const type = affordable[Math.floor(Math.random() * affordable.length)];
  spendControlTowerUnitCost(tower, type);
  const offset = tower.side === "enemy" ? 72 : -72;
  const unit = spawnUnit(type, tower.side, tower.x + offset);
  unit.y = tower.y + (Math.random() - 0.5) * 110;
  unit.forceCharge = true;
  unit.controlledByTower = true;
  popText(tower.x, tower.y - 170, `${UNIT[type]?.name ?? "元素"}被控制`, "#b88cff");
}

function getControlTowerUnitCost(type) {
  if (BASIC_ELEMENT_UNITS.has(type)) {
    return { gold: getUnitCost(type, "element"), magic: 0 };
  }
  if (MERGE_UNITS.has(type)) {
    const magic = getElementMergeMagicCost(type, null) || (type === "scaldStrike" || type === "electricGate" ? 100 : 0);
    return { gold: 0, magic };
  }
  return { gold: getUnitCost(type, "element"), magic: getUnitMagicCost(type, "element") };
}

function canControlTowerAffordUnit(tower, type) {
  const cost = getControlTowerUnitCost(type);
  return (tower.gold ?? 0) >= cost.gold && (tower.magic ?? 0) >= cost.magic;
}

function spendControlTowerUnitCost(tower, type) {
  const cost = getControlTowerUnitCost(type);
  tower.gold = Math.max(0, (tower.gold ?? 0) - cost.gold);
  tower.magic = Math.max(0, (tower.magic ?? 0) - cost.magic);
}

function fireAcidTower(tower) {
  const target = state.units
    .filter((unit) => (
      areHostileSides(tower.side, unit.side) &&
      unit.hp > 0 &&
      !isUnitHidden(unit) &&
      !isReaperStealthed(unit) &&
      !UNIT[unit.type]?.untargetable &&
      Math.abs(unit.x - tower.x) <= tower.acidRange &&
      Math.abs((unit.y ?? FIELD.ground) - tower.y) <= 280
    ))
    .sort((a, b) => Math.abs(a.x - tower.x) - Math.abs(b.x - tower.x))[0];
  if (!target) return;
  const damage = applyUnitDamage(target, tower.acidDamage, {
    label: "酸蚀",
    color: "#b7e06b",
    yOffset: -88,
    sourceSide: tower.side,
  });
  if (damage > 0) {
    createSlimeField({
      x: target.x,
      y: target.y ?? FIELD.ground,
      side: tower.side,
      radius: tower.slimeRadius,
      slow: tower.slimeSlow,
      duration: tower.slimeDuration,
      label: "酸蚀粘液",
    });
  }
  state.blasts.push({
    x: target.x,
    y: (target.y ?? FIELD.ground) - 36,
    radius: 34,
    life: 0.28,
    duration: 0.28,
    color: "#b7e06b",
  });
  state.lightning.push({
    x1: tower.x,
    y1: tower.y - tower.width / 2 - 70,
    x2: target.x,
    y2: (target.y ?? FIELD.ground) - 56,
    life: 0.18,
    duration: 0.18,
  });
}

function fireHighWallArchers(wall) {
  const front = getBarricadeFrontDirection(wall);
  const targets = state.units
    .filter((unit) => (
      areHostileSides(wall.side, unit.side) &&
      unit.hp > 0 &&
      !isUnitHidden(unit) &&
      !isReaperStealthed(unit) &&
      !UNIT[unit.type]?.untargetable &&
      (unit.x - wall.x) * front >= -40 &&
      Math.abs(unit.x - wall.x) <= wall.archerRange &&
      Math.abs((unit.y ?? FIELD.ground) - wall.y) <= 240
    ))
    .sort((a, b) => Math.abs(a.x - wall.x) - Math.abs(b.x - wall.x))
    .slice(0, wall.archerCount);

  targets.forEach((target, index) => {
    const xOffset = (index - (targets.length - 1) / 2) * 16;
    state.arrows.push({
      x: wall.x + xOffset,
      y: wall.y - wall.width / 2 - 24,
      tx: target.x,
      ty: target.y - 48 + (UNIT[target.type]?.flying ? -42 : 0),
      side: wall.side,
      damage: wall.archerDamage,
      target,
      life: 0.45,
      duration: 0.45,
      type: "campaignHighWallArrow",
    });
  });
}

function damageBarricadeRow(barricade) {
  const targets = getUnitsOnBarricade(barricade).slice(0, 6);
  targets.forEach((unit) => {
    const dealt = applyUnitDamage(unit, barricade.damage, { label: "拒马", color: "#d7c090", yOffset: -84, sourceSide: barricade.side });
    const source = state.units.find((candidate) => candidate.id === barricade.ownerId && candidate.hp > 0) ?? null;
    handleDamageDealt(source, unit, dealt);
    if (isCavalryUnit(unit)) {
      cancelCavalryMomentum(unit);
      applyStun(unit, barricade.cavalryStop);
      popText(unit.x, unit.y - 108, "骑兵受阻", "#d7c090");
    }
  });
}

function getUnitsOnBarricade(barricade) {
  const front = getBarricadeFrontDirection(barricade);
  return state.units.filter((unit) =>
    areHostileSides(barricade.side, unit.side) &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !isReaperStealthed(unit) &&
    !UNIT[unit.type]?.untargetable &&
    isPointInFrontOfBarricade(unit.x, unit.y ?? FIELD.ground, barricade, front)
  );
}

function getBarricadeFrontDirection(barricade) {
  if (state?.fourWay && FOUR_WAY_BASES[barricade.side]) {
    return FOUR_WAY_BASES[barricade.side].x < FIELD.width / 2 ? 1 : -1;
  }
  return barricade.side === "player" ? 1 : -1;
}

function isPointInFrontOfBarricade(x, y, barricade, front = getBarricadeFrontDirection(barricade)) {
  const forward = (x - barricade.x) * front;
  return (
    forward >= -barricade.length / 2 &&
    forward <= barricade.length / 2 + 70 &&
    Math.abs(y - barricade.y) <= barricade.width / 2 + 40
  );
}

function isPointInsideBarricade(x, y, barricade) {
  return Math.abs(x - barricade.x) <= barricade.length / 2 && Math.abs(y - barricade.y) <= barricade.width / 2;
}

function getBlockingBarricadeAt(unit, x = unit.x, y = unit.y, beforeX = null, beforeY = null) {
  if (!unit || UNIT[unit.type]?.flying) return null;
  return (state.barricades ?? []).find((barricade) => (
    barricade.hp > 0 &&
    areHostileSides(barricade.side, unit.side) &&
    (
      isPointInsideBarricade(x, y ?? FIELD.ground, barricade) ||
      didCrossBarricade(unit, barricade, x, y ?? FIELD.ground, beforeX, beforeY)
    )
  )) ?? null;
}

function didCrossBarricade(unit, barricade, x, y, beforeX, beforeY) {
  if (!Number.isFinite(beforeX) || !Number.isFinite(beforeY)) return false;
  const laneTouches = Math.min(Math.abs(y - barricade.y), Math.abs(beforeY - barricade.y)) <= barricade.width / 2 + 8;
  if (!laneTouches) return false;
  const left = barricade.x - barricade.length / 2;
  const right = barricade.x + barricade.length / 2;
  const minX = Math.min(beforeX, x);
  const maxX = Math.max(beforeX, x);
  return minX <= right && maxX >= left;
}

function findBlockingBarricadeTarget(unit) {
  if (!unit || UNIT[unit.type]?.flying) return null;
  const dir = getUnitFacingDirection(unit);
  const reach = Math.max(getUnitRange(unit), 80) + 24;
  const candidate = (state.barricades ?? [])
    .filter((barricade) => (
      barricade.hp > 0 &&
      areHostileSides(barricade.side, unit.side) &&
      Math.sign(barricade.x - unit.x || dir) === dir &&
      Math.abs((unit.y ?? FIELD.ground) - barricade.y) <= barricade.width / 2 + 44 &&
      Math.abs(barricade.x - unit.x) <= reach + barricade.length / 2
    ))
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))[0];
  if (!candidate) return null;
  return { ...candidate, kind: "barricade" };
}

function isCavalryUnit(unit) {
  return ["ironCavalry", "darkKnight", "minotaur", "hornKnightRider", "rhinoMan"].includes(unit?.type);
}

function cancelCavalryMomentum(unit) {
  unit.forceCharge = false;
  unit.ironCavalryChargeTimer = 0;
  unit.darkKnightChargeTimer = 0;
  unit.minotaurLeapTimer = Math.max(unit.minotaurLeapTimer ?? 0, 0.8);
}

function updateGhosts(dt) {
  for (const ghost of state.ghosts) {
    ghost.life -= dt;
    ghost.x += ghost.dir * ghost.speed * dt;
    state.units.forEach((unit) => {
      if (unit.side === ghost.side || unit.hp <= 0 || isUnitHidden(unit) || UNIT[unit.type]?.untargetable) return;
      if (ghost.hitIds.has(unit.id)) return;
      if (Math.abs(unit.x - ghost.x) > 26 || Math.abs(unit.y - ghost.y) > 62) return;
      ghost.hitIds.add(unit.id);
      applyFear(unit, ghost.fearDuration);
    });
  }
  state.ghosts = state.ghosts.filter((ghost) => ghost.life > 0 && ghost.x > FIELD.playerGate - 120 && ghost.x < FIELD.enemyGate + 120);
}

function applyFear(unit, duration) {
  unit.fearTimer = Math.max(unit.fearTimer ?? 0, duration);
  unit.fearDamageMultiplier = Math.max(unit.fearDamageMultiplier ?? 1, 2);
  popText(unit.x, unit.y - 108, "恐惧", "#d8d0ff");
}

function applyNeuralRetreat(unit, duration, sourceSide) {
  if (!unit || unit.kind === "statue" || unit.hp <= 0 || isUnitHidden(unit)) return;
  unit.neuralRetreatTimer = Math.max(unit.neuralRetreatTimer ?? 0, duration);
  unit.neuralRetreatFromSide = sourceSide;
  popText(unit.x, unit.y - 112, "神经后撤", "#cde69b");
}

function updateNeuralRetreatUnit(unit, dt) {
  const sourceSide = unit.neuralRetreatFromSide;
  const dir = state?.fourWay && sourceSide && FOUR_WAY_BASES[sourceSide]
    ? Math.sign(unit.x - FOUR_WAY_BASES[sourceSide].x) || getUnitFacingDirection(unit)
    : sourceSide === "enemy" ? 1 : -1;
  const speed = Math.max(unit.speed ?? UNIT[unit.type]?.speed ?? 40, 42);
  const targetX = unit.x + dir * 120;
  moveUnitTowardPoint(unit, clampWorldX(targetX), unit.y ?? FIELD.ground, speed, dt, 4);
}

function updateChaosRecovery(dt) {
  const regenEvery = 2;
  const regenAmount = 5;
  state.units.forEach((unit) => {
    if (unit.hp <= 0 || isUnitHidden(unit) || factionForSide(unit.side) !== "chaos" || unit.combatTimer > 0) return;
    unit.chaosRegenTick += dt;
    unit.chaosCleanseTimer -= dt;

    if (unit.chaosRegenTick >= regenEvery) {
      unit.chaosRegenTick = 0;
      const healed = Math.min(regenAmount, unit.maxHp - unit.hp);
      if (healed > 0) {
        unit.hp += healed;
        popText(unit.x, unit.y - 96, `混沌恢复 +${healed}`, "#ff8a3d");
      }
    }

    if (unit.chaosCleanseTimer <= 0) {
      unit.chaosCleanseTimer = 10;
      clearPoison(unit, "脱战解毒");
    }
  });
}

function updateDelayedSpells(dt) {
  for (const spell of state.delayedSpells) {
    spell.timer -= dt;
    if (spell.timer > 0) continue;
    if (spell.type === "fireDragon") {
      damageUnitsInRadius(spell.x, spell.radius, spell.side, UNIT.dreadfire.dragonDamage, "火龙");
      stunUnitsInRadius(spell.x, spell.radius, spell.side, UNIT.dreadfire.dragonStun);
      state.blasts.push({ x: spell.x, y: spell.y, radius: spell.radius, life: 0.45, duration: 0.45, color: "#ff4f2e" });
    } else if (spell.type === "redflamePillar") {
      damageUnitsInRadius(spell.x, spell.radius, spell.side, spell.damage, "熔岩柱");
      stunUnitsInRadius(spell.x, spell.radius, spell.side, spell.stun);
      state.spikes.push({
        x1: spell.x - spell.radius * 0.35,
        x2: spell.x + spell.radius * 0.35,
        y: FIELD.ground - 12,
        side: spell.side,
        life: 0.34,
        duration: 0.34,
      });
      state.blasts.push({ x: spell.x, y: spell.y, radius: spell.radius, life: 0.28, duration: 0.28, color: "#ff6a3d" });
    }
  }
  state.delayedSpells = state.delayedSpells.filter((spell) => spell.timer > 0);
}

function updateMeteors(dt) {
  for (const meteor of state.meteors) {
    meteor.life -= dt;
    if (meteor.life > 0) continue;
    const radius = meteor.radius ?? 18;
    damageUnitsInRadius(meteor.x, radius, meteor.side, meteor.damage, meteor.label ?? (meteor.campaign ? "陨石" : "流星"));
    if (meteor.burnDps) {
      getUnitsInRadius(meteor.x, radius, meteor.side, Infinity).forEach((unit) => {
        applyBurn(unit, meteor.burnDps, meteor.burnDuration);
      });
    }
    state.blasts.push({ x: meteor.x, y: meteor.y, radius: meteor.campaign ? radius : 22, life: 0.32, duration: 0.32, color: meteor.color ?? "#ffb45e" });
  }
  state.meteors = state.meteors.filter((meteor) => meteor.life > 0);
}

function updateStormClouds(dt) {
  for (const cloud of state.stormClouds) {
    cloud.life -= dt;
    if (cloud.type === "attack") updateAttackStormCloud(cloud, dt);
    if (cloud.type === "rain") updateHealingRainCloud(cloud, dt);
  }
  state.stormClouds = state.stormClouds.filter((cloud) => cloud.life > 0 && (cloud.type !== "rain" || cloud.dropsLeft > 0));
}

function updateElectricWalls(dt) {
  for (const wall of state.electricColumns) {
    wall.life -= dt;
    wall.tick += dt;
    while (wall.tick >= 1) {
      wall.tick -= 1;
      strikeElectricWall(wall);
    }
  }
  state.electricColumns = state.electricColumns.filter((wall) => wall.life > 0);
}

function updateGroundFires(dt) {
  for (const fire of state.groundFires) {
    fire.life -= dt;
    fire.tick -= dt;
    while (fire.tick <= 0 && fire.life > 0) {
      fire.tick += 1;
      damageGroundFire(fire);
    }
  }
  state.groundFires = state.groundFires.filter((fire) => fire.life > 0);
}

function updateThornFields(dt) {
  for (const field of state.thornFields) {
    field.life -= dt;
    field.tick -= dt;
    while (field.tick <= 0 && field.life > 0) {
      field.tick += 1;
      damageThornField(field);
    }
  }
  state.thornFields = state.thornFields.filter((field) => field.life > 0);
}

function updateSlimeFields(dt) {
  for (const field of state.slimeFields ?? []) {
    field.life -= dt;
  }
  state.slimeFields = (state.slimeFields ?? []).filter((field) => field.life > 0);
}

function updateWebFields(dt) {
  for (const field of state.webFields ?? []) {
    field.life -= dt;
  }
  state.webFields = (state.webFields ?? []).filter((field) => field.life > 0);
}

function updateHealingFields(dt) {
  for (const field of state.healingFields) {
    field.life -= dt;
    field.tick -= dt;
    while (field.tick <= 0 && field.life > 0) {
      field.tick += 1;
      healHealingField(field);
    }
  }
  state.healingFields = state.healingFields.filter((field) => field.life > 0);
}

function damageGroundFire(fire) {
  getUnitsInRadius(fire.x, fire.radius, fire.side, Infinity).forEach((unit) => {
    if (Math.abs((unit.y ?? FIELD.ground) - fire.y) > fire.radius) return;
    applyUnitDamage(unit, fire.dps, { label: "地火", color: "#ff8a3d", yOffset: -96 });
  });
}

function healHealingField(field) {
  state.units.forEach((unit) => {
    if (unit.side !== field.side || unit.hp <= 0 || unit.hp >= unit.maxHp || isUnitHidden(unit)) return;
    if (Math.abs(unit.x - field.x) > field.radius) return;
    if (Math.abs((unit.y ?? FIELD.ground) - field.y) > field.radius) return;
    const healed = Math.min(field.heal, unit.maxHp - unit.hp);
    unit.hp += healed;
    popText(unit.x, unit.y - 94, `回血区 +${healed}`, "#b8f6c1");
  });
}

function damageThornField(field) {
  getUnitsInRadius(field.x, field.radius, field.side, Infinity).forEach((unit) => {
    if (Math.abs((unit.y ?? FIELD.ground) - field.y) > field.radius) return;
    applyUnitDamage(unit, field.dps, { label: "荆棘", color: "#8ee88a", yOffset: -96 });
  });
}

function strikeElectricWall(wall) {
  state.units.forEach((unit) => {
    if (unit.side === wall.side || unit.hp <= 0 || isUnitHidden(unit) || UNIT[unit.type]?.untargetable) return;
    if (Math.abs(unit.x - wall.x) > wall.width) return;
    applyUnitDamage(unit, wall.damage, { label: "电墙", color: "#d7f6ff", yOffset: -98 });
    unit.stormSlowTimer = wall.slowDuration;
    unit.stormSlowFactor = Math.min(unit.stormSlowFactor ?? 1, wall.slow);
    state.lightning.push({
      x1: wall.x + (Math.random() * 34 - 17),
      y1: FIELD.ground - 178,
      x2: unit.x,
      y2: unit.y - 44 + (UNIT[unit.type]?.flying ? -42 : 0),
      life: 0.18,
      duration: 0.18,
    });
  });
}

function updateAttackStormCloud(cloud, dt) {
  if (cloud.moveSpeed) {
    cloud.x += (cloud.moveDir ?? 1) * cloud.moveSpeed * dt;
    cloud.x = Math.max(FIELD.playerGate + 80, Math.min(FIELD.enemyGate - 80, cloud.x));
  }
  if (cloud.boltsLeft <= 0) return;
  cloud.boltTimer -= dt;
  while (cloud.boltsLeft > 0 && cloud.boltTimer <= 0) {
    cloud.boltTimer += cloud.boltEvery;
    cloud.boltsLeft -= 1;
    strikeStormLichBolt(cloud);
  }
}

function strikeStormLichBolt(cloud) {
  const targets = getUnitsInRadius(cloud.x, cloud.radius, cloud.side, Infinity);
  if (!targets.length) return;
  const target = targets[Math.floor(Math.random() * targets.length)];
  applyDamage(target, cloud.damage, cloud.side);
  if (cloud.stun) applyStun(target, cloud.stun);
  if (cloud.slowDuration > 0) {
    target.stormSlowTimer = cloud.slowDuration;
    target.stormSlowFactor = Math.min(target.stormSlowFactor ?? 1, cloud.slow);
  }
  state.lightning.push({
    x1: target.x + (Math.random() * 70 - 35),
    y1: cloud.y,
    x2: target.x,
    y2: target.y - 48 + (UNIT[target.type]?.flying ? -42 : 0),
    life: 0.24,
    duration: 0.24,
  });
  popText(target.x, target.y - 105, `雷 -${cloud.damage}`, "#d7f6ff");
}

function updateHealingRainCloud(cloud, dt) {
  cloud.dropTimer -= dt;
  const dropsPerSecond = cloud.totalDrops / cloud.duration;
  while (cloud.dropsLeft > 0 && cloud.dropTimer <= 0) {
    cloud.dropTimer += 1 / dropsPerSecond;
    cloud.dropsLeft -= 1;
    healRainDrop(cloud);
  }
}

function healRainDrop(cloud) {
  const allies = state.units.filter((unit) => unit.side === cloud.side && unit.hp > 0 && !isUnitHidden(unit) && Math.abs(unit.x - cloud.x) <= cloud.radius && unit.hp < unit.maxHp);
  if (!allies.length) return;
  const target = allies[Math.floor(Math.random() * allies.length)];
  const healed = Math.min(cloud.heal, target.maxHp - target.hp);
  target.hp += healed;
  state.floaters.push({ x: target.x + (Math.random() * 34 - 17), y: target.y - 82, text: `雨 +${healed}`, color: "#9ee8ff", life: 0.75 });
}

function updateTornadoes(dt) {
  for (const tornado of state.tornadoes) {
    tornado.life -= dt;
    if (tornado.life > 0) continue;
    damageUnitsInRadius(tornado.tx, 34, tornado.side, tornado.damage, "龙卷");
    stunUnitsInRadius(tornado.tx, 34, tornado.side, tornado.stun);
    state.blasts.push({ x: tornado.tx, y: tornado.ty + 24, radius: 54, life: 0.3, duration: 0.3, color: "#d7f6ee" });
  }
  state.tornadoes = state.tornadoes.filter((tornado) => tornado.life > 0);
}

function updateIceFieldEffects(dt) {
  for (const field of state.iceFields) {
    field.tick = (field.tick ?? 0) + dt;
    if (field.tick < 1) continue;
    field.tick -= 1;
    state.units.forEach((unit) => {
      if (unit.side === field.side || unit.hp <= 0 || isUnitHidden(unit)) return;
      if (Math.abs(unit.x - field.x) > field.radius) return;
      const damage = getModifiedDamage(unit, field.damage ?? 0);
      if (damage <= 0) return;
      applyUnitDamage(unit, field.damage ?? 0, { label: "冰", color: "#9ee8ff", yOffset: -98, sourceSide: field.side });
    });
  }
}

function damageUnitsInRadius(x, radius, attackerSide, amount, label) {
  getUnitsInRadius(x, radius, attackerSide).forEach((unit) => {
    applyUnitDamage(unit, amount, { label, color: "#ffb45e", yOffset: -80, sourceSide: attackerSide });
  });
}

function stunUnitsInRadius(x, radius, attackerSide, duration) {
  getUnitsInRadius(x, radius, attackerSide).forEach((unit) => {
    applyStun(unit, duration);
  });
}

function getUnitsInRadius(x, radius, attackerSide, limit = AOE_TARGET_LIMIT, exclude = null, y = null) {
  return state.units
    .filter((unit) => {
      if ((attackerSide !== "neutral" && unit.side === attackerSide) || unit.hp <= 0 || unit === exclude || isUnitHidden(unit) || isReaperStealthed(unit) || UNIT[unit.type]?.untargetable) return false;
      if (!state?.fourWay || y === null) return Math.abs(unit.x - x) <= radius;
      return distanceTo(unit.x, unit.y, x, y) <= radius;
    })
    .sort((a, b) => {
      if (!state?.fourWay || y === null) return Math.abs(a.x - x) - Math.abs(b.x - x);
      return distanceTo(a.x, a.y, x, y) - distanceTo(b.x, b.y, x, y);
    })
    .slice(0, limit);
}

function applyDamage(target, amount, attackerSide, options = {}) {
  if (!target || amount <= 0) return 0;
  if (isUnitHidden(target)) return 0;
  if (isReaperStealthed(target)) return 0;
  if (target.kind !== "statue" && target.hp <= 0) return 0;
  if (target.kind === "barricade") {
    const barricade = state.barricades.find((item) => item.id === target.id);
    if (!barricade || barricade.hp <= 0) return 0;
    const damage = Math.max(0, Math.round(amount * 10) / 10);
    const label = barricade.label ?? "拒马";
    barricade.hp = Math.max(0, barricade.hp - damage);
    popText(barricade.x, barricade.y - 58, `${label} -${damage}`, attackerSide === "player" ? "#9fc0ff" : "#ff9b8d");
    if (barricade.hp <= 0) {
      popText(barricade.x, barricade.y - 82, `${label}摧毁`, "#d7c090");
      state.blasts.push({ x: barricade.x, y: barricade.y - 28, radius: 42, life: 0.24, duration: 0.24, color: "#d7c090" });
      if (barricade.controlTower) releaseControlledElementUnits(barricade);
    }
    return damage;
  }
  if (target.kind === "statue") {
    if (state?.fourWay) {
      state.fourWayBaseHp[target.side] = Math.max(0, (state.fourWayBaseHp[target.side] ?? STATUE_MAX_HP) - amount);
      const base = FOUR_WAY_BASES[target.side] ?? target;
      popText(base.x, base.y + (base.y < FIELD.height / 2 ? -120 : 145), `-${amount}`, FOUR_WAY_BASES[attackerSide]?.color ?? "#ff9b8d");
      return amount;
    }
    if (target.side === "enemy") state.enemyHp -= amount;
    if (target.side === "player") state.playerHp -= amount;
    popText(target.x, FIELD.ground - 145, `-${amount}`, attackerSide === "player" ? "#9fc0ff" : "#ff9b8d");
    return amount;
  }

  const damage = getModifiedDamage(target, amount, options);
  if (damage <= 0) return 0;
  const hpDamage = absorbShieldDamage(target, damage);
  target.hp -= hpDamage;
  handleCovenantFatalSave(target);
  if (attackerSide && attackerSide !== "neutral" && hpDamage > 0) target.lastDamageSide = attackerSide;
  target.combatTimer = 3;
  popText(target.x, target.y - 68, `-${damage}`, target.shieldHp > 0 && hpDamage < damage ? "#9fc0ff" : "#f0a36a");
  return hpDamage;
}

function applyUnitDamage(target, amount, options = {}) {
  if (!target || target.kind === "statue" || target.hp <= 0 || amount <= 0 || isUnitHidden(target)) return 0;
  const damage = options.modified === false ? amount : getModifiedDamage(target, amount, options);
  if (damage <= 0) return 0;
  const hpDamage = absorbShieldDamage(target, damage);
  target.hp -= hpDamage;
  handleCovenantFatalSave(target);
  if (options.sourceSide && options.sourceSide !== "neutral" && hpDamage > 0) target.lastDamageSide = options.sourceSide;
  if (options.sourceUnitId && hpDamage > 0) target.lastDamageUnitId = options.sourceUnitId;
  target.combatTimer = 3;
  const label = options.label ? `${options.label} -${damage}` : `-${damage}`;
  popText(target.x, target.y + (options.yOffset ?? -68), label, options.color ?? "#f0a36a");
  return damage;
}

function absorbShieldDamage(target, damage) {
  if (!target.maxShieldHp || target.shieldHp <= 0) return damage;
  const shieldDamage = Math.min(target.shieldHp, damage);
  target.shieldHp -= shieldDamage;
  const overflow = Math.max(0, damage - shieldDamage);
  if (shieldDamage > 0) popText(target.x, target.y - 88, `盾 -${shieldDamage}`, "#9fc0ff");
  return overflow;
}

function getModifiedDamage(target, amount, options = {}) {
  if (target.kind === "statue") return amount;
  if (amount <= 0) return 0;
  let damage = isPoisoned(target) ? amount * 2 : amount;
  if ((target.vulnerabilityTimer ?? 0) > 0 && (target.vulnerabilityBonus ?? 0) > 0) {
    damage *= 1 + target.vulnerabilityBonus;
  }
  if ((target.fearDamageMultiplier ?? 1) > 1) {
    damage *= target.fearDamageMultiplier;
  }
  if (target.type === "ironAnt" && amount < (UNIT.ironAnt.lowDamageShieldThreshold ?? 15) && (target.ironAntShieldCharges ?? 0) > 0) {
    target.ironAntShieldCharges -= 1;
    popText(target.x, target.y - 105, `铁壳 ${target.ironAntShieldCharges}`, "#cde69b");
    return 0;
  }
  if (options.ranged && target.type === "heavyAnt" && target.heavyAntDodge) {
    popText(target.x, target.y - 105, "直射免疫", "#cde69b");
    return 0;
  }
  if (options.ranged && target.type === "heavyAnt" && amount < (UNIT.heavyAnt.rangedShieldThreshold ?? 35) && (target.heavyAntRangedShieldCharges ?? 0) > 0) {
    target.heavyAntRangedShieldCharges -= 1;
    popText(target.x, target.y - 105, `重壳 ${target.heavyAntRangedShieldCharges}`, "#cde69b");
    return 0;
  }
  if (options.ranged && target.type === "boneGiant") {
    damage *= 1 - (UNIT.boneGiant.rangedReduction ?? 0.25);
  }
  if (options.ranged && target.type === "rhinoMan" && amount <= (UNIT.rhinoMan.rangedShieldThreshold ?? 15)) {
    popText(target.x, target.y - 105, "大盾格挡", "#c8d0c8");
    return 0;
  }
  if (target.type === "goblin" && target.goblinBurrowed) {
    damage *= 1 - (UNIT.goblin.burrowReduction ?? 0.9);
  }
  if (target.type === "boneStinger" && (target.boneStingerBurrowTimer ?? 0) > 0) {
    damage *= 1 - (UNIT.boneStinger.burrowReduction ?? 0.5);
  }
  if (target.type === "lurker") {
    damage *= 1 - (UNIT.lurker.burrowReduction ?? 0.5);
  }
  const armorReduction = Math.max(
    target.armorReduction ?? 0,
    target.heavyArmorTimer > 0 ? target.heavyArmorReduction ?? 0 : 0,
    getOrderHeavyTraitReduction(target),
    target.orderMeleeVeteran ? ORDER_MELEE_VETERAN_TRAIT.reduction : 0,
  );
  if (armorReduction > 0) {
    damage *= 1 - armorReduction;
  }
  if (activeCampaign?.enemySpartanDamageReduction && target.side === "enemy" && target.type === "spartan") {
    damage *= 1 - activeCampaign.enemySpartanDamageReduction;
  }
  if (target.shieldTimer > 0) {
    damage *= 1 - (target.shieldReduction ?? 0.8);
  }
  if (target.spartanShieldTimer > 0) {
    damage *= 1 - (UNIT.spartan.shieldStanceReduction ?? 0.9);
  }
  if (target.type === "covenantGuard" && hasCovenantFormation(target)) {
    damage *= 1 - UNIT.covenantGuard.formationReduction;
  }
  if (target.covenantDamageReductionTimer > 0) {
    damage *= 1 - (target.covenantDamageReduction ?? UNIT.covenantGuard.guardReduction);
  }
  return Math.max(1, Math.round(damage * 10) / 10);
}

function handleCovenantFatalSave(target) {
  if (!target || target.kind === "statue" || target.hp > 0 || target.covenantSaveTimer <= 0) return false;
  target.hp = 1;
  target.covenantSaveTimer = 0;
  target.covenantDamageReduction = UNIT.covenantGuard.guardReduction;
  target.covenantDamageReductionTimer = UNIT.covenantGuard.guardReductionDuration;
  state.blasts.push({ x: target.x, y: target.y - 42, radius: 48, life: 0.28, duration: 0.28, color: "#fff1a8" });
  popText(target.x, target.y - 112, "守约", "#fff1a8");
  return true;
}

function hasCovenantFormation(unit) {
  const data = UNIT.covenantGuard;
  if (!unit || unit.type !== "covenantGuard") return false;
  const types = new Set();
  state.units.forEach((candidate) => {
    if (candidate.side !== unit.side || candidate.hp <= 0 || candidate.id === unit.id || isUnitHidden(candidate)) return;
    if (factionForSide(candidate.side) !== "order") return;
    if (distanceTo(candidate.x, candidate.y, unit.x, unit.y) <= data.formationRadius) types.add(candidate.type);
  });
  return types.size >= data.formationTypes;
}

function isPoisoned(unit) {
  return unit.poisonTimer > 0 || unit.poisonTimer === Infinity;
}

function getOrderHeavyTraitReduction(unit) {
  if (!unit || factionForSide(unit.side) !== "order") return 0;
  const maxHp = unit.maxHp ?? UNIT[unit.type]?.hp ?? 0;
  return maxHp > ORDER_ARMOR_TRAIT.heavy.hpAbove ? ORDER_ARMOR_TRAIT.heavy.reduction : 0;
}

function getWormKillerSide(unit) {
  const killer = state.units.find((candidate) => candidate.id === unit.lastDamageUnitId && candidate.type === "swarmWorm" && candidate.hp > 0);
  return killer?.side ?? null;
}

function shouldBecomeWorm(unit) {
  if (!unit || unit.kind === "statue" || unit.type === "swarmWorm" || isHeroUnit(unit) || UNIT[unit.type]?.untargetable) return false;
  const side = getWormKillerSide(unit);
  return Boolean(side && areHostileSides(side, unit.side));
}

function createWormSlime(unit) {
  const data = UNIT.swarmWorm;
  createSlimeField({
    x: unit.x,
    y: unit.y ?? FIELD.ground,
    side: unit.side,
    radius: data.slimeRadius,
    slow: data.slimeSlow,
    duration: data.slimeDuration,
    label: "粘液",
  });
}

function removeDead() {
  const deathSpawns = [];
  state.units = state.units.filter((unit) => {
    if (unit.hp > 0) return true;
    if (unit.inspiredReviveReady && unit.inspiredReviveTimer > 0 && SKELETON_UNITS.has(unit.type)) {
      unit.hp = Math.max(1, Math.round(unit.maxHp * 0.45));
      unit.inspiredReviveReady = false;
      unit.inspiredReviveTimer = 0;
      unit.stunTimer = 0;
      unit.frozenBy = null;
      unit.combatTimer = 0;
      popText(unit.x, unit.y - 100, "骷髅复活", "#d8d0ff");
      return true;
    }
    if (unit.type === "vUnit") {
      releaseVControl(unit);
    }
    grantChaosKillRewards(unit);
    grantOrderMeleeVeteranKill(unit);
    if (unit.type === "minotaur") {
      deathSpawns.push({
        type: "hornKnightRider",
        side: unit.side,
        x: unit.x,
        y: unit.y,
        text: "骑士下马",
        color: "#c89a6d",
      });
    }
    if (unit.type === "rhinoMan") {
      enrageNearbyRhinoMen(unit);
    }
    if (unit.type === "vClone" && unit.summonerId) {
      const summoner = state.units.find((candidate) => candidate.id === unit.summonerId && candidate.hp > 0);
      if (summoner) {
        const cloneRespawnDelay = summoner.cloneRespawnDelay ?? UNIT.vUnit.cloneRespawnDelay;
        summoner.cloneSpawnTimer = Math.max(summoner.cloneSpawnTimer, cloneRespawnDelay);
      }
    }
    if (unit.controlledBy) {
      const controller = state.units.find((candidate) => candidate.id === unit.controlledBy && candidate.hp > 0);
      if (controller) controller.controlledTargetId = null;
    }
    if (unit.type === "bomber" && !unit.exploded) {
      unit.exploded = true;
      explodeAt(unit.x, unit.y - 20, unit.side, UNIT.bomber.damage / 2, UNIT.bomber.splash, "殉爆", {
        burnDps: UNIT.bomber.burnDps,
        burnDuration: UNIT.bomber.burnDuration,
      });
    }
    if (unit.type === "orderMiniBomb" && !unit.exploded) {
      explodeOrderMiniBomb(unit);
    }
    if (unit.type === "waterElement") {
      releaseFrozenTarget(unit);
      healNearbyAllies(unit);
    }
    if (unit.type === "linghan") {
      releaseFrozenTargetsFor(unit);
      createLinghanDeathIce(unit);
    }
    if (unit.type === "stormLich") {
      createStormLichDeathRain(unit);
    }
    if (unit.type === "swarmWorm") {
      createWormSlime(unit);
    }
    if (unit.type === "undeadVulture") {
      createUndeadVultureCrash(unit);
    }
    if (unit.type === "crossbow") {
      createCrossbowCrash(unit);
    }
    if (unit.type === "darkKnightBrother") {
      enrageSurvivingDarkKnightBrother(unit);
    }
    if (activeCampaign?.playerDeathBlast && unit.side === "player" && !isHeroUnit(unit)) {
      explodePlayerDeathBlast(unit);
    }
    if (activeCampaign?.playerDeathsBecomeEnemySpearman && unit.side === "player") {
      deathSpawns.push({
        type: "spearman",
        side: "enemy",
        x: unit.x,
        y: unit.y,
        text: "原地转化长矛兵",
        color: "#ffb0a3",
        setup: (spearman) => {
          spearman.cooldown = 0;
          spearman.spearRecoverTimer = 0;
          spearman.spearThrown = false;
        },
      });
    }
    if (activeCampaign?.enemyDeathsBecomeWaterScorpion && unit.side === "enemy" && unit.type !== "waterScorpion") {
      deathSpawns.push({
        type: "waterScorpion",
        side: "player",
        x: unit.x,
        y: unit.y,
        text: "化为水蝎子",
        color: "#8ee0cf",
      });
    }
    if (activeCampaign?.enemyDeathsBecomePlayerUndead && unit.side === "enemy" && unit.type !== "undead" && !isHeroUnit(unit)) {
      deathSpawns.push({
        type: "undead",
        side: "player",
        x: unit.x,
        y: unit.y,
        text: "原地转化亡灵",
        color: "#b8b0a5",
        setup: (undead) => {
          undead.forceCharge = true;
        },
      });
    }
    if (unit.type === "electricGate" && unit.expired && !unit.noRespawn) {
      deathSpawns.push({
        type: UNIT.electricGate.respawnType,
        side: unit.side,
        x: unit.x,
        y: unit.y,
        text: "土元素重生",
        color: "#c0a36d",
      });
    }
    maybeReviveElementFromMergedUnit(unit, deathSpawns);
    if (unit.poisonRaisesUndead && unit.poisonSourceSide && unit.type !== "undead") {
      deathSpawns.push({
        type: "undead",
        side: unit.poisonSourceSide,
        x: unit.x,
        y: unit.y,
        text: "化为亡灵",
        color: "#93d96b",
      });
    }
    if (unit.necroPlague) {
      triggerNecroPlagueDeath(unit);
    }
    if (shouldBecomeWorm(unit)) {
      deathSpawns.push({
        type: "swarmWorm",
        side: getWormKillerSide(unit),
        x: unit.x,
        y: unit.y,
        text: "转化沙虫",
        color: "#cde69b",
        setup: (worm) => {
          worm.forceCharge = true;
        },
      });
    }
    if (unit.frozenBy) {
      const water = state.units.find((candidate) => candidate.id === unit.frozenBy);
      if (water) water.boundTargetId = null;
    }
    if (activeCampaign?.failOnDeath === unit.type && unit.side === "player") {
      state.over = true;
      state.winner = "enemy";
      statusEl.textContent = `${UNIT[unit.type].name}倒下，挑战失败`;
    }
    if (unit.godV && unit.side === "player") {
      state.over = true;
      state.winner = "enemy";
      statusEl.textContent = "神明V倒下，挑战失败";
    }
    maybeLeaveCorpse(unit);
    const godVExit = unit.godV && unit.side === "enemy" && activeCampaign?.enemyGodV;
    popText(unit.x, unit.y - 35, godVExit ? "退出战场" : "倒下", godVExit ? "#d7ceff" : "#a7a7a7");
    return false;
  });
  deathSpawns.forEach(spawnDeathUnit);
}

function maybeLeaveCorpse(unit) {
  if (unit.noCorpse) return;
  if (UNIT[unit.type]?.untargetable) return;
  if (!unit.lastDamageSide) return;
  const reviveable = factionForSide(unit.side) === "undeadEmpire"
    && UNDEAD_BASE_UNITS.has(unit.type)
    && !UNDEAD_CORPSE_EXCLUDED.has(unit.type);
  const ritual = unit.type !== "electricGate";
  state.corpses.push({
    id: state.nextId++,
    type: unit.type,
    side: unit.side,
    x: unit.x,
    y: unit.y,
    maxHp: unit.maxHp ?? UNIT[unit.type]?.hp ?? 0,
    life: 15,
    duration: 15,
    reviveable,
    ritual,
    revives: unit.corpseRevives ?? 0,
  });
}

function maybeReviveElementFromMergedUnit(unit, deathSpawns) {
  if (!unit || !MERGE_UNITS.has(unit.type)) return;
  if (factionForSide(unit.side) !== "element") return;
  if (ELEMENT_MERGE_REVIVE_EXCLUDED_UNITS.has(unit.type)) return;
  if (unit.type === "electricGate" && unit.expired) return;
  if (Math.random() >= ELEMENT_MERGE_REVIVE_CHANCE) return;
  const pool = ELEMENT_MERGE_REVIVE_POOL[unit.type] ?? [...BASIC_ELEMENT_UNITS];
  const type = pool[Math.floor(Math.random() * pool.length)];
  deathSpawns.push({
    type,
    side: unit.side,
    x: unit.x,
    y: unit.y,
    text: "融合复苏",
    color: getElementReviveColor(type),
    setup: (element) => {
      element.forceCharge = true;
      state.blasts.push({ x: element.x, y: element.y - 38, radius: 52, life: 0.32, duration: 0.32, color: getElementReviveColor(type) });
    },
  });
}

function getElementReviveColor(type) {
  if (type === "earthElement") return "#c0a36d";
  if (type === "waterElement") return "#8ee0cf";
  if (type === "fireElement") return "#ff9b45";
  if (type === "windElement") return "#9ee8ff";
  return "#d7ceff";
}

function enrageSurvivingDarkKnightBrother(deadBrother) {
  const survivor = state.units.find((unit) => (
    unit !== deadBrother
    && unit.type === "darkKnightBrother"
    && unit.side === deadBrother.side
    && unit.hp > 0
    && !isUnitHidden(unit)
  ));
  if (!survivor) return;
  survivor.rageTimer = Math.max(survivor.rageTimer ?? 0, 60);
  popText(survivor.x, survivor.y - 125, "兄弟狂暴", "#ff4f3d");
}

function explodePlayerDeathBlast(unit) {
  const blast = activeCampaign.playerDeathBlast;
  const allies = state.units
    .filter((candidate) => (
      candidate !== unit
      && candidate.side === unit.side
      && candidate.hp > 0
      && !isUnitHidden(candidate)
      && !UNIT[candidate.type]?.untargetable
      && Math.abs(candidate.x - unit.x) <= blast.radius
      && Math.abs(candidate.y - unit.y) <= blast.radius
    ))
    .sort((a, b) => Math.abs(a.x - unit.x) - Math.abs(b.x - unit.x))
    .slice(0, blast.limit ?? AOE_TARGET_LIMIT);
  allies.forEach((ally) => {
    applyUnitDamage(ally, blast.damage, { label: "殉爆", color: "#ffb45e", yOffset: -82 });
  });
  state.blasts.push({ x: unit.x, y: unit.y - 26, radius: blast.radius, life: 0.28, duration: 0.28, color: "#ffb45e" });
}

function spawnDeathUnit(spawn) {
  const unit = spawnUnit(spawn.type, spawn.side, spawn.x);
  unit.x = spawn.x;
  unit.y = spawn.y;
  if (spawn.setup) spawn.setup(unit);
  popText(spawn.x, spawn.y - 95, spawn.text, spawn.color);
}

function releaseFrozenTarget(water) {
  const target = state.units.find((unit) => unit.id === water.boundTargetId);
  if (!target) return;
  releaseFrozenUnit(target);
}

function releaseFrozenUnit(unit) {
  const source = state.units.find((candidate) => candidate.id === unit.frozenBy);
  if (source?.boundTargetId === unit.id) source.boundTargetId = null;
  unit.frozenBy = null;
  unit.frozenTimer = 0;
  unit.frozenTick = 0;
  unit.freezeDps = 0;
  popText(unit.x, unit.y - 88, "解冻", "#d8f8ff");
}

function releaseFrozenTargetsFor(source) {
  state.units.forEach((unit) => {
    if (unit.frozenBy === source.id) releaseFrozenUnit(unit);
  });
}

function createLinghanDeathIce(unit) {
  const data = UNIT.linghan;
  state.iceFields.push({
    x: unit.x,
    y: FIELD.ground + 8,
    radius: data.deathIceRadius,
    slow: data.deathIceSlow,
    attackSlow: 1,
    damage: 0,
    tick: 0,
    side: unit.side,
    life: data.deathIceDuration,
    duration: data.deathIceDuration,
  });
  popText(unit.x, FIELD.ground - 70, "凌寒冰地", "#9ee8ff");
}

function createStormLichDeathRain(unit) {
  const data = UNIT.stormLich;
  state.stormClouds.push({
    type: "rain",
    x: unit.x,
    y: FIELD.ground - 240,
    side: unit.side,
    radius: data.deathRainRadius,
    life: data.cloudDuration,
    duration: data.cloudDuration,
    dropsLeft: data.deathRainDrops,
    totalDrops: data.deathRainDrops,
    dropTimer: 0,
    heal: data.rainHeal,
  });
  popText(unit.x, unit.y - 118, "治疗雨", "#9ee8ff");
}

function createUndeadVultureCrash(unit) {
  const data = UNIT.undeadVulture;
  const y = FIELD.ground - 34;
  const from = { x: unit.x, y: unit.y - 96 };
  getUnitsInRadius(unit.x, data.crashRadius, unit.side, data.crashLimit).forEach((enemy) => {
    const to = { x: enemy.x, y: enemy.y - 38 };
    if (tryBlockSpecialWithShieldCart(from, to, enemy, data.crashDamage)) {
      popText(enemy.x, enemy.y - 96, "坠落被挡", "#d7c090");
      return;
    }
    applyUnitDamage(enemy, data.crashDamage, { label: "坠落", color: "#7ed8ff", yOffset: -82, ranged: true, sourceSide: unit.side });
  });
  state.blasts.push({ x: unit.x, y, radius: data.crashRadius, life: 0.32, duration: 0.32, color: "#7ed8ff" });
  popText(unit.x, unit.y - 120, "骨翼坠落", "#7ed8ff");
}

function createCrossbowCrash(unit) {
  const data = UNIT.crossbow;
  const radius = data.splash;
  const y = FIELD.ground - 34;
  getUnitsInRadius(unit.x, radius, unit.side, data.deathCrashLimit).forEach((enemy) => {
    applyUnitDamage(enemy, data.deathCrashDamage, { label: "坠地", color: "#ffce7a", yOffset: -82, ranged: true, sourceSide: unit.side });
  });
  state.blasts.push({ x: unit.x, y, radius, life: 0.3, duration: 0.3, color: "#ffce7a" });
  popText(unit.x, unit.y - 118, "弩手坠地", "#ffce7a");
}

function healNearbyAllies(water) {
  const data = UNIT.waterElement;
  state.units.forEach((unit) => {
    if (unit.side !== water.side || unit.hp <= 0 || unit === water) return;
    if (Math.abs(unit.x - water.x) > data.healRadius) return;
    const healed = Math.min(data.healOnDeath, unit.maxHp - unit.hp);
    if (healed > 0) unit.hp += healed;
    clearPoison(unit);
    if (healed > 0) popText(unit.x, unit.y - 78, `+${healed}`, "#8ee0cf");
  });
}

function checkWin() {
  if (state.fourWay) {
    checkFourWayWin();
    return;
  }
  state.playerHp = Math.max(0, state.playerHp);
  state.enemyHp = Math.max(0, state.enemyHp);

  if (activeCampaign?.secondPhase?.winByKillingType && state.campaignPhase === 2) {
    if (state.playerHp <= 0) {
      state.over = true;
      state.winner = "enemy";
      statusEl.textContent = "失败，我方基地倒塌";
      homeBtn.classList.remove("hidden");
      return;
    }
    const bossAlive = state.units.some((unit) => unit.side === "enemy" && unit.type === activeCampaign.secondPhase.winByKillingType && unit.hp > 0);
    if (!bossAlive) {
      completeCampaignVictory();
    }
    return;
  }

  if (state.enemyHp <= 0 && activeCampaign?.secondPhase && state.campaignPhase === 1 && state.playerHp > 0) {
    startCampaignSecondPhase();
    return;
  }

  if (state.enemyHp <= 0 && activeCampaign?.requireControlTowerDestroyed && isCampaignControlTowerAlive()) {
    state.enemyHp = 1;
    statusEl.textContent = "控制之塔仍在运转，先摧毁它才能击溃亡灵基地";
    popText(CENTER_TOWER.x, CENTER_TOWER.y - 130, "先摧毁控制之塔", "#b88cff");
    return;
  }

  if (state.enemyHp <= 0 || state.playerHp <= 0) {
    state.over = true;
    state.winner = state.enemyHp <= 0 ? "player" : "enemy";
    if (state.winner === "player" && activeCampaign) {
      completeCampaignVictory();
      return;
    }
    statusEl.textContent =
      state.winner === "player" ? `胜利！${FACTIONS[opponentFaction()].name}基地已被摧毁` : "失败，我方基地倒塌";
    homeBtn.classList.remove("hidden");
  }
}

function isCampaignControlTowerAlive() {
  return (state.barricades ?? []).some((barricade) => barricade.controlTower && barricade.hp > 0);
}

function releaseControlledElementUnits(tower) {
  let released = 0;
  state.units.forEach((unit) => {
    if (!unit.controlledByTower || unit.hp <= 0 || isUnitHidden(unit)) return;
    if (!BASIC_ELEMENT_UNITS.has(unit.type) && !MERGE_UNITS.has(unit.type)) return;
    unit.side = "player";
    unit.controlledByTower = false;
    unit.targetId = null;
    unit.manualTargetId = null;
    unit.groupAttackTargetId = null;
    unit.forceCharge = false;
    unit.combatTimer = 0;
    unit.rallyX = Math.max(FIELD.playerGate + 180, tower.x - 140 - released * 18);
    unit.rallyY = unit.y;
    released += 1;
    popText(unit.x, unit.y - 112, "解除控制", "#8ee0cf");
  });
  if (released > 0) {
    popText(tower.x, tower.y - 190, `同胞归队 x${released}`, "#8ee0cf");
    statusEl.textContent = `控制之塔被摧毁，${released} 个元素同胞归队`;
  }
}

function checkFourWayWin() {
  state.fourWaySides.forEach((ai) => {
    if (!ai.alive) return;
    const hp = state.fourWayBaseHp[ai.side] ?? 0;
    if (hp > 0) return;
    ai.alive = false;
    state.units.forEach((unit) => {
      if (unit.side === ai.side) {
        unit.noCorpse = true;
        unit.hp = 0;
      }
    });
    const base = FOUR_WAY_BASES[ai.side];
    popText(base.x, base.y - 130, `${FACTIONS[ai.faction].name}出局`, "#ffce7a");
  });
  const alive = state.fourWaySides.filter((ai) => ai.alive);
  const aliveTeams = new Set(alive.map((ai) => getFourWayTeam(ai.side)));
  if ((isDuoBattle() ? aliveTeams.size > 1 : alive.length > 1) || state.over) return;
  state.over = true;
  state.winner = alive[0]?.side ?? null;
  const winnerName = alive.length > 1
    ? alive.map((ai) => FACTIONS[ai.faction].name).join("、")
    : alive[0] ? FACTIONS[alive[0].faction].name : "无人";
  statusEl.textContent = `四国对战结束：${winnerName}获胜`;
  homeBtn.classList.remove("hidden");
}

function completeCampaignVictory() {
  state.over = true;
  state.winner = "player";
  campaignProgressByFaction[activeCampaign.faction] = Math.max(campaignProgressByFaction[activeCampaign.faction], activeCampaign.level + 1);
  if (activeCampaign.faction === "element" && activeCampaign.level === 1) campaignAbilities.element.earthMiner = true;
  saveCampaignProgress();
  const rewardText = activeCampaign.rewardText ? `，解锁：${activeCampaign.rewardText}` : "";
  statusEl.textContent = `胜利！${activeCampaign.title}完成${rewardText}，下一关已开启`;
  homeBtn.classList.remove("hidden");
}

function startCampaignSecondPhase() {
  const phase = activeCampaign.secondPhase;
  state.campaignPhase = 2;
  enemyFaction = phase.enemyFaction;
  state.enemyMaxHp = phase.enemyBaseHp ?? STATUE_MAX_HP;
  state.enemyHp = state.enemyMaxHp;
  state.enemyGold = phase.enemyGold ?? state.enemyGold;
  state.enemySpawnTimer = 1.2;
  state.enemyMinerTimer = 3;
  state.enemyAttackMood = 12;
  state.enemyCommand = "guard";
  state.enemyCommandTimer = 0;
  state.enemyLineX = getEnemyRallyBaseX();
  state.enemyCounterPushTimer = 0;
  state.enemyCounterTargetX = null;
  state.enemyCounterCooldown = 0;
  state.enemyHoldTimer = 8;
  state.enemyAttackWaveTimer = 0;
  state.secondPhaseReinforcementTimers = (phase.reinforcements ?? []).map((reinforcement) => reinforcement.every);
  if (phase.killPlayerArmy) {
    state.units.forEach((unit) => {
      if (unit.side === "player" && unit.hp > 0 && !isUnitHidden(unit)) {
        popText(unit.x, unit.y - 80, isHeroUnit(unit) || unit.campaignCenterGate ? "免疫秒杀" : "秒杀", "#f5f0df");
      }
    });
    state.units = state.units.filter((unit) => unit.side !== "player" || isHeroUnit(unit) || unit.campaignCenterGate);
  }
  if (phase.stunPlayerArmy) stunPlayerArmy(phase.stunPlayerArmy);
  state.units = state.units.filter((unit) => unit.side !== "enemy");
  state.arrows = [];
  state.delayedSpells = [];
  state.tornadoes = [];
  state.iceFields = [];
  state.groundFires = [];
  state.thornFields = [];
  state.healingFields = [];
  state.spikes = [];
  phase.enemyStart.forEach((type, index) => {
    const unit = spawnUnit(type, "enemy", FIELD.enemyGate + 28 - index * 32);
    if (phase.forceAllUnitsCharge) unit.forceCharge = true;
  });
  if (phase.forceAllUnitsCharge) forceAllBattleUnitsCharge();
  renderFactionUi();
  updateHud();
  statusEl.textContent = phase.message ?? "第二场战斗开始";
  popText(FIELD.enemyBase, FIELD.ground - 170, "第二场战斗", "#ffb0a3");
}

function forceAllBattleUnitsCharge() {
  state.command = "attack";
  state.attackIntent = "statue";
  state.commandLevel = 2;
  state.enemyCommand = "attack";
  state.enemyCommandTimer = 8;
  state.enemyAttackWaveTimer = 8;
  state.enemyHoldTimer = 0;
  state.units.forEach((unit) => {
    if (unit.hp <= 0 || isUnitHidden(unit) || unit.type === "miner" || unit.type === "electricGate") return;
    unit.forceCharge = true;
  });
  commandButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.command === "attack");
  });
  popText(FIELD.width / 2, FIELD.ground - 190, "全军冲锋", "#ffd27a");
}

function stunPlayerArmy(duration) {
  state.units.forEach((unit) => {
    if (unit.side !== "player" || unit.hp <= 0 || isUnitHidden(unit)) return;
    unit.stunTimer = Math.max(unit.stunTimer, duration);
    popText(unit.x, unit.y - 92, `眩晕 ${duration}秒`, "#d7b978");
  });
}

function updateParticles(dt) {
  state.floaters.forEach((floater) => {
    floater.y -= dt * 26;
    floater.life -= dt;
  });
  state.floaters = state.floaters.filter((floater) => floater.life > 0);
  state.blasts.forEach((blast) => {
    blast.life -= dt;
  });
  state.blasts = state.blasts.filter((blast) => blast.life > 0);
  state.lightning.forEach((bolt) => {
    bolt.life -= dt;
  });
  state.lightning = state.lightning.filter((bolt) => bolt.life > 0);
  state.iceFields.forEach((field) => {
    field.life -= dt;
  });
  state.iceFields = state.iceFields.filter((field) => field.life > 0);
  state.spikes.forEach((spike) => {
    spike.life -= dt;
  });
  state.spikes = state.spikes.filter((spike) => spike.life > 0);
  state.screenShake = Math.max(0, (state.screenShake ?? 0) - dt);
}

function popText(x, y, text, color) {
  if (!state) return;
  if (state.floaters.length > 90) state.floaters.splice(0, state.floaters.length - 90);
  state.floaters.push({ x, y, text, color, life: 0.9 });
}

function draw() {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  if (!state) return;
  ctx.save();
  if ((state.screenShake ?? 0) > 0) {
    const shake = state.screenShake * 7;
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }
  drawSky();
  drawStormClouds();
  drawGround();
  drawCampaignMagmaGround();
  drawIceRoadGround();
  state.groundFires.forEach(drawGroundFire);
  state.thornFields.forEach(drawThornField);
  state.healingFields.forEach(drawHealingField);
  (state.slimeFields ?? []).forEach(drawSlimeField);
  (state.webFields ?? []).forEach(drawWebField);
  state.landMines.forEach(drawLandMine);
  state.barricades.forEach(drawBarricade);
  (state.swarmEggs ?? []).forEach(drawSwarmEgg);
  state.corpses.forEach(drawCorpse);
  if (state.fourWay) {
    drawFourWayCenter();
    FOUR_WAY_SIDES.forEach((side) => getSideMines(side).forEach((mine) => drawMine(mine, side)));
  } else if (isGoldRushActive()) {
    drawGoldRushMines();
  } else {
    getSideMines("player").forEach((mine) => drawMine(mine, "player"));
    getSideMines("enemy").forEach((mine) => drawMine(mine, "enemy"));
  }
  if (!state.fourWay) drawCenterTower();
  if (state.fourWay) {
    FOUR_WAY_SIDES.forEach(drawFourWayCastle);
  } else {
    drawCastle("player");
    drawCastle("enemy");
  }
  drawControlledUnitMarker();
  drawSelectedGroupMarkers();

  state.units.filter((unit) => unit.type === "swarmWorm" && unit.wormBurrowed && unit.hp > 0).forEach(drawWormBurrow);
  const sortedUnits = state.units.filter((unit) => !isUnitHidden(unit)).sort((a, b) => a.y - b.y);
  sortedUnits.forEach(drawUnit);
  drawInspectedUnitInfo();
  state.ghosts.forEach(drawGhost);
  state.arrows.forEach(drawArrow);
  state.delayedSpells.forEach(drawDelayedSpell);
  state.meteors.forEach(drawMeteor);
  state.stormClouds.forEach(drawStormCloud);
  state.tornadoes.forEach(drawTornado);
  state.electricColumns.forEach(drawElectricWall);
  state.iceFields.forEach(drawIceField);
  state.spikes.forEach(drawSpike);
  state.blasts.forEach(drawBlast);
  state.lightning.forEach(drawLightning);
  drawSnow();
  drawCampaignMissileWarning();
  drawCampaignDarkness();
  drawManualMoveTarget();
  drawGroupMoveTarget();
  drawGroupSelectionDrag();
  drawManualJoystick();
  state.floaters.forEach(drawFloater);
  drawManualControlPanel();

  if (state.over) drawEndOverlay();
  ctx.restore();
}

function drawCampaignMissileWarning() {
  if (!activeCampaign?.campaignMissiles || state.campaignMissileWarning <= 0) return;
  const missile = activeCampaign.campaignMissiles;
  const seconds = Math.ceil(state.campaignMissileWarning);
  const x = Math.max(180, Math.min(FIELD.width - 180, getMissileTargetX(missile)));
  ctx.save();
  ctx.fillStyle = "rgba(90, 22, 14, 0.78)";
  ctx.strokeStyle = "#ffdf6b";
  ctx.lineWidth = 2;
  ctx.fillRect(x - 142, 78, 284, 54);
  ctx.strokeRect(x - 142, 78, 284, 54);
  ctx.fillStyle = "#ffdf6b";
  ctx.font = "800 20px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${getMissileLabel(missile)} ${seconds}`, x, 112);
  ctx.restore();
}

function drawSnow() {
  if (!activeCampaign?.snow) return;
  const time = performance.now() / 1000;
  ctx.save();
  ctx.fillStyle = "rgba(245, 252, 255, 0.75)";
  for (let i = 0; i < 110; i += 1) {
    const x = (i * 97 + time * 18 * ((i % 5) + 1)) % FIELD.width;
    const y = (i * 53 + time * 34 * ((i % 3) + 1)) % FIELD.height;
    const radius = 1.2 + (i % 3) * 0.45;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCampaignDarkness() {
  const darkness = activeCampaign?.darkeningSky;
  if (!darkness) return;
  const step = darkness.tick ?? 5;
  const duration = darkness.duration ?? 300;
  const maxAlpha = darkness.maxAlpha ?? 0.82;
  const elapsed = Math.min(duration, Math.floor((state.campaignDarknessElapsed ?? 0) / step) * step);
  const alpha = Math.min(maxAlpha, (elapsed / duration) * maxAlpha);
  if (alpha <= 0) return;
  ctx.save();
  ctx.fillStyle = `rgba(2, 6, 16, ${alpha})`;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.restore();
}

function drawStormClouds() {
  if (!activeCampaign?.stormClouds) return;
  if (activeCampaign.stormClouds.duration && state.stormCloudRemaining <= 0) return;
  ctx.save();
  ctx.fillStyle = "rgba(24, 31, 43, 0.72)";
  ctx.fillRect(0, 0, FIELD.width, 118);
  ctx.fillStyle = "rgba(10, 14, 24, 0.5)";
  for (let x = -80; x < FIELD.width + 120; x += 120) {
    ctx.beginPath();
    ctx.arc(x, 86, 58, 0, Math.PI * 2);
    ctx.arc(x + 45, 70, 72, 0, Math.PI * 2);
    ctx.arc(x + 96, 88, 54, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(180, 210, 230, 0.14)";
  ctx.fillRect(0, 112, FIELD.width, 8);
  ctx.restore();
}

function drawIceRoadGround() {
  if (!activeCampaign?.iceRoad) return;
  ctx.save();
  const top = FIELD.ground - 225;
  const gradient = ctx.createLinearGradient(0, top, 0, FIELD.height);
  gradient.addColorStop(0, "rgba(210, 244, 255, 0.42)");
  gradient.addColorStop(0.48, "rgba(142, 212, 236, 0.34)");
  gradient.addColorStop(1, "rgba(72, 130, 154, 0.18)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, FIELD.width, FIELD.height - top);
  ctx.strokeStyle = "rgba(235, 252, 255, 0.48)";
  ctx.lineWidth = 2;
  for (let x = -90; x < FIELD.width; x += 130) {
    ctx.beginPath();
    ctx.moveTo(x, FIELD.ground - 176 + ((x / 130) % 3) * 52);
    ctx.lineTo(x + 92, FIELD.ground - 192 + ((x / 130) % 3) * 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + 26, FIELD.ground + 34 - ((x / 130) % 4) * 34);
    ctx.lineTo(x + 118, FIELD.ground + 18 - ((x / 130) % 4) * 34);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(244, 253, 255, 0.2)";
  for (let x = 40; x < FIELD.width; x += 210) {
    ctx.beginPath();
    ctx.ellipse(x, FIELD.ground - 70 + (x % 420 === 0 ? 72 : 0), 42, 10, -0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawSky() {
  const gradient = ctx.createLinearGradient(0, 0, 0, FIELD.height);
  gradient.addColorStop(0, "#637982");
  gradient.addColorStop(0.48, "#b3a175");
  gradient.addColorStop(1, "#3a3b28");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);

  drawMountain(0, 330, "#4a5a53");
  drawMountain(250, 350, "#394940");
  drawMountain(690, 315, "#526158");
  drawMountain(1110, 340, "#44534b");
  drawMountain(1390, 320, "#38483f");
  drawMountain(1760, 350, "#4a5a53");
  drawMountain(2180, 325, "#394940");
  drawMountain(2600, 345, "#526158");

  ctx.fillStyle = "rgba(255, 239, 186, 0.7)";
  ctx.beginPath();
  ctx.arc(610, 92, 42, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountain(offset, base, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(offset - 80, base);
  ctx.lineTo(offset + 110, 170);
  ctx.lineTo(offset + 275, base);
  ctx.lineTo(offset + 430, 215);
  ctx.lineTo(offset + 620, base);
  ctx.closePath();
  ctx.fill();
}

function drawGround() {
  if (state?.fourWay) {
    const gradient = ctx.createLinearGradient(0, 0, 0, FIELD.height);
    gradient.addColorStop(0, "#6d954f");
    gradient.addColorStop(0.5, "#47723c");
    gradient.addColorStop(1, "#244a28");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = "rgba(18, 45, 24, 0.22)";
    for (let x = 140; x < FIELD.width; x += 220) ctx.fillRect(x, 0, 18, FIELD.height);
    for (let y = 140; y < FIELD.height; y += 220) ctx.fillRect(0, y, FIELD.width, 18);
    ctx.fillStyle = "rgba(225, 210, 128, 0.16)";
    ctx.beginPath();
    ctx.arc(FIELD.width / 2, FIELD.height / 2, 280, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const top = 350;
  const gradient = ctx.createLinearGradient(0, top, 0, FIELD.height);
  gradient.addColorStop(0, "#78a055");
  gradient.addColorStop(0.45, "#426f34");
  gradient.addColorStop(1, "#193a18");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, FIELD.width, FIELD.height - top);

  ctx.fillStyle = "rgba(94, 130, 49, 0.42)";
  ctx.fillRect(0, FIELD.ground - 92, FIELD.width, 36);
  ctx.fillStyle = "rgba(38, 88, 32, 0.52)";
  ctx.fillRect(0, FIELD.ground - 20, FIELD.width, 42);
  ctx.fillStyle = "rgba(19, 50, 18, 0.48)";
  ctx.fillRect(0, FIELD.ground + 76, FIELD.width, 52);

  for (let x = 0; x < FIELD.width; x += 42) {
    ctx.fillStyle = x % 84 === 0 ? "rgba(157, 190, 82, 0.28)" : "rgba(106, 148, 64, 0.24)";
    ctx.fillRect(x, FIELD.ground - 26 + (x % 126 === 0 ? 8 : 0), 25, 4);
  }
  for (let x = 18; x < FIELD.width; x += 96) {
    ctx.fillStyle = "rgba(180, 210, 105, 0.2)";
    ctx.fillRect(x, FIELD.ground - 142 + (x % 288 === 0 ? 86 : 0), 16, 3);
  }
}

function drawFourWayCenter() {
  ctx.save();
  ctx.strokeStyle = "rgba(248, 234, 197, 0.42)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(FIELD.width / 2, FIELD.height / 2, 120, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.beginPath();
  ctx.arc(FIELD.width / 2, FIELD.height / 2, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCampaignMagmaGround() {
  if (!activeCampaign?.magmaGround || state.magmaGroundRemaining <= 0) return;
  const top = FIELD.ground - 168;
  const alpha = 0.2 + 0.12 * Math.sin(performance.now() / 120);
  ctx.save();
  ctx.globalAlpha = Math.max(0.14, alpha);
  const gradient = ctx.createLinearGradient(0, top, 0, FIELD.ground + 150);
  gradient.addColorStop(0, "#ff6a3d");
  gradient.addColorStop(0.5, "#e14222");
  gradient.addColorStop(1, "#7f2517");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, top, FIELD.width, FIELD.height - top);
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "#ffcf6b";
  ctx.lineWidth = 3;
  for (let x = -80; x < FIELD.width + 80; x += 150) {
    ctx.beginPath();
    ctx.moveTo(x, FIELD.ground - 110);
    ctx.lineTo(x + 90, FIELD.ground - 62);
    ctx.lineTo(x + 30, FIELD.ground + 12);
    ctx.stroke();
  }
  ctx.restore();
}

function drawGroundFire(fire) {
  const alpha = Math.max(0.18, Math.min(0.72, fire.life / fire.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(fire.x, fire.y);
  const pulse = 1 + Math.sin(performance.now() / 120 + fire.x) * 0.08;
  const radius = fire.radius * pulse;
  const gradient = ctx.createRadialGradient(0, 0, 8, 0, 0, radius);
  gradient.addColorStop(0, "rgba(255, 210, 92, 0.78)");
  gradient.addColorStop(0.4, "rgba(255, 104, 45, 0.5)");
  gradient.addColorStop(1, "rgba(110, 28, 16, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 198, 86, 0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const offset = (i - 1.5) * radius * 0.28;
    ctx.beginPath();
    ctx.moveTo(offset - 10, -4);
    ctx.quadraticCurveTo(offset, -20 - Math.sin(performance.now() / 150 + i) * 6, offset + 12, -6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawThornField(field) {
  const alpha = Math.max(0.2, Math.min(0.68, field.life / UNIT.shaman.thornDuration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(field.x, field.y);
  const radius = field.radius * (1 + Math.sin(performance.now() / 160 + field.x) * 0.05);
  const gradient = ctx.createRadialGradient(0, 0, 3, 0, 0, radius + 10);
  gradient.addColorStop(0, "rgba(142, 232, 138, 0.58)");
  gradient.addColorStop(0.65, "rgba(45, 118, 64, 0.36)");
  gradient.addColorStop(1, "rgba(20, 56, 31, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius + 10, (radius + 10) * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(180, 255, 160, 0.72)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 7; i += 1) {
    const x = (i - 3) * radius * 0.32;
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x + Math.sin(i) * 8, -radius * 0.72);
    ctx.lineTo(x + 8, -radius * 0.28);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSlimeField(field) {
  const alpha = Math.max(0.16, Math.min(0.52, field.life / field.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(field.x, field.y);
  const radius = field.radius * (1 + Math.sin(performance.now() / 180 + field.x) * 0.04);
  const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, radius);
  gradient.addColorStop(0, "rgba(176, 220, 78, 0.55)");
  gradient.addColorStop(0.62, "rgba(80, 122, 38, 0.34)");
  gradient.addColorStop(1, "rgba(22, 48, 20, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(214, 246, 118, 0.46)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc((i - 1.5) * radius * 0.25, Math.sin(i + field.x) * 7, radius * 0.08, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWebField(field) {
  const alpha = Math.max(0.18, Math.min(0.58, field.life / field.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(field.x, field.y);
  const radius = field.radius;
  ctx.strokeStyle = "rgba(228, 236, 214, 0.62)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.32, 0, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius * 0.32);
    ctx.stroke();
  }
  for (let r = 0.35; r <= 0.8; r += 0.22) {
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * r, radius * 0.32 * r, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSwarmEgg(egg) {
  const pulse = Math.sin(performance.now() / 150 + egg.x * 0.02) * 0.08;
  const hatchRatio = Math.max(0, Math.min(1, 1 - egg.life / 5));
  ctx.save();
  ctx.translate(egg.x, egg.y - 12);
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "#3b4d22";
  ctx.beginPath();
  ctx.ellipse(0, 13, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cfe88a";
  ctx.strokeStyle = "#6f8f3a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -2, 12 * (1 + pulse), 17 * (1 - pulse), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = `rgba(58, 82, 28, ${0.35 + hatchRatio * 0.45})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, -13);
  ctx.quadraticCurveTo(2, -4, -2, 12);
  ctx.moveTo(5, -11);
  ctx.quadraticCurveTo(-1, -3, 4, 10);
  ctx.stroke();
  ctx.restore();
}

function drawHealingField(field) {
  const alpha = Math.max(0.22, Math.min(0.7, field.life / field.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(field.x, field.y);
  const radius = field.radius * (1 + Math.sin(performance.now() / 180 + field.x) * 0.05);
  const gradient = ctx.createRadialGradient(0, 0, 4, 0, 0, radius + 14);
  gradient.addColorStop(0, "rgba(220, 255, 205, 0.6)");
  gradient.addColorStop(0.62, "rgba(136, 240, 178, 0.36)");
  gradient.addColorStop(1, "rgba(74, 160, 104, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, radius + 14, (radius + 14) * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(225, 255, 216, 0.76)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -2, radius * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-radius * 0.34, -2);
  ctx.lineTo(radius * 0.34, -2);
  ctx.moveTo(0, -radius * 0.34 - 2);
  ctx.lineTo(0, radius * 0.34 - 2);
  ctx.stroke();
  ctx.restore();
}

function drawLandMine(mine) {
  ctx.save();
  ctx.translate(mine.x, mine.y - 5);
  ctx.fillStyle = mine.side === "player" ? "#2f3a32" : "#3a2c28";
  ctx.strokeStyle = "#ffce7a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#ffce7a";
  ctx.beginPath();
  ctx.arc(0, -7, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawBarricade(barricade) {
  if (barricade.acidTower) {
    drawCampaignAcidTower(barricade);
    return;
  }
  if (barricade.controlTower) {
    drawCampaignControlTower(barricade);
    return;
  }
  if (barricade.highWall) {
    drawCampaignHighWall(barricade);
    return;
  }
  const ratio = barricade.maxHp > 0 ? Math.max(0, barricade.hp / barricade.maxHp) : 0;
  const alpha = Number.isFinite(barricade.life) && Number.isFinite(barricade.duration)
    ? Math.max(0.35, Math.min(1, barricade.life / barricade.duration))
    : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(barricade.x, barricade.y);
  ctx.fillStyle = "rgba(42, 28, 18, 0.48)";
  ctx.fillRect(-barricade.length / 2, -barricade.width / 2, barricade.length, barricade.width);
  ctx.strokeStyle = "#2b1c12";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  for (let x = -barricade.length / 2 + 18; x <= barricade.length / 2 - 18; x += 34) {
    ctx.beginPath();
    ctx.moveTo(x - 18, barricade.width / 2 - 6);
    ctx.lineTo(x + 18, -barricade.width / 2 + 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 18, -barricade.width / 2 + 6);
    ctx.lineTo(x + 18, barricade.width / 2 - 6);
    ctx.stroke();
  }
  ctx.strokeStyle = "#d7c090";
  ctx.lineWidth = 2;
  ctx.strokeRect(-barricade.length / 2, -barricade.width / 2, barricade.length, barricade.width);
  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.fillRect(-42, -barricade.width / 2 - 14, 84, 6);
  ctx.fillStyle = ratio > 0.35 ? "#d7c090" : "#ff8a6b";
  ctx.fillRect(-42, -barricade.width / 2 - 14, 84 * ratio, 6);
  ctx.restore();
}

function drawCampaignAcidTower(tower) {
  const ratio = tower.maxHp > 0 ? Math.max(0, tower.hp / tower.maxHp) : 0;
  const pulse = Math.sin(Date.now() / 210) * 3;
  ctx.save();
  ctx.translate(tower.x, tower.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, 118, 108, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createLinearGradient(0, -165, 0, 105);
  gradient.addColorStop(0, "#536d39");
  gradient.addColorStop(0.52, "#283b28");
  gradient.addColorStop(1, "#171f18");
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#0e150f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-52, 98);
  ctx.lineTo(-38, -118);
  ctx.lineTo(38, -118);
  ctx.lineTo(52, 98);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#7da94b";
  ctx.fillRect(-64, -146, 128, 30);
  ctx.strokeRect(-64, -146, 128, 30);
  ctx.fillStyle = "rgba(183, 224, 107, 0.32)";
  ctx.beginPath();
  ctx.arc(0, -174, 34 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#cde69b";
  ctx.beginPath();
  ctx.arc(0, -174, 18 + pulse * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#eef8cf";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "rgba(183, 224, 107, 0.58)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    const angle = Date.now() / 720 + i * Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 28, -174 + Math.sin(angle) * 10);
    ctx.lineTo(Math.cos(angle + 0.6) * 72, -174 + Math.sin(angle + 0.6) * 24);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(-62, -214, 124, 8);
  ctx.fillStyle = ratio > 0.35 ? "#b7e06b" : "#ff8a6b";
  ctx.fillRect(-62, -214, 124 * ratio, 8);
  ctx.fillStyle = "#eef8cf";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(tower.label ?? "酸蚀炮塔", 0, -224);
  ctx.restore();
}

function drawCampaignControlTower(tower) {
  const ratio = tower.maxHp > 0 ? Math.max(0, tower.hp / tower.maxHp) : 0;
  ctx.save();
  ctx.translate(tower.x, tower.y);
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 118, 110, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  const gradient = ctx.createLinearGradient(0, -170, 0, 105);
  gradient.addColorStop(0, "#5e456f");
  gradient.addColorStop(0.55, "#2f2940");
  gradient.addColorStop(1, "#1b1d25");
  ctx.fillStyle = gradient;
  ctx.strokeStyle = "#15131b";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-46, 98);
  ctx.lineTo(-32, -130);
  ctx.lineTo(32, -130);
  ctx.lineTo(46, 98);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#7c5b96";
  ctx.fillRect(-58, -152, 116, 30);
  ctx.strokeRect(-58, -152, 116, 30);
  ctx.fillStyle = "#b88cff";
  ctx.beginPath();
  ctx.arc(0, -176, 22 + Math.sin(Date.now() / 180) * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#efe6ff";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = "rgba(184, 140, 255, 0.55)";
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const angle = (Date.now() / 650) + i * (Math.PI * 2 / 5);
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 34, -176 + Math.sin(angle) * 14);
    ctx.lineTo(Math.cos(angle + 0.7) * 76, -176 + Math.sin(angle + 0.7) * 28);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.58)";
  ctx.fillRect(-62, -215, 124, 8);
  ctx.fillStyle = ratio > 0.35 ? "#b88cff" : "#ff8a6b";
  ctx.fillRect(-62, -215, 124 * ratio, 8);
  ctx.fillStyle = "#efe6ff";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(tower.label ?? "控制之塔", 0, -225);
  ctx.restore();
}

function drawCampaignHighWall(wall) {
  const ratio = wall.maxHp > 0 ? Math.max(0, wall.hp / wall.maxHp) : 0;
  const width = wall.length;
  const height = wall.width;
  ctx.save();
  ctx.translate(wall.x, wall.y);
  ctx.fillStyle = "rgba(17, 18, 24, 0.32)";
  ctx.fillRect(-width / 2 - 18, height / 2 - 8, width + 36, 18);
  const gradient = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
  gradient.addColorStop(0, "#6d6a62");
  gradient.addColorStop(0.55, "#3f403d");
  gradient.addColorStop(1, "#242724");
  ctx.fillStyle = gradient;
  ctx.fillRect(-width / 2, -height / 2, width, height);
  ctx.strokeStyle = "#161815";
  ctx.lineWidth = 5;
  ctx.strokeRect(-width / 2, -height / 2, width, height);
  ctx.fillStyle = "#2d302c";
  for (let y = -height / 2 + 18; y < height / 2 - 8; y += 30) {
    for (let x = -width / 2 + ((Math.floor((y + height / 2) / 30) % 2) ? 14 : 4); x < width / 2 - 16; x += 30) {
      ctx.fillRect(x, y, 22, 9);
    }
  }
  ctx.fillStyle = "#58564e";
  const merlonCount = 5;
  for (let i = 0; i < merlonCount; i += 1) {
    const x = -width / 2 + i * (width / (merlonCount - 1)) - 11;
    ctx.fillRect(x, -height / 2 - 28, 22, 32);
  }
  for (let i = 0; i < wall.archerCount; i += 1) {
    const x = -width / 2 + 18 + i * ((width - 36) / Math.max(1, wall.archerCount - 1));
    ctx.fillStyle = "#d9c39a";
    ctx.beginPath();
    ctx.arc(x, -height / 2 - 42, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f0d27a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 8, -height / 2 - 32);
    ctx.quadraticCurveTo(x - 16, -height / 2 - 42, x - 8, -height / 2 - 52);
    ctx.stroke();
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(-52, -height / 2 - 62, 104, 7);
  ctx.fillStyle = ratio > 0.35 ? "#d7c090" : "#ff8a6b";
  ctx.fillRect(-52, -height / 2 - 62, 104 * ratio, 7);
  ctx.fillStyle = "#f3e8c2";
  ctx.font = "12px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("高城", 0, -height / 2 - 70);
  ctx.restore();
}

function drawMine(mine, side) {
  const x = typeof mine === "number" ? mine : mine.x;
  const y = typeof mine === "number" ? FIELD.ground : mine.y;
  const remaining = typeof mine === "number" ? NORMAL_MINE_CAPACITY : mine.remaining;
  const capacity = typeof mine === "number" ? NORMAL_MINE_CAPACITY : mine.capacity;
  const resource = typeof mine === "number" ? "gold" : (mine.resource ?? "gold");
  const ratio = capacity > 0 ? Math.max(0, remaining / capacity) : 0;
  const faction = factionForSide(side);
  ctx.fillStyle = remaining > 0 ? (resource === "magic" ? "#2d2440" : "#403421") : "#26231e";
  ctx.beginPath();
  ctx.moveTo(x - 35, y + 11);
  ctx.lineTo(x - 10, y - 31);
  ctx.lineTo(x + 34, y + 11);
  ctx.closePath();
  ctx.fill();
  if (remaining > 0) {
    ctx.fillStyle = resource === "magic" ? "#b88cff" : FACTIONS[faction].mineColor;
    ctx.beginPath();
    ctx.arc(x + 4, y - 5, 9, 0, Math.PI * 2);
    ctx.arc(x - 10, y + 5, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.34)";
  ctx.fillRect(x - 19, y + 15, 38, 4);
  ctx.fillStyle = remaining > 0 ? (resource === "magic" ? "#b88cff" : "#f5c542") : "#5d574b";
  ctx.fillRect(x - 19, y + 15, 38 * ratio, 4);
}

function drawGoldRushMines() {
  ctx.save();
  state.goldRushMines.forEach((mine) => {
    const ratio = mine.capacity > 0 ? mine.remaining / mine.capacity : 0;
    const y = mine.y ?? FIELD.ground;
    ctx.fillStyle = mine.remaining > 0 ? "#3b301f" : "#2a2925";
    ctx.beginPath();
    ctx.moveTo(mine.x - 29, y + 11);
    ctx.lineTo(mine.x - 9, y - 29);
    ctx.lineTo(mine.x + 30, y + 11);
    ctx.closePath();
    ctx.fill();

    if (mine.remaining > 0) {
      ctx.fillStyle = "#f5c542";
      ctx.beginPath();
      ctx.arc(mine.x + 2, y - 3, 7, 0, Math.PI * 2);
      ctx.arc(mine.x - 9, y + 5, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(mine.x - 18, y + 16, 36, 4);
    ctx.fillStyle = "#f5c542";
    ctx.fillRect(mine.x - 18, y + 16, 36 * ratio, 4);
    ctx.fillStyle = "#efe6c8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(Math.ceil(mine.remaining).toString(), mine.x, y + 33);
  });
  ctx.restore();
}

function drawCenterTower() {
  if (activeCampaign?.campaignControlTower || activeCampaign?.campaignAcidTower) return;
  const owner = state.towerOwner;
  const captureRatio = state.towerCaptureSide ? Math.min(1, state.towerCaptureTimer / CENTER_TOWER.captureTime) : 0;
  const bannerColor = owner === "player" ? "#75a7ff" : owner === "enemy" ? "#e2675d" : "#d8c7a0";
  ctx.save();
  ctx.translate(CENTER_TOWER.x, CENTER_TOWER.y);

  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(0, 68, CENTER_TOWER.radiusX, 24, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#4d493f";
  ctx.strokeStyle = "#1f211d";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-34, 58);
  ctx.lineTo(-24, -70);
  ctx.lineTo(24, -70);
  ctx.lineTo(34, 58);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#635f53";
  ctx.fillRect(-42, -82, 84, 22);
  ctx.strokeRect(-42, -82, 84, 22);

  ctx.fillStyle = bannerColor;
  ctx.beginPath();
  ctx.moveTo(0, -112);
  ctx.lineTo(58, -94);
  ctx.lineTo(0, -75);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#222220";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, -118);
  ctx.lineTo(0, -48);
  ctx.stroke();

  ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
  ctx.fillRect(-54, 82, 108, 8);
  if (captureRatio > 0) {
    ctx.fillStyle = state.towerCaptureSide === "player" ? "#75a7ff" : "#e2675d";
    ctx.fillRect(-54, 82, 108 * captureRatio, 8);
  }
  ctx.fillStyle = "#efe6c8";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(owner ? `${owner === "player" ? "我方" : "敌方"}据点 +6/s` : "中心塔", 0, 108);
  ctx.restore();
}

function drawCastle(side) {
  const isPlayer = side === "player";
  const baseX = isPlayer ? FIELD.playerBase : FIELD.enemyBase;
  const faction = factionForSide(side);
  const color = faction === "order"
    ? "#415f8f"
    : faction === "element"
      ? "#5e8d85"
      : faction === "swarm"
        ? "#6d8f3e"
        : faction === "undeadEmpire"
          ? "#6e6680"
          : "#813b34";
  const hp = isPlayer ? state.playerHp : state.enemyHp;

  ctx.save();
  ctx.translate(baseX, 0);
  ctx.scale(isPlayer ? 1 : -1, 1);

  ctx.fillStyle = "#2d2f30";
  ctx.fillRect(-78, FIELD.ground - 165, 82, 165);
  ctx.fillStyle = color;
  ctx.fillRect(-62, FIELD.ground - 205, 48, 52);
  ctx.fillRect(-90, FIELD.ground - 126, 30, 126);
  ctx.fillRect(-5, FIELD.ground - 126, 30, 126);
  ctx.fillStyle = "#17191a";
  ctx.fillRect(-50, FIELD.ground - 64, 32, 64);

  ctx.fillStyle = hp <= 0 ? "#5e5146" : "#d7d2bd";
  ctx.beginPath();
  ctx.arc(42, FIELD.ground - 125, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(32, FIELD.ground - 106, 20, 84);
  ctx.fillStyle = color;
  ctx.fillRect(29, FIELD.ground - 76, 26, 10);

  ctx.restore();
  drawCastleHpBar(baseX, hp, isPlayer);
}

function drawFourWayCastle(side) {
  const base = FOUR_WAY_BASES[side];
  const hp = state.fourWayBaseHp?.[side] ?? STATUE_MAX_HP;
  const centerAngle = Math.atan2(FIELD.height / 2 - base.y, FIELD.width / 2 - base.x);
  ctx.save();
  ctx.translate(base.x, base.y);

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 78, 116, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2d2f30";
  ctx.fillRect(-64, -56, 128, 132);
  ctx.fillStyle = base.color;
  ctx.fillRect(-48, -94, 96, 45);
  ctx.fillRect(-86, -25, 34, 101);
  ctx.fillRect(52, -25, 34, 101);
  ctx.fillStyle = "#17191a";
  ctx.fillRect(-22, 22, 44, 54);
  ctx.fillStyle = hp <= 0 ? "#5e5146" : "#d7d2bd";
  ctx.beginPath();
  ctx.arc(0, -38, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = base.color;
  ctx.fillRect(-20, -4, 40, 12);
  ctx.save();
  ctx.rotate(centerAngle);
  ctx.fillStyle = "rgba(248, 234, 197, 0.78)";
  ctx.beginPath();
  ctx.moveTo(112, 0);
  ctx.lineTo(82, -13);
  ctx.lineTo(82, 13);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.restore();

  drawFourWayCastleHpBar(side);
}

function drawFourWayCastleHpBar(side) {
  const base = FOUR_WAY_BASES[side];
  const hp = state.fourWayBaseHp?.[side] ?? 0;
  const width = 170;
  const x = base.x - width / 2;
  const y = base.y + (base.y < FIELD.height / 2 ? -155 : 132);
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.fillRect(x, y, width, 16);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.34)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, 16);
  ctx.fillStyle = base.color;
  ctx.fillRect(x + 2, y + 2, (width - 4) * Math.max(0, hp / STATUE_MAX_HP), 12);
  ctx.fillStyle = "#f8eac5";
  ctx.font = "700 15px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${base.label} ${Math.max(0, Math.ceil(hp))}`, base.x, y - 8);
  ctx.restore();
}

function drawCastleHpBar(baseX, hp, isPlayer) {
  const width = 175;
  const y = FIELD.ground - 238;
  const maxHp = isPlayer ? (state.playerMaxHp ?? STATUE_MAX_HP) : (state.enemyMaxHp ?? STATUE_MAX_HP);
  const label = isPlayer ? (activeCampaign?.playerBaseLabel ?? "我方基地") : (activeCampaign?.enemyBaseLabel ?? "敌方基地");
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.48)";
  ctx.fillRect(baseX - width / 2, y, width, 14);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
  ctx.lineWidth = 2;
  ctx.strokeRect(baseX - width / 2, y, width, 14);
  ctx.fillStyle = isPlayer ? "#5be887" : "#5be887";
  ctx.fillRect(baseX - width / 2 + 2, y + 2, (width - 4) * Math.max(0, hp / maxHp), 10);
  ctx.fillStyle = "#f8eac5";
  ctx.font = "700 13px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(label, baseX, y - 7);
  ctx.restore();
}

function drawUnit(unit) {
  const color = getUnitColor(unit);
  const headColor = getHeadColor(unit);
  const dir = state?.fourWay ? (unit.facingDir ?? (unit.x < FIELD.width / 2 ? 1 : -1)) : (unit.side === "player" ? 1 : -1);
  const bob = getUnitBodyBob(unit);
  const flightOffset = UNIT[unit.type]?.flying ? -42 : 0;
  const size = UNIT[unit.type]?.visualScale ?? (UNIT[unit.type]?.giant ? 1.55 : 1);

  if (UNIT[unit.type]?.flying) drawFlightMarker(unit, flightOffset);

  ctx.save();
  ctx.translate(unit.x, unit.y + bob + flightOffset);
  ctx.scale(dir * size, size);
  if (UNIT[unit.type]?.flying) {
    ctx.shadowColor = "#d7f6ff";
    ctx.shadowBlur = 12;
  }
  if (unit.type === "vClone") {
    ctx.shadowColor = "#78ff9a";
    ctx.shadowBlur = 18;
  }
  if (unit.shieldTimer > 0) {
    ctx.shadowColor = "#9ee8ff";
    ctx.shadowBlur = 22;
  }
  if (unit.type === "commander" || unit.type === "covenantGuard") {
    ctx.shadowColor = unit.type === "commander" ? "#f5d14f" : "#fff1a8";
    ctx.shadowBlur = 10;
  }
  if (unit.rageTimer > 0 || unit.swordsmanSelfRageTimer > 0) {
    ctx.shadowColor = "#ff4f3d";
    ctx.shadowBlur = 18;
  }
  if (unit.type === "treeEnt") {
    drawTreeEntUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "hurricane") {
    drawHurricaneUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "catapult" || unit.type === "undeadCatapult") {
    drawCatapultUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "arrowShieldCart") {
    drawArrowShieldCartUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "rocketCart") {
    drawRocketCartUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "medusa") {
    drawMedusaUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "boneGiant") {
    drawBoneGiantUnit(unit);
    ctx.restore();
    return;
  }
  if (unit.type === "hill") {
    drawHillUnit(unit);
    ctx.restore();
    return;
  }
  if (BASIC_ELEMENT_UNITS.has(unit.type)) {
    drawBasicElementUnit(unit);
    drawUnitHp(unit);
    ctx.shadowBlur = 0;
    ctx.restore();
    return;
  }
  if (unit.type === "miner") {
    drawMinerUnit(unit, color, headColor);
    ctx.restore();
    return;
  }
  if (unit.type === "swordsman") {
    drawSwordsmanUnit(unit, color, headColor);
    ctx.restore();
    return;
  }
  if (unit.type === "ironCavalry") {
    drawIronCavalryUnit(unit, color, headColor);
    ctx.restore();
    return;
  }
  drawRoundedStickUnit(unit, color, headColor);

  drawWeapon(unit.type, unit);
  drawUnitHp(unit);
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawWormBurrow(unit) {
  ctx.save();
  ctx.translate(unit.x, unit.y);
  const pulse = 1 + Math.sin(performance.now() / 130 + unit.id) * 0.06;
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "rgba(74, 58, 32, 0.72)";
  ctx.beginPath();
  ctx.ellipse(0, -4, 28 * pulse, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(190, 214, 104, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -10);
  ctx.quadraticCurveTo(-6, -20, 12, -8);
  ctx.moveTo(-15, -1);
  ctx.quadraticCurveTo(4, 8, 25, -2);
  ctx.stroke();
  ctx.restore();
}

function drawBasicElementUnit(unit) {
  const palette = {
    earthElement: {
      aura: "rgba(192, 163, 109, 0.34)",
      body: "#9b8051",
      head: "#c0a36d",
      accent: "#5f4f33",
      glow: "#d7bd82",
    },
    waterElement: {
      aura: "rgba(114, 200, 232, 0.32)",
      body: "#72c8e8",
      head: "#b8f0ff",
      accent: "#2d7ea6",
      glow: "#d8fbff",
    },
    fireElement: {
      aura: "rgba(255, 122, 61, 0.36)",
      body: "#f07845",
      head: "#ffd08a",
      accent: "#8f2f20",
      glow: "#ffe06d",
    },
    windElement: {
      aura: "rgba(215, 246, 238, 0.32)",
      body: "#d7f6ee",
      head: "#ffffff",
      accent: "#66b8aa",
      glow: "#ffffff",
    },
  }[unit.type] ?? {
    aura: "rgba(255,255,255,0.28)",
    body: getUnitColor(unit),
    head: getHeadColor(unit),
    accent: "#333333",
    glow: "#ffffff",
  };
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const lean = step * 2;

  ctx.save();
  ctx.shadowColor = palette.glow;
  ctx.shadowBlur = 12;
  ctx.fillStyle = palette.aura;
  ctx.beginPath();
  ctx.ellipse(0, -36, 33, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  strokePose("#151515", 12, () => {
    makeLimbPath(-2, -26, 12 + step * 10, -12 - liftA * 6, 24 + step * 12, 5 - liftA * 3);
    makeLimbPath(-1, -26, -13 + counter * 10, -12 - liftB * 6, -24 + counter * 12, 5 - liftB * 3);
    makeLimbPath(-2, -44, 18 + counter * 10, -38 + liftB * 2, 31 + counter * 11, -32 + liftB * 2);
    makeLimbPath(1, -43, -18 + step * 10, -37 + liftA * 2, -31 + step * 11, -29 + liftA * 2);
  });
  strokePose(palette.body, 7, () => {
    makeLimbPath(-2, -26, 12 + step * 10, -12 - liftA * 6, 24 + step * 12, 5 - liftA * 3);
    makeLimbPath(-1, -26, -13 + counter * 10, -12 - liftB * 6, -24 + counter * 12, 5 - liftB * 3);
    makeLimbPath(-2, -44, 18 + counter * 10, -38 + liftB * 2, 31 + counter * 11, -32 + liftB * 2);
    makeLimbPath(1, -43, -18 + step * 10, -37 + liftA * 2, -31 + step * 11, -29 + liftA * 2);
  });

  ctx.lineJoin = "round";
  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 4;
  ctx.fillStyle = palette.body;
  if (unit.type === "earthElement") {
    ctx.beginPath();
    ctx.moveTo(-18 + lean * 0.2, -52);
    ctx.lineTo(9 + lean * 0.4, -55);
    ctx.lineTo(23 + lean * 0.3, -35);
    ctx.lineTo(9, -17);
    ctx.lineTo(-17, -20);
    ctx.lineTo(-25, -38);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.head;
    [[-12, -45, 5], [5, -49, 6], [13, -34, 5], [-5, -27, 4]].forEach(([x, y, radius]) => {
      ctx.beginPath();
      ctx.arc(x + lean * 0.2, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  } else if (unit.type === "waterElement") {
    ctx.beginPath();
    ctx.moveTo(0 + lean * 0.3, -57);
    ctx.bezierCurveTo(25, -39, 20, -15, 0, -15);
    ctx.bezierCurveTo(-22, -15, -27, -39, 0 + lean * 0.3, -57);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = palette.glow;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-12, -34);
    ctx.quadraticCurveTo(-2, -41, 9, -34);
    ctx.quadraticCurveTo(15, -30, 20, -34);
    ctx.stroke();
  } else if (unit.type === "fireElement") {
    ctx.beginPath();
    ctx.moveTo(0, -61);
    ctx.bezierCurveTo(25, -45, 22, -20, 4, -14);
    ctx.bezierCurveTo(-18, -22, -27, -37, -9, -55);
    ctx.bezierCurveTo(-5, -45, 4, -43, 0, -61);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.moveTo(1, -49);
    ctx.bezierCurveTo(12, -38, 10, -25, 0, -21);
    ctx.bezierCurveTo(-10, -28, -10, -40, 1, -49);
    ctx.fill();
  } else {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = palette.body;
    ctx.beginPath();
    ctx.ellipse(0 + lean * 0.2, -35, 18, 25, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = palette.accent;
    ctx.lineWidth = 4;
    for (let i = 0; i < 3; i += 1) {
      const offset = i * 9;
      ctx.beginPath();
      ctx.arc(-2, -37, 18 + offset, phase * 0.5 + i, phase * 0.5 + i + Math.PI * 1.1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  drawRoundedHead(palette.head, lean * 0.25, -68, 14);
  ctx.shadowBlur = 0;
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  if (unit.type === "windElement") {
    ctx.beginPath();
    ctx.moveTo(-13, -70);
    ctx.quadraticCurveTo(0, -82, 15, -70);
    ctx.stroke();
  } else if (unit.type === "fireElement") {
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.moveTo(0, -91);
    ctx.bezierCurveTo(9, -80, 5, -73, 0, -72);
    ctx.bezierCurveTo(-7, -77, -6, -84, 0, -91);
    ctx.fill();
  } else if (unit.type === "waterElement") {
    ctx.beginPath();
    ctx.arc(0, -85, 7, 0.15 * Math.PI, 1.85 * Math.PI);
    ctx.stroke();
  } else if (unit.type === "earthElement") {
    ctx.fillStyle = palette.accent;
    ctx.fillRect(-9, -84, 18, 7);
  }
  ctx.restore();
}

function strokePose(color, width, draw) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  draw();
  ctx.stroke();
}

function drawRoundedHead(headColor, x = 0, y = -64, radius = 13) {
  ctx.fillStyle = headColor;
  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.beginPath();
  ctx.arc(x - radius * 0.32, y - radius * 0.34, radius * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

function getWalkAmount(unit) {
  if (unit.stunTimer > 0 || unit.frozenBy || unit.controlLockTimer > 0 || isUnitHidden(unit)) return 0;
  const velocity = Math.hypot(unit.velocityX ?? 0, unit.velocityY ?? 0);
  if (velocity < 5) return 0;
  return Math.min(1, velocity / 70);
}

function getWalkPhase(unit) {
  return unit.anim * 0.82;
}

function getUnitBodyBob(unit) {
  const walk = getWalkAmount(unit);
  if (walk <= 0) return Math.sin(unit.anim * 0.35) * 0.45;
  const phase = getWalkPhase(unit);
  return Math.sin(phase * 2) * 2.1 * walk - Math.abs(Math.sin(phase)) * 1.1 * walk;
}

function makeLimbPath(startX, startY, jointX, jointY, endX, endY) {
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(jointX, jointY, endX, endY);
}

function drawRoundedStickUnit(unit, color, headColor) {
  const pose = roundedUnitPose(unit);
  strokePose("#151515", pose.outerWidth, pose.path);
  strokePose(color, pose.innerWidth, pose.path);
  drawRoundedHead(headColor, 0, -64, pose.headRadius);
  if (unit.godV || unit.godVClone) drawGodVHeadpiece();
  if (unit.type === "zeus") drawZeusOverheadCloud(unit);
}

function roundedUnitPose(unit) {
  const type = unit.type;
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const lean = step * 1.4;
  const hipY = -24 + Math.abs(Math.sin(phase)) * 1.2 * walk;
  const torsoTopX = 1 + lean * 0.6;
  const shoulderY = -42;
  const frontArm = 16 + counter * 13;
  const rearArm = -15 + step * 11;
  const frontFoot = 20 + step * 13;
  const rearFoot = -18 + counter * 12;

  if (type === "creeper" || type === "largeCreeper" || type === "deadCorpse") {
    return {
      outerWidth: 12,
      innerWidth: 7,
      headRadius: 13,
      path: () => {
        makeLimbPath(-1 + lean * 0.4, -51, 7 + lean, -40, 4, -25);
        makeLimbPath(2, -42, 17 + counter * 9, -33, 31 + counter * 9, -29 + liftB * 3);
        makeLimbPath(-2, -39, -17 + step * 8, -32, -27 + step * 8, -20 + liftA * 3);
        makeLimbPath(4, -25, 12 + step * 9, -13 - liftA * 5, 24 + step * 11, 3 - liftA * 3);
        makeLimbPath(2, -25, -9 + counter * 8, -13 - liftB * 5, -18 + counter * 10, 4 - liftB * 3);
      },
    };
  }
  if (type === "chaosGiant" || type === "superGiant" || type === "enslavedGiant") {
    return {
      outerWidth: 13,
      innerWidth: 8,
      headRadius: 14,
      path: () => {
        makeLimbPath(1 + lean * 0.3, -52, -3 + lean, -39, 1, -22);
        makeLimbPath(0, -43, 18 + counter * 8, -34, 31 + counter * 8, -43 + liftB * 2);
        makeLimbPath(-2, -42, -18 + step * 8, -35, -31 + step * 8, -24 + liftA * 2);
        makeLimbPath(1, -22, 16 + step * 8, -12 - liftA * 4, 28 + step * 10, 4 - liftA * 2);
        makeLimbPath(0, -22, -13 + counter * 7, -11 - liftB * 4, -24 + counter * 9, 5 - liftB * 2);
      },
    };
  }
  if (type === "archer" || type === "goldenArcher" || type === "demonArcher" || type === "crossbow" || type === "musketeer") {
    return {
      outerWidth: 12,
      innerWidth: 7,
      headRadius: 13,
      path: () => {
        makeLimbPath(1 + lean * 0.25, -51, -2 + lean, -39, 1, hipY);
        makeLimbPath(0, shoulderY, 15 + counter * 5, -37 + liftB, 28 + counter * 4, -38 + liftB);
        makeLimbPath(-2, -41, -16 + step * 7, -35, -26 + step * 7, -26 + liftA * 2);
        makeLimbPath(1, hipY, 12 + step * 8, -13 - liftA * 5, 21 + step * 10, 3 - liftA * 2);
        makeLimbPath(0, hipY, -10 + counter * 8, -12 - liftB * 5, -18 + counter * 10, 4 - liftB * 2);
      },
    };
  }
  return {
    outerWidth: 12,
    innerWidth: 7,
    headRadius: 13,
    path: () => {
      makeLimbPath(torsoTopX, -51, -3 + lean, -39, 1, hipY);
      makeLimbPath(0, shoulderY, frontArm, -37 - liftB * 2, 26 + counter * 11, -43 + liftB * 5);
      makeLimbPath(-2, -41, rearArm, -35 - liftA * 2, -24 + step * 11, -25 + liftA * 5);
      makeLimbPath(1, hipY, 13 + step * 9, -13 - liftA * 7, frontFoot, 2 - liftA * 3);
      makeLimbPath(0, hipY, -11 + counter * 8, -12 - liftB * 7, rearFoot, 4 - liftB * 3);
    },
  };
}

function drawMinerUnit(unit, color, headColor) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const hipY = -25 + Math.abs(Math.sin(phase)) * 1.1 * walk;
  const lean = step * 1.1;
  const minerPath = () => {
    makeLimbPath(-2 + lean * 0.5, -51, 2 + lean, -39, -3, hipY);
    makeLimbPath(-1, -42, 15 + counter * 7, -36 - liftB, 25 + counter * 8, -46 + liftB * 2);
    makeLimbPath(-5, -39, -17 + step * 7, -31 - liftA, -25 + step * 8, -20 + liftA * 2);
    makeLimbPath(-3, hipY, 8 + step * 8, -15 - liftA * 6, 18 + step * 10, 1 - liftA * 3);
    makeLimbPath(-5, hipY, -13 + counter * 8, -13 - liftB * 6, -21 + counter * 10, 2 - liftB * 3);
  };

  ctx.fillStyle = "#7a4f2d";
  ctx.strokeStyle = "#3d2a1b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-29, -38, 22, 28, 8);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#d0a05c";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, -31);
  ctx.lineTo(-10, -25);
  ctx.moveTo(-24, -21);
  ctx.lineTo(-10, -15);
  ctx.stroke();

  strokePose("#151515", 12, minerPath);
  strokePose(color, 7, minerPath);

  drawRoundedHead(headColor, 0, -64, 13);
  ctx.fillStyle = "#d0a05c";
  ctx.strokeStyle = "#5c3a20";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-15, -71);
  ctx.quadraticCurveTo(0, -82, 16, -71);
  ctx.lineTo(11, -66);
  ctx.quadraticCurveTo(0, -72, -11, -66);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#4b3420";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(22 + counter * 4, -42 + liftB);
  ctx.lineTo(43 + counter * 5, -98 + liftB * 2);
  ctx.stroke();

  ctx.strokeStyle = "#cfd6dc";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(43 + counter * 5, -79 + liftB * 2, 19, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  drawUnitHp(unit);
}

function drawSwordsmanUnit(unit, color, headColor) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const hipY = -24 + Math.abs(Math.sin(phase)) * 1.15 * walk;
  const lean = step * 1.2;
  const swordPath = () => {
    makeLimbPath(1 + lean * 0.5, -51, -3 + lean, -39, 1, hipY);
    makeLimbPath(0, -42, 17 + counter * 7, -36 - liftB * 2, 26 + counter * 6, -43 + liftB * 3);
    makeLimbPath(-2, -41, -18 + step * 8, -36 - liftA * 2, -24 + step * 9, -25 + liftA * 3);
    makeLimbPath(1, hipY, 14 + step * 9, -14 - liftA * 7, 23 + step * 11, 2 - liftA * 3);
    makeLimbPath(0, hipY, -11 + counter * 8, -12 - liftB * 7, -18 + counter * 10, 4 - liftB * 3);
  };

  strokePose("#151515", 12, swordPath);
  strokePose(color, 7, swordPath);

  drawRoundedHead(headColor, 0, -64, 13);
  drawIronSword(25 + counter * 6, -43 + liftB * 3, -0.72 + counter * 0.08, 0.95);

  drawUnitHp(unit);
}

function drawIronSword(x, y, angle, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.scale(scale, scale);

  ctx.fillStyle = "#dfe7ec";
  ctx.strokeStyle = "#6f7f8a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(3, -6);
  ctx.quadraticCurveTo(28, -9, 53, -2);
  ctx.quadraticCurveTo(57, 0, 53, 3);
  ctx.quadraticCurveTo(28, 9, 3, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(9, -3);
  ctx.quadraticCurveTo(28, -5, 43, -2);
  ctx.stroke();

  ctx.strokeStyle = "#9aa8b2";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(6, 0);
  ctx.quadraticCurveTo(30, 3, 51, 0);
  ctx.stroke();

  ctx.strokeStyle = "#aab7c2";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-2, -11);
  ctx.lineTo(-2, 11);
  ctx.stroke();

  ctx.strokeStyle = "#6f4a2d";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-19, 0);
  ctx.lineTo(-5, 0);
  ctx.stroke();

  ctx.fillStyle = "#5d3a24";
  ctx.beginPath();
  ctx.arc(-18, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f2118";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawFlightMarker(unit, flightOffset) {
  const baseY = unit.y + 7;
  const airY = unit.y + flightOffset - 6;
  ctx.save();
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(unit.x, baseY, 28, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(215, 246, 255, 0.58)";
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(unit.x, baseY - 3);
  ctx.lineTo(unit.x, airY + 18);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.strokeStyle = "rgba(215, 246, 255, 0.75)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(unit.x, airY + 18, 24, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGodVHeadpiece() {
  ctx.save();
  ctx.strokeStyle = "#d7dde5";
  ctx.fillStyle = "#f2f5f7";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-13, -72);
  ctx.lineTo(-6, -82);
  ctx.lineTo(0, -73);
  ctx.lineTo(6, -82);
  ctx.lineTo(13, -72);
  ctx.lineTo(7, -69);
  ctx.lineTo(0, -72);
  ctx.lineTo(-7, -69);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "#aeb8c2";
  ctx.beginPath();
  ctx.moveTo(-10, -72);
  ctx.quadraticCurveTo(0, -76, 10, -72);
  ctx.stroke();
  ctx.restore();
}

function drawZeusOverheadCloud(unit) {
  ctx.save();
  ctx.globalAlpha = 0.72;
  ctx.fillStyle = "#44546b";
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.ellipse((i - 1.5) * 13, -108 + Math.sin(unit.anim + i) * 2, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "#d7f6ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-4, -96);
  ctx.lineTo(-14, -78);
  ctx.lineTo(0, -83);
  ctx.lineTo(-8, -63);
  ctx.stroke();
  ctx.restore();
}

function drawIronCavalryUnit(unit, color, headColor) {
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const gallop = Math.sin(phase) * walk;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.fillStyle = "#4b4a4f";
  ctx.strokeStyle = "#18181c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(0, -23 + Math.abs(gallop) * 0.5, 35, 17, -0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#24242a";
  ctx.lineWidth = 7;
  [[-20, 1], [-7, -1], [11, -1], [25, 1]].forEach(([x, offset], index) => {
    const lift = Math.sin(phase + index * 1.5) * walk;
    ctx.beginPath();
    ctx.moveTo(x, -12);
    ctx.lineTo(x + lift * 2, 2 + offset);
    ctx.lineTo(x + lift * 3.5, 13 + Math.abs(lift) * 0.5);
    ctx.stroke();
  });

  ctx.fillStyle = "#3a3b42";
  ctx.beginPath();
  ctx.ellipse(34, -32, 13, 12, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1f2025";
  ctx.beginPath();
  ctx.moveTo(41, -42);
  ctx.lineTo(51, -48);
  ctx.lineTo(47, -36);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#151515";
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(-4, -43);
  ctx.lineTo(0, -70);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7;
  ctx.stroke();
  drawRoundedHead(headColor, 1, -82, 12);

  ctx.strokeStyle = "#c8a35a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(8, -59);
  ctx.lineTo(72, -72);
  ctx.stroke();
  ctx.fillStyle = "#dfe8ff";
  ctx.beginPath();
  ctx.moveTo(72, -72);
  ctx.lineTo(58, -76);
  ctx.lineTo(63, -63);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#2e2d2a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(2, -55);
  ctx.lineTo(47, -50);
  ctx.stroke();
  ctx.strokeStyle = "#c7b17a";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(11, -51);
  ctx.lineTo(22, -43);
  ctx.stroke();

  ctx.restore();
  drawUnitHp(unit);
}

function drawHillUnit(unit) {
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const armSwing = Math.sin(phase + Math.PI) * walk;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#4c3e28";
  ctx.fillStyle = "#8f7a54";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-18, -50);
  ctx.lineTo(4, -66);
  ctx.lineTo(25, -50);
  ctx.lineTo(18, -18);
  ctx.lineTo(-16, -18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#d6c090";
  ctx.beginPath();
  ctx.arc(1, -82, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#6f5c3c";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(-14, -42);
  ctx.quadraticCurveTo(-25 + armSwing * 9, -35 - liftB * 4, -34 + armSwing * 12, -28 + liftB * 4);
  ctx.moveTo(20, -43);
  ctx.quadraticCurveTo(28 - armSwing * 8, -37 - liftA * 4, 36 - armSwing * 12, -32 + liftA * 4);
  ctx.moveTo(-10, -18);
  ctx.quadraticCurveTo(-18 + step * 8, -5 - liftA * 5, -24 + step * 12, 4 - liftA * 4);
  ctx.moveTo(13, -18);
  ctx.quadraticCurveTo(22 + counter * 8, -5 - liftB * 5, 29 + counter * 12, 3 - liftB * 4);
  ctx.stroke();

  drawStoneWeapon(1.3);
  ctx.restore();
  drawUnitHp(unit);
}

function drawCatapultUnit(unit) {
  if (unit.type === "catapult") {
    drawCannonUnit(unit);
    return;
  }
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#2f2418";
  ctx.fillStyle = "#8b6f46";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(-34, -16);
  ctx.lineTo(26, -16);
  ctx.lineTo(42, -38);
  ctx.lineTo(-20, -38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#5c3f24";
  ctx.beginPath();
  ctx.moveTo(-20, -38);
  ctx.lineTo(22, -70);
  ctx.lineTo(38, -48);
  ctx.stroke();

  ctx.strokeStyle = "#d0a05c";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(17, -68);
  ctx.lineTo(54, -84);
  ctx.stroke();

  ctx.fillStyle = "#8b7a58";
  ctx.beginPath();
  ctx.arc(58, -86, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#4d4130";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#3a2a1b";
  [-21, 23].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, -5, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d0a05c";
    ctx.lineWidth = 3;
    ctx.stroke();
  });

  ctx.restore();
  drawUnitHp(unit);
}

function drawArrowShieldCartUnit(unit) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#5c4a35";
  ctx.strokeStyle = "#211a14";
  ctx.lineWidth = 4.5;

  ctx.beginPath();
  ctx.moveTo(-42, -15);
  ctx.lineTo(39, -15);
  ctx.lineTo(29, -42);
  ctx.lineTo(-34, -45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#8e6a3c";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-30, -45);
  ctx.lineTo(-52, -97);
  ctx.moveTo(28, -42);
  ctx.lineTo(52, -97);
  ctx.stroke();

  const boardRatio = unit.maxArrowBoardHp > 0 ? Math.max(0, unit.arrowBoardHp / unit.maxArrowBoardHp) : 0;
  ctx.fillStyle = unit.arrowBoardHp > 0 ? "#7e6241" : "#3b322a";
  ctx.strokeStyle = unit.arrowBoardHp > 0 ? "#d7c090" : "#6a5440";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(-68, -132, 136, 46, 8);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(255, 232, 172, 0.55)";
  ctx.lineWidth = 2;
  for (let x = -44; x <= 44; x += 22) {
    ctx.beginPath();
    ctx.moveTo(x, -128);
    ctx.lineTo(x - 16, -89);
    ctx.stroke();
  }

  if (unit.arrowBoardHp > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.52)";
    ctx.fillRect(-38, -143, 76, 6);
    ctx.fillStyle = boardRatio > 0.35 ? "#d7c090" : "#ff8a6b";
    ctx.fillRect(-38, -143, 76 * boardRatio, 6);
  }

  ctx.fillStyle = "#2d251d";
  [-27, 27].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, -4, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d7c090";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "#211a14";
    ctx.lineWidth = 4.5;
  });

  ctx.restore();
  drawUnitHp(unit);
}

function drawCannonUnit(unit) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#5d5650";
  ctx.strokeStyle = "#221d19";
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.moveTo(-38, -18);
  ctx.lineTo(34, -18);
  ctx.lineTo(46, -36);
  ctx.lineTo(-28, -40);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.rotate(-0.18);
  ctx.fillStyle = "#343235";
  ctx.strokeStyle = "#141416";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(-8, -58, 70, 18, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#19191b";
  ctx.beginPath();
  ctx.ellipse(65, -49, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#2c241d";
  [-25, 25].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, -5, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#c0a36d";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, -5, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#221d19";
    ctx.lineWidth = 5;
  });
  ctx.restore();
  drawUnitHp(unit);
}

function drawRocketCartUnit(unit) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "#5b6f82";
  ctx.strokeStyle = "#1f2b35";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(-34, -16);
  ctx.lineTo(34, -16);
  ctx.lineTo(24, -42);
  ctx.lineTo(-26, -42);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#ffce7a";
  ctx.lineWidth = 3;
  for (let i = 0; i < 5; i += 1) {
    const y = -53 - i * 5;
    ctx.beginPath();
    ctx.moveTo(-15 + i * 4, y);
    ctx.lineTo(34 + i * 3, y - 13);
    ctx.stroke();
  }

  ctx.fillStyle = "#2c3440";
  [-20, 22].forEach((x) => {
    ctx.beginPath();
    ctx.arc(x, -5, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d0d9e8";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  ctx.restore();
  drawUnitHp(unit);
}

function drawEnslavedGiantBasket() {
  ctx.save();
  ctx.strokeStyle = "#4e3520";
  ctx.fillStyle = "#7a4f2d";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-29, -60);
  ctx.lineTo(-7, -55);
  ctx.lineTo(-10, -18);
  ctx.lineTo(-33, -24);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "#d0a05c";
  ctx.lineWidth = 2;
  for (let y = -50; y <= -29; y += 10) {
    ctx.beginPath();
    ctx.moveTo(-29, y);
    ctx.lineTo(-10, y + 4);
    ctx.stroke();
  }

  ctx.fillStyle = "#8b6f46";
  [
    [-25, -63, 6],
    [-18, -66, 7],
    [-11, -61, 5],
    [-22, -56, 5],
  ].forEach(([x, y, radius]) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "#5d3a22";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-8, -51);
  ctx.quadraticCurveTo(3, -42, 2, -27);
  ctx.stroke();
  ctx.restore();
}

function getUnitColor(unit) {
  if (isReaperStealthed(unit)) return "#808080";
  if (unit.type === "archon") return "#5e89d8";
  if (unit.type === "goldenArcher") return "#e0b84f";
  if (unit.type === "goldenSpartan") return "#d7a92e";
  if (unit.type === "ironCavalry") return "#5e6f7f";
  if (unit.type === "shotgunner") return "#596c78";
  if (unit.type === "orderMiniBomb") return "#d8a548";
  if (unit.type === "miner" && factionForSide(unit.side) === "element") return "#8a5b32";
  if (factionForSide(unit.side) === "order") return unit.side === "player" ? "#75a7ff" : "#8dbbff";
  if (unit.type === "earthElement") return "#9b8051";
  if (unit.type === "waterElement") return "#72c8e8";
  if (unit.type === "fireElement") return "#f07845";
  if (unit.type === "fireImp") return "#ff8a3d";
  if (unit.type === "windElement") return "#d7f6ee";
  if (unit.type === "treeEnt") return "#5f8a57";
  if (unit.type === "waterScorpion") return "#56a8c8";
  if (unit.type === "rog") return "#7f4a34";
  if (unit.type === "dreadfire") return "#8e2f32";
  if (unit.type === "redflame") return "#c63a25";
  if (unit.type === "stormLich") return "#566582";
  if (unit.type === "prometheus") return "#d75a31";
  if (unit.type === "zeus") return "#6d75c8";
  if (unit.type === "hurricane") return "#92d8d0";
  if (unit.type === "hill") return "#8f7a54";
  if (unit.type === "linghan") return "#5ca8d8";
  if (unit.type === "scaldStrike") return "#c7795a";
  if (unit.type === "electricGate") return "#4f79a7";
  if (unit.type === "vUnit") return "#f7f7f2";
  if (unit.type === "vClone") return "#7369c8";
  if (unit.type === "mage") return "#786bd8";
  if (unit.type === "stoneGolem") return "#8f816b";
  if (unit.type === "commander") return "#3f6fb8";
  if (unit.type === "barricadeEngineer") return "#9a7652";
  if (unit.type === "covenantGuard") return "#6f7f91";
  if (unit.type === "berserker") return "#a84032";
  if (unit.type === "archmage") return "#4c55b8";
  if (unit.type === "monk") return "#d8d0b2";
  if (unit.type === "catapult") return "#8b6f46";
  if (unit.type === "undeadCatapult") return "#4a3f4f";
  if (unit.type === "enslavedGiant") return "#8b6f46";
  const type = unit.type;
  if (type === "summoner") return "#4d405f";
  if (type === "wraithMiner") return "#7ed8ff";
  if (type === "gnawMiner") return "#8fae54";
  if (type === "crawler") return "#7fa64d";
  if (type === "poisonBug") return "#9abd4a";
  if (type === "swarmWorm") return "#8b7a45";
  if (type === "broodMother") return "#7d8f50";
  if (type === "locust") return "#b3c86a";
  if (type === "ashWorm") return "#6c5f56";
  if (type === "blastBug") return "#d88938";
  if (type === "ironAnt") return "#657464";
  if (type === "heavyAnt") return unit.heavyAntDodge ? "#4d5d50" : "#4f6658";
  if (type === "antQueen") return "#7d8f50";
  if (type === "spider") return "#596f4d";
  if (type === "giantSpider") return "#3f583c";
  if (type === "caterpillar") return "#6e9a55";
  if (type === "hoodCaterpillar") return "#5d7f62";
  if (type === "corrosiveSpitter") return "#6f9f58";
  if (type === "boneStinger") return (unit.boneStingerBurrowTimer ?? 0) > 0 ? "#75684a" : "#8a8f6a";
  if (type === "lurker") return "#6b7f55";
  if (type === "creeper") return "#9ee06b";
  if (type === "largeCreeper") return "#6fcf59";
  if (type === "orc") return "#7faa5c";
  if (type === "berserkOrc") return "#8d6a48";
  if (type === "goblin") return unit.goblinBurrowed ? "#5d5648" : "#9abf62";
  if (type === "goblinExpert") return "#7d9f6a";
  if (type === "shaman") return "#526f4a";
  if (type === "priest") return "#5d4b74";
  if (type === "apeMan" || type === "summonedApeMan") return "#6c4d37";
  if (type === "scimitarWarrior") return "#6f5d48";
  if (type === "minotaur") return "#6d5a42";
  if (type === "hornKnightRider") return "#7faa5c";
  if (type === "rhinoMan") return unit.rhinoRage ? "#8b5f45" : "#6f7370";
  if (type === "javelinThrower") return "#8fbd6b";
  if (type === "goblinVulture") return "#756a55";
  if (type === "undeadVulture") return "#d8d0c8";
  if (type === "boneThrower") return "#d8d0c8";
  if (type === "undead") return "#b8b0a5";
  if (type === "ghoul") return "#7f8f68";
  if (type === "candlelight") return "#766487";
  if (type === "reaper") return "#55505f";
  if (type === "deadCorpse") return "#72836c";
  if (type === "medusa") return "#587a5f";
  if (type === "poisonZombie") return "#6bd28f";
  if (type === "necromancer") return "#4d405f";
  if (type === "bomber") return "#f09a47";
  if (type === "demonArcher") return "#d05b8f";
  if (type === "darkKnight") return "#55505f";
  if (type === "darkKnightBrother") return "#3f3b4a";
  if (type === "executioner") return "#6f4b46";
  if (type === "chaosGiant") return "#493b4e";
  if (type === "superGiant") return "#2f2634";
  if (type === "undeadMage") return "#766487";
  if (type === "suikai") return "#4c4058";
  return "#e2675d";
}

function getHeadColor(unit) {
  if (isReaperStealthed(unit)) return "#a0a0a0";
  if (unit.type === "miner" && factionForSide(unit.side) === "element") return "#8a5b32";
  if (unit.type === "miner" && unit.earthMiner) return "#8a5b32";
  if (unit.type === "earthElement") return "#c0a36d";
  if (unit.type === "waterElement") return "#b8f0ff";
  if (unit.type === "fireElement") return "#ffd08a";
  if (unit.type === "fireImp") return "#ffe0a3";
  if (unit.type === "windElement") return "#ffffff";
  if (unit.type === "treeEnt") return "#9fc082";
  if (unit.type === "waterScorpion") return "#b8f0ff";
  if (unit.type === "rog") return "#ffb35f";
  if (unit.type === "dreadfire") return "#ff8963";
  if (unit.type === "redflame") return "#ffd08a";
  if (unit.type === "stormLich") return "#d7f6ff";
  if (unit.type === "prometheus") return "#ffe0a3";
  if (unit.type === "zeus") return "#f0e8ff";
  if (unit.type === "hurricane") return "#ffffff";
  if (unit.type === "hill") return "#d6c090";
  if (unit.type === "linghan") return "#d8f8ff";
  if (unit.type === "scaldStrike") return "#ffd08a";
  if (unit.type === "electricGate") return "#d7f6ee";
  if (unit.type === "vUnit") return "#ffffff";
  if (unit.type === "vClone") return "#d7ceff";
  if (unit.type === "summoner") return "#d8c8e8";
  if (unit.type === "wraithMiner") return "#d7f6ff";
  if (unit.type === "gnawMiner") return "#d8efa2";
  if (unit.type === "crawler") return "#cde69b";
  if (unit.type === "poisonBug") return "#e2ff8a";
  if (unit.type === "swarmWorm") return "#d8c87a";
  if (unit.type === "broodMother") return "#f0d892";
  if (unit.type === "locust") return "#f2f0a0";
  if (unit.type === "ashWorm") return "#ffb45e";
  if (unit.type === "blastBug") return "#ffd08a";
  if (unit.type === "ironAnt") return "#cbd6bd";
  if (unit.type === "heavyAnt") return "#d8e8cc";
  if (unit.type === "antQueen") return "#f0d892";
  if (unit.type === "spider") return "#d8e8cc";
  if (unit.type === "giantSpider") return "#e4ecd6";
  if (unit.type === "caterpillar") return "#d8ff8a";
  if (unit.type === "hoodCaterpillar") return "#e4ecd6";
  if (unit.type === "corrosiveSpitter") return "#d8ff8a";
  if (unit.type === "boneStinger") return "#e6e1b2";
  if (unit.type === "lurker") return "#cde69b";
  if (unit.type === "orc") return "#b8d68a";
  if (unit.type === "berserkOrc") return "#c8a36f";
  if (unit.type === "goblin") return unit.goblinBurrowed ? "#7a705f" : "#cde69b";
  if (unit.type === "goblinExpert") return "#d8e8a8";
  if (unit.type === "shaman") return "#d7f0a8";
  if (unit.type === "priest") return "#e0c8ff";
  if (unit.type === "apeMan" || unit.type === "summonedApeMan") return "#c89668";
  if (unit.type === "scimitarWarrior") return "#d0b078";
  if (unit.type === "minotaur") return "#b8d68a";
  if (unit.type === "hornKnightRider") return "#b8d68a";
  if (unit.type === "rhinoMan") return unit.rhinoRage ? "#ffb06b" : "#c8d0c8";
  if (unit.type === "javelinThrower") return "#cde69b";
  if (unit.type === "goblinVulture") return "#d7c090";
  if (unit.type === "undeadVulture") return "#7ed8ff";
  if (unit.type === "boneThrower") return "#f0eadc";
  if (unit.type === "griffinBomber") return "#e0b36d";
  if (unit.type === "candlelight") return "#e8ddcf";
  if (unit.type === "reaper") return "#d8d0c8";
  if (unit.type === "mage") return "#d7ceff";
  if (unit.type === "stoneGolem") return "#d6c090";
  if (unit.type === "commander") return "#fff1a8";
  if (unit.type === "barricadeEngineer") return "#e0c08a";
  if (unit.type === "covenantGuard") return "#f8eac5";
  if (unit.type === "goldenArcher") return "#fff1a8";
  if (unit.type === "goldenSpartan") return "#fff1a8";
  if (unit.type === "ironCavalry") return "#dbe8ff";
  if (unit.type === "shotgunner") return "#dbe8ff";
  if (unit.type === "orderMiniBomb") return "#ffce7a";
  if (unit.type === "berserker") return "#ffd0bd";
  if (unit.type === "archmage") return "#f0e8ff";
  if (unit.type === "archon") return "#dbe8ff";
  if (unit.type === "monk") return "#fff4d0";
  if (unit.type === "catapult") return "#c0a36d";
  if (unit.type === "undeadCatapult") return "#d8c8e8";
  if (unit.type === "enslavedGiant") return "#c0a36d";
  if (unit.type === "undeadMage") return "#d8c8e8";
  if (unit.type === "necromancer") return "#d8c8e8";
  if (unit.type === "suikai") return "#ece1ff";
  if (unit.type === "chaosGiant") return "#c7b0d8";
  if (unit.type === "superGiant") return "#e0c8ff";
  if (unit.type === "ghoul") return "#d4d7a0";
  if (factionForSide(unit.side) !== "chaos") return getUnitColor(unit);
  if (unit.type === "creeper") return "#b8b0a5";
  if (unit.type === "undead") return "#9ee06b";
  if (unit.type === "darkKnightBrother") return "#d8ccff";
  if (unit.type === "executioner") return "#e0beb8";
  if (unit.type === "deadCorpse") return "#93d96b";
  if (unit.type === "medusa") return "#d8f6b8";
  return getUnitColor(unit);
}

function drawTreeEntUnit(unit) {
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const sway = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#3e5f38";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(sway * 1.5, -6);
  ctx.quadraticCurveTo(sway * 6, -38, sway * 2, -72);
  ctx.moveTo(-6, -38);
  ctx.quadraticCurveTo(-20 + counter * 8, -50 - liftB * 5, -33 + counter * 12, -58 + liftB * 3);
  ctx.moveTo(6, -44);
  ctx.quadraticCurveTo(19 + sway * 8, -59 - liftA * 5, 34 + sway * 12, -66 + liftA * 3);
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(-13 + sway * 6, -13 - liftA * 5, -22 + sway * 10, -6 - liftA * 4);
  ctx.moveTo(0, -24);
  ctx.quadraticCurveTo(13 + counter * 6, -13 - liftB * 5, 21 + counter * 10, -6 - liftB * 4);
  ctx.stroke();

  ctx.fillStyle = "#6f8f4f";
  ctx.fillRect(-15, -42, 30, 38);
  ctx.fillStyle = "#87b66b";
  ctx.beginPath();
  ctx.arc(-28, -68, 18, 0, Math.PI * 2);
  ctx.arc(-7, -86, 23, 0, Math.PI * 2);
  ctx.arc(20, -77, 21, 0, Math.PI * 2);
  ctx.arc(35, -58, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2d4b2d";
  ctx.fillRect(-8, -34, 6, 8);
  ctx.fillRect(7, -34, 6, 8);
  drawUnitHp(unit);
}

function drawHurricaneUnit(unit) {
  const phase = getWalkPhase(unit);
  const spin = phase * 0.18;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#d7f6ee";
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i += 1) {
    const y = -78 + i * 18 + Math.sin(phase + i) * 1.8;
    const radius = 35 - i * 7;
    ctx.beginPath();
    ctx.ellipse(Math.sin(phase + i) * 2.4, y, radius, 8 + i * 2, -0.22 + spin, Math.PI * 0.08, Math.PI * 1.72);
    ctx.stroke();
  }
  ctx.strokeStyle = "#7ed8ff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-30, -76);
  ctx.lineTo(8, -57);
  ctx.lineTo(-8, -42);
  ctx.lineTo(28, -25);
  ctx.stroke();
  ctx.fillStyle = "rgba(215, 246, 238, 0.22)";
  ctx.beginPath();
  ctx.moveTo(-24, -82);
  ctx.quadraticCurveTo(38, -64, 20, -9);
  ctx.quadraticCurveTo(-6, 4, -18, -9);
  ctx.quadraticCurveTo(8, -42, -24, -82);
  ctx.fill();
  drawUnitHp(unit);
}

function drawMedusaUnit(unit) {
  ctx.lineCap = "round";

  ctx.fillStyle = "#b9e6a3";
  ctx.strokeStyle = "#4d6f48";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-14, -45);
  ctx.lineTo(14, -45);
  ctx.lineTo(20, 0);
  ctx.lineTo(-20, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(147, 217, 107, 0.24)";
  ctx.beginPath();
  ctx.ellipse(0, -16, 22, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#405c36";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-12, -46);
  ctx.quadraticCurveTo(-24, -70, -38, -61);
  ctx.moveTo(12, -46);
  ctx.quadraticCurveTo(24, -70, 38, -61);
  ctx.stroke();

  ctx.strokeStyle = "#93d96b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-6, -68);
  ctx.quadraticCurveTo(-24, -88, -35, -75);
  ctx.moveTo(6, -68);
  ctx.quadraticCurveTo(24, -88, 35, -75);
  ctx.stroke();

  ctx.fillStyle = "#d8f6b8";
  ctx.strokeStyle = "#1d241b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -66, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f0c94a";
  ctx.beginPath();
  ctx.moveTo(-13, -78);
  ctx.lineTo(-7, -94);
  ctx.lineTo(0, -80);
  ctx.lineTo(8, -94);
  ctx.lineTo(14, -78);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#6f5520";
  ctx.lineWidth = 2;
  ctx.stroke();

  drawUnitHp(unit);
}

function drawBoneGiantUnit(unit) {
  const walk = getWalkAmount(unit);
  const phase = getWalkPhase(unit);
  const step = Math.sin(phase) * walk;
  const counter = Math.sin(phase + Math.PI) * walk;
  const liftA = Math.max(0, Math.sin(phase)) * walk;
  const liftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
  const lean = step * 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#d8d0c8";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(lean * 0.4, -52);
  ctx.quadraticCurveTo(lean, -30, 0, -8);
  ctx.moveTo(-28, -34);
  ctx.quadraticCurveTo(-10 + counter * 10, -41 - liftB * 4, 28 + counter * 8, -34 + liftB * 3);
  ctx.moveTo(-16, -8);
  ctx.quadraticCurveTo(-24 + step * 11, 10 - liftA * 7, -29 + step * 16, 34 - liftA * 5);
  ctx.moveTo(16, -8);
  ctx.quadraticCurveTo(24 + counter * 11, 10 - liftB * 7, 30 + counter * 16, 34 - liftB * 5);
  ctx.stroke();
  ctx.strokeStyle = "#1c1b1a";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#d8d0c8";
  ctx.strokeStyle = "#1c1b1a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(0, -72, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1c1b1a";
  ctx.beginPath();
  ctx.arc(-7, -75, 3.5, 0, Math.PI * 2);
  ctx.arc(7, -75, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d8d0c8";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(18, -36);
  ctx.quadraticCurveTo(35 + counter * 8, -59 - liftB * 6, 54 + counter * 10, -70 + liftB * 4);
  ctx.stroke();
  ctx.fillStyle = "#6f7680";
  ctx.strokeStyle = "#25282c";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(48, -75);
  ctx.lineTo(78, -65);
  ctx.lineTo(64, -38);
  ctx.lineTo(38, -49);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  drawUnitHp(unit);
}

function drawStoneWeapon(scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "#8a7348";
  ctx.beginPath();
  ctx.moveTo(17, -46);
  ctx.lineTo(36, -61);
  ctx.lineTo(57, -50);
  ctx.lineTo(50, -28);
  ctx.lineTo(24, -25);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#4c3e28";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "rgba(225, 205, 150, 0.55)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(27, -47);
  ctx.lineTo(38, -54);
  ctx.moveTo(39, -34);
  ctx.lineTo(49, -42);
  ctx.stroke();
  ctx.restore();
}

function drawWeapon(type, unit = null) {
  const walk = unit ? getWalkAmount(unit) : 0;
  const phase = unit ? getWalkPhase(unit) : 0;
  const sway = Math.sin(phase + Math.PI) * walk;
  ctx.save();
  if (walk > 0 && !["miner", "swordsman", "waterElement", "vUnit", "vClone"].includes(type)) {
    ctx.translate(sway * 2.2, Math.max(0, -sway) * 1.2);
    ctx.rotate(sway * 0.035);
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#e7dfc7";
  ctx.lineWidth = 3;
  if (type === "miner") {
    ctx.beginPath();
    ctx.moveTo(16, -38);
    ctx.lineTo(29, -55);
    ctx.moveTo(21, -52);
    ctx.lineTo(37, -43);
    ctx.stroke();
  } else if (type === "summoner") {
    ctx.strokeStyle = "#d8c8e8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, -24);
    ctx.lineTo(42, -78);
    ctx.stroke();
    ctx.fillStyle = "#7ed8ff";
    ctx.beginPath();
    ctx.arc(44, -82, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "wraithMiner") {
    ctx.strokeStyle = "#7ed8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(14, -34);
    ctx.lineTo(34, -56);
    ctx.moveTo(23, -52);
    ctx.lineTo(42, -43);
    ctx.stroke();
    ctx.fillStyle = "rgba(126, 216, 255, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, -28, 18, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "gnawMiner") {
    ctx.strokeStyle = "#d8efa2";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14, -36);
    ctx.lineTo(32, -52);
    ctx.moveTo(19, -48);
    ctx.lineTo(39, -40);
    ctx.stroke();
    ctx.fillStyle = "#3f4f26";
    ctx.beginPath();
    ctx.moveTo(23, -29);
    ctx.lineTo(34, -34);
    ctx.lineTo(29, -22);
    ctx.closePath();
    ctx.fill();
  } else if (type === "crawler") {
    ctx.strokeStyle = "#cde69b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, -30);
    ctx.lineTo(36, -39);
    ctx.moveTo(13, -25);
    ctx.lineTo(33, -19);
    ctx.moveTo(23, -35);
    ctx.lineTo(42, -48);
    ctx.stroke();
  } else if (type === "poisonBug") {
    ctx.fillStyle = "rgba(183, 224, 107, 0.28)";
    ctx.beginPath();
    ctx.arc(25, -35, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e2ff8a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -31);
    ctx.lineTo(42, -39);
    ctx.moveTo(18, -47);
    ctx.lineTo(31, -20);
    ctx.stroke();
  } else if (type === "swarmWorm") {
    ctx.strokeStyle = "#d8c87a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(2, -28);
    ctx.quadraticCurveTo(19, -48, 44, -34);
    ctx.stroke();
    ctx.strokeStyle = "#4c3f20";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(30, -37);
    ctx.lineTo(44, -45);
    ctx.moveTo(31, -32);
    ctx.lineTo(45, -25);
    ctx.stroke();
  } else if (type === "broodMother" || type === "ashWorm") {
    ctx.strokeStyle = type === "broodMother" ? "#f0d892" : "#ffb45e";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.quadraticCurveTo(22, -60, 54, -34);
    ctx.stroke();
    ctx.fillStyle = type === "broodMother" ? "rgba(240,216,146,0.32)" : "rgba(255,138,61,0.25)";
    ctx.beginPath();
    ctx.ellipse(25, -38, 28, 18, -0.12, 0, Math.PI * 2);
    ctx.fill();
    if (type === "ashWorm") {
      ctx.fillStyle = "#ff8a3d";
      ctx.beginPath();
      ctx.arc(48, -38, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "locust") {
    ctx.strokeStyle = "#f2f0a0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -34);
    ctx.lineTo(40, -42);
    ctx.moveTo(19, -45);
    ctx.lineTo(36, -68);
    ctx.moveTo(19, -38);
    ctx.lineTo(38, -18);
    ctx.stroke();
    ctx.fillStyle = "rgba(242,240,160,0.28)";
    ctx.beginPath();
    ctx.ellipse(26, -50, 22, 9, -0.35, 0, Math.PI * 2);
    ctx.ellipse(28, -31, 20, 8, 0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "blastBug") {
    ctx.fillStyle = "rgba(255,138,61,0.35)";
    ctx.beginPath();
    ctx.arc(26, -35, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffd08a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, -31);
    ctx.lineTo(42, -39);
    ctx.moveTo(20, -49);
    ctx.lineTo(33, -21);
    ctx.stroke();
  } else if (type === "ironAnt" || type === "heavyAnt") {
    ctx.strokeStyle = type === "heavyAnt" ? "#d8e8cc" : "#cbd6bd";
    ctx.lineWidth = type === "heavyAnt" ? 6 : 4;
    ctx.beginPath();
    ctx.moveTo(8, -30);
    ctx.lineTo(39, -42);
    ctx.moveTo(12, -24);
    ctx.lineTo(38, -18);
    ctx.moveTo(24, -44);
    ctx.lineTo(45, -58);
    ctx.stroke();
    ctx.fillStyle = "rgba(205, 230, 155, 0.22)";
    ctx.beginPath();
    ctx.ellipse(22, -34, type === "heavyAnt" ? 22 : 16, type === "heavyAnt" ? 14 : 10, -0.22, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "antQueen") {
    ctx.strokeStyle = "#f0d892";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14, -32);
    ctx.lineTo(42, -54);
    ctx.moveTo(10, -25);
    ctx.lineTo(43, -20);
    ctx.stroke();
    ctx.fillStyle = "rgba(240, 216, 146, 0.34)";
    ctx.beginPath();
    ctx.ellipse(26, -42, 23, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "spider" || type === "giantSpider") {
    const big = type === "giantSpider";
    ctx.strokeStyle = big ? "#e4ecd6" : "#d8e8cc";
    ctx.lineWidth = big ? 5 : 4;
    ctx.fillStyle = big ? "rgba(228,236,214,0.22)" : "rgba(205,230,155,0.2)";
    ctx.beginPath();
    ctx.ellipse(23, -36, big ? 23 : 17, big ? 16 : 12, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      const y = -48 + i * 8;
      ctx.moveTo(12, y);
      ctx.lineTo(42, y - 16);
      ctx.moveTo(13, y);
      ctx.lineTo(41, y + 14);
    }
    ctx.stroke();
  } else if (type === "caterpillar" || type === "hoodCaterpillar") {
    const hood = type === "hoodCaterpillar";
    ctx.strokeStyle = hood ? "#e4ecd6" : "#d8ff8a";
    ctx.lineWidth = hood ? 5 : 4;
    ctx.beginPath();
    ctx.moveTo(4, -28);
    ctx.quadraticCurveTo(18, -52, 40, -42);
    ctx.quadraticCurveTo(55, -35, 46, -24);
    ctx.stroke();
    ctx.fillStyle = hood ? "rgba(228,236,214,0.28)" : "rgba(216,255,138,0.22)";
    ctx.beginPath();
    ctx.ellipse(27, -38, hood ? 25 : 20, hood ? 15 : 12, -0.12, 0, Math.PI * 2);
    ctx.fill();
    if (hood) {
      ctx.strokeStyle = "#cde69b";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(41, -52, 14, Math.PI * 0.15, Math.PI * 1.15);
      ctx.stroke();
    }
    ctx.fillStyle = "#cde69b";
    ctx.beginPath();
    ctx.arc(49, -39, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "corrosiveSpitter") {
    ctx.fillStyle = "rgba(183, 224, 107, 0.32)";
    ctx.beginPath();
    ctx.arc(34, -49, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8ff8a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(11, -31);
    ctx.lineTo(43, -50);
    ctx.moveTo(23, -51);
    ctx.lineTo(47, -35);
    ctx.stroke();
  } else if (type === "boneStinger" || type === "lurker") {
    ctx.strokeStyle = type === "lurker" ? "#cde69b" : "#e6e1b2";
    ctx.lineWidth = type === "lurker" ? 5 : 4;
    ctx.beginPath();
    ctx.moveTo(10, -30);
    ctx.lineTo(48, -45);
    ctx.moveTo(36, -57);
    ctx.lineTo(48, -45);
    ctx.lineTo(43, -30);
    ctx.stroke();
    if ((unit?.boneStingerBurrowTimer ?? 0) > 0 || type === "lurker") {
      ctx.fillStyle = "rgba(90, 74, 42, 0.32)";
      ctx.beginPath();
      ctx.ellipse(4, -7, 34, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "graveDigger") {
    ctx.strokeStyle = "#d8d0c8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(17, -34);
    ctx.lineTo(45, -62);
    ctx.stroke();
    ctx.fillStyle = "#6f7680";
    ctx.strokeStyle = "#25282c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(50, -66, 12, 7, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === "bannerBearer") {
    ctx.strokeStyle = "#d8d0c8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, -18);
    ctx.lineTo(20, -94);
    ctx.stroke();
    ctx.fillStyle = unit?.inspiringTimer > 0 ? "#d8d0ff" : "#7d6aa8";
    ctx.strokeStyle = "#2d2948";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(22, -92);
    ctx.lineTo(58, -82);
    ctx.lineTo(22, -66);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "swordsman") {
    ctx.strokeStyle = "#f2f6f8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(17, -34);
    ctx.lineTo(42, -58);
    ctx.stroke();
    ctx.strokeStyle = "#aab7c2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(24, -36);
    ctx.lineTo(32, -28);
    ctx.stroke();
  } else if (type === "greatsword" || type === "berserker") {
    ctx.strokeStyle = "#f2f6f8";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(15, -31);
    ctx.lineTo(48, -66);
    ctx.stroke();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#aab7c2";
    ctx.beginPath();
    ctx.moveTo(25, -35);
    ctx.lineTo(38, -23);
    ctx.stroke();
  } else if (type === "spartan" || type === "goldenSpartan") {
    ctx.strokeStyle = type === "goldenSpartan" ? "#f7d66b" : "#c8a35a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(13, -35);
    ctx.lineTo(70, -57);
    ctx.stroke();
    ctx.fillStyle = type === "goldenSpartan" ? "#fff0a8" : "#f2f6f8";
    ctx.beginPath();
    ctx.moveTo(70, -57);
    ctx.lineTo(56, -61);
    ctx.lineTo(61, -47);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = type === "goldenSpartan" ? "#d7a92e" : "#aab7c2";
    ctx.beginPath();
    ctx.moveTo(12, -48);
    ctx.lineTo(28, -42);
    ctx.lineTo(25, -21);
    ctx.lineTo(9, -26);
    ctx.closePath();
    ctx.fill();
  } else if (type === "archon") {
    ctx.strokeStyle = "#7e5a35";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -34);
    ctx.lineTo(38, -48);
    ctx.stroke();
    ctx.fillStyle = "#8a6a46";
    ctx.beginPath();
    ctx.arc(43, -51, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9fc0ff";
    ctx.strokeStyle = "#dbe8ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(3, -58);
    ctx.lineTo(25, -52);
    ctx.lineTo(23, -18);
    ctx.lineTo(1, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (type === "spearman") {
    ctx.strokeStyle = "#c8a35a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, -34);
    ctx.lineTo(79, -64);
    ctx.stroke();
    ctx.fillStyle = "#dfe8ff";
    ctx.beginPath();
    ctx.moveTo(79, -64);
    ctx.lineTo(66, -67);
    ctx.lineTo(70, -55);
    ctx.closePath();
    ctx.fill();
  } else if (type === "javelinThrower") {
    ctx.strokeStyle = "#b7d38a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, -36);
    ctx.lineTo(64, -48);
    ctx.stroke();
    ctx.fillStyle = "#93d96b";
    ctx.beginPath();
    ctx.moveTo(64, -48);
    ctx.lineTo(52, -53);
    ctx.lineTo(55, -40);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(147, 217, 107, 0.45)";
    ctx.beginPath();
    ctx.arc(66, -48, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "goblinVulture") {
    ctx.strokeStyle = "#2e2d2a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, -41);
    ctx.lineTo(45, -38);
    ctx.moveTo(33, -50);
    ctx.lineTo(33, -27);
    ctx.stroke();
    ctx.strokeStyle = "#b7d38a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-8, -54);
    ctx.quadraticCurveTo(-38, -84, -64, -52);
    ctx.moveTo(6, -54);
    ctx.quadraticCurveTo(42, -86, 64, -50);
    ctx.stroke();
  } else if (type === "undeadVulture") {
    ctx.strokeStyle = "#d8d0c8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-34, -50);
    ctx.lineTo(-10, -42);
    ctx.lineTo(12, -42);
    ctx.lineTo(38, -50);
    ctx.moveTo(-10, -42);
    ctx.lineTo(-24, -18);
    ctx.moveTo(12, -42);
    ctx.lineTo(24, -18);
    ctx.stroke();
    ctx.strokeStyle = "#b8b0a5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-9, -53);
    ctx.lineTo(9, -53);
    ctx.moveTo(-8, -47);
    ctx.lineTo(8, -47);
    ctx.moveTo(-7, -41);
    ctx.lineTo(7, -41);
    ctx.stroke();
    ctx.strokeStyle = "#d8d0c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const lx = -16 - i * 10;
      ctx.moveTo(-11, -45);
      ctx.lineTo(lx, -67 + Math.sin(i) * 5);
      const rx = 16 + i * 10;
      ctx.moveTo(11, -45);
      ctx.lineTo(rx, -67 + Math.sin(i) * 5);
    }
    ctx.stroke();
    ctx.fillStyle = "rgba(126, 216, 255, 0.6)";
    ctx.strokeStyle = "#d7f6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, -35, 15, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#7ed8ff";
    ctx.beginPath();
    ctx.arc(0, -35, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "griffinBomber") {
    ctx.strokeStyle = "#3a2a1b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(8, -42);
    ctx.lineTo(48, -40);
    ctx.moveTo(35, -54);
    ctx.lineTo(35, -28);
    ctx.stroke();
    ctx.strokeStyle = "#d0a05c";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-12, -53);
    ctx.quadraticCurveTo(-58, -100, -86, -54);
    ctx.moveTo(8, -53);
    ctx.quadraticCurveTo(58, -100, 88, -52);
    ctx.stroke();
    ctx.fillStyle = "#2f2c2a";
    for (let i = 0; i < Math.min(unit?.griffinAmmo ?? 0, UNIT.griffinBomber.ammo); i += 1) {
      ctx.beginPath();
      ctx.arc(-27 + i * 10, -22, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === "monk") {
    ctx.strokeStyle = "#f4e7b7";
    ctx.beginPath();
    ctx.moveTo(20, -58);
    ctx.lineTo(20, -22);
    ctx.moveTo(9, -48);
    ctx.lineTo(31, -48);
    ctx.stroke();
  } else if (type === "crossbow") {
    ctx.strokeStyle = "#8c552e";
    ctx.beginPath();
    ctx.moveTo(13, -34);
    ctx.lineTo(42, -34);
    ctx.moveTo(32, -47);
    ctx.lineTo(32, -21);
    ctx.stroke();
    ctx.strokeStyle = "#eadfbf";
    ctx.beginPath();
    ctx.moveTo(42, -34);
    ctx.lineTo(54, -34);
    ctx.stroke();
  } else if (type === "musketeer") {
    ctx.strokeStyle = "#2e2d2a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(13, -35);
    ctx.lineTo(58, -39);
    ctx.stroke();
    ctx.strokeStyle = "#c7b17a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(19, -31);
    ctx.lineTo(31, -23);
    ctx.stroke();
  } else if (type === "shotgunner") {
    ctx.strokeStyle = "#2e2d2a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(12, -36);
    ctx.lineTo(55, -39);
    ctx.stroke();
    ctx.strokeStyle = "#8a6a46";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(49, -42);
    ctx.lineTo(67, -44);
    ctx.stroke();
    ctx.strokeStyle = "#dbe8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, -31);
    ctx.lineTo(31, -22);
    ctx.stroke();
  } else if (type === "orderMiniBomb") {
    ctx.fillStyle = "#2f2c2a";
    ctx.beginPath();
    ctx.arc(0, -34, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffce7a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -45);
    ctx.quadraticCurveTo(18, -58, 30, -53);
    ctx.stroke();
  } else if (type === "mage") {
    ctx.strokeStyle = "#d7ceff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(16, -22);
    ctx.lineTo(34, -63);
    ctx.stroke();
    ctx.fillStyle = "#b88cff";
    ctx.beginPath();
    ctx.arc(36, -66, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "stoneGolem") {
    ctx.strokeStyle = "#6f6452";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(11, -49);
    ctx.lineTo(33, -56);
    ctx.moveTo(33, -56);
    ctx.lineTo(48, -38);
    ctx.stroke();
    ctx.fillStyle = "#a99a7a";
    [-10, 10, 28].forEach((x, index) => {
      ctx.beginPath();
      ctx.arc(x, -50 - index * 5, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === "archmage") {
    ctx.strokeStyle = "#d7ceff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -22);
    ctx.lineTo(34, -68);
    ctx.stroke();
    ctx.fillStyle = "#9ee8ff";
    ctx.beginPath();
    ctx.arc(37, -72, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b88cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(37, -72, 15, 0, Math.PI * 1.55);
    ctx.stroke();
  } else if (type === "stormLich") {
    ctx.strokeStyle = "#7fa7b8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -23);
    ctx.quadraticCurveTo(24, -48, 35, -70);
    ctx.stroke();
    ctx.strokeStyle = "#d7f6ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(29, -66);
    ctx.lineTo(39, -80);
    ctx.lineTo(48, -66);
    ctx.lineTo(36, -70);
    ctx.lineTo(29, -66);
    ctx.stroke();
    ctx.fillStyle = "rgba(158, 232, 255, 0.55)";
    ctx.beginPath();
    ctx.arc(39, -73, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#9ee8ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(44, -78);
    ctx.lineTo(54, -88);
    ctx.moveTo(46, -69);
    ctx.lineTo(58, -65);
    ctx.stroke();
  } else if (type === "enslavedGiant") {
    ctx.strokeStyle = "#c0a36d";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(17, -30);
    ctx.lineTo(45, -54);
    ctx.stroke();
    ctx.fillStyle = "#8b6f46";
    ctx.beginPath();
    ctx.arc(49, -57, 12, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "orc") {
    ctx.strokeStyle = "#3d4d2b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -31);
    ctx.lineTo(42, -45);
    ctx.stroke();
  } else if (type === "berserkOrc") {
    ctx.strokeStyle = "#30251f";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -27);
    ctx.lineTo(42, -55);
    ctx.stroke();
    ctx.fillStyle = "#7b7f80";
    ctx.beginPath();
    ctx.moveTo(38, -59);
    ctx.lineTo(57, -54);
    ctx.lineTo(50, -36);
    ctx.lineTo(34, -43);
    ctx.closePath();
    ctx.fill();
  } else if (type === "goblin") {
    if (unit?.goblinBurrowed) {
      ctx.fillStyle = "#4a4034";
      ctx.beginPath();
      ctx.ellipse(0, -20, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d0b078";
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.strokeStyle = "#3d4d2b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(12, -30);
      ctx.lineTo(36, -42);
      ctx.stroke();
      ctx.fillStyle = "#2f2c2a";
      for (let i = 0; i < (unit?.goblinMineAmmo ?? 0); i += 1) {
        ctx.beginPath();
        ctx.arc(-20 + i * 8, -26, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (unit?.goblinPlantTimer > 0) {
        ctx.strokeStyle = "#ffce7a";
        ctx.beginPath();
        ctx.arc(28, -18, 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (type === "goblinExpert") {
    ctx.strokeStyle = "#3d4d2b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(12, -30);
    ctx.lineTo(36, -45);
    ctx.stroke();
    ctx.fillStyle = "#b7d38a";
    ctx.strokeStyle = "#2f3a32";
    ctx.lineWidth = 2;
    [-14, -2, 10].forEach((x, index) => {
      ctx.beginPath();
      ctx.roundRect(x, -35 - index * 4, 10, 13, 3);
      ctx.fill();
      ctx.stroke();
    });
    ctx.strokeStyle = "#ffce7a";
    ctx.beginPath();
    ctx.arc(38, -47, 8, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === "shaman") {
    ctx.strokeStyle = "#31482b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(16, -22);
    ctx.lineTo(34, -66);
    ctx.stroke();
    ctx.fillStyle = "#8ee88a";
    ctx.strokeStyle = "#e3ffd0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(36, -70, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "rgba(142, 232, 138, 0.9)";
    ctx.beginPath();
    ctx.arc(36, -70, 15, Math.PI * 0.1, Math.PI * 1.85);
    ctx.stroke();
  } else if (type === "priest") {
    ctx.strokeStyle = "#3e2a54";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -22);
    ctx.lineTo(34, -62);
    ctx.stroke();
    ctx.fillStyle = "#c8a0ff";
    ctx.beginPath();
    ctx.arc(36, -66, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#f1e6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(28, -74);
    ctx.lineTo(44, -58);
    ctx.moveTo(44, -74);
    ctx.lineTo(28, -58);
    ctx.stroke();
  } else if (type === "apeMan" || type === "summonedApeMan") {
    ctx.strokeStyle = "#3a2418";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(20, -28);
    ctx.lineTo(48, -38);
    ctx.stroke();
    ctx.fillStyle = "#8c5d3b";
    ctx.beginPath();
    ctx.arc(52, -40, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "scimitarWarrior") {
    ctx.fillStyle = "#4e463a";
    ctx.strokeStyle = "#211c18";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-4, -55);
    ctx.lineTo(23, -48);
    ctx.lineTo(20, -18);
    ctx.lineTo(-8, -25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#252024";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -30);
    ctx.quadraticCurveTo(42, -68, 68, -49);
    ctx.stroke();
    ctx.fillStyle = "#8a7a88";
    ctx.beginPath();
    ctx.moveTo(55, -56);
    ctx.quadraticCurveTo(76, -55, 73, -35);
    ctx.quadraticCurveTo(64, -45, 55, -56);
    ctx.fill();
  } else if (type === "minotaur") {
    const beastStep = Math.sin(phase) * walk;
    const beastCounter = Math.sin(phase + Math.PI) * walk;
    const beastLiftA = Math.max(0, Math.sin(phase)) * walk;
    const beastLiftB = Math.max(0, Math.sin(phase + Math.PI)) * walk;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.fillStyle = "#5f513b";
    ctx.strokeStyle = "#211c18";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(-4, -35, 44, 23, -0.06, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#4f4535";
    ctx.beginPath();
    ctx.ellipse(36, -48, 24, 18, -0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#f0d0a0";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(51, -54);
    ctx.quadraticCurveTo(81, -65, 92, -42);
    ctx.moveTo(48, -43);
    ctx.quadraticCurveTo(74, -40, 86, -18);
    ctx.stroke();
    ctx.strokeStyle = "#2f2418";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-25, -18);
    ctx.quadraticCurveTo(-34 + beastStep * 8, -6 - beastLiftA * 5, -36 + beastStep * 12, 5 - beastLiftA * 4);
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(-6 + beastCounter * 8, -4 - beastLiftB * 5, -5 + beastCounter * 12, 7 - beastLiftB * 4);
    ctx.moveTo(22, -18);
    ctx.quadraticCurveTo(30 + beastStep * 7, -5 - beastLiftA * 4, 29 + beastStep * 11, 5 - beastLiftA * 3);
    ctx.stroke();
    ctx.fillStyle = "#7faa5c";
    ctx.strokeStyle = "#1f2518";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-4, -70, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#2f2418";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-5, -58);
    ctx.lineTo(-6, -38);
    ctx.moveTo(-9, -52);
    ctx.quadraticCurveTo(-18 + beastCounter * 7, -62 - beastLiftB * 4, -28 + beastCounter * 10, -63 + beastLiftB * 3);
    ctx.moveTo(0, -52);
    ctx.quadraticCurveTo(10 + beastStep * 7, -62 - beastLiftA * 4, 20 + beastStep * 10, -63 + beastLiftA * 3);
    ctx.stroke();
    ctx.fillStyle = "#7b7f80";
    ctx.strokeStyle = "#211c18";
    ctx.lineWidth = 2;
    [
      [-31, -64, -1],
      [23, -64, 1],
    ].forEach(([x, y, dir]) => {
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + dir * 16, y - 4);
      ctx.lineTo(x + dir * 9, y + 11);
      ctx.lineTo(x - dir * 6, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else if (type === "hornKnightRider") {
    ctx.strokeStyle = "#2f2418";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(11, -40);
    ctx.lineTo(38, -58);
    ctx.moveTo(-8, -40);
    ctx.lineTo(-36, -58);
    ctx.stroke();
    ctx.fillStyle = "#7b7f80";
    ctx.strokeStyle = "#211c18";
    ctx.lineWidth = 2;
    [
      [41, -60, 1],
      [-39, -60, -1],
    ].forEach(([x, y, dir]) => {
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x + dir * 16, y - 4);
      ctx.lineTo(x + dir * 9, y + 11);
      ctx.lineTo(x - dir * 6, y + 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  } else if (type === "rhinoMan") {
    ctx.strokeStyle = unit?.rhinoRage ? "#ff8a3d" : "#2f3330";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(15, -30);
    ctx.lineTo(45, -53);
    ctx.stroke();
    ctx.strokeStyle = "#d8d0b8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(2, -78);
    ctx.lineTo(18, -105);
    ctx.stroke();
    ctx.fillStyle = "#59605d";
    ctx.strokeStyle = "#222725";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -83);
    ctx.quadraticCurveTo(-62, -72, -64, -36);
    ctx.quadraticCurveTo(-48, -12, -13, -28);
    ctx.quadraticCurveTo(-3, -56, -18, -83);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#c8d0c8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-43, -71);
    ctx.lineTo(-37, -25);
    ctx.moveTo(-58, -50);
    ctx.lineTo(-13, -44);
    ctx.stroke();
  } else if (type === "creeper" || type === "largeCreeper" || type === "ghoul") {
    ctx.strokeStyle = "#c7b08f";
    ctx.beginPath();
    ctx.moveTo(12, -29);
    ctx.lineTo(38, -28);
    ctx.moveTo(16, -21);
    ctx.lineTo(41, -18);
    ctx.stroke();
  } else if (type === "undead") {
    ctx.fillStyle = "#9ee06b";
    ctx.save();
    ctx.translate(29, -38);
    ctx.rotate(0.12);
    ctx.fillRect(-3, -4, 30, 8);
    ctx.restore();
  } else if (type === "candlelight") {
    const fire = unit?.candleForm === "fire";
    ctx.fillStyle = "#e8ddcf";
    ctx.strokeStyle = "#2d2135";
    ctx.lineWidth = 2;
    ctx.fillRect(-5, -91, 10, 17);
    ctx.strokeRect(-5, -91, 10, 17);
    ctx.fillStyle = fire ? "#ff9b45" : "#9ee8ff";
    ctx.shadowColor = fire ? "#ff9b45" : "#9ee8ff";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(0, -105);
    ctx.quadraticCurveTo(fire ? 10 : 7, -94, 0, -86);
    ctx.quadraticCurveTo(fire ? -8 : -6, -96, 0, -105);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = fire ? "#ffce7a" : "#d7f6ff";
    ctx.beginPath();
    ctx.moveTo(15, -34);
    ctx.lineTo(44, -48);
    ctx.stroke();
  } else if (type === "reaper" || type === "deathGod" || type === "deathGodClone") {
    const isClone = type === "deathGodClone";
    const isDeathGod = type === "deathGod";
    if (isClone) ctx.globalAlpha *= 0.72;
    ctx.strokeStyle = unit?.reaperStealthTimer > 0 || isClone ? "#9a9a9a" : isDeathGod ? "#151018" : "#2d2135";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -22);
    ctx.lineTo(isDeathGod ? 39 : 35, isDeathGod ? -76 : -66);
    ctx.stroke();
    ctx.strokeStyle = unit?.reaperStealthTimer > 0 || isClone ? "#c2c2c2" : isDeathGod ? "#f1e6ff" : "#d8d0c8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(isDeathGod ? 38 : 34, isDeathGod ? -76 : -66);
    ctx.quadraticCurveTo(isDeathGod ? 72 : 62, isDeathGod ? -84 : -72, isDeathGod ? 72 : 62, isDeathGod ? -49 : -43);
    ctx.stroke();
  } else if (type === "machete") {
    ctx.strokeStyle = "#2f2832";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -31);
    ctx.quadraticCurveTo(34, -59, 55, -51);
    ctx.stroke();
    ctx.fillStyle = "#8a7a88";
    ctx.beginPath();
    ctx.moveTo(43, -55);
    ctx.quadraticCurveTo(59, -57, 58, -42);
    ctx.quadraticCurveTo(49, -48, 43, -55);
    ctx.fill();
  } else if (type === "deadCorpse") {
    ctx.strokeStyle = "#5b6f4e";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(13, -30);
    ctx.lineTo(39, -24);
    ctx.moveTo(19, -42);
    ctx.lineTo(41, -50);
    ctx.stroke();
    ctx.fillStyle = "rgba(147, 217, 107, 0.4)";
    ctx.beginPath();
    ctx.arc(34, -41, 7, 0, Math.PI * 2);
    ctx.arc(45, -30, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "medusa") {
    ctx.strokeStyle = "#93d96b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(10, -34);
    ctx.lineTo(46, -48);
    ctx.moveTo(4, -52);
    ctx.quadraticCurveTo(20, -78, 40, -66);
    ctx.moveTo(-4, -52);
    ctx.quadraticCurveTo(-24, -78, -42, -64);
    ctx.stroke();
    ctx.fillStyle = "rgba(147, 217, 107, 0.35)";
    ctx.beginPath();
    ctx.arc(48, -48, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "poisonZombie") {
    ctx.strokeStyle = "#8ef076";
    ctx.beginPath();
    ctx.arc(30, -36, 18, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(142, 240, 118, 0.35)";
    ctx.beginPath();
    ctx.arc(46, -41, 6, 0, Math.PI * 2);
    ctx.arc(53, -31, 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "boneThrower") {
    ctx.strokeStyle = "#f0eadc";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(16, -30);
    ctx.lineTo(48, -48);
    ctx.stroke();
    ctx.strokeStyle = "#9a8f82";
    ctx.lineWidth = 3;
    ctx.strokeRect(-28, -48, 18, 26);
    ctx.strokeStyle = "#f0eadc";
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-25 + i * 4, -44);
      ctx.lineTo(-20 + i * 4, -27);
      ctx.stroke();
    }
  } else if (type === "demonArcher") {
    ctx.strokeStyle = "#251729";
    ctx.beginPath();
    ctx.arc(30, -37, 24, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = "#ff7cb1";
    ctx.beginPath();
    ctx.moveTo(28, -61);
    ctx.lineTo(28, -13);
    ctx.moveTo(36, -38);
    ctx.lineTo(58, -40);
    ctx.stroke();
  } else if (type === "undeadMage") {
    ctx.strokeStyle = "#2d2135";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(14, -25);
    ctx.lineTo(31, -60);
    ctx.stroke();
    ctx.strokeStyle = "#d8c8e8";
    ctx.beginPath();
    ctx.moveTo(22, -39);
    ctx.lineTo(48, -47);
    ctx.stroke();
    ctx.fillStyle = "rgba(184, 176, 165, 0.45)";
    ctx.beginPath();
    ctx.arc(50, -48, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "necromancer") {
    ctx.fillStyle = "#2d2135";
    ctx.strokeStyle = "#d8c8e8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, -70);
    ctx.quadraticCurveTo(0, -88, 19, -70);
    ctx.lineTo(12, -18);
    ctx.quadraticCurveTo(0, -10, -13, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#1b1420";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -25);
    ctx.lineTo(32, -62);
    ctx.stroke();
    ctx.strokeStyle = "#b8b0e8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(23, -44);
    ctx.lineTo(52, -50);
    ctx.stroke();
    ctx.fillStyle = "rgba(184, 176, 232, 0.55)";
    ctx.beginPath();
    ctx.arc(55, -51, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "suikai") {
    ctx.strokeStyle = "#2d2135";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(15, -23);
    ctx.lineTo(36, -64);
    ctx.stroke();
    ctx.strokeStyle = "#ece1ff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(34, -64);
    ctx.quadraticCurveTo(59, -70, 57, -42);
    ctx.stroke();
    ctx.fillStyle = "rgba(216, 200, 232, 0.45)";
    ctx.beginPath();
    ctx.arc(57, -42, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "chaosGiant" || type === "superGiant") {
    ctx.strokeStyle = "#1f1a24";
    ctx.lineWidth = type === "superGiant" ? 8 : 6;
    ctx.beginPath();
    ctx.moveTo(16, -31);
    ctx.lineTo(type === "superGiant" ? 58 : 47, type === "superGiant" ? -62 : -55);
    ctx.stroke();
    ctx.fillStyle = type === "superGiant" ? "#2f2634" : "#493b4e";
    ctx.fillRect(39, -65, type === "superGiant" ? 24 : 18, type === "superGiant" ? 24 : 18);
  } else if (type === "hill") {
    drawStoneWeapon(1.25);
  } else if (type === "linghan") {
    ctx.strokeStyle = "#d8f8ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(12, -28);
    ctx.lineTo(42, -64);
    ctx.stroke();
    ctx.fillStyle = "#9ee8ff";
    ctx.beginPath();
    ctx.arc(45, -68, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#5ca8d8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(45, -68, 17, 0, Math.PI * 1.7);
    ctx.stroke();
  } else if (type === "earthElement") {
    drawStoneWeapon(1);
  } else if (type === "waterElement") {
    return;
  } else if (type === "fireElement" || type === "fireImp") {
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.arc(type === "fireImp" ? 32 : 42, type === "fireImp" ? -35 : -40, type === "fireImp" ? 9 : 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.moveTo(type === "fireImp" ? 30 : 39, type === "fireImp" ? -44 : -53);
    ctx.lineTo(type === "fireImp" ? 38 : 48, type === "fireImp" ? -36 : -42);
    ctx.lineTo(type === "fireImp" ? 30 : 37, type === "fireImp" ? -27 : -31);
    ctx.lineTo(type === "fireImp" ? 24 : 31, type === "fireImp" ? -36 : -42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd08a";
    ctx.beginPath();
    ctx.arc(type === "fireImp" ? 33 : 44, type === "fireImp" ? -36 : -41, type === "fireImp" ? 4 : 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "dreadfire" || type === "redflame" || type === "prometheus") {
    ctx.strokeStyle = "#3a1718";
    ctx.lineWidth = type === "redflame" || type === "prometheus" ? 7 : 5;
    ctx.beginPath();
    ctx.moveTo(14, -25);
    ctx.lineTo(type === "redflame" || type === "prometheus" ? 37 : 31, type === "redflame" || type === "prometheus" ? -70 : -63);
    ctx.stroke();
    ctx.fillStyle = "#ff6a3a";
    ctx.beginPath();
    ctx.arc(type === "redflame" || type === "prometheus" ? 42 : 34, type === "redflame" || type === "prometheus" ? -72 : -66, type === "prometheus" ? 14 : type === "redflame" ? 12 : 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 122, 61, 0.45)";
    ctx.beginPath();
    ctx.moveTo(type === "redflame" ? 50 : 45, -52);
    ctx.lineTo(type === "redflame" ? 68 : 60, -40);
    ctx.lineTo(type === "redflame" ? 50 : 45, -30);
    ctx.closePath();
    ctx.fill();
  } else if (type === "windElement") {
    ctx.strokeStyle = "#9ee8ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(39, -65);
    ctx.lineTo(27, -42);
    ctx.lineTo(42, -42);
    ctx.lineTo(31, -17);
    ctx.stroke();
  } else if (type === "zeus") {
    ctx.strokeStyle = "#d7f6ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(16, -24);
    ctx.lineTo(34, -62);
    ctx.lineTo(25, -55);
    ctx.moveTo(34, -62);
    ctx.lineTo(44, -47);
    ctx.stroke();
  } else if (type === "hurricane") {
    ctx.strokeStyle = "#d7f6ee";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(27, -42, 18, -Math.PI * 0.2, Math.PI * 1.2);
    ctx.arc(34, -44, 10, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();
    ctx.strokeStyle = "#9ee8ff";
    ctx.beginPath();
    ctx.moveTo(42, -34);
    ctx.lineTo(60, -41);
    ctx.stroke();
  } else if (type === "scaldStrike") {
    ctx.fillStyle = "#72c8e8";
    ctx.beginPath();
    ctx.arc(30, -43, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.moveTo(27, -61);
    ctx.lineTo(40, -45);
    ctx.lineTo(29, -27);
    ctx.lineTo(20, -43);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffd08a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(42, -38, 10, 0, Math.PI * 1.7);
    ctx.stroke();
  } else if (type === "electricGate") {
    ctx.strokeStyle = "#9ee8ff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(0, -72);
    ctx.moveTo(28, -12);
    ctx.lineTo(28, -72);
    ctx.stroke();
    ctx.strokeStyle = "#d7f6ee";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(5, -42);
    ctx.lineTo(17, -58);
    ctx.lineTo(13, -42);
    ctx.lineTo(24, -55);
    ctx.stroke();
  } else if (type === "vUnit" || type === "vClone") {
    return;
  } else if (type === "treeEnt") {
    ctx.strokeStyle = "#3e5f38";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(0, -68);
    ctx.moveTo(-14, -50);
    ctx.lineTo(16, -64);
    ctx.moveTo(11, -43);
    ctx.lineTo(37, -55);
    ctx.stroke();
    ctx.fillStyle = "#87b66b";
    ctx.beginPath();
    ctx.arc(-12, -65, 11, 0, Math.PI * 2);
    ctx.arc(8, -75, 14, 0, Math.PI * 2);
    ctx.arc(25, -62, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "waterScorpion") {
    ctx.strokeStyle = "#56a8c8";
    ctx.beginPath();
    ctx.moveTo(4, -28);
    ctx.lineTo(35, -25);
    ctx.moveTo(10, -33);
    ctx.lineTo(0, -43);
    ctx.moveTo(28, -31);
    ctx.lineTo(44, -44);
    ctx.moveTo(22, -24);
    ctx.lineTo(36, -12);
    ctx.stroke();
  } else if (type === "rog") {
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#4a2c22";
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.lineTo(0, -58);
    ctx.moveTo(0, -42);
    ctx.lineTo(34, -55);
    ctx.moveTo(0, -42);
    ctx.lineTo(-18, -54);
    ctx.stroke();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.arc(23, -56, 9, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "bomber") {
    ctx.fillStyle = "#27221d";
    ctx.beginPath();
    ctx.arc(31, -35, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffce7a";
    ctx.beginPath();
    ctx.moveTo(36, -45);
    ctx.lineTo(45, -56);
    ctx.stroke();
  } else if (type === "darkKnight" || type === "darkKnightBrother" || type === "executioner") {
    ctx.lineWidth = 5;
    ctx.strokeStyle = type === "executioner" ? "#3d2723" : type === "darkKnightBrother" ? "#17151d" : "#1f1f26";
    ctx.beginPath();
    ctx.moveTo(15, -32);
    ctx.lineTo(type === "executioner" ? 52 : type === "darkKnightBrother" ? 50 : 45, type === "darkKnightBrother" ? -59 : -55);
    ctx.stroke();
    ctx.fillStyle = type === "executioner" ? "#6f4b46" : type === "darkKnightBrother" ? "#262231" : "#34313d";
    ctx.fillRect(type === "executioner" ? 42 : -11, type === "executioner" ? -63 : type === "darkKnightBrother" ? -53 : -49, type === "executioner" ? 22 : type === "darkKnightBrother" ? 26 : 22, type === "executioner" ? 18 : type === "darkKnightBrother" ? 26 : 22);
  } else {
    ctx.strokeStyle = "#7b4b28";
    ctx.beginPath();
    ctx.arc(28, -37, 22, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = "#eee6c9";
    ctx.beginPath();
    ctx.moveTo(28, -59);
    ctx.lineTo(28, -15);
    ctx.stroke();
  }
  ctx.restore();
}

function drawUnitHp(unit) {
  ctx.scale(unit.side === "player" ? 1 : -1, 1);
  if (unit.hp < unit.maxHp) {
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(-19, -86, 38, 5);
    ctx.fillStyle = "#6ee07c";
    ctx.fillRect(-19, -86, 38 * (unit.hp / unit.maxHp), 5);
  }
  if (unit.maxShieldHp > 0 && unit.shieldHp > 0) {
    ctx.fillStyle = "#9fc0ff";
    ctx.fillRect(-19, -93, 38 * (unit.shieldHp / unit.maxShieldHp), 4);
  }
  if ((unit.armorReduction ?? 0) > 0 || unit.heavyArmorTimer > 0) {
    const reduction = Math.max(unit.armorReduction ?? 0, unit.heavyArmorTimer > 0 ? unit.heavyArmorReduction ?? 0 : 0);
    ctx.fillStyle = unit.heavyArmorTimer > 0 ? "#ffce7a" : "#b7d38a";
    ctx.fillRect(-19, -99, 38 * Math.min(1, reduction), 4);
  }

  if (unit.poisonTimer > 0) {
    ctx.fillStyle = "#93d96b";
    ctx.beginPath();
    ctx.arc(24, -84, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (unit.burnTimer > 0 || unit.stackedBurns?.length) {
    ctx.fillStyle = "#ff9b45";
    ctx.beginPath();
    ctx.arc(31, -84, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (unit.stickyBombs?.length) {
    ctx.fillStyle = "#ffce7a";
    ctx.beginPath();
    ctx.arc(0, -102, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2b2418";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = "#ffefb0";
    ctx.beginPath();
    ctx.moveTo(3, -107);
    ctx.lineTo(8, -112);
    ctx.stroke();
  }

  if (unit.stunTimer > 0) {
    ctx.fillStyle = "#d7b978";
    ctx.fillRect(-8, -98, 16, 4);
  }

  if (unit.fearTimer > 0) {
    ctx.strokeStyle = "#d8d0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -101, 9, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (unit.inspiredReviveReady || unit.inspiredZombieTimer > 0 || unit.inspiredLifestealTimer > 0 || unit.inspiringTimer > 0) {
    ctx.strokeStyle = unit.inspiredZombieTimer > 0 ? "#93d96b" : "#d8d0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -55, 31, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (unit.frozenBy || unit.boundTargetId) {
    ctx.strokeStyle = "#b8f0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -45, 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (isMiningWorker(unit)) {
    const bagSize = getMiningBagSize(unit);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(-18, -77, 36, 5);
    ctx.fillStyle = unit.type === "wraithMiner" ? "#7ed8ff" : getResourceColor(getCarryResource(unit), unit.side === "player");
    ctx.fillRect(-18, -77, 36 * (unit.carry / bagSize), 5);
  }
}

function getInspectedUnitInfoLayout(unit) {
  const data = UNIT[unit.type] ?? {};
  const canChooseMineResource = isPlayerControlledSide(unit.side) && isMiningWorker(unit);
  const stats = [
    { id: "hp", label: "生命", value: formatStat(unit.maxHp), valueColor: "#e94f4f" },
    { id: "speed", label: "移速", value: formatStat(unit.speed ?? data.speed ?? 0), valueColor: "#4f8cff" },
    { id: "damage", label: "攻击", value: formatStat(getUnitBasicDamage(unit)), valueColor: "#111111" },
  ];
  const lines = [
    data.name ?? unit.type,
    ...stats.map((stat) => `${stat.label} ${stat.value}`),
  ];
  ctx.save();
  ctx.font = "700 14px system-ui, sans-serif";
  const width = Math.max(...lines.map((line) => ctx.measureText(line).width), 88) + 28;
  ctx.restore();
  const height = canChooseMineResource ? 154 : 124;
  const x = Math.max(10, Math.min(FIELD.width - width - 10, unit.x - width / 2));
  const y = Math.max(12, unit.y - (UNIT[unit.type]?.flying ? 126 : 112) - height);
  const resourceButtons = canChooseMineResource
    ? {
      gold: { x: x + 14, y: y + height - 64, width: (width - 34) / 2, height: 24 },
      magic: { x: x + 20 + (width - 34) / 2, y: y + height - 64, width: (width - 34) / 2, height: 24 },
    }
    : null;
  return {
    x,
    y,
    width,
    height,
    lines,
    stats,
    resourceButtons,
    controlButton: {
      x: x + 14,
      y: y + height - 34,
      width: width - 28,
      height: 25,
    },
  };
}

function drawInspectedUnitInfo() {
  if (!state.inspectedUnitId || state.inspectedUnitTimer <= 0) return;
  const unit = state.units.find((candidate) => candidate.id === state.inspectedUnitId && candidate.hp > 0 && !isUnitHidden(candidate));
  if (!unit) return;

  const layout = getInspectedUnitInfoLayout(unit);
  const { x, y, width, height, lines, stats, controlButton } = layout;
  ctx.save();
  ctx.fillStyle = "rgba(18, 22, 24, 0.86)";
  ctx.strokeStyle = unit.side === "player" ? "#75a7ff" : "#ff9b8d";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f8eac5";
  ctx.textAlign = "center";
  ctx.font = "700 14px system-ui, sans-serif";
  ctx.fillText(lines[0], x + width / 2, y + 20);
  stats.forEach((stat, index) => {
    drawInfoStatRow(stat, x + 14, y + 37 + index * 18, width - 28);
  });

  if (layout.resourceButtons) {
    const current = getMinerResource(unit);
    Object.entries(layout.resourceButtons).forEach(([resource, button]) => {
      const active = current === resource;
      ctx.fillStyle = active ? "rgba(230, 184, 74, 0.9)" : "rgba(255, 255, 255, 0.12)";
      ctx.beginPath();
      ctx.roundRect(button.x, button.y, button.width, button.height, 6);
      ctx.fill();
      ctx.fillStyle = active ? "#17140e" : "#f5f0df";
      ctx.font = "800 11px system-ui, sans-serif";
      ctx.fillText(resource === "magic" ? "挖魔力" : "挖金矿", button.x + button.width / 2, button.y + 16);
    });
  }

  const controlled = state.controlledUnitId === unit.id;
  ctx.fillStyle = controlled ? "rgba(230, 184, 74, 0.92)" : "rgba(117, 167, 255, 0.78)";
  ctx.beginPath();
  ctx.roundRect(controlButton.x, controlButton.y, controlButton.width, controlButton.height, 6);
  ctx.fill();
  ctx.fillStyle = controlled ? "#16140f" : "#f5f0df";
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.fillText(controlled ? "解除接管" : "接管控制", controlButton.x + controlButton.width / 2, controlButton.y + 17);

  ctx.fillStyle = "rgba(18, 22, 24, 0.86)";
  ctx.beginPath();
  ctx.moveTo(unit.x - 8, y + height - 1);
  ctx.lineTo(unit.x + 8, y + height - 1);
  ctx.lineTo(unit.x, y + height + 9);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawInfoStatRow(stat, x, y, width) {
  const iconX = x + 10;
  const textX = x + 26;
  ctx.save();
  if (stat.id === "hp") drawHeartIcon(iconX, y - 4, "#e94f4f");
  if (stat.id === "speed") drawRunnerIcon(iconX, y - 5, "#4f8cff");
  if (stat.id === "damage") drawKeyIcon(iconX, y - 4, "#111111");
  ctx.textAlign = "left";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillStyle = "#d9d0b8";
  ctx.fillText(`${stat.label}`, textX, y);
  ctx.textAlign = "right";
  ctx.font = "900 13px system-ui, sans-serif";
  if (stat.id === "damage") {
    const pillWidth = Math.max(26, ctx.measureText(stat.value).width + 12);
    ctx.fillStyle = "rgba(245, 240, 223, 0.88)";
    ctx.beginPath();
    ctx.roundRect(x + width - pillWidth, y - 13, pillWidth, 17, 6);
    ctx.fill();
  }
  ctx.fillStyle = stat.valueColor;
  ctx.fillText(stat.value, x + width - 6, y);
  ctx.restore();
}

function drawHeartIcon(x, y, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + 8);
  ctx.bezierCurveTo(x - 11, y, x - 5, y - 8, x, y - 3);
  ctx.bezierCurveTo(x + 5, y - 8, x + 11, y, x, y + 8);
  ctx.fill();
  ctx.restore();
}

function drawKeyIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x - 4, y, 4.5, 0, Math.PI * 2);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 9, y);
  ctx.moveTo(x + 5, y);
  ctx.lineTo(x + 5, y + 4);
  ctx.moveTo(x + 9, y);
  ctx.lineTo(x + 9, y + 3);
  ctx.stroke();
  ctx.restore();
}

function drawRunnerIcon(x, y, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.arc(x, y - 6, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 1, y - 2);
  ctx.lineTo(x + 3, y + 3);
  ctx.lineTo(x + 9, y + 3);
  ctx.moveTo(x + 1, y);
  ctx.lineTo(x - 7, y + 1);
  ctx.moveTo(x + 3, y + 3);
  ctx.lineTo(x - 2, y + 9);
  ctx.moveTo(x + 4, y + 3);
  ctx.lineTo(x + 9, y + 9);
  ctx.stroke();
  ctx.restore();
}

function drawControlledUnitMarker() {
  const unit = getControlledUnit();
  if (!unit || isUnitHidden(unit)) return;
  ctx.save();
  ctx.translate(unit.x, unit.y + 11);
  ctx.scale(1.25, 0.34);
  ctx.rotate(-0.05);
  ctx.fillStyle = "rgba(230, 184, 74, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, 5, 28, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  drawFlatStarPath(0, 0, 24, 10);
  ctx.fillStyle = "#f5d14f";
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = "#7a5619";
  ctx.stroke();
  ctx.restore();
}

function drawFlatStarPath(x, y, outerRadius, innerRadius) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawManualControlPanel() {
  const controlled = getControlledUnit();
  const groupUnits = controlled ? [] : getSelectedGroupUnits();
  const unit = controlled ?? groupUnits[0];
  if (!unit || isUnitHidden(unit)) return;
  const buttons = getManualControlButtons(unit);
  if (!buttons.length) return;
  const isGroup = !controlled && groupUnits.length > 0;
  const rect = getVisibleWorldRect();
  const panel = getManualPanelRect(buttons, rect);
  ctx.save();
  ctx.fillStyle = "rgba(16, 20, 22, 0.78)";
  ctx.strokeStyle = "rgba(230, 184, 74, 0.48)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.width, panel.height, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f8eac5";
  ctx.font = "900 16px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(isGroup ? `框选：${UNIT[unit.type]?.name ?? unit.type} x${groupUnits.length}` : `接管：${UNIT[unit.type]?.name ?? unit.type}`, panel.x + 14, panel.y + 24);
  ctx.fillStyle = "#cfc6ad";
  ctx.font = "700 12px system-ui, sans-serif";
  ctx.fillText(isGroup ? "点地移动，点敌人集火" : "方向键/WASD、点地或摇杆移动", panel.x + 14, panel.y + 42);
  const pendingAction = isGroup ? state.pendingGroupAction : state.pendingManualAction;
  if (pendingAction) {
    ctx.fillStyle = "#f5d14f";
    ctx.font = "800 13px system-ui, sans-serif";
    ctx.fillText("点击战场选择释放位置", panel.x + 14, panel.y + 58);
  }

  buttons.forEach((button) => {
    const disabled = isGroup ? isGroupButtonDisabled(button) : isManualButtonDisabled(unit, button);
    ctx.fillStyle = button.id === pendingAction?.id
      ? "rgba(230, 184, 74, 0.86)"
      : disabled
        ? "rgba(80, 84, 88, 0.72)"
        : "rgba(36, 44, 50, 0.92)";
    ctx.strokeStyle = disabled ? "rgba(255,255,255,0.12)" : "rgba(230, 184, 74, 0.48)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(button.x, button.y, button.width, button.height, 8);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = disabled ? "rgba(245,240,223,0.48)" : "#f5f0df";
    ctx.font = "900 13px system-ui, sans-serif";
    ctx.fillText(button.label, button.x + button.width / 2, button.y + 21);
    ctx.font = "700 11px system-ui, sans-serif";
    ctx.fillStyle = disabled ? "rgba(245,240,223,0.34)" : "#cfc6ad";
    ctx.fillText(button.mode === "direct" ? "立即" : "点地", button.x + button.width / 2, button.y + 38);
  });
  ctx.restore();
}

function drawManualMoveTarget() {
  if (!state.manualMoveTarget || !getControlledUnit()) return;
  const target = state.manualMoveTarget;
  ctx.save();
  ctx.strokeStyle = "#f5d14f";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.86;
  ctx.beginPath();
  ctx.ellipse(target.x, target.y + 8, 28, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(target.x - 16, target.y + 8);
  ctx.lineTo(target.x + 16, target.y + 8);
  ctx.moveTo(target.x, target.y - 4);
  ctx.lineTo(target.x, target.y + 20);
  ctx.stroke();
  ctx.restore();
}

function drawGroupMoveTarget() {
  if (!state.groupMoveTarget || !getSelectedGroupUnits().length) return;
  const target = state.groupMoveTarget;
  ctx.save();
  ctx.strokeStyle = "#78d4ff";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.ellipse(target.x, target.y + 8, 34, 12, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(target.x - 20, target.y + 8);
  ctx.lineTo(target.x + 20, target.y + 8);
  ctx.moveTo(target.x, target.y - 8);
  ctx.lineTo(target.x, target.y + 24);
  ctx.stroke();
  ctx.restore();
}

function drawSelectedGroupMarkers() {
  const units = getSelectedGroupUnits();
  if (!units.length) return;
  ctx.save();
  units.forEach((unit) => {
    ctx.strokeStyle = "rgba(120, 212, 255, 0.88)";
    ctx.fillStyle = "rgba(120, 212, 255, 0.14)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(unit.x, unit.y + 10, 22, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.restore();
}

function drawGroupSelectionDrag() {
  if (!groupDrag?.active) return;
  const rect = normalizeRect(groupDrag.start, groupDrag.current);
  ctx.save();
  ctx.fillStyle = "rgba(120, 212, 255, 0.12)";
  ctx.strokeStyle = "rgba(120, 212, 255, 0.9)";
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 7]);
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
  ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  ctx.restore();
}

function drawManualJoystick() {
  if (!getControlledUnit()) return;
  const base = getManualJoystickBase();
  const center = manualJoystick.active && manualJoystick.center ? manualJoystick.center : base;
  const knob = manualJoystick.active && manualJoystick.knob ? manualJoystick.knob : center;
  ctx.save();
  ctx.globalAlpha = manualJoystick.active ? 0.82 : 0.48;
  ctx.fillStyle = "rgba(210, 216, 220, 0.32)";
  ctx.strokeStyle = "rgba(245, 240, 223, 0.46)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(center.x, center.y, 54, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "rgba(230, 235, 238, 0.7)";
  ctx.strokeStyle = "rgba(30, 34, 38, 0.52)";
  ctx.beginPath();
  ctx.arc(knob.x, knob.y, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function getUnitBasicDamage(unit) {
  const data = UNIT[unit.type] ?? {};
  if (unit.type === "mage") return data.damage;
  if (unit.type === "undeadMage") return data.damage;
  if (unit.type === "necromancer") return data.damage;
  if (unit.type === "hurricane") return data.damage;
  if (unit.type === "treeEnt") return data.damage;
  return unit.damage ?? data.damage ?? 0;
}

function formatStat(value) {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function getVisibleWorldRect() {
  const rect = canvas.getBoundingClientRect();
  const scaleX = FIELD.width / Math.max(1, rect.width);
  const scaleY = FIELD.height / Math.max(1, rect.height);
  return {
    x: (battlefieldWrap?.scrollLeft ?? 0) * scaleX,
    y: (battlefieldWrap?.scrollTop ?? 0) * scaleY,
    width: (battlefieldWrap?.clientWidth ?? rect.width) * scaleX,
    height: (battlefieldWrap?.clientHeight ?? rect.height) * scaleY,
  };
}

function getManualJoystickBase() {
  const rect = getVisibleWorldRect();
  return {
    x: rect.x + 86,
    y: rect.y + rect.height - 102,
  };
}

function isInsideManualJoystick(point) {
  if (!getControlledUnit()) return false;
  const base = getManualJoystickBase();
  return distanceTo(point.x, point.y, base.x, base.y) <= 82;
}

function updateManualJoystick(point) {
  const center = manualJoystick.center ?? getManualJoystickBase();
  const maxRadius = 54;
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.hypot(dx, dy);
  const factor = distance > maxRadius ? maxRadius / distance : 1;
  manualJoystick.center = center;
  manualJoystick.knob = {
    x: center.x + dx * factor,
    y: center.y + dy * factor,
  };
  manualJoystick.vector = {
    x: distance ? (dx * factor) / maxRadius : 0,
    y: distance ? (dy * factor) / maxRadius : 0,
  };
}

function getManualPanelRect(buttons, visibleRect = getVisibleWorldRect()) {
  const columns = Math.min(4, Math.max(1, buttons.length));
  const rows = Math.ceil(buttons.length / columns);
  const buttonWidth = 76;
  const buttonHeight = 48;
  const gap = 8;
  const width = 28 + columns * buttonWidth + (columns - 1) * gap;
  const height = 74 + rows * buttonHeight + (rows - 1) * gap;
  const x = visibleRect.x + visibleRect.width - width - 18;
  const y = visibleRect.y + visibleRect.height - height - 18;
  return { x, y, width, height, columns, buttonWidth, buttonHeight, gap };
}

function getManualControlButtons(unit) {
  const actions = getManualActions(unit);
  const panel = getManualPanelRect(actions);
  return actions.map((action, index) => {
    const column = index % panel.columns;
    const row = Math.floor(index / panel.columns);
    return {
      ...action,
      x: panel.x + 14 + column * (panel.buttonWidth + panel.gap),
      y: panel.y + 66 + row * (panel.buttonHeight + panel.gap),
      width: panel.buttonWidth,
      height: panel.buttonHeight,
    };
  });
}

function getManualActions(unit) {
  const actions = [{ id: "attack", label: "普攻", mode: "direct" }];
  const add = (id, label, mode = "point") => actions.push({ id, label, mode });
  switch (unit.type) {
    case "crawler":
      add("evolveGnawMiner", "咀矿者", "direct");
      break;
    case "swordsman":
      add("swordsmanRage", "愤怒", "direct");
      add("jumpSlash", "跳劈", "target");
      break;
    case "spearman":
      if (!unit.spearThrown) add("throwSpear", "投矛", "target");
      break;
    case "archer":
      add("fireArrow", "火箭", "target");
      break;
    case "shotgunner":
      add("shotgunBombs", "小炸弹", "direct");
      break;
    case "spartan":
      add("spartanShield", unit.spartanShieldTimer > 0 ? "收盾" : "举盾", "direct");
      break;
    case "goldenSpartan":
      add("goldenSpear", "黄金矛", "direct");
      add("spartanShield", unit.spartanShieldTimer > 0 ? "收盾" : "举盾", "direct");
      break;
    case "waterElement":
      add("freeze", "冰冻", "target");
      add("waterSacrifice", "水愈", "direct");
      break;
    case "mage":
      add("magicBlast", "魔爆");
      add("iceField", "冰地");
      add("mageWall", "电墙");
      add("mageStoneGolem", "化石", "target");
      break;
    case "commander":
      add("orderMark", "标记", "target");
      break;
    case "barricadeEngineer":
      add("buildBarricade", "拒马", "direct");
      break;
    case "covenantGuard":
      add("covenantGuard", "守约", "target");
      break;
    case "medusa":
      add("medusaSlay", "石化", "target");
      add("medusaPoison", "喷毒", "direct");
      break;
    case "vUnit":
      add("vBlink", "闪现", "direct");
      add(unit.controlledTargetId ? "releaseV" : "vControl", unit.controlledTargetId ? "解除" : "控制", unit.controlledTargetId ? "direct" : "target");
      break;
    case "undeadMage":
      add("undeadSkeletons", "召骷髅", "direct");
      add("undeadSpike", "骨刺", "target");
      add("undeadLure", "勾引", "target");
      break;
    case "suikai":
      add("suikaiPierce", "骨刺", "target");
      add("suikaiCorpses", "死尸", "direct");
      add("suikaiHook", "镰钩", "target");
      break;
    case "treeEnt":
      add("treeRoot", "树根", "target");
      add("toggleRoot", unit.rooted ? "拔根" : "扎根", "direct");
      break;
    case "dreadfire":
      add("fireDragon", "火龙");
      add("meteorRain", "流星");
      break;
    case "redflame":
      add("redFireball", "火球");
      add("redPillars", "熔柱");
      break;
    case "stormLich":
      add("stormCloud", "乌云");
      break;
    case "hurricane":
      add("tornado", "龙卷");
      add("hurricaneShield", "护盾", "direct");
      break;
    case "windElement":
      add("windBolt", "闪电", "target");
      break;
    case "ghoul":
      add("ghoulDevour", "啃食", "direct");
      break;
    case "monk":
      add("monkField", "回血区", "direct");
      break;
    case "goblin":
      actions[0].label = "待命";
      add("goblinBurrow", unit.goblinBurrowed ? "钻出" : "遁地", "direct");
      break;
    case "goblinExpert":
      actions[0].label = "待命";
      add("goblinHeavyArmor", "重甲", "target");
      break;
    case "shaman":
      actions[0].label = "待命";
      break;
    case "priest":
      add("priestSiphon", "献祭", "target");
      add("priestBlood", "血祭", "target");
      break;
    case "candlelight":
      add("toggleCandleForm", unit.candleForm === "fire" ? "冰矩" : "火焰", "direct");
      break;
    case "reaper":
      add("reaperStealth", "隐形", "direct");
      break;
    case "necromancer":
      add("necromancerSummon", "召尸", "direct");
      add("necromancerPlague", "死爆", "target");
      break;
    case "boneThrower":
      add("boneHarvest", "取骨", "direct");
      break;
    case "swarmWorm":
      add("evolveBroodMother", "虫母", "direct");
      add("evolveAshWorm", "灰烬", "direct");
      break;
    case "ironAnt":
      add("evolveHeavyAnt", "重蚁", "direct");
      add("evolveAntQueen", "蚁后", "direct");
      break;
    case "spider":
      add("spiderWeb", "蛛网", "direct");
      add("evolveGiantSpider", "巨蛛", "direct");
      break;
    case "caterpillar":
      add("evolveHoodCaterpillar", "毛帽虫", "direct");
      break;
    case "heavyAnt":
      add("heavyAntDodge", unit.heavyAntDodge ? "免疫中" : "直免", "direct");
      break;
    case "boneStinger":
      add("boneStingerBurrow", "钻地", "direct");
      add("evolveLurker", "潜伏者", "direct");
      break;
    case "bannerBearer":
      add("bannerInspireGroup", `激励:${BANNER_INSPIRE_LABELS[unit.bannerInspireGroup ?? "skeleton"]}`, "direct");
      break;
    case "darkKnight":
      add("darkKnightCharge", "冲刺", "direct");
      break;
    case "deathGod":
      add("deathGodSpikes", "尖刺", "direct");
      add("deathGodClone", "分身", "direct");
      break;
    case "scimitarWarrior":
      add("scimitarRoar", "战吼", "direct");
      break;
    case "minotaur":
      add("rhinoCharge", "冲撞", "direct");
      break;
    case "archmage":
      add("chainLightning", "链雷", "target");
      add("archFireballs", "火球雨", "direct");
      add("arcaneExplosion", "奥爆", "direct");
      break;
    case "prometheus":
      add("prometheusDragon", "火龙");
      add("prometheusImp", "小火人", "direct");
      add("prometheusMeteor", "神流星");
      break;
    case "zeus":
      add("zeusCloud", "雷云");
      add("zeusWall", "电墙");
      add("zeusGate", "电门");
      break;
    case "berserker":
      add("berserkerRage", "狂暴", "direct");
      break;
    case "scaldStrike":
      add("scaldExplode", "爆裂", "direct");
      break;
    default:
      break;
  }
  return actions;
}

function isManualButtonDisabled(unit, button) {
  if (!unit || unit.hp <= 0 || isUnitHidden(unit)) return true;
  if (button.id === "releaseV" || button.id === "toggleRoot" || button.id === "toggleCandleForm" || button.id === "waterSacrifice" || button.id === "scaldExplode" || button.id === "bannerInspireGroup") return false;
  if (button.id === "heavyAntDodge") return false;
  if (button.id === "goblinBurrow") return false;
  if (button.id === "evolveGnawMiner") return !canEvolveSwarmUnit(unit, "gnawMiner");
  if (button.id === "evolveBroodMother") return !canEvolveSwarmUnit(unit, "broodMother");
  if (button.id === "evolveAshWorm") return !canEvolveSwarmUnit(unit, "ashWorm");
  if (button.id === "evolveHeavyAnt" || button.id === "evolveAntQueen") return !canEvolveSwarmUnit(unit, button.id === "evolveHeavyAnt" ? "heavyAnt" : "antQueen");
  if (button.id === "evolveGiantSpider") return !canEvolveSwarmUnit(unit, "giantSpider");
  if (button.id === "evolveHoodCaterpillar") return !canEvolveSwarmUnit(unit, "hoodCaterpillar");
  if (button.id === "evolveLurker") return !canEvolveSwarmUnit(unit, "lurker");
  if (button.id === "spiderWeb" && unit.spiderWebCooldown > 0) return true;
  if (button.id === "boneStingerBurrow" && unit.boneStingerBurrowCooldown > 0) return true;
  if (button.id === "swordsmanRage" && (unit.swordsmanSelfRageTimer > 0 || unit.hp <= UNIT.swordsman.selfRageHpCost)) return true;
  if (button.id === "spartanShield") return unit.spartanShieldTimer <= 0 && unit.spartanShieldCooldown > 0;
  if (button.id === "reaperStealth" && unit.reaperStealthTimer > 0) return true;
  if (button.id === "scimitarRoar" && unit.scimitarRoarTimer > 0) return true;
  if (button.id === "rhinoCharge" && unit.minotaurLeapTimer > 0) return true;
  if (button.id === "darkKnightCharge" && unit.darkKnightChargeTimer > 0) return true;
  if (button.id === "priestSiphon" && unit.priestSiphonTimer > 0) return true;
  if (button.id === "priestBlood" && unit.priestBloodTimer > 0) return true;
  if (button.id === "undeadLure" && unit.undeadLureTimer > 0) return true;
  if (button.id === "monkField" && unit.monkFieldTimer > 0) return true;
  if (button.id === "buildBarricade") return !canStartBuildBarricade(unit);
  if (button.id === "orderMark" && (unit.manualSkillCooldowns?.orderMark ?? 0) > 0) return true;
  if (button.id === "covenantGuard" && (unit.manualSkillCooldowns?.covenantGuard ?? 0) > 0) return true;
  if (button.id === "shotgunBombs" && (unit.manualSkillCooldowns?.shotgunBombs ?? 0) > 0) return true;
  if (button.id === "ghoulDevour" && unit.devourTimer > 0) return true;
  if (button.id === "goldenSpear" && unit.goldenSpearThrown) return true;
  if (button.id === "medusaSlay" && unit.medusaSlayTimer > 0) return true;
  if (button.id === "vControl" && (unit.controlTimer > 0 || unit.controlledTargetId)) return true;
  if (button.id === "deathGodClone" && hasActiveDeathGodClone(unit)) return true;
  if (button.id === "boneHarvest") return !canBoneHarvest(unit);
  if (button.id === "mageStoneGolem") return !findMageStoneGolemTarget(unit);
  if ((unit.manualSkillCooldowns?.[button.id] ?? 0) > 0) return true;
  return button.id !== "attack" && unit.cooldown > 0;
}

function pointInRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function handleInspectedInfoButton(point) {
  if (!state.inspectedUnitId || state.inspectedUnitTimer <= 0) return false;
  const unit = state.units.find((candidate) => candidate.id === state.inspectedUnitId && candidate.hp > 0 && !isUnitHidden(candidate));
  if (!unit) return false;
  const layout = getInspectedUnitInfoLayout(unit);
  if (layout.resourceButtons) {
    if (pointInRect(point, layout.resourceButtons.gold)) {
      setMinerUnitResource(unit, "gold");
      return true;
    }
    if (pointInRect(point, layout.resourceButtons.magic)) {
      setMinerUnitResource(unit, "magic");
      return true;
    }
  }
  if (!pointInRect(point, layout.controlButton)) return false;
  toggleManualControl(unit);
  return true;
}

function setMinerUnitResource(unit, resource) {
  if (!unit || !isMiningWorker(unit) || !isPlayerControlledSide(unit.side)) return false;
  if (unit.carry > 0) {
    popText(unit.x, unit.y - 112, "先运回当前资源", "#f3c963");
    return true;
  }
  unit.miningResource = resource === "magic" ? "magic" : "gold";
  unit.carryResource = unit.miningResource;
  unit.mineSlotId = null;
  unit.mineWorkSlot = null;
  unit.mineTimer = 0;
  popText(unit.x, unit.y - 112, unit.miningResource === "magic" ? "改挖魔力" : "改挖金矿", unit.miningResource === "magic" ? "#b88cff" : "#f5c542");
  return true;
}

function isPointInsideInspectedInfo(point) {
  if (!state.inspectedUnitId || state.inspectedUnitTimer <= 0) return false;
  const unit = state.units.find((candidate) => candidate.id === state.inspectedUnitId && candidate.hp > 0 && !isUnitHidden(candidate));
  if (!unit) return false;
  const layout = getInspectedUnitInfoLayout(unit);
  return pointInRect(point, layout);
}

function toggleManualControl(unit) {
  if (!unit || unit.hp <= 0 || isUnitHidden(unit)) return false;
  if (!isPlayerControlledSide(unit.side)) return false;
  if (state.controlledUnitId === unit.id) {
    state.controlledUnitId = null;
    state.pendingManualAction = null;
    state.manualMoveTarget = null;
    stopManualJoystick();
    popText(unit.x, unit.y - 112, "解除接管", "#f5d14f");
    return true;
  }
  state.controlledUnitId = unit.id;
  state.inspectedUnitId = unit.id;
  state.inspectedUnitTimer = 9999;
  state.pendingManualAction = null;
  state.manualMoveTarget = null;
  state.selectedGroupIds = [];
  state.selectedGroupType = null;
  state.pendingGroupAction = null;
  state.groupAttackTargetId = null;
  state.groupMoveTarget = null;
  unit.inCastle = false;
  popText(unit.x, unit.y - 112, "手动接管", "#f5d14f");
  return true;
}

function handleManualControlClick(point) {
  const unit = getControlledUnit();
  if (!unit || isUnitHidden(unit)) return false;
  if (isPointInsideInspectedInfo(point)) return false;
  const button = getManualControlButtons(unit).find((candidate) => pointInRect(point, candidate));
  if (button) {
    if (isManualButtonDisabled(unit, button)) {
      popText(unit.x, unit.y - 116, getManualDisabledLabel(unit, button), "#d9d0b8");
      return true;
    }
    if (button.mode === "direct") {
      executeManualAction(unit, button, point);
      updateHud();
      return true;
    }
    state.pendingManualAction = { id: button.id, mode: button.mode };
    popText(unit.x, unit.y - 116, `选择${button.label}位置`, "#f5d14f");
    return true;
  }

  const panel = getManualPanelRect(getManualActions(unit));
  if (pointInRect(point, panel)) return true;

  if (!state.pendingManualAction) {
    state.manualMoveTarget = makeManualPointTarget(point);
    popText(unit.x, unit.y - 116, "移动指令", "#f5d14f");
    return true;
  }
  const action = getManualActions(unit).find((candidate) => candidate.id === state.pendingManualAction.id);
  if (action && !isManualButtonDisabled(unit, action)) {
    executeManualAction(unit, action, point);
  }
  state.pendingManualAction = null;
  updateHud();
  return true;
}

function getManualDisabledLabel(unit, button) {
  if (button.id === "goldenSpear" && unit.goldenSpearThrown) return "已使用";
  if (button.id === "medusaSlay" && unit.medusaSlayTimer > 0) return `冷却 ${Math.ceil(unit.medusaSlayTimer)}秒`;
  if (button.id === "vControl" && unit.controlTimer > 0) return `冷却 ${Math.ceil(unit.controlTimer)}秒`;
  if (button.id === "deathGodClone" && hasActiveDeathGodClone(unit)) return "分身存在";
  if (button.id === "boneHarvest") {
    if ((unit.boneAmmo ?? 0) >= UNIT.boneThrower.maxBoneAmmo) return "骨头已满";
    if (!findBoneHarvestCorpse(unit)) return "附近没有敌方尸体";
  }
  if (button.id === "mageStoneGolem" && !findMageStoneGolemTarget(unit)) return "没有可转化目标";
  if (button.id === "evolveGnawMiner") return getSwarmEvolveDisabledLabel(unit, "gnawMiner");
  if (button.id === "evolveBroodMother") return getSwarmEvolveDisabledLabel(unit, "broodMother");
  if (button.id === "evolveAshWorm") return getSwarmEvolveDisabledLabel(unit, "ashWorm");
  if (button.id === "evolveHeavyAnt" || button.id === "evolveAntQueen") return getSwarmEvolveDisabledLabel(unit, button.id === "evolveHeavyAnt" ? "heavyAnt" : "antQueen");
  if (button.id === "evolveGiantSpider") return getSwarmEvolveDisabledLabel(unit, "giantSpider");
  if (button.id === "evolveHoodCaterpillar") return getSwarmEvolveDisabledLabel(unit, "hoodCaterpillar");
  if (button.id === "evolveLurker") return getSwarmEvolveDisabledLabel(unit, "lurker");
  if (button.id === "spiderWeb" && unit.spiderWebCooldown > 0) return `冷却 ${Math.ceil(unit.spiderWebCooldown)}秒`;
  if (button.id === "boneStingerBurrow" && unit.boneStingerBurrowCooldown > 0) return `冷却 ${Math.ceil(unit.boneStingerBurrowCooldown)}秒`;
  if (button.id === "swordsmanRage") {
    if (unit.swordsmanSelfRageTimer > 0) return "愤怒中";
    if (unit.hp <= UNIT.swordsman.selfRageHpCost) return "生命不足";
  }
  if (button.id === "ghoulDevour" && unit.devourTimer > 0) return "正在啃食";
  if (button.id === "reaperStealth" && unit.reaperStealthTimer > 0) return "已隐形";
  if (button.id === "scimitarRoar" && unit.scimitarRoarTimer > 0) return `冷却 ${Math.ceil(unit.scimitarRoarTimer)}秒`;
  if (button.id === "rhinoCharge" && unit.minotaurLeapTimer > 0) return `冷却 ${Math.ceil(unit.minotaurLeapTimer)}秒`;
  if (button.id === "darkKnightCharge" && unit.darkKnightChargeTimer > 0) return `冷却 ${Math.ceil(unit.darkKnightChargeTimer)}秒`;
  if (button.id === "priestSiphon" && unit.priestSiphonTimer > 0) return `冷却 ${Math.ceil(unit.priestSiphonTimer)}秒`;
  if (button.id === "priestBlood" && unit.priestBloodTimer > 0) return `冷却 ${Math.ceil(unit.priestBloodTimer)}秒`;
  if (button.id === "undeadLure" && unit.undeadLureTimer > 0) return `冷却 ${Math.ceil(unit.undeadLureTimer)}秒`;
  if (button.id === "monkField" && unit.monkFieldTimer > 0) return `冷却 ${Math.ceil(unit.monkFieldTimer)}秒`;
  if (button.id === "spartanShield" && unit.spartanShieldCooldown > 0) return `冷却 ${Math.ceil(unit.spartanShieldCooldown)}秒`;
  if (button.id === "buildBarricade") {
    if (unit.barricadeBuildTimer > 0) return "建造中";
    if ((unit.barricadeBuildCooldown ?? 0) > 0) return `冷却 ${Math.ceil(unit.barricadeBuildCooldown)}秒`;
    if (getActiveBarricadeCount(unit) >= UNIT.barricadeEngineer.barricadeMax) return "拒马已满";
    if (getSideGoldAmount(unit.side) < UNIT.barricadeEngineer.barricadeCost) return "金币不足";
  }
  const cooldown = Math.max(unit.cooldown ?? 0, unit.manualSkillCooldowns?.[button.id] ?? 0);
  if (cooldown > 0) return `冷却 ${Math.ceil(cooldown)}秒`;
  return "暂不可用";
}

function executeManualAction(unit, action, point) {
  if (action.id === "attack") {
    manualUnitAttack(unit);
    return;
  }
  if (action.id === "releaseV") {
    releaseVControl(unit, true);
    return;
  }
  if (action.id === "vBlink") {
    castVBlink(unit);
    return;
  }
  if (action.id === "toggleRoot") {
    toggleTreeEntRoot(unit);
    return;
  }
  if (action.id === "toggleCandleForm") {
    toggleCandleForm(unit);
    return;
  }
  if (action.id === "goblinBurrow") {
    toggleGoblinBurrow(unit);
    return;
  }
  if (action.id === "heavyAntDodge") {
    toggleHeavyAntDodge(unit);
    return;
  }
  if (action.id === "boneStingerBurrow") {
    activateBoneStingerBurrow(unit);
    return;
  }
  if (action.id === "spiderWeb") {
    castSpiderWeb(unit);
    return;
  }
  if (action.id === "evolveGnawMiner") {
    evolveSwarmUnit(unit, "gnawMiner");
    return;
  }
  if (action.id === "evolveBroodMother") {
    evolveSwarmUnit(unit, "broodMother");
    return;
  }
  if (action.id === "evolveAshWorm") {
    evolveSwarmUnit(unit, "ashWorm");
    return;
  }
  if (action.id === "evolveHeavyAnt") {
    evolveSwarmUnit(unit, "heavyAnt");
    return;
  }
  if (action.id === "evolveAntQueen") {
    evolveSwarmUnit(unit, "antQueen");
    return;
  }
  if (action.id === "evolveLurker") {
    evolveSwarmUnit(unit, "lurker");
    return;
  }
  if (action.id === "evolveGiantSpider") {
    evolveSwarmUnit(unit, "giantSpider");
    return;
  }
  if (action.id === "evolveHoodCaterpillar") {
    evolveSwarmUnit(unit, "hoodCaterpillar");
    return;
  }
  if (action.id === "spartanShield") {
    toggleSpartanShield(unit);
    return;
  }
  if (action.id === "swordsmanRage") {
    activateSwordsmanRage(unit);
    return;
  }
  if (action.id === "reaperStealth") {
    activateReaperStealth(unit);
    return;
  }
  if (action.id === "deathGodSpikes") {
    castDeathGodSpikes(unit);
    return;
  }
  if (action.id === "deathGodClone") {
    summonDeathGodClone(unit);
    return;
  }
  if (action.id === "necromancerSummon") {
    summonNecromancerZombies(unit);
    return;
  }
  if (action.id === "undeadSkeletons") {
    summonUndeadMageSkeletons(unit);
    return;
  }
  if (action.id === "boneHarvest") {
    harvestBonesFromCorpse(unit);
    return;
  }
  if (action.id === "bannerInspireGroup") {
    cycleBannerInspireGroup(unit);
    return;
  }
  if (action.id === "scimitarRoar") {
    castScimitarRoar(unit);
    return;
  }
  if (action.id === "rhinoCharge") {
    castMinotaurLeap(unit);
    return;
  }
  if (action.id === "darkKnightCharge") {
    castDarkKnightCharge(unit);
    return;
  }
  if (action.id === "monkField") {
    castMonkHealingField(unit);
    return;
  }
  if (action.id === "buildBarricade") {
    startBuildBarricade(unit);
    return;
  }
  if (action.id === "waterSacrifice") {
    sacrificeWaterElement(unit);
    return;
  }
  if (action.id === "goldenSpear") {
    throwGoldenSpear(unit);
    return;
  }
  if (action.id === "shotgunBombs") {
    summonShotgunnerBombs(unit);
    return;
  }
  if (action.id === "scaldExplode") {
    explodeScaldStrike(unit);
    return;
  }
  if (action.id === "ghoulDevour") {
    if (commandGhoulDevour(unit)) {
      unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
      unit.manualSkillCooldowns[action.id] = getManualActionCooldown(unit, action.id);
    }
    return;
  }

  const target = action.mode === "target" ? getManualTargetAt(unit, point, action.id) : makeManualPointTarget(point);
  if (action.mode === "target" && !target) {
    popText(unit.x, unit.y - 116, "没有可用目标", "#d9d0b8");
    return;
  }

  const used = castManualSkill(unit, action.id, target);
  if (!used) return;
  const data = UNIT[unit.type] ?? {};
  unit.cooldown = Math.max(unit.cooldown ?? 0, data.cooldown ?? 1);
  unit.combatTimer = 3;
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns[action.id] = getManualActionCooldown(unit, action.id);
}

function manualUnitAttack(unit) {
  if (unit.type === "goblin" || unit.type === "goblinExpert" || unit.type === "shaman") {
    popText(unit.x, unit.y - 116, `${UNIT[unit.type].name}没有普攻`, "#d9d0b8");
    return;
  }
  const range = Math.max(getUnitRange(unit), 70);
  const target = findManualAttackTarget(unit, range);
  if (!target) {
    popText(unit.x, unit.y - 116, "附近没有目标", "#d9d0b8");
    return;
  }
  if (canAttackFromDistance(unit, target, getUnitRange(unit)) || Math.abs(unit.x - target.x) <= range) {
    attack(unit, target);
    return;
  }
  popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
}

function findManualAttackTarget(unit, range) {
  return state.units
    .filter((target) => areHostileSides(unit.side, target.side) && target.hp > 0 && !isUnitHidden(target) && !UNIT[target.type]?.untargetable && canTarget(unit, target))
    .filter((target) => distanceTo(unit.x, unit.y, target.x, target.y) <= range)
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y))[0] ?? null;
}

function getManualTargetAt(unit, point, actionId = null) {
  if (actionId === "mageStoneGolem") {
    const clickedEnemy = findUnitAt(point);
    if (clickedEnemy && canMageStoneGolem(unit, clickedEnemy)) return clickedEnemy;
    return findMageStoneGolemTarget(unit, point);
  }
  if (actionId === "covenantGuard") {
    const clickedAlly = findUnitAt(point);
    if (clickedAlly && canCovenantGuardAlly(unit, clickedAlly)) return clickedAlly;
    return state.units
      .filter((target) => canCovenantGuardAlly(unit, target))
      .filter((target) => distanceTo(point.x, point.y, target.x, target.y - 48) <= 130)
      .sort((a, b) => distanceTo(point.x, point.y, a.x, a.y - 48) - distanceTo(point.x, point.y, b.x, b.y - 48))[0] ?? null;
  }
  if (actionId === "goblinHeavyArmor") {
    const clickedAlly = findUnitAt(point);
    if (clickedAlly && canReceiveGoblinExpertArmor(unit, clickedAlly)) return clickedAlly;
    return state.units
      .filter((target) => canReceiveGoblinExpertArmor(unit, target))
      .filter((target) => distanceTo(point.x, point.y, target.x, target.y - 48) <= 130)
      .sort((a, b) => distanceTo(point.x, point.y, a.x, a.y - 48) - distanceTo(point.x, point.y, b.x, b.y - 48))[0] ?? null;
  }
  if (actionId === "priestBlood") {
    const clickedAlly = findUnitAt(point);
    if (clickedAlly && canPriestSacrificeAlly(unit, clickedAlly)) return clickedAlly;
    return state.units
      .filter((target) => canPriestSacrificeAlly(unit, target))
      .filter((target) => distanceTo(point.x, point.y, target.x, target.y - 48) <= 130)
      .sort((a, b) => distanceTo(point.x, point.y, a.x, a.y - 48) - distanceTo(point.x, point.y, b.x, b.y - 48))[0] ?? null;
  }
  const clicked = findUnitAt(point);
  if (clicked && areHostileSides(unit.side, clicked.side) && clicked.hp > 0 && canTarget(unit, clicked)) return clicked;
  return state.units
    .filter((target) => areHostileSides(unit.side, target.side) && target.hp > 0 && !isUnitHidden(target) && !UNIT[target.type]?.untargetable && canTarget(unit, target))
    .filter((target) => distanceTo(point.x, point.y, target.x, target.y - 48) <= 130)
    .sort((a, b) => distanceTo(point.x, point.y, a.x, a.y - 48) - distanceTo(point.x, point.y, b.x, b.y - 48))[0] ?? null;
}

function makeManualPointTarget(point) {
  if (state?.fourWay) {
    return {
      kind: "point",
      x: Math.max(30, Math.min(FIELD.width - 30, point.x)),
      y: Math.max(30, Math.min(FIELD.height - 30, point.y)),
    };
  }
  return {
    kind: "point",
    x: Math.max(FIELD.playerBase + 30, Math.min(FIELD.enemyBase - 30, point.x)),
    y: Math.max(FIELD.ground - 150, Math.min(FIELD.ground + 140, point.y)),
  };
}

function normalizeRect(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };
}

function isUnitInSelectionRect(unit, rect) {
  const bodyY = unit.y - 44;
  return unit.x >= rect.x && unit.x <= rect.x + rect.width && bodyY >= rect.y && bodyY <= rect.y + rect.height;
}

function selectGroupByRect(rect) {
  const candidates = state.units.filter((unit) =>
    isPlayerControlledSide(unit.side) &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !UNIT[unit.type]?.untargetable &&
    isUnitInSelectionRect(unit, rect)
  );
  if (!candidates.length) {
    clearSelectedGroup();
    return false;
  }
  const counts = new Map();
  candidates.forEach((unit) => counts.set(unit.type, (counts.get(unit.type) ?? 0) + 1));
  const selectedType = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const selected = candidates.filter((unit) => unit.type === selectedType);
  setSelectedGroup(selected);
  return true;
}

function selectVisibleGroupByUnitAt(point) {
  const unit = findUnitAt(point);
  if (!unit || !isPlayerControlledSide(unit.side) || unit.hp <= 0 || isUnitHidden(unit) || UNIT[unit.type]?.untargetable) return false;
  const visible = getVisibleWorldRect();
  const selected = state.units.filter((candidate) =>
    isPlayerControlledSide(candidate.side) &&
    candidate.type === unit.type &&
    candidate.hp > 0 &&
    !isUnitHidden(candidate) &&
    candidate.x >= visible.x &&
    candidate.x <= visible.x + visible.width &&
    candidate.y >= visible.y &&
    candidate.y <= visible.y + visible.height
  );
  setSelectedGroup(selected);
  return true;
}

function setSelectedGroup(units) {
  if (!units.length) {
    clearSelectedGroup();
    return;
  }
  const type = units[0].type;
  state.selectedGroupIds = units.map((unit) => unit.id);
  state.selectedGroupType = type;
  state.pendingGroupAction = null;
  state.groupAttackTargetId = null;
  state.groupMoveTarget = null;
  state.controlledUnitId = null;
  state.pendingManualAction = null;
  state.manualMoveTarget = null;
  stopManualJoystick();
  const centerX = units.reduce((sum, unit) => sum + unit.x, 0) / units.length;
  const centerY = units.reduce((sum, unit) => sum + unit.y, 0) / units.length;
  popText(centerX, centerY - 112, `框选 ${UNIT[type]?.name ?? type} x${units.length}`, "#78d4ff");
}

function isGroupButtonDisabled(button) {
  const units = getSelectedGroupUnits();
  if (!units.length) return true;
  return !units.some((unit) => !isManualButtonDisabled(unit, button));
}

function handleGroupControlClick(point) {
  const units = getSelectedGroupUnits();
  if (!units.length || getControlledUnit()) return false;
  const representative = units[0];
  const button = getManualControlButtons(representative).find((candidate) => pointInRect(point, candidate));
  if (button) {
    if (isGroupButtonDisabled(button)) {
      popText(representative.x, representative.y - 116, "小队暂不可用", "#d9d0b8");
      return true;
    }
    if (button.mode === "direct") {
      executeGroupAction(button, point);
      updateHud();
      return true;
    }
    state.pendingGroupAction = { id: button.id, mode: button.mode };
    popText(representative.x, representative.y - 116, `小队选择${button.label}位置`, "#78d4ff");
    return true;
  }

  const panel = getManualPanelRect(getManualActions(representative));
  if (pointInRect(point, panel)) return true;

  if (state.pendingGroupAction) {
    const action = getManualActions(representative).find((candidate) => candidate.id === state.pendingGroupAction.id);
    if (action) executeGroupAction(action, point);
    state.pendingGroupAction = null;
    updateHud();
    return true;
  }

  const clicked = findUnitAt(point);
  if (clicked && areHostileSides(representative.side, clicked.side) && clicked.hp > 0 && !isUnitHidden(clicked) && !UNIT[clicked.type]?.untargetable) {
    state.groupAttackTargetId = clicked.id;
    state.groupMoveTarget = null;
    popText(clicked.x, clicked.y - 118, "小队集火", "#78d4ff");
    return true;
  }

  state.groupAttackTargetId = null;
  state.groupMoveTarget = makeManualPointTarget(point);
  popText(state.groupMoveTarget.x, state.groupMoveTarget.y - 42, "小队移动", "#78d4ff");
  return true;
}

function executeGroupAction(action, point) {
  let used = 0;
  const units = getSelectedGroupUnits();
  units.forEach((unit) => {
    if (isManualButtonDisabled(unit, action)) return;
    executeManualAction(unit, action, point);
    used += 1;
  });
  if (!used) return;
  const centerX = units.reduce((sum, unit) => sum + unit.x, 0) / units.length;
  const centerY = units.reduce((sum, unit) => sum + unit.y, 0) / units.length;
  popText(centerX, centerY - 124, `小队释放 ${action.label}`, "#78d4ff");
}

function getManualActionCooldown(unit, id) {
  const data = UNIT[unit.type] ?? {};
  const table = {
    undeadSpike: data.boneSpikeEvery,
    undeadLure: data.lureCooldown,
    undeadSkeletons: data.skeletonSummonCooldown,
    vBlink: data.blinkCooldown,
    deathGodSpikes: data.spikeCooldown,
    deathGodClone: data.cloneCooldown,
    darkKnightCharge: data.chargeCooldown,
    necromancerSummon: data.summonCooldown,
    necromancerPlague: data.plagueCooldown,
    boneHarvest: data.boneHarvestCooldown,
    medusaPoison: data.poisonEvery,
    suikaiCorpses: data.corpseEvery,
    suikaiHook: data.hookEvery,
    hurricaneShield: data.shieldEvery,
    ghoulDevour: data.devourDuration,
    zeusCloud: data.cloudEvery,
    zeusWall: data.columnEvery,
    zeusGate: data.gateEvery,
    archFireballs: data.fireballEvery,
    berserkerRage: data.rageEvery,
    goblinHeavyArmor: UNIT.goblinExpert.heavyArmorDuration,
    priestSiphon: UNIT.priest.siphonCooldown,
    priestBlood: UNIT.priest.bloodSacrificeCooldown,
    swordsmanRage: data.selfRageEvery,
    jumpSlash: data.jumpSlashCooldown,
    fireArrow: data.fireArrowCooldown ?? data.cooldown,
    shotgunBombs: data.bombSkillCooldown,
    orderMark: data.markCooldown,
    buildBarricade: data.barricadeCooldown,
    covenantGuard: data.guardCooldown,
    magicBlast: data.skillCooldown,
    iceField: data.skillCooldown,
    mageWall: data.skillCooldown,
    mageStoneGolem: data.skillCooldown,
  };
  return table[id] ?? data.cooldown ?? 1;
}

function castManualSkill(unit, id, target) {
  switch (id) {
    case "throwSpear":
      throwSpear(unit, target);
      return true;
    case "jumpSlash":
      return castSwordsmanJumpSlash(unit, target);
    case "fireArrow":
      return shootArcherFireArrow(unit, target);
    case "freeze":
      bindFreeze(unit, target);
      return true;
    case "magicBlast":
      castMagicBlast(unit, target);
      return true;
    case "iceField":
      castIceField(unit, target);
      return true;
    case "mageWall":
      castMageElectricWall(unit, target);
      return true;
    case "mageStoneGolem":
      return castMageStoneGolem(unit, target);
    case "medusaSlay":
      if (!canMedusaSlay(unit, target)) {
        popText(unit.x, unit.y - 116, "无法石化", "#93d96b");
        return false;
      }
      target.lastDamageSide = unit.side;
      target.lastDamageUnitId = unit.id;
      target.hp = 0;
      unit.medusaSlayTimer = UNIT.medusa.slayCooldown;
      state.lightning.push({ x1: unit.x, y1: unit.y - 78, x2: target.x, y2: target.y - 64, life: 0.28, duration: 0.28 });
      popText(target.x, target.y - 92, "石化秒杀", "#93d96b");
      return true;
    case "medusaPoison":
      sprayMedusaPoison(unit);
      releaseMedusaCorpses(unit);
      return true;
    case "priestSiphon":
      return castPriestSiphon(unit, target);
    case "priestBlood":
      return castPriestBloodSacrifice(unit, target);
    case "vControl":
      if (!canVControl(unit, target)) {
        popText(unit.x, unit.y - 116, "无法控制", "#d7ceff");
        return false;
      }
      controlTargetWithV(unit, target);
      return true;
    case "undeadSpike":
      castUndeadPierce(unit, target);
      return true;
    case "undeadLure":
      return castUndeadLure(unit, target);
    case "necromancerPlague":
      return castNecromancerPlague(unit, target);
    case "suikaiPierce":
      castSuikaiPierce(unit, target);
      return true;
    case "suikaiCorpses":
      summonSuikaiCorpses(unit);
      return true;
    case "suikaiHook":
      if (!canSuikaiHook(unit, target) || Math.abs(target.x - unit.x) > UNIT.suikai.range + 180) {
        popText(unit.x, unit.y - 116, "无法勾取", "#d8c8e8");
        return false;
      }
      hookTargetWithSuikai(unit, target);
      return true;
    case "treeRoot":
      castTreeRoot(unit, target);
      return true;
    case "fireDragon":
      castFireDragon(unit, target);
      return true;
    case "meteorRain":
      castMeteorRain(unit, target);
      return true;
    case "redFireball":
      castRedflameFireball(unit, target);
      return true;
    case "redPillars":
      castRedflamePillars(unit, target);
      return true;
    case "stormCloud":
      summonStormCloud(unit, target);
      return true;
    case "tornado":
      launchTornado(unit, target);
      return true;
    case "hurricaneShield":
      castManualHurricaneShield(unit);
      return true;
    case "windBolt":
      strikeLightning(unit, target);
      return true;
    case "chainLightning":
      castChainLightning(unit, target);
      return true;
    case "archFireballs":
      castArchmageFireballs(unit);
      return true;
    case "arcaneExplosion":
      castArcaneExplosion(unit);
      return true;
    case "prometheusDragon":
      castPrometheusDragons(unit, target);
      return true;
    case "prometheusImp":
      summonPrometheusFireImps(unit);
      return true;
    case "prometheusMeteor":
      castPrometheusMeteorRain(unit, target);
      return true;
    case "zeusCloud":
      summonZeusCloud(unit, target);
      return true;
    case "zeusWall":
      summonZeusElectricWall(unit, target);
      return true;
    case "zeusGate":
      summonZeusElectricGate(unit, target);
      return true;
    case "berserkerRage":
      unit.berserkerRageTimer = 0;
      updateBerserker(unit, 0);
      return true;
    case "goblinHeavyArmor":
      return castGoblinExpertHeavyArmor(unit, target);
    case "orderMark":
      return castOrderMark(unit, target);
    case "covenantGuard":
      return castCovenantGuard(unit, target);
    default:
      return false;
  }
}

function getSideGoldAmount(side) {
  if (state?.fourWay) return state.fourWaySides.find((item) => item.side === side)?.gold ?? 0;
  return side === "player" ? state.gold : state.enemyGold;
}

function spendSideGold(side, amount) {
  if (state?.fourWay) {
    const ai = state.fourWaySides.find((item) => item.side === side);
    if (ai) ai.gold = Math.max(0, ai.gold - amount);
    return;
  }
  if (side === "player") state.gold = Math.max(0, state.gold - amount);
  else state.enemyGold = Math.max(0, state.enemyGold - amount);
}

function getActiveBarricadeCount(unit) {
  return (state.barricades ?? []).filter((barricade) => barricade.ownerId === unit.id && barricade.hp > 0 && barricade.life > 0).length;
}

function canStartBuildBarricade(unit) {
  if (!unit || unit.type !== "barricadeEngineer" || unit.hp <= 0 || isUnitHidden(unit)) return false;
  const data = UNIT.barricadeEngineer;
  if (unit.barricadeBuildTimer > 0 || unit.barricadeBuildCooldown > 0) return false;
  if (getActiveBarricadeCount(unit) >= data.barricadeMax) return false;
  return getSideGoldAmount(unit.side) >= data.barricadeCost;
}

function startBuildBarricade(unit) {
  if (!canStartBuildBarricade(unit)) {
    popText(unit.x, unit.y - 116, getManualDisabledLabel(unit, { id: "buildBarricade" }), "#d9d0b8");
    return false;
  }
  const data = UNIT.barricadeEngineer;
  spendSideGold(unit.side, data.barricadeCost);
  const dir = getUnitFacingDirection(unit);
  unit.barricadeBuildTimer = data.barricadeBuildTime;
  unit.barricadeBuildPending = {
    x: clampWorldX(unit.x + dir * 82),
    y: Math.max(FIELD.minY ?? FIELD.ground - 150, Math.min(FIELD.maxY ?? FIELD.ground + 140, unit.y)),
  };
  unit.cooldown = Math.max(unit.cooldown ?? 0, data.barricadeBuildTime);
  unit.combatTimer = data.barricadeBuildTime;
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.buildBarricade = data.barricadeCooldown;
  popText(unit.x, unit.y - 116, "建造拒马", "#d7c090");
  return true;
}

function finishBuildBarricade(unit) {
  const data = UNIT.barricadeEngineer;
  const point = unit.barricadeBuildPending ?? { x: unit.x, y: unit.y };
  state.barricades.push({
    id: state.nextId++,
    ownerId: unit.id,
    side: unit.side,
    x: point.x,
    y: point.y,
    hp: data.barricadeHp,
    maxHp: data.barricadeHp,
    length: data.barricadeLength,
    width: data.barricadeWidth,
    life: data.barricadeDuration,
    duration: data.barricadeDuration,
    tick: data.barricadeTickEvery,
    tickEvery: data.barricadeTickEvery,
    damage: data.barricadeDamage,
    slow: data.barricadeSlow,
    cavalryStop: data.cavalryStop,
  });
  unit.barricadeBuildPending = null;
  unit.barricadeBuildCooldown = data.barricadeCooldown;
  state.blasts.push({ x: point.x, y: point.y - 28, radius: 38, life: 0.24, duration: 0.24, color: "#d7c090" });
  popText(point.x, point.y - 60, "拒马完成", "#d7c090");
}

function getUnitFacingDirection(unit) {
  if (state?.fourWay) return unit.facingDir ?? (unit.x < FIELD.width / 2 ? 1 : -1);
  return unit.side === "player" ? 1 : -1;
}

function clampWorldX(x) {
  if (state?.fourWay) return Math.max(40, Math.min(FIELD.width - 40, x));
  return Math.max(FIELD.playerGate + 40, Math.min(FIELD.enemyGate - 40, x));
}

function castOrderMark(unit, target) {
  const data = UNIT.commander;
  if (!target || target.kind === "statue" || target.hp <= 0 || !areHostileSides(unit.side, target.side) || !canTarget(unit, target)) {
    popText(unit.x, unit.y - 116, "无法标记", "#f5d14f");
    return false;
  }
  if (distanceTo(unit.x, unit.y, target.x, target.y) > data.commandRadius) {
    popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
    return false;
  }
  target.orderMarkTimer = data.markDuration;
  target.orderMarkSide = unit.side;
  state.lightning.push({ x1: unit.x, y1: unit.y - 72, x2: target.x, y2: target.y - 60, life: 0.22, duration: 0.22 });
  state.blasts.push({ x: target.x, y: target.y - 44, radius: 44, life: 0.28, duration: 0.28, color: "#f5d14f" });
  popText(target.x, target.y - 105, "号令标记", "#f5d14f");
  return true;
}

function canCovenantGuardAlly(unit, target) {
  if (!unit || !target || unit.id === target.id || target.hp <= 0 || isUnitHidden(target)) return false;
  if (target.side !== unit.side || target.kind === "statue" || UNIT[target.type]?.untargetable || isSiegeUnit(target)) return false;
  return distanceTo(unit.x, unit.y, target.x, target.y) <= UNIT.covenantGuard.formationRadius;
}

function castCovenantGuard(unit, target) {
  const data = UNIT.covenantGuard;
  if (!canCovenantGuardAlly(unit, target)) {
    popText(unit.x, unit.y - 116, "无法守约", "#fff1a8");
    return false;
  }
  target.covenantSaveTimer = data.guardDuration;
  state.blasts.push({ x: target.x, y: target.y - 42, radius: 52, life: 0.32, duration: 0.32, color: "#fff1a8" });
  popText(target.x, target.y - 108, "圣契守约", "#fff1a8");
  return true;
}

function getSwarmEvolutionCostForSource(sourceType, targetType) {
  const data = UNIT[sourceType] ?? {};
  return {
    gold: data.evolveGoldCost ?? 0,
    magic: data.evolveMagicCost ?? 0,
    targetType,
  };
}

function getSwarmEvolutionCost(unit, targetType) {
  return getSwarmEvolutionCostForSource(unit?.type, targetType);
}

function getSwarmEvolutionSourceType(targetType) {
  return SWARM_EVOLUTION_SOURCE_BY_TYPE[targetType] ?? null;
}

function findSwarmEvolutionCandidate(side, targetType) {
  const sourceType = getSwarmEvolutionSourceType(targetType);
  if (!sourceType) return null;
  return state.units
    .filter((unit) => unit.side === side && unit.type === sourceType && unit.hp > 0 && !isUnitHidden(unit))
    .sort((a, b) => b.x - a.x || a.id - b.id)
    .find((unit) => canEvolveSwarmUnit(unit, targetType)) ?? null;
}

function canStartSwarmEvolutionFromShop(side, targetType) {
  return Boolean(findSwarmEvolutionCandidate(side, targetType));
}

function evolveFirstSwarmUnit(side, targetType) {
  const unit = findSwarmEvolutionCandidate(side, targetType);
  if (!unit) {
    const sourceType = getSwarmEvolutionSourceType(targetType);
    const x = getSideTraitTextPoint(side).x;
    const y = getSideTraitTextPoint(side).y;
    popText(x, y, sourceType ? `需要可进化的${UNIT[sourceType].name}` : "暂不可进化", "#d9d0b8");
    return false;
  }
  return evolveSwarmUnit(unit, targetType);
}

function canEvolveSwarmUnit(unit, targetType) {
  if (!unit || unit.hp <= 0 || isUnitHidden(unit)) return false;
  if ((unit.swarmEvolutionTimer ?? 0) > 0) return false;
  if (unit.type !== getSwarmEvolutionSourceType(targetType)) return false;
  const cost = getSwarmEvolutionCost(unit, targetType);
  return getSideGoldAmount(unit.side) >= cost.gold && getSideMagic(unit.side) >= cost.magic;
}

function getSwarmEvolveDisabledLabel(unit, targetType) {
  if ((unit.swarmEvolutionTimer ?? 0) > 0) return `进化中 ${Math.ceil(unit.swarmEvolutionTimer)}秒`;
  const cost = getSwarmEvolutionCost(unit, targetType);
  if (getSideGoldAmount(unit.side) < cost.gold) return `需要 ${cost.gold} 金币`;
  if (getSideMagic(unit.side) < cost.magic) return `需要 ${cost.magic} 魔力`;
  return "暂不可进化";
}

function evolveSwarmUnit(unit, targetType) {
  if (!canEvolveSwarmUnit(unit, targetType)) {
    popText(unit.x, unit.y - 116, getSwarmEvolveDisabledLabel(unit, targetType), "#d9d0b8");
    return false;
  }
  const cost = getSwarmEvolutionCost(unit, targetType);
  spendSideGold(unit.side, cost.gold);
  addSideMagic(unit.side, -cost.magic);
  const originalMaxHp = Math.max(1, unit.maxHp || UNIT[unit.type]?.hp || unit.hp || 1);
  const evolutionMaxHp = Math.max(1, Math.round(originalMaxHp * 0.5));
  unit.swarmEvolutionOriginalMaxHp = originalMaxHp;
  unit.maxHp = evolutionMaxHp;
  unit.hp = Math.min(unit.hp, evolutionMaxHp);
  unit.swarmEvolutionTarget = targetType;
  unit.swarmEvolutionTimer = UNIT[unit.type]?.evolveDuration ?? 5;
  unit.swarmEvolutionForceCharge = unit.forceCharge;
  unit.cooldown = Math.max(unit.cooldown ?? 0, unit.swarmEvolutionTimer);
  unit.combatTimer = unit.swarmEvolutionTimer;
  unit.forceCharge = false;
  state.manualMoveTarget = null;
  state.blasts.push({ x: unit.x, y: unit.y - 34, radius: 48, life: 0.35, duration: 0.35, color: "#cde69b" });
  popText(unit.x, unit.y - 118, `进化中：${UNIT[targetType].name}`, "#cde69b");
  updateHud();
  return true;
}

function finishSwarmEvolution(unit) {
  const targetType = unit.swarmEvolutionTarget;
  if (!targetType || unit.hp <= 0) return false;
  const evolutionHpRatio = Math.max(0.01, Math.min(1, unit.hp / Math.max(1, unit.maxHp || unit.hp)));
  const evolved = spawnUnit(targetType, unit.side, unit.x);
  evolved.y = unit.y;
  evolved.hp = Math.max(1, Math.round(evolved.maxHp * evolutionHpRatio));
  evolved.forceCharge = unit.swarmEvolutionForceCharge;
  evolved.combatTimer = 1.5;
  if (targetType === "lurker") {
    evolved.boneStingerBurrowTimer = Infinity;
  }
  unit.noCorpse = true;
  unit.hp = 0;
  if (state.controlledUnitId === unit.id) state.controlledUnitId = evolved.id;
  if (state.inspectedUnitId === unit.id) state.inspectedUnitId = evolved.id;
  state.blasts.push({ x: evolved.x, y: evolved.y - 42, radius: 58, life: 0.38, duration: 0.38, color: "#cde69b" });
  popText(evolved.x, evolved.y - 118, `进化：${UNIT[targetType].name}`, "#cde69b");
  updateHud();
  return true;
}

function toggleHeavyAntDodge(unit) {
  const duration = UNIT.heavyAnt.dodgeDuration ?? 6;
  unit.heavyAntDodge = true;
  unit.heavyAntDodgeTimer = duration;
  unit.cooldown = 0;
  popText(unit.x, unit.y - 116, `直射免疫 ${duration}秒`, "#cde69b");
  return true;
}

function activateBoneStingerBurrow(unit) {
  const data = UNIT.boneStinger;
  if ((unit.boneStingerBurrowCooldown ?? 0) > 0) {
    popText(unit.x, unit.y - 116, `冷却 ${Math.ceil(unit.boneStingerBurrowCooldown)}秒`, "#d9d0b8");
    return false;
  }
  unit.boneStingerBurrowTimer = data.burrowDuration;
  unit.boneStingerBurrowCooldown = data.burrowCooldown;
  state.blasts.push({ x: unit.x, y: unit.y - 22, radius: 44, life: 0.26, duration: 0.26, color: "#8d7a4a" });
  popText(unit.x, unit.y - 112, "钻地", "#d8c87a");
  return true;
}

function castSpiderWeb(unit) {
  const data = UNIT.spider;
  if ((unit.spiderWebCooldown ?? 0) > 0) {
    popText(unit.x, unit.y - 116, `冷却 ${Math.ceil(unit.spiderWebCooldown)}秒`, "#d9d0b8");
    return false;
  }
  state.webFields = state.webFields ?? [];
  state.webFields.push({
    x: unit.x,
    y: unit.y ?? FIELD.ground,
    side: unit.side,
    radius: data.webRadius,
    enemySlow: data.webEnemySlow,
    spiderBoost: data.webSpiderBoost,
    life: data.webDuration,
    duration: data.webDuration,
  });
  unit.spiderWebCooldown = data.webCooldown;
  state.blasts.push({ x: unit.x, y: unit.y - 28, radius: data.webRadius, life: 0.28, duration: 0.28, color: "#e4ecd6" });
  popText(unit.x, unit.y - 112, "蛛网", "#e4ecd6");
  return true;
}

function toggleSpartanShield(unit) {
  const data = UNIT.spartan;
  if (unit.spartanShieldTimer > 0) {
    finishSpartanShield(unit);
    popText(unit.x, unit.y - 116, "收盾", "#d7c090");
    return true;
  }
  if (unit.spartanShieldCooldown > 0) {
    popText(unit.x, unit.y - 116, `冷却 ${Math.ceil(unit.spartanShieldCooldown)}秒`, "#d9d0b8");
    return false;
  }
  unit.spartanShieldTimer = data.shieldStanceDuration;
  unit.cooldown = Math.max(unit.cooldown ?? 0, data.shieldStanceDuration);
  unit.combatTimer = data.shieldStanceDuration;
  state.manualMoveTarget = null;
  state.blasts.push({ x: unit.x, y: unit.y - 44, radius: 48, life: 0.28, duration: 0.28, color: "#d7c090" });
  popText(unit.x, unit.y - 116, "举盾", "#d7c090");
  return true;
}

function finishSpartanShield(unit) {
  unit.spartanShieldTimer = 0;
  unit.spartanShieldCooldown = unit.spartanShieldCooldownDuration ?? UNIT.spartan.shieldStanceCooldown;
}

function activateSwordsmanRage(unit) {
  const data = UNIT.swordsman;
  if (unit.hp <= data.selfRageHpCost) {
    popText(unit.x, unit.y - 116, "生命不足", "#d9d0b8");
    return false;
  }
  if ((unit.swordsmanSelfRageTimer ?? 0) > 0) {
    popText(unit.x, unit.y - 116, "愤怒中", "#ff5a45");
    return false;
  }
  const cooldown = unit.manualSkillCooldowns?.swordsmanRage ?? 0;
  if (cooldown > 0) {
    popText(unit.x, unit.y - 116, `冷却 ${Math.ceil(cooldown)}秒`, "#d9d0b8");
    return false;
  }
  unit.hp = Math.max(1, unit.hp - data.selfRageHpCost);
  unit.swordsmanSelfRageTimer = data.selfRageDuration;
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.swordsmanRage = data.selfRageEvery;
  state.blasts.push({ x: unit.x, y: unit.y - 42, radius: data.selfRageRange, life: 0.28, duration: 0.28, color: "#ff5a45" });
  popText(unit.x, unit.y - 104, `愤怒 -${data.selfRageHpCost}生命`, "#ff5a45");
  return true;
}

function castSwordsmanJumpSlash(unit, target) {
  const data = UNIT.swordsman;
  if (!target || target.kind === "statue" || target.hp <= 0 || isUnitHidden(target) || !canTarget(unit, target)) {
    popText(unit.x, unit.y - 116, "无法跳劈", "#f5d14f");
    return false;
  }
  if (Math.abs(target.x - unit.x) > data.jumpSlashDistance) {
    popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
    return false;
  }
  const dir = unit.side === "player" ? 1 : -1;
  const stopDistance = Math.max(22, getUnitRange(unit) - 4);
  unit.x = Math.max(FIELD.playerGate + 25, Math.min(FIELD.enemyGate - 25, target.x - dir * stopDistance));
  unit.y = target.y;
  const damage = Math.round((unit.damage ?? data.damage) * data.jumpSlashDamageMultiplier);
  const dealt = applyDamage(target, damage, unit.side);
  handleDamageDealt(unit, target, dealt);
  applyStun(target, data.jumpSlashStun);
  state.blasts.push({ x: target.x, y: target.y - 42, radius: 42, life: 0.24, duration: 0.24, color: "#f5d14f" });
  popText(target.x, target.y - 92, "跳劈", "#f5d14f");
  return true;
}

function shootArcherFireArrow(unit, target) {
  const data = UNIT.archer;
  if (!target || target.kind === "statue" || target.hp <= 0 || isUnitHidden(target) || !canTarget(unit, target)) {
    popText(unit.x, unit.y - 116, "无法射击", "#ff9b45");
    return false;
  }
  if (!canAttackFromDistance(unit, target, getUnitRange(unit))) {
    popText(unit.x, unit.y - 116, "距离太远", "#d9d0b8");
    return false;
  }
  state.arrows.push({
    x: unit.x,
    y: unit.y - 62,
    tx: target.x,
    ty: target.y - 48,
    side: unit.side,
    damage: unit.damage ?? data.damage,
    target,
    sourceId: unit.id,
    sourceType: unit.type,
    life: 0.55,
    type: "archerFire",
    burnDps: data.fireArrowBurnDps,
    burnDuration: data.fireArrowBurnDuration,
  });
  popText(unit.x, unit.y - 112, "火箭", "#ff9b45");
  return true;
}

function summonShotgunnerBombs(unit) {
  const data = UNIT.shotgunner;
  const bombData = UNIT.orderMiniBomb;
  const dir = getUnitFacingDirection(unit);
  for (let i = 0; i < data.bombCount; i += 1) {
    const bomb = spawnUnit("orderMiniBomb", unit.side, unit.x + dir * (26 + i * 12));
    bomb.y = unit.y + (i - 1) * 26;
    bomb.timedLife = bombData.duration;
    bomb.noCorpse = true;
    bomb.forceCharge = true;
    bomb.facingDir = dir;
    bomb.combatTimer = bombData.duration;
  }
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.shotgunBombs = data.bombSkillCooldown;
  unit.cooldown = Math.max(unit.cooldown ?? 0, 0.45);
  popText(unit.x, unit.y - 112, "释放小炸弹", "#ffce7a");
  return true;
}

function castVBlink(unit) {
  const data = UNIT.vUnit;
  const dir = unit.side === "player" ? -1 : 1;
  const baseLimit = unit.side === "player" ? FIELD.playerGate - 80 : FIELD.enemyGate + 80;
  unit.x += dir * (unit.blinkDistance ?? data.blinkDistance);
  unit.x = unit.side === "player" ? Math.max(baseLimit, unit.x) : Math.min(baseLimit, unit.x);
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.vBlink = unit.blinkCooldown ?? data.blinkCooldown;
  state.blasts.push({ x: unit.x, y: unit.y - 44, radius: 58, life: 0.32, duration: 0.32, color: "#d7ceff" });
  popText(unit.x, unit.y - 125, "闪现", "#d7ceff");
  return true;
}

function castDeathGodSpikes(unit) {
  const data = UNIT.deathGod;
  const enemies = getUnitsInRadius(unit.x, data.spikeRadius, unit.side, Infinity)
    .filter((enemy) => enemy.hp > 0 && !isUnitHidden(enemy) && !UNIT[enemy.type]?.untargetable)
    .sort((a, b) => distanceTo(unit.x, unit.y, a.x, a.y) - distanceTo(unit.x, unit.y, b.x, b.y));
  if (!enemies.length) {
    popText(unit.x, unit.y - 116, "范围内没有敌人", "#d8d0c8");
    return false;
  }
  const minX = unit.x - data.spikeRadius;
  const maxX = unit.x + data.spikeRadius;
  for (let i = 0; i < data.spikeCount; i += 1) {
    const target = enemies[i % enemies.length];
    const offset = ((i % 4) - 1.5) * 14;
    const x = Math.max(minX, Math.min(maxX, target.x + offset));
    applyUnitDamage(target, data.spikeDamage, { label: "刺", color: "#d8d0c8", yOffset: -88, sourceSide: unit.side });
    state.spikes.push({
      x1: x - 6,
      x2: x + 6,
      y: FIELD.ground - 10,
      side: unit.side,
      life: 0.42,
      duration: 0.42,
    });
  }
  state.blasts.push({ x: unit.x, y: unit.y - 28, radius: data.spikeRadius, life: 0.38, duration: 0.38, color: "#d8d0c8" });
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.deathGodSpikes = data.spikeCooldown;
  popText(unit.x, unit.y - 122, "死神尖刺", "#d8d0c8");
  return true;
}

function hasActiveDeathGodClone(unit) {
  return state.units.some((candidate) => candidate.type === "deathGodClone" && candidate.summonerId === unit.id && candidate.hp > 0);
}

function summonDeathGodClone(unit) {
  const data = UNIT.deathGod;
  if (hasActiveDeathGodClone(unit)) {
    popText(unit.x, unit.y - 116, "分身已存在", "#d8d0c8");
    return false;
  }
  const dir = unit.side === "player" ? -1 : 1;
  const clone = spawnUnit("deathGodClone", unit.side, Math.max(FIELD.playerGate + 42, Math.min(FIELD.enemyGate - 42, unit.x + dir * 42)));
  clone.y = unit.y + 10;
  clone.summonerId = unit.id;
  clone.deathGodCloneTimer = UNIT.deathGodClone.duration;
  clone.forceCharge = false;
  unit.manualSkillCooldowns = unit.manualSkillCooldowns ?? {};
  unit.manualSkillCooldowns.deathGodClone = data.cloneCooldown;
  state.blasts.push({ x: clone.x, y: clone.y - 42, radius: 68, life: 0.4, duration: 0.4, color: "#d8d0c8" });
  popText(unit.x, unit.y - 122, "召唤分身", "#d8d0c8");
  return true;
}

function updateDeathGodClone(unit, dt) {
  unit.deathGodCloneTimer = Math.max(0, (unit.deathGodCloneTimer ?? UNIT.deathGodClone.duration) - dt);
  if (unit.deathGodCloneTimer <= 0) {
    unit.noCorpse = true;
    unit.hp = 0;
    state.blasts.push({ x: unit.x, y: unit.y - 42, radius: 44, life: 0.28, duration: 0.28, color: "#d8d0c8" });
    popText(unit.x, unit.y - 96, "分身消散", "#d8d0c8");
  }
}

function castManualHurricaneShield(unit) {
  const data = UNIT.hurricane;
  const target = state.units
    .filter((ally) => ally.side === unit.side && ally.hp > 0 && !isUnitHidden(ally) && !UNIT[ally.type]?.untargetable && ally.shieldTimer <= 0)
    .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  if (!target) {
    popText(unit.x, unit.y - 116, "没有护盾目标", "#d7f6ee");
    return;
  }
  target.shieldTimer = data.shieldDuration;
  target.shieldReduction = data.shieldReduction;
  popText(target.x, target.y - 100, "护盾", "#d7f6ee");
}

function drawCorpse(corpse) {
  const alpha = Math.max(0.18, Math.min(0.65, corpse.life / corpse.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(corpse.x, corpse.y);
  ctx.fillStyle = corpse.ritual && !corpse.reviveable ? "#2f243a" : "#3b3735";
  ctx.strokeStyle = corpse.ritual && !corpse.reviveable ? "#c8a0ff" : "#b8b0a5";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, -8, 25, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = corpse.ritual && !corpse.reviveable ? "#f1e6ff" : "#d8d0c8";
  ctx.beginPath();
  if (corpse.ritual && !corpse.reviveable) {
    ctx.arc(0, -10, 11, 0, Math.PI * 2);
    ctx.moveTo(0, -25);
    ctx.lineTo(0, 6);
    ctx.moveTo(-14, -10);
    ctx.lineTo(14, -10);
  } else {
    ctx.moveTo(-14, -18);
    ctx.lineTo(14, 0);
    ctx.moveTo(12, -18);
    ctx.lineTo(-12, 0);
  }
  ctx.stroke();
  ctx.restore();
}

function drawGhost(ghost) {
  const alpha = Math.max(0.15, Math.min(0.72, ghost.life / ghost.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(ghost.x, ghost.y);
  ctx.scale(ghost.dir, 1);
  ctx.fillStyle = "rgba(216, 208, 255, 0.62)";
  ctx.strokeStyle = "#f4f0ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-18, 18);
  ctx.quadraticCurveTo(-24, -14, 0, -24);
  ctx.quadraticCurveTo(24, -14, 18, 18);
  ctx.quadraticCurveTo(8, 9, 0, 20);
  ctx.quadraticCurveTo(-8, 9, -18, 18);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#2d2948";
  ctx.beginPath();
  ctx.arc(-6, -8, 2.5, 0, Math.PI * 2);
  ctx.arc(7, -8, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawArrow(arrow) {
  const { x, y } = getArrowPosition(arrow);
  if (arrow.type === "boulder") {
    ctx.fillStyle = arrow.cannon ? "#2b2d31" : "#8b6f46";
    ctx.beginPath();
    ctx.arc(x, y, arrow.cannon ? 10 : 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = arrow.cannon ? "#ffce7a" : "#3f3324";
    ctx.lineWidth = 3;
    ctx.stroke();
    return;
  }
  if (arrow.type === "campaignRain") {
    ctx.strokeStyle = "#f5f0df";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y - 16);
    ctx.lineTo(x, y + 16);
    ctx.stroke();
    return;
  }
  if (arrow.type === "rocketVolley") {
    ctx.strokeStyle = "#ffce7a";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x - 13, y + 5);
    ctx.lineTo(x + 14, y - 6);
    ctx.stroke();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.arc(x + 15, y - 6, 3.5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  if (arrow.type === "campaignMissile") {
    ctx.strokeStyle = "#ffdf6b";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x + 24, y - 5);
    ctx.lineTo(x - 22, y + 5);
    ctx.stroke();
    ctx.fillStyle = "#ff6b4a";
    ctx.beginPath();
    ctx.arc(x - 24, y + 5, 5, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.strokeStyle =
    arrow.type === "crossbow"
      ? "#ffce7a"
      : arrow.type === "goldenSpear"
        ? "#f7d66b"
      : arrow.type === "spearThrow"
        ? "#dfe8ff"
      : arrow.type === "poisonZombie"
        ? "#93d96b"
      : arrow.type === "archerFire"
        ? "#ff9b45"
      : arrow.type === "summoner"
        ? "#7ed8ff"
      : arrow.type === "boneThrower"
        ? "#f0eadc"
        : arrow.type === "javelinThrower"
          ? (arrow.poison ? "#93d96b" : "#d7c090")
        : arrow.type === "goblinVulture"
          ? "#ffce7a"
        : arrow.type === "undeadVulture"
          ? "#7ed8ff"
        : arrow.type === "musketeer" || arrow.type === "ironCavalryMusket"
          ? "#f5f0df"
          : arrow.type === "ironCavalryBomb"
            ? "#ffce7a"
          : arrow.type === "fireElement"
            ? "#ff9b45"
          : arrow.type === "demonArcher"
            ? "#ff7cb1"
            : arrow.side === "player"
              ? "#d8e8ff"
              : "#ffd0c9";
  ctx.lineWidth = arrow.type === "crossbow" || arrow.type === "goblinVulture" || arrow.type === "undeadVulture" || arrow.type === "summoner" || arrow.type === "boneThrower" || arrow.type === "musketeer" || arrow.type === "ironCavalryMusket" ? 5 : arrow.type === "spearThrow" || arrow.type === "goldenSpear" || arrow.type === "javelinThrower" || arrow.type === "archerFire" ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 3);
  ctx.lineTo(x + 12, y - 3);
  ctx.stroke();
  if (arrow.type === "undeadVulture" || arrow.type === "summoner") {
    ctx.fillStyle = "rgba(126, 216, 255, 0.75)";
    ctx.beginPath();
    ctx.arc(x + 12, y - 3, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  if (arrow.type === "boneThrower") {
    ctx.fillStyle = "#f0eadc";
    ctx.beginPath();
    ctx.arc(x + 12, y - 3, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }
  if (arrow.type === "archerFire") {
    ctx.fillStyle = "#ff6a3a";
    ctx.beginPath();
    ctx.arc(x + 12, y - 3, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLightning(bolt) {
  const alpha = Math.max(0, bolt.life / bolt.duration);
  const midX = (bolt.x1 + bolt.x2) / 2 + Math.sin(bolt.life * 80) * 18;
  const midY = (bolt.y1 + bolt.y2) / 2 - 24;
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#d7f6ff";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bolt.x1, bolt.y1);
  ctx.lineTo(midX, midY);
  ctx.lineTo(bolt.x2, bolt.y2);
  ctx.stroke();
  ctx.strokeStyle = "#8fd8ff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawMeteor(meteor) {
  const progress = 1 - meteor.life / meteor.duration;
  const targetY = meteor.y ?? FIELD.ground - 30;
  const y = targetY - 230 + progress * 230;
  ctx.globalAlpha = 0.85;
  ctx.strokeStyle = "#ffb45e";
  ctx.lineWidth = meteor.campaign ? 8 : 3;
  ctx.beginPath();
  ctx.moveTo(meteor.x - (meteor.campaign ? 78 : 28), y - (meteor.campaign ? 72 : 24));
  ctx.lineTo(meteor.x, y);
  ctx.stroke();
  ctx.fillStyle = "#ff6a3a";
  ctx.beginPath();
  ctx.arc(meteor.x, y, meteor.size ?? 5, 0, Math.PI * 2);
  ctx.fill();
  if (meteor.campaign) {
    ctx.strokeStyle = "#7f2f1d";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawStormCloud(cloud) {
  const alpha = Math.max(0.18, Math.min(0.72, cloud.life / cloud.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = cloud.type === "rain" ? "#9ee8ff" : "#44546b";
  for (let i = 0; i < 5; i += 1) {
    const offset = (i - 2) * cloud.radius * 0.28;
    ctx.beginPath();
    ctx.ellipse(cloud.x + offset, cloud.y + Math.sin(i) * 6, cloud.radius * 0.24, 17, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (cloud.type === "rain") {
    ctx.strokeStyle = "#9ee8ff";
    ctx.lineWidth = 2;
    for (let i = 0; i < 10; i += 1) {
      const x = cloud.x - cloud.radius + ((i + (cloud.life * 9) % 1) / 9) * cloud.radius * 2;
      ctx.beginPath();
      ctx.moveTo(x, cloud.y + 28);
      ctx.lineTo(x - 8, cloud.y + 58);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawElectricWall(wall) {
  const alpha = Math.max(0.25, Math.min(0.85, wall.life / wall.duration));
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#d7f6ff";
  ctx.lineWidth = 5;
  ctx.shadowColor = "#9ee8ff";
  ctx.shadowBlur = 12;
  const top = FIELD.ground - 205;
  const bottom = FIELD.ground + 135;
  for (let i = 0; i < 5; i += 1) {
    const x = wall.x + (i - 2) * 8;
    ctx.beginPath();
    ctx.moveTo(x, top);
    for (let y = top; y < bottom; y += 42) {
      ctx.lineTo(x + (Math.random() - 0.5) * 24, y + 28);
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawDelayedSpell(spell) {
  if (spell.type !== "fireDragon") return;
  const progress = 1 - spell.timer / spell.duration;
  const baseY = FIELD.ground + 22;
  const headY = baseY - 118 * Math.max(0, Math.min(1, progress));
  const width = 28 + progress * 18;

  ctx.save();
  ctx.globalAlpha = 0.45 + progress * 0.45;
  ctx.fillStyle = "#ff5a2d";
  ctx.beginPath();
  ctx.moveTo(spell.x - width, baseY);
  ctx.quadraticCurveTo(spell.x - width * 0.55, headY + 38, spell.x - 11, headY);
  ctx.lineTo(spell.x + 11, headY);
  ctx.quadraticCurveTo(spell.x + width * 0.55, headY + 38, spell.x + width, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffd08a";
  ctx.beginPath();
  ctx.arc(spell.x, headY - 4, 13 + progress * 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ffb35f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(spell.x - 38, baseY - 8);
  ctx.lineTo(spell.x, headY - 18);
  ctx.lineTo(spell.x + 38, baseY - 8);
  ctx.stroke();
  ctx.restore();
}

function drawTornado(tornado) {
  const progress = 1 - tornado.life / tornado.duration;
  const x = tornado.x + (tornado.tx - tornado.x) * progress;
  const y = tornado.y + (tornado.ty - tornado.y) * progress;
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = "#d7f6ee";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 22, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(x, y, 16, 7, 0, 0, Math.PI * 2);
  ctx.ellipse(x, y + 15, 9, 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawIceField(field) {
  const alpha = Math.max(0, Math.min(0.42, field.life / field.duration));
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#9ee8ff";
  ctx.beginPath();
  ctx.ellipse(field.x, field.y, field.radius, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#d8f8ff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawSpike(spike) {
  const alpha = Math.max(0, spike.life / spike.duration);
  const start = Math.min(spike.x1, spike.x2);
  const end = Math.max(spike.x1, spike.x2);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#b8b0a5";
  for (let x = start; x <= end; x += 28) {
    const height = 22 + ((x / 28) % 2) * 10;
    ctx.beginPath();
    ctx.moveTo(x - 10, spike.y);
    ctx.lineTo(x, spike.y - height);
    ctx.lineTo(x + 10, spike.y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBlast(blast) {
  const duration = blast.duration ?? 0.32;
  const progress = Math.max(0, Math.min(1, 1 - blast.life / duration));
  ctx.globalAlpha = Math.max(0, blast.life / duration);
  ctx.strokeStyle = blast.color ?? "#ffce7a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(blast.x, blast.y, blast.radius * progress, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = blast.color ? "rgba(255, 122, 61, 0.2)" : "rgba(255, 119, 68, 0.22)";
  ctx.beginPath();
  ctx.arc(blast.x, blast.y, blast.radius * progress * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFloater(floater) {
  ctx.globalAlpha = Math.max(0, floater.life);
  ctx.fillStyle = floater.color;
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(floater.text, floater.x, floater.y);
  ctx.globalAlpha = 1;
}

function drawEndOverlay() {
  ctx.fillStyle = "rgba(10, 12, 12, 0.58)";
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = "#fff1c8";
  ctx.font = "800 54px system-ui, sans-serif";
  ctx.textAlign = "center";
  const winnerName = state.fourWay
    ? (state.winner ? FACTIONS[state.winner].name : "无人")
    : state.winner === "player" ? FACTIONS[selectedFaction].name : FACTIONS[opponentFaction()].name;
  ctx.fillText(`${winnerName}胜利`, FIELD.width / 2, 285);
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText("可重新开始，或回到主界面", FIELD.width / 2, 328);
}

function closeRuleDialog() {
  ruleDialog?.classList.add("hidden");
}

function openRuleDialog() {
  if (isFactionUnavailableForMode(selectedFaction, selectedMode)) {
    statusEl.textContent = selectedMode === "campaign"
      ? "虫群帝国隐藏战役暂未开放"
      : "虫群帝国暂不加入四国对战";
    return;
  }
  if (selectedMode === "campaign") {
    closeRuleDialog();
    openCampaignMap();
    return;
  }
  ruleDialog?.classList.remove("hidden");
}

function returnToMainMenu() {
  state = null;
  activeCampaign = null;
  selectedMode = "versus";
  selectedTeamMode = "solo";
  selectedControlMode = "human";
  selectedFaction = "order";
  enemyFaction = "chaos";
  applyFieldMode(false);
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
  });
  teamModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.teamMode === selectedTeamMode);
  });
  controlModeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.controlMode === selectedControlMode);
  });
  factionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.faction === selectedFaction);
  });
  closeRuleDialog();
  campaignMap.classList.add("hidden");
  factionSelect.classList.remove("hidden");
  controlDeck?.classList.remove("hidden");
  homeBtn.classList.add("hidden");
  statusEl.textContent = "选择模式与阵营，开始下一场战斗";
}

async function startSelectedBattle(faction = selectedFaction) {
  selectedFaction = faction || "order";
  if (isFactionUnavailableForMode(selectedFaction, selectedMode)) {
    statusEl.textContent = selectedMode === "campaign"
      ? "虫群帝国隐藏战役暂未开放"
      : "虫群帝国暂不加入四国对战";
    closeRuleDialog();
    return;
  }
  if (selectedControlMode === "ai" && selectedMode !== "campaign") {
    selectedMode = "quad";
    modeButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.mode === selectedMode);
    });
  }
  factionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.faction === selectedFaction);
  });
  if (selectedMode === "campaign") {
    openCampaignMap();
    return;
  }
  if (!isIosDevice()) await enterFullscreen();
  activeCampaign = null;
  closeRuleDialog();
  factionSelect.classList.add("hidden");
  newGame();
}

function isFullscreen() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function updateFullscreenButton() {
  fullscreenBtn.textContent = isFullscreen() ? "退出" : "全屏";
  fullscreenBtn.title = isFullscreen() ? "退出全屏" : "进入全屏";
}

async function enterFullscreen() {
  const target = document.documentElement;
  try {
    if (target.requestFullscreen) await target.requestFullscreen();
    else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
  } catch {
    statusEl.textContent = "当前浏览器需要手动允许全屏";
  }
  updateFullscreenButton();
}

async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } catch {
    statusEl.textContent = "当前浏览器暂不支持退出全屏";
  }
  updateFullscreenButton();
}

function toggleFullscreen() {
  if (isFullscreen()) exitFullscreen();
  else enterFullscreen();
}

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function isIosDevice() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function showInstallButton() {
  if (!installBtn || isStandaloneApp()) return;
  installBtn.classList.remove("hidden");
}

function hideInstallButton() {
  if (!installBtn) return;
  installBtn.classList.add("hidden");
}

function showInstallGuide(message) {
  if (!installGuide || !installGuideText) return;
  installGuideText.textContent = message;
  installGuide.classList.remove("hidden");
}

function closeInstallGuide() {
  if (!installGuide) return;
  installGuide.classList.add("hidden");
}

async function handleInstallClick() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    hideInstallButton();
    return;
  }

  if (isIosDevice()) {
    showInstallGuide("在 Safari 中点分享按钮，然后选择“添加到主屏幕”，之后就能从桌面图标直接进入游戏。");
    return;
  }

  showInstallGuide("请在浏览器菜单中选择“安装应用”或“添加到主屏幕”。安装后打开会隐藏地址栏，更像一款独立游戏。");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  const refreshKey = "stick-war-sw-refresh-20260617-spartan-sword-rage";
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (sessionStorage.getItem(refreshKey) === "done") return;
    sessionStorage.setItem(refreshKey, "done");
    window.location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
        return registration.update();
      })
      .catch(() => {
        statusEl.textContent = "离线缓存暂时不可用，联网游玩不受影响";
      });
  });
}

function updateHud() {
  if (state.fourWay) {
    const alive = state.fourWaySides.filter((ai) => ai.alive);
    goldEl.innerHTML = alive
      .map((ai) => {
        const base = FOUR_WAY_BASES[ai.side];
        const className = ai.side === "undeadEmpire" ? "undead" : ai.side;
        const magic = ai.magic > 0 ? `<span class="money-label">魔</span><span class="money-value">${Math.floor(ai.magic)}</span>` : "";
        return `<span class="money-chip ${className}"><span class="money-label">${base.label}</span><span class="money-value">${Math.floor(ai.gold)}</span>${magic}</span>`;
      })
      .join("");
    enemyGoldEl.textContent = `存活 ${alive.length}/4`;
    playerHpBar.style.width = `${Math.max(0, Math.min(100, ((state.fourWayBaseHp.order ?? 0) / STATUE_MAX_HP) * 100))}%`;
    enemyHpBar.style.width = `${Math.max(0, Math.min(100, ((state.fourWayBaseHp.chaos ?? 0) / STATUE_MAX_HP) * 100))}%`;
    const playerSide = getPlayerControlledSide();
    if (!playerSide) {
      trainButtons.forEach((button) => {
        delete button.dataset.training;
        button.style.removeProperty("--train-progress");
        button.disabled = true;
      });
      return;
    }
    const playerFaction = factionForSide(playerSide);
    const playerGold = getSideGoldAmount(playerSide);
    const trainingProgress = new Map();
    state.spawnQueue.forEach((item) => {
      if (item.side !== playerSide) return;
      const duration = item.duration ?? UNIT[item.type]?.train ?? 0;
      if (duration <= 0) return;
      const progress = Math.max(0, Math.min(1, 1 - item.timer / duration));
      if (!trainingProgress.has(item.type)) trainingProgress.set(item.type, progress);
    });
    trainButtons.forEach((button) => {
      const type = button.dataset.unit;
      const progress = type ? trainingProgress.get(type) : undefined;
      if (progress !== undefined) {
        const degrees = Math.max(1, Math.round(progress * 360));
        button.dataset.training = "true";
        button.style.setProperty("--train-progress", `${degrees}deg`);
      } else {
        delete button.dataset.training;
        button.style.removeProperty("--train-progress");
      }
      if (button.dataset.action?.startsWith("merge")) {
        const mergeType = ELEMENT_MERGE_TYPE_BY_ACTION[button.dataset.action];
        if (state.over || !canAffordElementMerge(mergeType, playerSide)) {
          button.disabled = true;
          return;
        }
      }
      if (button.dataset.action === "mergeTreeEnt") {
        const hasEarth = state.units.some((unit) => unit.side === playerSide && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
        const hasWater = state.units.some((unit) => unit.side === playerSide && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId);
        button.disabled = state.over || !canAffordElementMerge("treeEnt", playerSide) || !hasEarth || !hasWater;
        return;
      }
      if (button.dataset.action === "mergeRog") {
        const hasEarth = state.units.some((unit) => unit.side === playerSide && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
        const hasFire = state.units.some((unit) => unit.side === playerSide && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit));
        button.disabled = state.over || !canAffordElementMerge("rog", playerSide) || !hasEarth || !hasFire;
        return;
      }
      if (button.dataset.action === "mergeDreadfire") {
        button.disabled = state.over || !canAffordElementMerge("dreadfire", playerSide) || !canMergeDreadfire(playerSide);
        return;
      }
      if (button.dataset.action === "mergeRedflame") {
        button.disabled = state.over || !canAffordElementMerge("redflame", playerSide) || !canMergeRedflame(playerSide);
        return;
      }
      if (button.dataset.action === "mergeHurricane") {
        button.disabled = state.over || !canAffordElementMerge("hurricane", playerSide) || !canMergeHurricane(playerSide);
        return;
      }
      if (button.dataset.action === "mergeHill") {
        button.disabled = state.over || !canAffordElementMerge("hill", playerSide) || !canMergeHill(playerSide);
        return;
      }
      if (button.dataset.action === "mergeLinghan") {
        button.disabled = state.over || !canAffordElementMerge("linghan", playerSide) || !canMergeLinghan(playerSide);
        return;
      }
      if (button.dataset.action === "mergeScaldStrike") {
        button.disabled = state.over || !canAffordElementMerge("scaldStrike", playerSide) || !canMergeScaldStrike(playerSide);
        return;
      }
      if (button.dataset.action === "mergeElectricGate") {
        button.disabled = state.over || !canAffordElementMerge("electricGate", playerSide) || !canMergeElectricGate(playerSide);
        return;
      }
      if (button.dataset.action === "mergeV") {
        button.disabled = state.over || !canAffordElementMerge("vUnit", playerSide) || !canMergeV(playerSide);
        return;
      }
      const swarmEvolveType = SWARM_EVOLVE_TYPE_BY_ACTION[button.dataset.action];
      if (swarmEvolveType) {
        button.disabled = state.over || !canStartSwarmEvolutionFromShop(playerSide, swarmEvolveType);
        return;
      }
      if (!type) return;
      button.disabled = !canAffordUnit(type, playerFaction, playerSide, playerGold) || state.over;
    });
    return;
  }
  goldEl.innerHTML = `<span class="money-label">金</span><span class="money-value">${Math.floor(state.gold)}</span><span class="money-label magic">魔</span><span class="money-value magic">${Math.floor(state.magic ?? 0)}</span>`;
  enemyGoldEl.innerHTML = `<span class="money-label">金</span><span class="money-value">${Math.floor(state.enemyGold)}</span><span class="money-label magic">魔</span><span class="money-value magic">${Math.floor(state.enemyMagic ?? 0)}</span>`;
  playerHpBar.style.width = `${(state.playerHp / (state.playerMaxHp ?? STATUE_MAX_HP)) * 100}%`;
  enemyHpBar.style.width = `${(state.enemyHp / (state.enemyMaxHp ?? STATUE_MAX_HP)) * 100}%`;
  const trainingProgress = new Map();
  state.spawnQueue.forEach((item) => {
    const duration = item.duration ?? UNIT[item.type]?.train ?? 0;
    if (duration <= 0) return;
    const progress = Math.max(0, Math.min(1, 1 - item.timer / duration));
    if (!trainingProgress.has(item.type)) trainingProgress.set(item.type, progress);
  });
  trainButtons.forEach((button) => {
    const type = button.dataset.unit;
    const progress = type ? trainingProgress.get(type) : undefined;
    if (progress !== undefined) {
      const degrees = Math.max(1, Math.round(progress * 360));
      button.dataset.training = "true";
      button.style.setProperty("--train-progress", `${degrees}deg`);
    } else {
      delete button.dataset.training;
      button.style.removeProperty("--train-progress");
    }
    if (button.dataset.action === "convertEarth") {
      button.disabled = state.over || !findConvertibleEarthElement("player");
      return;
    }
    if (button.dataset.action?.startsWith("merge")) {
      const mergeType = ELEMENT_MERGE_TYPE_BY_ACTION[button.dataset.action];
      if (state.over || !canAffordElementMerge(mergeType, "player")) {
        button.disabled = true;
        return;
      }
    }
    if (button.dataset.action === "mergeTreeEnt") {
      const hasEarth = state.units.some((unit) => unit.side === "player" && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
      const hasWater = state.units.some((unit) => unit.side === "player" && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId);
      button.disabled = state.over || !canAffordElementMerge("treeEnt", "player") || !hasEarth || !hasWater;
      return;
    }
    if (button.dataset.action === "mergeRog") {
      const hasEarth = state.units.some((unit) => unit.side === "player" && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
      const hasFire = state.units.some((unit) => unit.side === "player" && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit));
      button.disabled = state.over || !canAffordElementMerge("rog", "player") || !hasEarth || !hasFire;
      return;
    }
    if (button.dataset.action === "mergeDreadfire") {
      button.disabled = state.over || !canAffordElementMerge("dreadfire", "player") || !canMergeDreadfire("player");
      return;
    }
    if (button.dataset.action === "mergeRedflame") {
      button.disabled = state.over || !canAffordElementMerge("redflame", "player") || !canMergeRedflame("player");
      return;
    }
    if (button.dataset.action === "mergeHurricane") {
      button.disabled = state.over || !canAffordElementMerge("hurricane", "player") || !canMergeHurricane("player");
      return;
    }
    if (button.dataset.action === "mergeHill") {
      button.disabled = state.over || !canAffordElementMerge("hill", "player") || !canMergeHill("player");
      return;
    }
    if (button.dataset.action === "mergeLinghan") {
      button.disabled = state.over || !canAffordElementMerge("linghan", "player") || !canMergeLinghan("player");
      return;
    }
    if (button.dataset.action === "mergeScaldStrike") {
      button.disabled = state.over || !canAffordElementMerge("scaldStrike", "player") || !canMergeScaldStrike("player");
      return;
    }
    if (button.dataset.action === "mergeElectricGate") {
      button.disabled = state.over || !canAffordElementMerge("electricGate", "player") || !canMergeElectricGate("player");
      return;
    }
    if (button.dataset.action === "mergeV") {
      button.disabled = state.over || !canAffordElementMerge("vUnit", "player") || !canMergeV("player");
      return;
    }
    const swarmEvolveType = SWARM_EVOLVE_TYPE_BY_ACTION[button.dataset.action];
    if (swarmEvolveType) {
      button.disabled = state.over || !canStartSwarmEvolutionFromShop("player", swarmEvolveType);
      return;
    }
    if (!type) return;
    button.disabled = !canAffordUnit(type, selectedFaction, "player", state.gold) || state.over || !canQueueCampaignUnit(type);
  });
}

function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  return {
    x: Math.max(0, Math.min(FIELD.width, ((event.clientX - rect.left) / width) * FIELD.width)),
    y: Math.max(0, Math.min(FIELD.height, ((event.clientY - rect.top) / height) * FIELD.height)),
  };
}

function findPlayerVAt(point) {
  return state.units.find((unit) => {
    if (!isPlayerControlledSide(unit.side) || unit.type !== "vUnit" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 42 && Math.abs(unit.y - 48 - point.y) <= 78;
  });
}

function findPlayerMedusaAt(point) {
  return state.units.find((unit) => {
    if (!isPlayerControlledSide(unit.side) || unit.type !== "medusa" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 54 && Math.abs(unit.y - 48 - point.y) <= 92;
  });
}

function findPlayerGoldenSpartanAt(point) {
  return state.units.find((unit) => {
    if (!isPlayerControlledSide(unit.side) || unit.type !== "goldenSpartan" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 54 && Math.abs(unit.y - 48 - point.y) <= 92;
  });
}

function findUnitAt(point) {
  return [...state.units]
    .filter((unit) => unit.hp > 0 && !isUnitHidden(unit))
    .sort((a, b) => b.y - a.y || b.id - a.id)
    .find((unit) => {
      const scale = UNIT[unit.type]?.visualScale ?? 1;
      const height = (UNIT[unit.type]?.giant ? 150 : unit.type === "treeEnt" ? 120 : 86) * scale;
      const width = (UNIT[unit.type]?.giant ? 74 : unit.type === "treeEnt" ? 72 : 48) * scale;
      return Math.abs(unit.x - point.x) <= width && Math.abs(unit.y - 48 - point.y) <= height;
    });
}

function inspectUnitAt(point) {
  const unit = findUnitAt(point);
  if (!unit) {
    state.inspectedUnitId = null;
    state.inspectedUnitTimer = 0;
    return false;
  }
  state.inspectedUnitId = unit.id;
  state.inspectedUnitTimer = 4;
  return true;
}

function canMedusaSlay(medusa, target) {
  if (!medusa || !target || medusa.hp <= 0 || target.hp <= 0) return false;
  if (!areHostileSides(medusa.side, target.side)) return false;
  if (UNIT[target.type]?.slayImmune) return false;
  if (isHeroUnit(target)) return false;
  if (UNIT[target.type]?.giant) return false;
  if (isSiegeUnit(target)) return false;
  return true;
}

function canVControl(v, target) {
  if (!v || !target || v.hp <= 0 || target.hp <= 0) return false;
  if (!areHostileSides(v.side, target.side)) return false;
  if (V_CONTROL_BLOCKED_UNITS.has(target.type)) return false;
  if (isControlImmune(target)) return false;
  if (isSiegeControlImmune(target) && !v.canControlAll) return false;
  if (Math.abs(target.x - v.x) > getVControlRange(v)) return false;
  if (v.canControlAll) return true;
  return true;
}

function getVControlRange(v) {
  return v?.controlRange ?? UNIT.vUnit.controlRange;
}

function isHeroUnit(unit) {
  return !!unit && (UNIT[unit.type]?.hero || unit.type === "vUnit");
}

function isControlImmune(unit) {
  return isHeroUnit(unit) || unit.type === "vClone" || UNIT[unit.type]?.giant || UNIT[unit.type]?.controlImmune;
}

function isSiegeControlImmune(unit) {
  return isSiegeUnit(unit);
}

function beginMedusaSlay(medusa) {
  if (medusa.medusaSlayTimer > 0) {
    popText(medusa.x, medusa.y - 125, `石化冷却 ${Math.ceil(medusa.medusaSlayTimer)}秒`, "#93d96b");
    return;
  }
  state.pendingMedusaSlayId = medusa.id;
  state.pendingVControlId = null;
  popText(medusa.x, medusa.y - 125, "选择石化目标", "#93d96b");
}

function beginManualVControl(v) {
  if (v.controlledTargetId) {
    releaseVControl(v, true);
    return;
  }
  if (v.controlTimer > 0) {
    popText(v.x, v.y - 125, "控制冷却中", "#d7ceff");
    return;
  }
  state.pendingVControlId = v.id;
  popText(v.x, v.y - 125, "选择控制目标", "#d7ceff");
}

function throwGoldenSpear(unit) {
  if (unit.goldenSpearThrown) {
    popText(unit.x, unit.y - 125, "金矛已投", "#f7d66b");
    return;
  }
  const target = findFrontEnemyForGoldenSpear(unit.side);
  if (!target) {
    popText(unit.x, unit.y - 125, "没有目标", "#f7d66b");
    return;
  }
  unit.goldenSpearThrown = true;
  unit.cooldown = Math.max(unit.cooldown, UNIT.goldenSpartan.cooldown);
  state.arrows.push({
    x: unit.x,
    y: unit.y - 58,
    tx: target.x,
    ty: target.y ? target.y - 40 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 118,
    side: unit.side,
    damage: UNIT.goldenSpartan.goldenSpearDamage,
    sourceId: unit.id,
    sourceType: unit.type,
    target,
    life: 0.42,
    type: "goldenSpear",
  });
  popText(unit.x, unit.y - 118, "黄金投矛", "#f7d66b");
}

function findFrontEnemyForGoldenSpear(side) {
  const enemies = state.units.filter((unit) => (
    unit.side !== side &&
    unit.hp > 0 &&
    !isUnitHidden(unit) &&
    !UNIT[unit.type]?.untargetable
  ));
  if (!enemies.length) return null;
  return enemies.reduce((front, unit) => {
    if (!front) return unit;
    return side === "player"
      ? (unit.x < front.x ? unit : front)
      : (unit.x > front.x ? unit : front);
  }, null);
}

function tryMedusaSlay(point) {
  if (!state.pendingMedusaSlayId) return false;
  const medusa = state.units.find((unit) => unit.id === state.pendingMedusaSlayId && unit.hp > 0);
  if (!medusa) {
    state.pendingMedusaSlayId = null;
    return false;
  }

  const target = findUnitAt(point);
  if (!canMedusaSlay(medusa, target)) {
    popText(medusa.x, medusa.y - 125, "无法石化", "#93d96b");
    state.pendingMedusaSlayId = null;
    return true;
  }

  target.lastDamageSide = medusa.side;
  target.lastDamageUnitId = medusa.id;
  target.hp = 0;
  target.combatTimer = 3;
  medusa.medusaSlayTimer = UNIT.medusa.slayCooldown;
  state.pendingMedusaSlayId = null;
  state.lightning.push({ x1: medusa.x, y1: medusa.y - 78, x2: target.x, y2: target.y - 64, life: 0.28, duration: 0.28 });
  popText(target.x, target.y - 92, "石化秒杀", "#93d96b");
  return true;
}

function tryManualVControl(point) {
  if (!state.pendingVControlId) return false;
  const v = state.units.find((unit) => unit.id === state.pendingVControlId && unit.hp > 0);
  if (!v) {
    state.pendingVControlId = null;
    return false;
  }

  const target = findUnitAt(point);
  if (!canVControl(v, target)) {
    popText(v.x, v.y - 125, "无法控制", "#d7ceff");
    state.pendingVControlId = null;
    return true;
  }

  controlTargetWithV(v, target);
  state.pendingVControlId = null;
  return true;
}

function findPlayerTreeEntAt(point) {
  return state.units.find((unit) => {
    if (!isPlayerControlledSide(unit.side) || unit.type !== "treeEnt" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 52 && Math.abs(unit.y - 48 - point.y) <= 92;
  });
}

function findPlayerWaterElementAt(point) {
  return state.units.find((unit) => {
    if (!isPlayerControlledSide(unit.side) || unit.type !== "waterElement" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 46 && Math.abs(unit.y - 48 - point.y) <= 86;
  });
}

function sacrificeWaterElement(unit) {
  releaseFrozenTarget(unit);
  unit.noCorpse = true;
  unit.hp = 0;
  popText(unit.x, unit.y - 120, "水愈爆发", "#8ee0cf");
}

function handleSpecialPress(point) {
  const goldenSpartan = findPlayerGoldenSpartanAt(point);
  if (goldenSpartan) {
    throwGoldenSpear(goldenSpartan);
    updateHud();
    return true;
  }

  const v = findPlayerVAt(point);
  if (v) {
    beginManualVControl(v);
    updateHud();
    return true;
  }

  const medusa = findPlayerMedusaAt(point);
  if (medusa) {
    beginMedusaSlay(medusa);
    updateHud();
    return true;
  }

  const tree = findPlayerTreeEntAt(point);
  if (tree) {
    toggleTreeEntRoot(tree);
    updateHud();
    return true;
  }

  const water = findPlayerWaterElementAt(point);
  if (water) {
    sacrificeWaterElement(water);
    updateHud();
    return true;
  }

  return false;
}

function toggleTreeEntRoot(unit) {
  unit.rooted = !unit.rooted;
  if (unit.rooted) {
    unit.summonTimer = Math.min(unit.summonTimer, UNIT.treeEnt.summonEvery);
    popText(unit.x, unit.y - 120, "扎根召唤", "#8ee0cf");
    return;
  }

  killTreeScorpions(unit);
  popText(unit.x, unit.y - 120, "拔根前进", "#8ee0cf");
}

armyCommandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeMobileUnitShop();
    setCommand(button.dataset.command);
  });
});

minerCommandButtons.forEach((button) => {
  button.addEventListener("click", () => {
    closeMobileUnitShop();
    setMinerCommand(button.dataset.minerCommand);
  });
});

mobileUnitsToggle?.addEventListener("click", toggleMobileUnitShop);

canvas.addEventListener("dblclick", (event) => {
  if (state.over) return;
  const point = canvasPoint(event);
  if (handleSpecialPress(point)) return;
  selectVisibleGroupByUnitAt(point);
});

canvas.addEventListener("click", (event) => {
  if (state.over) return;
  if (selectionDragTriggered || joystickDragTriggered) {
    selectionDragTriggered = false;
    joystickDragTriggered = false;
    return;
  }
  if (longPressTriggered) {
    longPressTriggered = false;
    return;
  }
  const point = canvasPoint(event);
  if (handleManualControlClick(point) || handleGroupControlClick(point) || handleInspectedInfoButton(point)) {
    updateHud();
    return;
  }
  if (tryMedusaSlay(point) || tryManualVControl(point)) {
    updateHud();
    return;
  }
  inspectUnitAt(point);
});

window.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key === "c" || key === "C") {
    const unit = state?.inspectedUnitId
      ? state.units.find((candidate) => candidate.id === state.inspectedUnitId && candidate.hp > 0 && !isUnitHidden(candidate))
      : null;
    if (unit) {
      toggleManualControl(unit);
      event.preventDefault();
    }
    return;
  }
  if (!state?.controlledUnitId) return;
  if (key === "ArrowUp" || key === "w" || key === "W") manualKeys.up = true;
  else if (key === "ArrowDown" || key === "s" || key === "S") manualKeys.down = true;
  else if (key === "ArrowLeft" || key === "a" || key === "A") manualKeys.left = true;
  else if (key === "ArrowRight" || key === "d" || key === "D") manualKeys.right = true;
  else return;
  event.preventDefault();
});

window.addEventListener("keyup", (event) => {
  const key = event.key;
  if (key === "ArrowUp" || key === "w" || key === "W") manualKeys.up = false;
  else if (key === "ArrowDown" || key === "s" || key === "S") manualKeys.down = false;
  else if (key === "ArrowLeft" || key === "a" || key === "A") manualKeys.left = false;
  else if (key === "ArrowRight" || key === "d" || key === "D") manualKeys.right = false;
});

let longPressTimer = null;
let longPressStart = null;
let longPressTriggered = false;
let groupDrag = null;
let selectionDragTriggered = false;
let joystickDragTriggered = false;
let lastTouchTap = null;

canvas.addEventListener("pointerdown", (event) => {
  if (state.over) return;
  const point = canvasPoint(event);
  if (event.pointerType !== "mouse" && isInsideManualJoystick(point)) {
    manualJoystick.pointerId = event.pointerId;
    manualJoystick.active = true;
    manualJoystick.center = getManualJoystickBase();
    updateManualJoystick(point);
    joystickDragTriggered = false;
    event.preventDefault();
    return;
  }
  if (event.pointerType === "mouse" && event.button === 0) {
    groupDrag = { pointerId: event.pointerId, start: point, current: point, active: false };
    return;
  }
  if (event.pointerType === "mouse") return;
  longPressStart = { clientX: event.clientX, clientY: event.clientY, point: canvasPoint(event) };
  longPressTriggered = false;
  window.clearTimeout(longPressTimer);
  longPressTimer = window.setTimeout(() => {
    if (!longPressStart) return;
    longPressTriggered = handleSpecialPress(longPressStart.point);
  }, 520);
});

canvas.addEventListener("pointermove", (event) => {
  if (manualJoystick.active && manualJoystick.pointerId === event.pointerId) {
    updateManualJoystick(canvasPoint(event));
    joystickDragTriggered = true;
    event.preventDefault();
    return;
  }
  if (groupDrag?.pointerId === event.pointerId) {
    groupDrag.current = canvasPoint(event);
    if (distanceTo(groupDrag.start.x, groupDrag.start.y, groupDrag.current.x, groupDrag.current.y) > 12) {
      groupDrag.active = true;
    }
    return;
  }
  if (!longPressStart) return;
  const dx = event.clientX - longPressStart.clientX;
  const dy = event.clientY - longPressStart.clientY;
  if (Math.hypot(dx, dy) > 14) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressStart = null;
  }
});

["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  canvas.addEventListener(eventName, (event) => {
    if (manualJoystick.pointerId === event.pointerId) {
      stopManualJoystick();
      joystickDragTriggered = true;
    }
    if (groupDrag?.pointerId === event.pointerId) {
      if (groupDrag.active) {
        selectGroupByRect(normalizeRect(groupDrag.start, groupDrag.current));
        selectionDragTriggered = true;
      }
      groupDrag = null;
    }
    if (eventName === "pointerup" && event.pointerType !== "mouse" && longPressStart && !longPressTriggered && !joystickDragTriggered) {
      const point = canvasPoint(event);
      const tapped = findUnitAt(point);
      const now = performance.now();
      if (
        tapped &&
        isPlayerControlledSide(tapped.side) &&
        lastTouchTap &&
        lastTouchTap.type === tapped.type &&
        now - lastTouchTap.time <= 380 &&
        distanceTo(point.x, point.y, lastTouchTap.x, lastTouchTap.y) <= 70
      ) {
        if (!handleSpecialPress(point)) selectVisibleGroupByUnitAt(point);
        selectionDragTriggered = true;
        lastTouchTap = null;
      } else {
        lastTouchTap = tapped ? { type: tapped.type, x: point.x, y: point.y, time: now } : null;
      }
    }
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressStart = null;
  });
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  hideInstallButton();
  closeInstallGuide();
});

if (isIosDevice() && !isStandaloneApp()) {
  showInstallButton();
}

installBtn?.addEventListener("click", handleInstallClick);
closeInstallGuideBtn?.addEventListener("click", closeInstallGuide);
installGuide?.addEventListener("click", (event) => {
  if (event.target === installGuide) closeInstallGuide();
});

restartBtn.addEventListener("click", newGame);
topHomeBtn.addEventListener("click", returnToMainMenu);
homeBtn.addEventListener("click", returnToMainMenu);

pauseBtn.addEventListener("click", () => {
  if (state.over) return;
  state.paused = !state.paused;
  pauseBtn.classList.toggle("active", state.paused);
  pauseBtn.textContent = state.paused ? "继续" : "暂停";
  statusEl.textContent = state.paused ? "战斗已暂停" : "战斗继续";
});

fullscreenBtn.addEventListener("click", toggleFullscreen);
zoomOutBtn?.addEventListener("click", () => {
  if (canZoomBattlefield()) setBattlefieldZoom(battlefieldZoom / BATTLEFIELD_ZOOM_STEP);
});
zoomInBtn?.addEventListener("click", () => {
  if (canZoomBattlefield()) setBattlefieldZoom(battlefieldZoom * BATTLEFIELD_ZOOM_STEP);
});
zoomFitBtn?.addEventListener("click", () => {
  if (canZoomBattlefield()) fitBattlefieldToView();
});
window.addEventListener("resize", () => {
  applyBattlefieldZoom(true);
  if (currentFieldModeFourWay && battlefieldZoom <= getFitBattlefieldZoom() + 0.001) centerFourWayView();
});
document.addEventListener("fullscreenchange", updateFullscreenButton);
document.addEventListener("webkitfullscreenchange", updateFullscreenButton);

statsBtn.addEventListener("click", () => {
  renderStatsTable();
  statsOverlay.classList.remove("hidden");
});

closeStatsBtn.addEventListener("click", () => {
  statsOverlay.classList.add("hidden");
});

statsOverlay.addEventListener("click", (event) => {
  if (event.target === statsOverlay) statsOverlay.classList.add("hidden");
});

campaignBackBtn.addEventListener("click", closeCampaignMap);
briefingStartBtn.addEventListener("click", launchCampaignBriefing);
briefingCloseBtn.addEventListener("click", closeCampaignBriefing);
campaignBriefing.addEventListener("click", (event) => {
  if (event.target === campaignBriefing) closeCampaignBriefing();
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    if (selectedMode !== "campaign") activeCampaign = null;
    modeButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
  });
});

homeStartBtn?.addEventListener("click", () => {
  openRuleDialog();
});

ruleStartBtn?.addEventListener("click", () => {
  startSelectedBattle(selectedFaction || "order");
});

ruleCancelBtn?.addEventListener("click", closeRuleDialog);

ruleDialog?.addEventListener("click", (event) => {
  if (event.target === ruleDialog) closeRuleDialog();
});

teamModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedTeamMode = button.dataset.teamMode;
    teamModeButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
  });
});

controlModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedControlMode = button.dataset.controlMode;
    controlModeButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
  });
});

factionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedFaction = button.dataset.faction || "order";
    factionButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
  });
});

loadCampaignSave();
registerServiceWorker();
requestAnimationFrame(loop);
