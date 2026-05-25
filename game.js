const canvas = document.querySelector("#battlefield");
const ctx = canvas.getContext("2d");

const factionSelect = document.querySelector("#factionSelect");
const factionButtons = [...document.querySelectorAll(".faction-card")];
const modeButtons = [...document.querySelectorAll(".mode-card")];
const campaignMap = document.querySelector("#campaignMap");
const campaignTitle = document.querySelector("#campaignTitle");
const campaignProgress = document.querySelector("#campaignProgress");
const campaignPath = document.querySelector("#campaignPath");
const campaignBackBtn = document.querySelector("#campaignBackBtn");
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
const fullscreenBtn = document.querySelector("#fullscreenBtn");
const pauseBtn = document.querySelector("#pauseBtn");
const statsBtn = document.querySelector("#statsBtn");
const homeBtn = document.querySelector("#homeBtn");
const closeStatsBtn = document.querySelector("#closeStatsBtn");
const statsOverlay = document.querySelector("#statsOverlay");
const statsTable = document.querySelector("#statsTable");
const armyCommandButtons = [...document.querySelectorAll(".command-btn[data-command]")];
const minerCommandButtons = [...document.querySelectorAll(".miner-command-btn")];
const unitShop = document.querySelector(".unit-shop");
let trainButtons = [...document.querySelectorAll(".train-btn")];
const restartBtn = document.querySelector("#restartBtn");

const FIELD = {
  width: 2600,
  height: 620,
  ground: 470,
  playerBase: 95,
  enemyBase: 2505,
  playerGate: 185,
  enemyGate: 2415,
  playerMineX: 425,
  enemyMineX: 2175,
};
const RALLY = {
  playerOffset: 150,
  enemyOffset: 150,
  spacing: 9,
  maxSpread: 180,
};

const MERGE_COST = 30;
const MERGE_UNITS = new Set(["treeEnt", "rog", "dreadfire", "hurricane", "scaldStrike", "electricGate", "vUnit"]);
const AOE_TARGET_LIMIT = 5;
const STATUE_MAX_HP = 3000;
const BASE_ATTACK = {
  range: 420,
  damage: 20,
  cooldown: 2,
};

const UNIT = {
  miner: {
    name: "矿工",
    cost: 50,
    hp: 100,
    damage: 4,
    range: 30,
    speed: 46,
    train: 2.8,
    goldPerSwing: 25,
    bagSize: 100,
  },
  swordsman: {
    name: "剑士",
    cost: 70,
    hp: 85,
    damage: 8,
    range: 32,
    speed: 55,
    train: 3.8,
  },
  spearman: {
    name: "长矛兵",
    cost: 110,
    hp: 100,
    damage: 12,
    range: 42,
    speed: 54,
    train: 4.2,
    cooldown: 0.95,
    throwDamage: 25,
    throwRange: 165,
    throwRecover: 1,
  },
  archer: {
    name: "弓箭手",
    cost: 90,
    hp: 70,
    damage: 10,
    range: 200,
    speed: 44,
    train: 4.4,
    cooldown: 1.35,
  },
  greatsword: {
    name: "大剑兵",
    cost: 150,
    hp: 180,
    damage: 20,
    range: 38,
    speed: 42,
    train: 5.6,
    cooldown: 1.75,
  },
  spartan: {
    name: "斯巴达",
    cost: 160,
    hp: 450,
    damage: 12,
    range: 40,
    speed: 55,
    train: 6.2,
    cooldown: 1,
  },
  monk: {
    name: "修道士",
    cost: 120,
    hp: 150,
    damage: 0,
    range: 150,
    speed: 38,
    train: 4.4,
    healEvery: 2,
    healAmount: 25,
    healRange: 150,
  },
  crossbow: {
    name: "弩手",
    cost: 160,
    hp: 150,
    damage: 30,
    range: 108,
    speed: 38,
    train: 5,
    cooldown: 2,
    splash: 62,
    splashDamage: 9,
    flying: true,
  },
  musketeer: {
    name: "火枪手",
    cost: 150,
    hp: 100,
    damage: 40,
    range: 350,
    speed: 34,
    train: 5.2,
    cooldown: 2.25,
  },
  mage: {
    name: "法师",
    cost: 225,
    hp: 180,
    damage: 50,
    range: 300,
    speed: 32,
    train: 5.8,
    cooldown: 6,
    explosionRadius: 76,
    iceRadius: 120,
    iceDuration: 5,
    iceSlow: 0.1,
    iceAttackSlow: 0.1,
    iceDps: 3,
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
    name: "投石车",
    cost: 750,
    hp: 550,
    damage: 60,
    range: 600,
    speed: 40,
    train: 8,
    cooldown: 1.5,
    stunDuration: 1,
    blindSpot: 120,
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
    giant: true,
    freezeImmune: true,
  },
  rocketCart: {
    name: "火箭车",
    cost: 850,
    hp: 500,
    damage: 8,
    range: 350,
    speed: 35,
    train: 8,
    cooldown: 5,
    volleyCount: 50,
    volleyRadius: 50,
    splash: 24,
    arrowLife: 1.35,
    blindSpot: 100,
  },
  creeper: {
    name: "爬行者",
    cost: 45,
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
    name: "亡灵",
    cost: 55,
    hp: 60,
    damage: 7,
    range: 30,
    speed: 32,
    train: 2.5,
    cooldown: 1.05,
  },
  machete: {
    name: "砍刀兵",
    cost: 100,
    hp: 130,
    damage: 11,
    range: 34,
    speed: 60,
    train: 3.9,
    cooldown: 0.88,
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
    cost: 70,
    hp: 40,
    damage: 10,
    range: 34,
    speed: 70,
    train: 3.4,
    cooldown: 1.15,
    poisonDps: 8,
    poisonDuration: Infinity,
    poisonRadius: 84,
    poisonSlow: 0.65,
  },
  poisonZombie: {
    name: "毒尸",
    cost: 120,
    hp: 225,
    damage: 8,
    range: 135,
    speed: 30,
    train: 4.8,
    cooldown: 1.55,
    poisonDps: 5,
    poisonDuration: Infinity,
  },
  bomber: {
    name: "炸弹客",
    cost: 80,
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
  demonArcher: {
    name: "日蚀",
    cost: 150,
    hp: 125,
    damage: 17,
    range: 180,
    speed: 58,
    train: 4.7,
    cooldown: 1.35,
    flying: true,
  },
  darkKnight: {
    name: "黑骑士",
    cost: 165,
    hp: 450,
    damage: 17,
    range: 38,
    speed: 42,
    train: 5.8,
    cooldown: 1.05,
  },
  undeadMage: {
    name: "亡灵法师",
    cost: 250,
    hp: 200,
    damage: 32,
    range: 175,
    speed: 26,
    train: 5.6,
    cooldown: 2,
    summonEvery: 15,
    summonCount: 5,
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
    giant: true,
    antiAir: true,
    freezeImmune: true,
    stunDuration: 2,
  },
  superGiant: {
    name: "超级巨人",
    cost: 0,
    hp: 12000,
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
    hero: true,
  },
  earthElement: {
    name: "土元素",
    cost: 65,
    hp: 100,
    damage: 6,
    range: 36,
    speed: 34,
    train: 4.2,
    cooldown: 1.8,
    stunDuration: 1,
  },
  waterElement: {
    name: "水元素",
    cost: 90,
    hp: 150,
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
    cost: 105,
    hp: 100,
    damage: 18,
    range: 185,
    speed: 34,
    train: 4.8,
    cooldown: 1.25,
    burnDps: 3,
    burnDuration: 5,
  },
  windElement: {
    name: "风元素",
    cost: 120,
    hp: 85,
    damage: 30,
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
    hp: 30,
    damage: 5,
    range: 28,
    speed: 80,
    train: 0,
    cooldown: 0.9,
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
    dragonStun: 3,
    dragonDelay: 0.6,
    dragonRadius: 92,
    meteorCount: 20,
    meteorDamage: 4,
    meteorRadius: 130,
  },
  hurricane: {
    name: "飓风",
    cost: 0,
    hp: 250,
    damage: 60,
    range: 230,
    speed: 42,
    train: 5.8,
    cooldown: 4,
    stunDuration: 2,
    tornadoLife: 0.85,
    flying: true,
  },
  scaldStrike: {
    name: "烫水击",
    cost: 0,
    hp: 120,
    damage: 60,
    range: 42,
    speed: 55,
    train: 0,
    cooldown: 1,
    splash: 104,
    stunDuration: 5,
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
    blinkHpThreshold: 100,
    blinkThreatHp: 600,
    blinkCooldown: 20,
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
    roster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "monk", "crossbow", "musketeer", "mage", "catapult", "rocketCart"],
    startingUnits: ["miner", "swordsman"],
    mineColor: "#e2b64e",
  },
  chaos: {
    name: "混沌帝国",
    roster: ["miner", "creeper", "undead", "machete", "deadCorpse", "poisonZombie", "bomber", "demonArcher", "darkKnight", "undeadMage", "chaosGiant", "enslavedGiant"],
    startingUnits: ["miner", "undead", "creeper"],
    mineColor: "#b7f56e",
  },
  element: {
    name: "元素帝国",
    roster: ["earthElement", "waterElement", "fireElement", "windElement"],
    startingUnits: ["earthElement", "waterElement", "fireElement", "windElement"],
    mineColor: "#8ee0cf",
  },
};

const UNIT_ICON = {
  miner: "miner",
  swordsman: "sharp-sword",
  spearman: "spear",
  archer: "bow",
  greatsword: "greatsword",
  spartan: "spartan",
  monk: "monk",
  crossbow: "bomb-crossbow",
  musketeer: "gun",
  mage: "wizard-hat",
  berserker: "greatsword",
  archmage: "wizard-hat",
  catapult: "earth",
  enslavedGiant: "earth",
  rocketCart: "bomb-crossbow",
  creeper: "claws",
  undead: "zombie-head",
  machete: "machete",
  deadCorpse: "venom",
  poisonZombie: "venom",
  bomber: "bomb",
  medusa: "venom",
  demonArcher: "wing",
  darkKnight: "axe",
  undeadMage: "skull",
  suikai: "skull",
  chaosGiant: "axe",
  superGiant: "axe",
  earthElement: "earth",
  waterElement: "water",
  fireElement: "fire",
  windElement: "lightning",
  treeEnt: "miner",
  waterScorpion: "spear",
  rog: "lava",
  dreadfire: "fire-dragon",
  hurricane: "tornado",
  scaldStrike: "water",
  electricGate: "lightning",
  vUnit: "white-orb",
};

const STAT_GROUPS = [
  ["秩序帝国", ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "monk", "crossbow", "musketeer", "mage", "berserker", "archmage", "catapult", "rocketCart"]],
  ["混沌帝国", ["miner", "creeper", "undead", "machete", "medusa", "deadCorpse", "poisonZombie", "bomber", "demonArcher", "darkKnight", "undeadMage", "suikai", "chaosGiant", "enslavedGiant", "superGiant"]],
  ["元素帝国", ["earthElement", "waterElement", "fireElement", "windElement", "dreadfire", "hurricane", "scaldStrike", "electricGate", "treeEnt", "waterScorpion", "rog", "vUnit", "vClone"]],
];

let state;
let lastTime = performance.now();
let selectedFaction = "order";
let enemyFaction = "chaos";
let selectedMode = "versus";
const MODE_START_GOLD = {
  versus: 120,
  brawl: 5000,
};
const CAMPAIGN_UNLOCKS = {
  order: ["spearman", "archer", "greatsword", "spartan", "monk", "crossbow", "musketeer", "mage", "catapult", "rocketCart", "rocketCart", "rocketCart"],
  chaos: ["machete", "creeper", "undead", "deadCorpse", "poisonZombie", "bomber", "demonArcher", "darkKnight", "undeadMage", "chaosGiant", "enslavedGiant", "chaosGiant"],
  element: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "dreadfire", "hurricane", "scaldStrike", "electricGate", "vUnit"],
};
const campaignProgressByFaction = {
  order: 1,
  chaos: 1,
  element: 1,
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
      title: "第一关：长矛守军",
      playerRoster: ["miner", "swordsman"],
      playerStart: ["miner", "swordsman", "swordsman"],
      enemyRoster: ["spearman"],
      enemyStart: ["miner", "spearman"],
      enemyFaction: "order",
      enemyReinforcement: { type: "spearman", every: 8 },
      startGold: 120,
      enemyGold: 120,
      objective: "训练矿工和剑士，击败长矛守军",
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
      enemySpartanDamageReduction: 0.2,
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
      goldRush: { mineCount: 10, mineGold: 5000 },
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
        enemyRoster: ["miner", "creeper", "bomber", "demonArcher", "machete", "darkKnight"],
        enemyStart: ["miner", "creeper", "bomber", "demonArcher", "machete", "darkKnight"],
        enemyGold: 200,
        killPlayerArmy: true,
        message: "混沌帝国参战，摧毁混沌雕像才可胜利",
      },
      rewardText: "火枪手",
      objective: "先击破秩序雕像，再迎战混沌帝国并摧毁第二座雕像",
    },
    6: {
      title: "第六关：霜冻之地",
      playerRoster: ["miner", "swordsman", "spearman", "archer", "greatsword", "spartan", "monk", "crossbow", "musketeer", "mage"],
      playerStart: ["miner", "swordsman", "spearman", "archer", "musketeer", "berserker"],
      enemyRoster: ["miner", "chaosGiant", "enslavedGiant", "bomber"],
      enemyStart: ["miner", "miner", "bomber", "bomber", "bomber"],
      enemyFaction: "chaos",
      startGold: 180,
      enemyGold: 760,
      snow: { moveFactor: 0.9, ignoreGiant: true },
      secondPhase: {
        enemyFaction: "chaos",
        enemyRoster: [],
        enemyStart: ["superGiant"],
        enemyGold: 0,
        disableEnemyTraining: true,
        stunPlayerArmy: 5,
        reinforcements: [
          { type: "creeper", every: 5 },
          { type: "bomber", every: 6 },
          { type: "miner", every: 10, count: 2 },
        ],
        winByKillingType: "superGiant",
        message: "超级巨人出现，击杀它才可通关",
      },
      rewardText: "投石车",
      objective: "霜冻之地会让普通单位移速下降 10%，巨人不受影响；摧毁雕像后击杀超级巨人",
    },
  },
  chaos: {
    1: {
      title: "第一关：砍刀试炼",
      playerRoster: ["miner"],
      playerStart: ["miner", "medusa"],
      enemyRoster: ["machete"],
      enemyStart: ["miner", "machete"],
      enemyFaction: "chaos",
      failOnDeath: "medusa",
      startGold: 120,
      enemyGold: 120,
      objective: "保护美杜莎，击败砍刀兵",
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
      title: "第三关：日蚀降临",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "darkKnight"],
      playerStart: ["miner", "machete", "darkKnight", "medusa"],
      enemyRoster: ["miner", "creeper", "bomber", "demonArcher"],
      enemyStart: ["miner", "creeper", "bomber", "demonArcher"],
      enemyFaction: "chaos",
      failOnDeath: "medusa",
      startGold: 150,
      enemyGold: 170,
      darkeningSky: { tick: 5, duration: 300, maxAlpha: 0.82 },
      rewardText: "日蚀与炸弹客",
      objective: "在逐渐降临的黑暗中保护美杜莎，击败日蚀军团",
    },
    4: {
      title: "第四关：巨人血潮",
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "demonArcher", "bomber"],
      playerStart: ["miner", "machete", "undead", "poisonZombie", "demonArcher", "bomber"],
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
      playerRoster: ["miner", "machete", "undead", "poisonZombie", "demonArcher", "bomber", "darkKnight", "chaosGiant"],
      playerStart: ["miner", "machete", "undead", "poisonZombie", "demonArcher", "bomber", "chaosGiant"],
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
        message: "秩序帝国参战，再次摧毁秩序雕像才可胜利",
      },
      rewardText: "爬行者",
      objective: "顶住大型爬行者冲击，击败混沌雕像后再迎战秩序帝国",
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
      rewardText: "亡灵法师",
      objective: "敌军阵亡会在原地转化为我方亡灵，击败拥有连锁闪电与火球雨的大法师",
    },
  },
  element: {
    1: {
      title: "第一关：亡灵毒潮",
      playerRoster: [],
      playerStart: ["earthElement", "earthElement", "waterElement", "waterElement", "fireElement", "fireElement", "windElement", "windElement", "vUnit"],
      enemyRoster: ["undead", "poisonZombie"],
      enemyStart: ["miner", "undead", "poisonZombie"],
      enemyFaction: "chaos",
      startGold: 0,
      enemyGold: 120,
      godV: true,
      rewardText: "土元素与土化矿工能力",
      objective: "守护神明 V，击败亡灵与毒尸",
    },
    2: {
      title: "第二关：天火矿脉",
      playerRoster: ["earthElement"],
      playerStart: ["vUnit", "waterElement", "waterElement", "waterElement"],
      enemyRoster: ["miner", "creeper", "machete"],
      enemyStart: ["miner", "miner", "darkKnight", "darkKnight", "creeper"],
      enemyFaction: "chaos",
      startGold: 120,
      enemyGold: 160,
      godV: true,
      allowEarthMinerConversion: true,
      campaignMeteor: { every: 15, count: 3, damage: 80, radius: 96, duration: 2.4, size: 18 },
      rewardText: "水元素、火元素与罗格",
      objective: "以土元素开采与作战，在巨大陨石下守住矿脉",
    },
    3: {
      title: "第三关：冰道异变",
      playerRoster: ["earthElement", "fireElement", "rog"],
      playerStart: ["earthElement", "fireElement", "rog", "vUnit"],
      enemyRoster: ["miner", "creeper", "bomber", "demonArcher", "machete"],
      enemyStart: ["miner", "creeper", "bomber", "demonArcher", "machete"],
      enemyFaction: "chaos",
      startGold: 130,
      enemyGold: 180,
      godV: true,
      iceRoad: { slowDuration: 5, slowFactor: 0.5, fastFactor: 1.5 },
      enemyDeathsBecomeWaterScorpion: true,
      rewardText: "水元素、树精与烫水击",
      objective: "在冰道上掌握移动节奏，利用敌军死亡后的水蝎子反击",
    },
    4: {
      title: "第四关：雷云战场",
      playerRoster: ["earthElement", "waterElement", "fireElement", "treeEnt", "rog", "scaldStrike"],
      playerStart: ["earthElement", "waterElement", "fireElement", "treeEnt", "rog", "scaldStrike"],
      enemyRoster: ["miner", "swordsman", "crossbow", "archer", "spearman"],
      enemyStart: ["miner", "swordsman", "crossbow", "archer", "spearman"],
      enemyFaction: "order",
      startGold: 160,
      enemyGold: 190,
      stormClouds: { every: 5, bolts: 5, hitChance: 0.7, damage: 15 },
      rewardText: "风元素与电门",
      objective: "没有神明 V 支援，在雷云随机轰击中击败秩序军团",
    },
    5: {
      title: "第五关：雪中电门",
      playerRoster: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "scaldStrike", "electricGate"],
      playerStart: ["earthElement", "waterElement", "fireElement", "windElement", "treeEnt", "rog", "scaldStrike", "vUnit"],
      enemyRoster: ["miner", "undead", "poisonZombie", "deadCorpse", "suikai", "undeadMage", "demonArcher"],
      enemyStart: ["miner", "undead", "poisonZombie", "deadCorpse", "suikai", "undeadMage", "demonArcher"],
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
        message: "秩序帝国雕像出现，神明 V 躲过秒杀，继续摧毁秩序雕像",
      },
      rewardText: "飓风与厄火",
      objective: "雪中守护神明 V，先破混沌雕像，再击破秩序雕像",
    },
  },
};
let activeCampaign = null;

function opponentFaction() {
  return enemyFaction;
}

function factionForSide(side) {
  return side === "player" ? selectedFaction : opponentFaction();
}

function getUnitCost(type, faction) {
  if (type === "miner" && (faction === "order" || faction === "chaos")) return 65;
  if (faction === "element" && MERGE_UNITS.has(type)) return MERGE_COST;
  return UNIT[type].cost;
}

function currentPlayerRoster() {
  if (activeCampaign) return activeCampaign.playerRoster;
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
  if (data.splash) notes.push(`范围 ${data.splash}`);
  if (data.splashDamage) notes.push(`溅射 ${data.splashDamage}`);
  if (data.flying) notes.push("飞行");
  if (data.giant) notes.push("巨大体型");
  if (data.freezeImmune) notes.push("无法被冰冻");
  if (data.stunImmune) notes.push("免疫眩晕");
  if (data.slayImmune) notes.push("免疫秒杀");
  if (data.controlImmune) notes.push("免疫控制");
  if (data.antiAir) notes.push("近战可攻击空中");
  if (type === "spearman") notes.push(`首次接敌投矛 ${data.throwDamage} 伤害，${data.throwRecover}秒后换副矛近战`);
  if (type === "deadCorpse") notes.push(`自爆 ${data.damage} 伤害，范围中毒 ${data.poisonDps}/秒并减速；中毒目标受伤翻倍，死亡变亡灵`);
  if (type === "undead" || type === "poisonZombie" || type === "deadCorpse") notes.push("免疫中毒");
  if (data.poisonDps) notes.push(data.poisonDuration === Infinity ? `中毒 ${data.poisonDps}/秒，直到解毒或死亡` : `中毒 ${data.poisonDps}/秒 ${data.poisonDuration}秒`);
  if (data.burnDps) notes.push(`灼烧 ${data.burnDps}/秒 ${data.burnDuration}秒`);
  if (data.stunDuration) notes.push(`眩晕 ${data.stunDuration}秒`);
  if (data.healOnDeath) notes.push(`死亡治疗 ${data.healOnDeath}`);
  if (type === "waterElement") notes.push(`冰冻敌人 ${data.freezeDps}/秒`);
  if (data.lightning) notes.push("必中闪电");
  if (type === "dreadfire") notes.push(`火龙标记/爆发；流星雨 ${data.meteorCount} 颗`);
  if (type === "hurricane") notes.push(`每 ${data.cooldown}秒发射龙卷风，眩晕 ${data.stunDuration}秒`);
  if (type === "scaldStrike") notes.push(`一次性爆炸 ${data.damage}；眩晕 ${data.stunDuration}秒；灼烧 ${data.burnDps}/秒 ${data.burnDuration}秒`);
  if (type === "electricGate") notes.push(`持续 ${data.duration}秒，每秒闪电 ${data.damage}，消失后重生土元素`);
  if (type === "mage") notes.push(`魔爆 50 / 冰地减速90%并减攻速90%，每秒 ${data.iceDps} 伤害，持续 ${data.iceDuration}秒`);
  if (type === "berserker") notes.push(`英雄单位；每 ${data.rageEvery}秒使自己和周围剑士/大剑兵狂暴 ${data.rageDuration}秒`);
  if (type === "archmage") notes.push(`英雄单位；连锁闪电 ${data.chainDamages.join("/")}; 每 ${data.fireballEvery}秒召唤 ${data.fireballCount} 个大火球；五次普攻后近距离奥术爆炸`);
  if (type === "superGiant") notes.push("只攻击雕像，击杀后通关");
  if (data.blindSpot) notes.push(`盲区 ${data.blindSpot}，敌人太近时会后撤`);
  if (type === "rocketCart") notes.push(`每 ${data.cooldown}秒齐射 ${data.volleyCount} 支慢速爆炸箭`);
  if (type === "treeEnt") notes.push(`不推进，每 ${data.summonEvery}秒召唤水蝎子，上限 ${data.summonLimit}；命中回血 ${data.healOnHit}`);
  if (type === "waterScorpion") notes.push("由树精召唤");
  if (type === "rog") notes.push(`每 ${data.magmaEvery}秒岩浆灼烧`);
  if (type === "undeadMage") notes.push(`每 ${data.summonEvery}秒召唤 ${data.summonCount} 只高速亡灵`);
  if (type === "suikai") notes.push(`英雄单位；骨刺后召唤 ${data.summonCount} 只毒亡灵；每 ${data.corpseEvery}秒召唤死尸；每 ${data.hookEvery}秒钩走高威胁目标`);
  if (type === "medusa") notes.push(`英雄单位；每 ${data.poisonEvery}秒喷毒并释放 ${data.corpseReleaseCount} 只死尸；双击后点敌人可秒杀非巨人/V单位，冷却 ${data.slayCooldown}秒`);
  if (type === "vUnit") notes.push("出场 3 秒后召唤分身；双击后手动选择控制目标；控制期间无法行动；低血且被包围时仅闪现一次");
  if (type === "vClone") notes.push("由 V 召唤，近战攻击");
  return notes.join("；") || "无";
}

function renderStatsTable() {
  const columns = ["单位", "价格", "生命", "攻击", "射程", "速度", "攻速", "特殊"];
  statsTable.innerHTML = STAT_GROUPS.map(([groupName, types]) => {
    const rows = types
      .map((type) => {
        const data = UNIT[type];
        const faction = groupName === "秩序帝国" ? "order" : groupName === "混沌帝国" ? "chaos" : "element";
        return [
          data.name,
          getUnitCost(type, faction),
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
  enemyFaction = activeCampaign?.enemyFaction ?? chooseEnemyFaction();
  renderFactionUi();
  renderShop();
  homeBtn.classList.add("hidden");
  pauseBtn.classList.remove("active");
  pauseBtn.textContent = "暂停";
  const startGold = activeCampaign?.startGold ?? MODE_START_GOLD[selectedMode] ?? MODE_START_GOLD.versus;
  const enemyStartGold = activeCampaign?.enemyGold ?? startGold;

  state = {
    gold: startGold,
    enemyGold: enemyStartGold,
    command: "guard",
    minerCommand: "mine",
    paused: false,
    over: false,
    winner: null,
    playerHp: STATUE_MAX_HP,
    enemyHp: STATUE_MAX_HP,
    units: [],
    arrows: [],
    blasts: [],
    lightning: [],
    iceFields: [],
    spikes: [],
    delayedSpells: [],
    meteors: [],
    tornadoes: [],
    floaters: [],
    spawnQueue: [],
    enemySpawnTimer: 0,
    enemyMinerTimer: 4,
    enemyAttackMood: 4,
    enemyCommand: "guard",
    enemyCommandTimer: 0,
    enemyLineX: getEnemyRallyBaseX(),
    playerBaseAttackTimer: 0,
    enemyBaseAttackTimer: 0,
    pendingVControlId: null,
    pendingMedusaSlayId: null,
    passiveGoldTimer: 2,
    campaignReinforcementTimer: activeCampaign?.enemyReinforcement?.every ?? 0,
    campaignTrainCounts: {},
    arrowRainTimer: activeCampaign?.arrowRain?.every ?? 0,
    arrowRainRemaining: 0,
    arrowRainDropCarry: 0,
    undeadMineWaveTimer: activeCampaign?.undeadMineWave?.every ?? 0,
    undeadMineWaveElapsed: 0,
    campaignMeteorTimer: activeCampaign?.campaignMeteor?.every ?? 0,
    goldRushMines: createGoldRushMines(activeCampaign?.goldRush),
    enemyHealthGrowthTimer: activeCampaign?.enemyHealthGrowth?.every ?? 0,
    stormCloudTimer: activeCampaign?.stormClouds?.every ?? 0,
    campaignPhase: 1,
    secondPhaseReinforcementTimers: [],
    campaignDarknessElapsed: 0,
    screenShake: 0,
    nextId: 1,
  };

  const playerStart = activeCampaign?.playerStart ?? FACTIONS[selectedFaction].startingUnits;
  const enemyStart = activeCampaign?.enemyStart ?? FACTIONS[opponentFaction()].startingUnits;

  playerStart.forEach((type, index) => {
    spawnUnit(type, "player", FIELD.playerGate - 28 + index * 32);
  });
  enemyStart.forEach((type, index) => {
    spawnUnit(type, "enemy", FIELD.enemyGate + 28 - index * 32);
  });
  spawnCampaignCenterElectricGate();
  setCommand("guard");
  setMinerCommand("mine");
  if (activeCampaign) statusEl.textContent = `${activeCampaign.title}：${activeCampaign.objective}`;
  if (selectedMode === "brawl") statusEl.textContent = "大乱斗开局，双方各有 5000 金币";
  updateHud();
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

function chooseEnemyFaction() {
  const factions = Object.keys(FACTIONS);
  return factions[Math.floor(Math.random() * factions.length)];
}

function openCampaignMap() {
  renderFactionUi();
  renderCampaignMap();
  factionSelect.classList.add("hidden");
  campaignMap.classList.remove("hidden");
}

function renderCampaignMap() {
  const faction = selectedFaction;
  const progress = campaignProgressByFaction[faction] ?? 1;
  const unlocks = CAMPAIGN_UNLOCKS[faction];

  campaignTitle.textContent = `${FACTIONS[faction].name}战役`;
  campaignProgress.textContent = `第 ${progress} 关可挑战，共 12 关`;
  campaignPath.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const level = index + 1;
    const unitType = unlocks[index];
    const unitName = UNIT[unitType]?.name ?? "终章军团";
    const available = level <= progress;
    const config = CAMPAIGN_LEVELS[faction]?.[level];
    const rewardText = config?.rewardText === "" ? "无" : (config?.rewardText ?? unitName);
    return `
      <button class="campaign-node ${available ? "available" : "locked"}" data-level="${level}" ${available ? "" : "disabled"}>
        <span class="level-tag">第 ${level} 关</span>
        <strong>${config?.title ?? (available ? "可挑战" : "未解锁")}</strong>
        <small>通关后解锁：${rewardText}</small>
        <small>${available ? (config ? "点击开始战斗" : "关卡暂未设计") : `完成第 ${level - 1} 关后开启`}</small>
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
  activeCampaign = { faction, level, ...config };
  campaignMap.classList.add("hidden");
  newGame();
}

function renderFactionUi() {
  playerNameEl.textContent = FACTIONS[selectedFaction].name;
  enemyNameEl.textContent = FACTIONS[opponentFaction()].name;
  playerCard.classList.toggle("order", selectedFaction === "order");
  playerCard.classList.toggle("chaos", selectedFaction === "chaos");
  playerCard.classList.toggle("element", selectedFaction === "element");
  enemyCard.classList.toggle("order", opponentFaction() === "order");
  enemyCard.classList.toggle("chaos", opponentFaction() === "chaos");
  enemyCard.classList.toggle("element", opponentFaction() === "element");
}

const ELEMENT_MERGE_ACTIONS = [
  { type: "treeEnt", action: "mergeTreeEnt" },
  { type: "rog", action: "mergeRog" },
  { type: "dreadfire", action: "mergeDreadfire" },
  { type: "hurricane", action: "mergeHurricane" },
  { type: "scaldStrike", action: "mergeScaldStrike" },
  { type: "electricGate", action: "mergeElectricGate" },
  { type: "vUnit", action: "mergeV" },
];

function getAvailableElementMerges() {
  if (selectedFaction !== "element") return [];
  if (!activeCampaign) return ELEMENT_MERGE_ACTIONS;
  const roster = currentPlayerRoster();
  return ELEMENT_MERGE_ACTIONS.filter((merge) => roster.includes(merge.type));
}

function renderShop() {
  const showElementConvertButton = selectedFaction === "element" && (!activeCampaign || canUseEarthMinerConversion());
  const allowedElementMerges = getAvailableElementMerges();
  const showElementMergeButtons = allowedElementMerges.length > 0;
  const elementActionButtons =
    showElementMergeButtons || showElementConvertButton
      ? `
        ${showElementMergeButtons ? allowedElementMerges.map((merge) => `
        <button class="train-btn" data-action="${merge.action}">
          <span class="unit-icon ${UNIT_ICON[merge.type]}"></span>
          <strong>合成${UNIT[merge.type].name}</strong>
          <small>${MERGE_COST} 金币</small>
        </button>
        `).join("") : ""}
        ${showElementConvertButton ? `
        <button class="train-btn" data-action="convertEarth">
          <span class="unit-icon miner"></span>
          <strong>土化矿工</strong>
          <small>选择一名土元素</small>
        </button>
        ` : ""}
      `
      : "";
  const shopRoster = currentPlayerRoster().filter((type) => !MERGE_UNITS.has(type));

  unitShop.innerHTML =
    shopRoster
    .map((type) => {
      const data = UNIT[type];
      return `
        <button class="train-btn" data-unit="${type}">
          <span class="unit-icon ${UNIT_ICON[type]}"></span>
          <strong>${data.name}</strong>
          <small>${getUnitCost(type, selectedFaction)} 金币${Number.isFinite(getCampaignUnitLimit(type)) ? ` · 本关限 ${getCampaignUnitLimit(type)}` : ""}</small>
        </button>
      `;
    })
      .join("") + elementActionButtons;

  trainButtons = [...document.querySelectorAll(".train-btn")];
  trainButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.action === "convertEarth") {
        convertEarthToMiner("player");
        return;
      }
      if (button.dataset.action === "mergeTreeEnt") {
        mergeTreeEnt("player");
        return;
      }
      if (button.dataset.action === "mergeRog") {
        mergeRog("player");
        return;
      }
      if (button.dataset.action === "mergeDreadfire") {
        mergeDreadfire("player");
        return;
      }
      if (button.dataset.action === "mergeHurricane") {
        mergeHurricane("player");
        return;
      }
      if (button.dataset.action === "mergeScaldStrike") {
        mergeScaldStrike("player");
        return;
      }
      if (button.dataset.action === "mergeElectricGate") {
        mergeElectricGate("player");
        return;
      }
      if (button.dataset.action === "mergeV") {
        mergeV("player");
        return;
      }
      queueUnit(button.dataset.unit);
    });
  });
}

function setCommand(command) {
  state.command = command;
  if (command !== "retreat") {
    state.units.forEach((unit) => {
      if (unit.side === "player" && unit.inCastle) unit.inCastle = false;
    });
  }
  armyCommandButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.command === command);
  });

  if (!state.over) {
    const label = { retreat: "撤退！部队回到城堡内", guard: "防守阵线已展开", attack: "全军进攻，目标敌方雕像" };
    statusEl.textContent = label[command];
  }
}

function setMinerCommand(command) {
  state.minerCommand = command;
  if (command !== "retreat" && state.command !== "retreat") {
    state.units.forEach((unit) => {
      if (unit.side === "player" && unit.type === "miner" && unit.inCastle) unit.inCastle = false;
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
  const data = UNIT[type];
  const lane = Math.random() * 34 - 17;
  state.units.push({
    id: state.nextId++,
    type,
    side,
    x,
    y: FIELD.ground + lane,
    hp: data.hp,
    maxHp: data.hp,
    cooldown: 0,
    mineTimer: 0,
    carry: 0,
    poisonTimer: 0,
    poisonDps: 0,
    poisonTick: 0,
    poisonSlow: 1,
    poisonRaisesUndead: false,
    poisonSourceSide: null,
    burnTimer: 0,
    burnDps: 0,
    burnTick: 0,
    healTimer: UNIT[type].healEvery ?? 0,
    stunTimer: 0,
    frozenBy: null,
    frozenTick: 0,
    boundTargetId: null,
    summonTimer: UNIT[type].summonEvery ?? 0,
    magmaTimer: UNIT[type].magmaEvery ?? 0,
    summonCooldown: UNIT[type].summonEvery ?? 0,
    controlTimer: UNIT[type].controlEvery ?? 0,
    controlLockTimer: 0,
    blinkTimer: 0,
    blinkUsed: false,
    cloneSpawnTimer: type === "vUnit" ? UNIT.vUnit.cloneReleaseDelay : 0,
    electricGateTimer: UNIT[type].duration ?? 0,
    electricGateTick: 1,
    spearThrown: false,
    spearRecoverTimer: 0,
    initialClonesReleased: false,
    controlledTargetId: null,
    controlledBy: null,
    originalSide: null,
    nextSpell: "blast",
    nextDreadfireSpell: "dragon",
    medusaPoisonTimer: UNIT[type].poisonEvery ?? 0,
    medusaSlayTimer: 0,
    suikaiCorpseTimer: UNIT[type].corpseEvery ?? 0,
    suikaiHookTimer: UNIT[type].hookEvery ?? 0,
    archmageFireballTimer: UNIT[type].fireballEvery ?? 0,
    archmageAttackCount: 0,
    berserkerRageTimer: UNIT[type].rageEvery ?? 0,
    rageTimer: 0,
    spawnedClones: false,
    summonerId: null,
    forceCharge: false,
    earthMiner: false,
    rooted: type === "treeEnt" ? false : null,
    inCastle: false,
    combatTimer: 0,
    chaosRegenTick: 0,
    chaosCleanseTimer: 10,
    exploded: false,
    anim: Math.random() * 10,
  });

  const unit = state.units[state.units.length - 1];
  applyCampaignUnitModifiers(unit);
  return unit;
}

function applyCampaignUnitModifiers(unit) {
  if (!activeCampaign?.godV || unit.side !== "player" || unit.type !== "vUnit") return;
  unit.nameOverride = "神明V";
  unit.godV = true;
  unit.maxHp = 1275;
  unit.hp = 1275;
  unit.cloneSpawnTimer = 5;
  unit.cloneLimit = 3;
  unit.blinkHpThreshold = 350;
  unit.blinkThreatHp = 1000;
  unit.blinkDistance = 600;
  unit.canControlAll = true;
}

function convertEarthToMiner(side) {
  const unit = state.units.find((candidate) => candidate.side === side && candidate.type === "earthElement" && candidate.hp > 0 && !isUnitHidden(candidate));
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

function mergeTreeEnt(side) {
  const { earth, water } = getTreeEntMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#8ee0cf")) return false;
  if (!earth || !water) {
    popText(x, FIELD.ground - 100, "需要土元素和空闲水元素", "#8ee0cf");
    refundMergeCost(side);
    return false;
  }

  releaseFrozenTarget(water);
  state.units = state.units.filter((unit) => unit !== earth && unit !== water);
  spawnUnit("treeEnt", side, (earth.x + water.x) / 2);
  popText((earth.x + water.x) / 2, FIELD.ground - 95, "合成树精", "#8ee0cf");
  return true;
}

function mergeRog(side) {
  const { earth, fire } = getRogMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#ff9b45")) return false;
  if (!earth || !fire) {
    popText(x, FIELD.ground - 100, "需要土元素和火元素", "#ff9b45");
    refundMergeCost(side);
    return false;
  }

  state.units = state.units.filter((unit) => unit !== earth && unit !== fire);
  spawnUnit("rog", side, (earth.x + fire.x) / 2);
  popText((earth.x + fire.x) / 2, FIELD.ground - 95, "合成罗格", "#ff9b45");
  return true;
}

function mergeDreadfire(side) {
  const { fire, wind } = getDreadfireMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#ff7a3d")) return false;
  if (!fire || !wind) {
    popText(x, FIELD.ground - 100, "需要火元素和风元素", "#ff7a3d");
    refundMergeCost(side);
    return false;
  }

  state.units = state.units.filter((unit) => unit !== fire && unit !== wind);
  spawnUnit("dreadfire", side, (fire.x + wind.x) / 2);
  popText((fire.x + wind.x) / 2, FIELD.ground - 95, "合成厄火", "#ff7a3d");
  return true;
}

function mergeHurricane(side) {
  const { water, wind } = getHurricaneMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#9ee8ff")) return false;
  if (!water || !wind) {
    popText(x, FIELD.ground - 100, "需要空闲水元素和风元素", "#9ee8ff");
    refundMergeCost(side);
    return false;
  }

  releaseFrozenTarget(water);
  state.units = state.units.filter((unit) => unit !== water && unit !== wind);
  spawnUnit("hurricane", side, (water.x + wind.x) / 2);
  popText((water.x + wind.x) / 2, FIELD.ground - 95, "合成飓风", "#9ee8ff");
  return true;
}

function mergeScaldStrike(side) {
  const { water, fire } = getScaldStrikeMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#ffb36e")) return false;
  if (!water || !fire) {
    popText(x, FIELD.ground - 100, "需要空闲水元素和火元素", "#ffb36e");
    refundMergeCost(side);
    return false;
  }

  releaseFrozenTarget(water);
  state.units = state.units.filter((unit) => unit !== water && unit !== fire);
  spawnUnit("scaldStrike", side, (water.x + fire.x) / 2);
  popText((water.x + fire.x) / 2, FIELD.ground - 95, "合成烫水击", "#ffb36e");
  return true;
}

function mergeElectricGate(side) {
  const { earth, wind } = getElectricGateMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#9ee8ff")) return false;
  if (!earth || !wind) {
    popText(x, FIELD.ground - 100, "需要土元素和风元素", "#9ee8ff");
    refundMergeCost(side);
    return false;
  }

  state.units = state.units.filter((unit) => unit !== earth && unit !== wind);
  spawnUnit("electricGate", side, (earth.x + wind.x) / 2);
  popText((earth.x + wind.x) / 2, FIELD.ground - 95, "合成电门", "#9ee8ff");
  return true;
}

function mergeV(side) {
  const materials = getVMaterials(side);
  const x = side === "player" ? FIELD.playerGate : FIELD.enemyGate;

  if (!payMergeCost(side, x, "#d7ceff")) return false;
  if (!materials) {
    popText(x, FIELD.ground - 100, "需要土水火风各 2 个", "#d7ceff");
    refundMergeCost(side);
    return false;
  }

  state.units = state.units.filter((unit) => !materials.includes(unit));
  const spawnX = materials.reduce((sum, unit) => sum + unit.x, 0) / materials.length;
  spawnUnit("vUnit", side, spawnX);
  popText(spawnX, FIELD.ground - 105, "合成 V", "#d7ceff");
  return true;
}

function payMergeCost(side, x, color) {
  const key = side === "player" ? "gold" : "enemyGold";
  if (state[key] < MERGE_COST) {
    popText(x, FIELD.ground - 100, `融合需要 ${MERGE_COST} 金币`, color);
    return false;
  }
  state[key] -= MERGE_COST;
  return true;
}

function refundMergeCost(side) {
  if (side === "player") state.gold += MERGE_COST;
  else state.enemyGold += MERGE_COST;
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

function getTreeEntMaterials(side) {
  return {
    earth: state.units.find((unit) => unit.side === side && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit)),
    water: state.units.find((unit) => unit.side === side && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId),
  };
}

function getRogMaterials(side) {
  return {
    earth: state.units.find((unit) => unit.side === side && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit)),
    fire: state.units.find((unit) => unit.side === side && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit)),
  };
}

function getDreadfireMaterials(side) {
  return {
    fire: state.units.find((unit) => unit.side === side && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit)),
    wind: state.units.find((unit) => unit.side === side && unit.type === "windElement" && unit.hp > 0 && !isUnitHidden(unit)),
  };
}

function getHurricaneMaterials(side) {
  return {
    water: state.units.find((unit) => unit.side === side && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId),
    wind: state.units.find((unit) => unit.side === side && unit.type === "windElement" && unit.hp > 0 && !isUnitHidden(unit)),
  };
}

function getScaldStrikeMaterials(side) {
  return {
    water: state.units.find((unit) => unit.side === side && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId),
    fire: state.units.find((unit) => unit.side === side && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit)),
  };
}

function getElectricGateMaterials(side) {
  return {
    earth: state.units.find((unit) => unit.side === side && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit)),
    wind: state.units.find((unit) => unit.side === side && unit.type === "windElement" && unit.hp > 0 && !isUnitHidden(unit)),
  };
}

function getVMaterials(side) {
  const required = ["earthElement", "earthElement", "waterElement", "waterElement", "fireElement", "fireElement", "windElement", "windElement"];
  const picked = [];

  for (const type of required) {
    const unit = state.units.find((candidate) => {
      if (candidate.side !== side || candidate.type !== type || candidate.hp <= 0 || isUnitHidden(candidate) || picked.includes(candidate)) return false;
      if (candidate.type === "waterElement" && candidate.boundTargetId) return false;
      return true;
    });
    if (!unit) return null;
    picked.push(unit);
  }

  return picked;
}

function canMergeTreeEnt(side) {
  const { earth, water } = getTreeEntMaterials(side);
  return Boolean(earth && water);
}

function canMergeRog(side) {
  const { earth, fire } = getRogMaterials(side);
  return Boolean(earth && fire);
}

function canMergeDreadfire(side) {
  const { fire, wind } = getDreadfireMaterials(side);
  return Boolean(fire && wind);
}

function canMergeHurricane(side) {
  const { water, wind } = getHurricaneMaterials(side);
  return Boolean(water && wind);
}

function canMergeScaldStrike(side) {
  const { water, fire } = getScaldStrikeMaterials(side);
  return Boolean(water && fire);
}

function canMergeElectricGate(side) {
  const { earth, wind } = getElectricGateMaterials(side);
  return Boolean(earth && wind);
}

function canMergeV(side) {
  return Boolean(getVMaterials(side));
}

function queueUnit(type) {
  if (state.over) return;
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
  const cost = getUnitCost(type, selectedFaction);
  if (state.gold < cost) {
    popText(FIELD.playerGate, FIELD.ground - 95, "金币不足", "#f3c963");
    return;
  }

  state.gold -= cost;
  state.campaignTrainCounts[type] = getCampaignQueuedCount(type) + 1;
  state.spawnQueue.push({ type, timer: data.train });
  popText(FIELD.playerGate, FIELD.ground - 118, `训练 ${data.name}`, "#d9e8ff");
  updateHud();
}

function update(dt) {
  if (state.paused) return;

  if (state.over) {
    updateParticles(dt);
    return;
  }

  updateQueue(dt);
  updatePassiveGold(dt);
  updateCampaignRules(dt);
  updateEnemyAi(dt);
  updateUnits(dt);
  updateBaseAttacks(dt);
  updateChaosRecovery(dt);
  updateArrows(dt);
  updateFrozenDamage(dt);
  updatePoison(dt);
  updateBurn(dt);
  updateDelayedSpells(dt);
  updateMeteors(dt);
  updateTornadoes(dt);
  updateIceFieldEffects(dt);
  updateParticles(dt);
  removeDead();
  checkWin();
  updateHud();
}

function updatePassiveGold(dt) {
  state.passiveGoldTimer -= dt;
  if (state.passiveGoldTimer > 0) return;

  state.passiveGoldTimer += 2;
  state.gold += 10;
  state.enemyGold += 10;
}

function updateQueue(dt) {
  for (const item of state.spawnQueue) item.timer -= dt;
  const ready = state.spawnQueue.filter((item) => item.timer <= 0);
  state.spawnQueue = state.spawnQueue.filter((item) => item.timer > 0);
  ready.forEach((item, index) => {
    spawnUnit(item.type, "player", FIELD.playerGate - 20 + index * 12);
  });
}

function updateCampaignRules(dt) {
  updateCampaignReinforcements(dt);
  updateSecondPhaseReinforcements(dt);
  updateCampaignArrowRain(dt);
  updateCampaignUndeadMineWave(dt);
  updateCampaignMeteor(dt);
  updateCampaignDarkness(dt);
  updateCampaignEnemyHealthGrowth(dt);
  updateCampaignStormClouds(dt);
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
  state.stormCloudTimer -= dt;
  if (state.stormCloudTimer > 0) return;
  state.stormCloudTimer += storm.every;
  for (let i = 0; i < storm.bolts; i += 1) {
    strikeStormBolt(storm);
  }
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
  const count = config.mineCount ?? 10;
  const left = FIELD.playerGate + 520;
  const right = FIELD.enemyGate - 520;
  const step = count > 1 ? (right - left) / (count - 1) : 0;
  return Array.from({ length: count }, (_, index) => ({
    id: `goldRush-${index}`,
    x: left + step * index,
    remaining: config.mineGold ?? 5000,
    capacity: config.mineGold ?? 5000,
  }));
}

function isGoldRushActive() {
  return Boolean(activeCampaign?.goldRush && state.goldRushMines?.length);
}

function updateCampaignReinforcements(dt) {
  if (!activeCampaign?.enemyReinforcement) return;
  const reinforcement = activeCampaign.enemyReinforcement;
  if (reinforcement.phase && reinforcement.phase !== state.campaignPhase) return;
  state.campaignReinforcementTimer -= dt;
  if (state.campaignReinforcementTimer > 0) return;
  state.campaignReinforcementTimer += reinforcement.every;
  spawnUnit(reinforcement.type, "enemy", FIELD.enemyGate + 12);
  popText(FIELD.enemyGate - 60, FIELD.ground - 112, `${UNIT[reinforcement.type].name}增援`, "#ffb0a3");
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

  state.arrowRainTimer -= dt;
  if (state.arrowRainTimer <= 0 && state.arrowRainRemaining <= 0) {
    state.arrowRainTimer += rain.every;
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
    side: "enemy",
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

  state.campaignMeteorTimer -= dt;
  if (state.campaignMeteorTimer > 0) return;

  state.campaignMeteorTimer += meteor.every;
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
}

function updateEnemyAi(dt) {
  state.enemySpawnTimer -= dt;
  state.enemyMinerTimer -= dt;
  state.enemyAttackMood += dt;
  state.enemyCommandTimer -= dt;
  updateEnemyCommand();
  updateEnemyBattleLine(dt);
  if (activeCampaign?.secondPhase?.disableEnemyTraining && state.campaignPhase === 2) return;

  const enemyMiners = state.units.filter((unit) => unit.side === "enemy" && unit.type === "miner").length;
  const savingForV = shouldEnemySaveForV();

  if (opponentFaction() === "element" && state.enemyAttackMood > 34 && canMergeV("enemy") && mergeV("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 5);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 18 && canMergeTreeEnt("enemy") && canSpendVMaterials(["earthElement", "waterElement"], savingForV) && mergeTreeEnt("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 24 && canMergeRog("enemy") && canSpendVMaterials(["earthElement", "fireElement"], savingForV) && mergeRog("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 28 && canMergeDreadfire("enemy") && canSpendVMaterials(["fireElement", "windElement"], savingForV) && mergeDreadfire("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 32 && canMergeHurricane("enemy") && canSpendVMaterials(["waterElement", "windElement"], savingForV) && mergeHurricane("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 30 && canMergeScaldStrike("enemy") && canSpendVMaterials(["waterElement", "fireElement"], savingForV) && mergeScaldStrike("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }
  if (opponentFaction() === "element" && state.enemyAttackMood > 30 && canMergeElectricGate("enemy") && canSpendVMaterials(["earthElement", "windElement"], savingForV) && mergeElectricGate("enemy")) {
    state.enemySpawnTimer = Math.max(state.enemySpawnTimer, 3);
  }

  if (opponentFaction() === "element" && enemyMiners < 2 && state.enemyMinerTimer <= 0 && (!savingForV || countUnits("enemy", "earthElement") > 2) && convertEarthToMiner("enemy")) {
    state.enemyMinerTimer = 8;
  }

  const minerCost = getUnitCost("miner", opponentFaction());
  if (state.enemyMinerTimer <= 0 && enemyMiners < 3 && state.enemyGold >= minerCost) {
    state.enemyGold -= minerCost;
    state.enemyMinerTimer = 8;
    spawnUnit("miner", "enemy", FIELD.enemyGate + 34);
  }

  if (state.enemySpawnTimer <= 0) {
    const enemyRoster = currentEnemyRoster().filter((type) => type !== "miner" && !UNIT[type]?.hero);
    const affordable = enemyRoster.filter((type) => getUnitCost(type, opponentFaction()) <= state.enemyGold);
    if (!affordable.length) {
      state.enemySpawnTimer = 0.8;
      return;
    }

    const type = chooseEnemyUnit(affordable);
    state.enemyGold -= getUnitCost(type, opponentFaction());
    state.enemySpawnTimer = opponentFaction() === "element" ? 1.8 + Math.random() * 2.1 : 1.35 + Math.random() * 1.55;
    spawnUnit(type, "enemy", FIELD.enemyGate + 12);
  }
}

function updateEnemyCommand() {
  if (state.enemyCommandTimer > 0) return;

  const enemyPower = getArmyPower("enemy");
  const playerPower = getArmyPower("player");
  const enemyFighters = countFighters("enemy");
  const playerPressure = state.units.filter((unit) => unit.side === "player" && unit.hp > 0 && !isUnitHidden(unit) && unit.x > FIELD.enemyGate - 430).length;
  let nextCommand = "guard";

  if (state.enemyHp < 360 && enemyPower < playerPower * 0.95) {
    nextCommand = "retreat";
  } else if (playerPressure >= 3 || enemyPower < playerPower * 0.78 || enemyFighters < 3) {
    nextCommand = "guard";
  } else if (state.enemyAttackMood < 16) {
    nextCommand = "guard";
  } else if (enemyFighters >= 5 && enemyPower >= Math.max(260, playerPower * 1.08)) {
    nextCommand = "attack";
  } else if (Math.random() < 0.22) {
    nextCommand = "guard";
  } else {
    nextCommand = "attack";
  }

  if (nextCommand !== state.enemyCommand) {
    state.enemyCommand = nextCommand;
    const label = { retreat: "敌方撤退", guard: "敌方防守", attack: "敌方进攻" };
    popText(FIELD.enemyGate - 90, FIELD.ground - 135, label[nextCommand], "#ffb0a3");
  }
  state.enemyCommandTimer = 4 + Math.random() * 2.5;
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
  } else if (enemyFighters >= 4 && enemyPower >= playerPower * 0.85) {
    targetLine = Math.max(FIELD.playerGate + 340, playerFront ? playerFront + 300 : FIELD.enemyGate - 620);
  } else {
    targetLine = getEnemyRallyBaseX();
  }

  if (state.enemyCommand !== "retreat") {
    targetLine = Math.min(getEnemyRallyBaseX(), Math.max(FIELD.playerGate + 220, targetLine));
  }
  const lineSpeed = state.enemyCommand === "retreat" ? 210 : state.enemyCommand === "attack" ? 92 : 56;
  const step = Math.sign(targetLine - state.enemyLineX) * lineSpeed * dt;
  if (Math.abs(targetLine - state.enemyLineX) <= Math.abs(step)) state.enemyLineX = targetLine;
  else state.enemyLineX += step;
}

function getArmyPower(side) {
  return state.units.reduce((sum, unit) => {
    if (unit.side !== side || unit.hp <= 0 || isUnitHidden(unit) || unit.type === "miner") return sum;
    const data = UNIT[unit.type];
    const rangeBonus = (data.range ?? 30) > 80 ? 1.25 : 1;
    const giantBonus = data.giant ? 1.35 : 1;
    return sum + (unit.hp + (unit.damage ?? data.damage ?? 0) * 18) * rangeBonus * giantBonus;
  }, 0);
}

function countFighters(side) {
  return state.units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitHidden(unit) && unit.type !== "miner").length;
}

function getFrontX(side) {
  const fighters = state.units.filter((unit) => unit.side === side && unit.hp > 0 && !isUnitHidden(unit) && unit.type !== "miner");
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

  const weights = {
    swordsman: 1.1,
    spearman: 0.85,
    archer: 0.9,
    greatsword: 0.75,
    spartan: 0.55,
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
    undead: 1.05,
    machete: 0.9,
    deadCorpse: 0.75,
    poisonZombie: 0.85,
    bomber: 0.85,
    demonArcher: 0.75,
    darkKnight: 0.65,
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

function canSpendVMaterials(types, savingForV) {
  if (!savingForV) return true;
  return types.every((type) => countUnits("enemy", type) > 2);
}

function updateBaseAttacks(dt) {
  state.playerBaseAttackTimer = Math.max(0, state.playerBaseAttackTimer - dt);
  state.enemyBaseAttackTimer = Math.max(0, state.enemyBaseAttackTimer - dt);

  if (state.playerBaseAttackTimer <= 0) {
    const target = findBaseTarget("player");
    if (target) {
      launchBaseBoulder("player", target);
      state.playerBaseAttackTimer = BASE_ATTACK.cooldown;
    }
  }

  if (state.enemyBaseAttackTimer <= 0) {
    const target = findBaseTarget("enemy");
    if (target) {
      launchBaseBoulder("enemy", target);
      state.enemyBaseAttackTimer = BASE_ATTACK.cooldown;
    }
  }
}

function findBaseTarget(side) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  return state.units
    .filter((unit) => unit.side !== side && unit.hp > 0 && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable && Math.abs(unit.x - baseX) <= BASE_ATTACK.range)
    .sort((a, b) => Math.abs(a.x - baseX) - Math.abs(b.x - baseX))[0];
}

function launchBaseBoulder(side, target) {
  const baseX = side === "player" ? FIELD.playerBase : FIELD.enemyBase;
  state.arrows.push({
    x: baseX,
    y: FIELD.ground - 130,
    tx: target.x,
    ty: target.y ? target.y - 42 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 110,
    side,
    damage: BASE_ATTACK.damage,
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
    if (isUnitHidden(unit)) {
      if (unit.side === "player" && state.command === "retreat") continue;
      unit.inCastle = false;
    }
    unit.cooldown = Math.max(0, unit.cooldown - dt * getAttackSpeedFactor(unit));
    unit.spearRecoverTimer = Math.max(0, unit.spearRecoverTimer - dt);
    unit.medusaSlayTimer = Math.max(0, unit.medusaSlayTimer - dt);
    unit.stunTimer = Math.max(0, unit.stunTimer - dt);
    unit.combatTimer = Math.max(0, unit.combatTimer - dt);
    unit.rageTimer = Math.max(0, (unit.rageTimer ?? 0) - dt);
    unit.anim += dt * 8;

    if (unit.stunTimer > 0 || unit.frozenBy) {
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }
    if (unit.controlLockTimer > 0) {
      unit.controlLockTimer = Math.max(0, unit.controlLockTimer - dt);
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }
    if (shouldEnterPlayerCastle(unit)) {
      if (moveTowardCastle(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, dt);
        continue;
      }
    }

    if (unit.type === "waterElement" && unit.boundTargetId) {
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }

    if (unit.type === "treeEnt") {
      updateTreeEnt(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }
    if (unit.type === "rog") {
      updateRog(unit, dt);
    }
    if (unit.type === "monk") {
      updateMonk(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }
    if (unit.type === "vUnit") {
      if (updateV(unit, dt)) {
        updateIceRoadMoveTimer(unit, beforeX, dt);
        continue;
      }
    }
    if (unit.type === "medusa") {
      updateMedusa(unit, dt);
    }
    if (unit.type === "undeadMage") {
      updateUndeadMage(unit, dt);
    }
    if (unit.type === "suikai") {
      updateSuikai(unit, dt);
    }
    if (unit.type === "archmage") {
      updateArchmage(unit, dt);
    }
    if (unit.type === "berserker") {
      updateBerserker(unit, dt);
    }
    if (unit.type === "electricGate") {
      updateElectricGate(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }

  if (unit.type === "miner") {
      updateMiner(unit, dt);
      updateIceRoadMoveTimer(unit, beforeX, dt);
      continue;
    }

    const target = isPlayerRetreating(unit) ? null : findTarget(unit);
    const desiredX = getDesiredX(unit, target);
    const distance = Math.abs(unit.x - desiredX);

    const range = getUnitRange(unit);

    if (target && canAttackFromDistance(unit, target, range)) {
      attack(unit, target);
    } else if (target && target.kind === "statue" && Math.abs(unit.x - target.x) <= range + 12) {
      attack(unit, target);
    } else if (distance > 4) {
      unit.x += Math.sign(desiredX - unit.x) * (unit.speed ?? data.speed) * getMoveFactor(unit) * dt;
    }
    updateIceRoadMoveTimer(unit, beforeX, dt);
  }
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

  const blinkHpThreshold = unit.blinkHpThreshold ?? UNIT.vUnit.blinkHpThreshold;
  const blinkThreatHp = unit.blinkThreatHp ?? UNIT.vUnit.blinkThreatHp;
  const blinkDistance = unit.blinkDistance ?? UNIT.vUnit.blinkDistance;

  if (!unit.blinkUsed && unit.hp <= blinkHpThreshold && nearbyEnemyHp(unit, 165) >= blinkThreatHp) {
    const dir = unit.side === "player" ? -1 : 1;
    const baseLimit = unit.side === "player" ? FIELD.playerGate - 80 : FIELD.enemyGate + 80;
    unit.x += dir * blinkDistance;
    unit.x = unit.side === "player" ? Math.max(baseLimit, unit.x) : Math.min(baseLimit, unit.x);
    unit.blinkUsed = true;
    popText(unit.x, unit.y - 125, "闪现后撤", "#d7ceff");
  }

  if (unit.controlledTargetId) return true;

  unit.controlTimer = Math.max(0, unit.controlTimer - dt);
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
    if (target.side === unit.side || target.hp <= 0 || isUnitHidden(target) || isControlImmune(target)) return;
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
    unit.hp = 0;
    killed += 1;
    popText(unit.x, unit.y - 70, "召唤消散", "#b8b0a5");
  });
  if (killed > 0) popText(mage.x, mage.y - 120, "亡灵消散", "#b8b0a5");
}

function updateUndeadMage(unit, dt) {
  unit.summonCooldown -= dt;
  if (unit.summonCooldown > 0) return;

  unit.summonCooldown = UNIT.undeadMage.summonEvery;
  const dir = unit.side === "player" ? 1 : -1;
  for (let i = 0; i < UNIT.undeadMage.summonCount; i += 1) {
    spawnUnit("undead", unit.side, unit.x - dir * (22 + i * 16));
    const summoned = state.units[state.units.length - 1];
    summoned.forceCharge = true;
    summoned.speed = 70;
    summoned.maxHp = 55;
    summoned.hp = 55;
    summoned.damage = 7;
    summoned.summonerId = unit.id;
  }
  popText(unit.x, unit.y - 112, "亡灵冲锋", "#b8b0a5");
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

function updateMiner(unit, dt) {
  const isPlayer = unit.side === "player";
  const minerCommand = isPlayer ? state.minerCommand : "mine";

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
  if (danger && canFight) {
    if (unit.cooldown <= 0) attack(unit, danger);
    return;
  }

  if (isGoldRushActive()) {
    updateGoldRushMiner(unit, dt);
    return;
  }

  const home = isPlayer ? FIELD.playerGate - 36 : FIELD.enemyGate + 36;
  const mine = isPlayer ? FIELD.playerMineX : FIELD.enemyMineX;
  const mustDeposit = unit.carry >= UNIT.miner.bagSize;
  const forcedHome = isPlayer && state.command === "retreat";
  const targetX = forcedHome || mustDeposit ? home : mine;

  if (Math.abs(unit.x - targetX) > 5) {
    unit.x += Math.sign(targetX - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
    return;
  }

  if ((mustDeposit || forcedHome) && unit.carry > 0) {
    if (isPlayer) state.gold += unit.carry;
    else state.enemyGold += unit.carry;
    popText(unit.x, unit.y - 52, `入库 +${unit.carry}`, isPlayer ? "#f5c542" : "#b7f56e");
    unit.carry = 0;
    unit.mineTimer = 0;
    return;
  }

  if (!forcedHome) {
    unit.mineTimer += dt;
    if (unit.mineTimer >= 1) {
      unit.mineTimer = 0;
      unit.carry = Math.min(UNIT.miner.bagSize, unit.carry + UNIT.miner.goldPerSwing);
      popText(unit.x, unit.y - 52, `袋 ${unit.carry}/${UNIT.miner.bagSize}`, isPlayer ? "#f5c542" : "#b7f56e");
    }
  }
}

function getMinerMoveSpeed(unit) {
  return unit.speed ?? UNIT.miner.speed;
}

function updateGoldRushMiner(unit, dt) {
  const isPlayer = unit.side === "player";
  const home = isPlayer ? FIELD.playerGate - 36 : FIELD.enemyGate + 36;
  const mustDeposit = unit.carry >= UNIT.miner.bagSize;

  if (mustDeposit) {
    unit.goldRushMineId = null;
    if (Math.abs(unit.x - home) > 5) {
      unit.x += Math.sign(home - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
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
      if (Math.abs(unit.x - home) > 5) {
        unit.x += Math.sign(home - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
        return;
      }
      if (isPlayer) state.gold += unit.carry;
      else state.enemyGold += unit.carry;
      popText(unit.x, unit.y - 52, `入库 +${unit.carry}`, isPlayer ? "#f5c542" : "#b7f56e");
      unit.carry = 0;
      unit.mineTimer = 0;
      updateHud();
    } else if (Math.abs(unit.x - home) > 5) {
      unit.x += Math.sign(home - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
    }
    return;
  }

  if (Math.abs(unit.x - mine.x) > 5) {
    unit.x += Math.sign(mine.x - unit.x) * getMinerMoveSpeed(unit) * getMoveFactor(unit) * dt;
    return;
  }

  unit.mineTimer += dt;
  if (unit.mineTimer < 1) return;
  unit.mineTimer = 0;
  const space = UNIT.miner.bagSize - unit.carry;
  const mined = Math.min(UNIT.miner.goldPerSwing, space, mine.remaining);
  if (mined <= 0) {
    unit.goldRushMineId = null;
    return;
  }
  unit.carry += mined;
  mine.remaining -= mined;
  popText(unit.x, unit.y - 52, `袋 ${unit.carry}/${UNIT.miner.bagSize}`, isPlayer ? "#f5c542" : "#b7f56e");
}

function getGoldRushMineForMiner(unit) {
  const current = state.goldRushMines.find((mine) => mine.id === unit.goldRushMineId && canMineGoldRushMine(unit, mine));
  if (current) return current;
  const available = state.goldRushMines
    .filter((mine) => canMineGoldRushMine(unit, mine))
    .sort((a, b) => Math.abs(unit.x - a.x) - Math.abs(unit.x - b.x));
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
    candidate.type === "miner"
    && candidate.hp > 0
    && !isUnitHidden(candidate)
    && candidate.goldRushMineId === mine.id
    && Math.abs(candidate.x - mine.x) <= 8
    && candidate.carry < UNIT.miner.bagSize
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
  return unit.side === "player" && !UNIT[unit.type]?.giant;
}

function isUnitHidden(unit) {
  return unit.inCastle && canEnterCastle(unit);
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

  if (Math.abs(unit.x - castleX) > 6) {
    const speed = unit.type === "miner" ? getMinerMoveSpeed(unit) : (unit.speed ?? data.speed);
    unit.x += Math.sign(castleX - unit.x) * speed * getMoveFactor(unit) * dt;
    return true;
  }

  unit.x = castleX;
  unit.inCastle = true;
  unit.cooldown = 0;
  if (unit.carry > 0) {
    state.gold += unit.carry;
    popText(unit.x, unit.y - 52, `入库 +${unit.carry}`, "#f5c542");
    unit.carry = 0;
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
  for (const field of state.iceFields) {
    if (field.side === unit.side) continue;
    if (Math.abs(unit.x - field.x) <= field.radius) factor = Math.min(factor, field.slow);
  }
  if (activeCampaign?.iceRoad) factor *= getIceRoadMoveFactor(unit);
  if (activeCampaign?.snow && !(activeCampaign.snow.ignoreGiant && UNIT[unit.type]?.giant)) {
    factor *= activeCampaign.snow.moveFactor ?? 1;
  }
  if (unit.rageTimer > 0) factor *= 2;
  return factor;
}

function getIceRoadMoveFactor(unit) {
  const road = activeCampaign?.iceRoad;
  if (!road) return 1;
  return (unit.iceRoadMoveTimer ?? 0) >= road.slowDuration ? road.fastFactor : road.slowFactor;
}

function updateIceRoadMoveTimer(unit, beforeX, dt) {
  if (!activeCampaign?.iceRoad) return;
  if (Math.abs(unit.x - beforeX) > 0.1) unit.iceRoadMoveTimer = (unit.iceRoadMoveTimer ?? 0) + dt;
  else unit.iceRoadMoveTimer = 0;
}

function getAttackSpeedFactor(unit) {
  let factor = 1;
  for (const field of state.iceFields) {
    if (field.side === unit.side) continue;
    if (Math.abs(unit.x - field.x) <= field.radius) factor = Math.min(factor, field.attackSlow ?? 1);
  }
  if (unit.rageTimer > 0) factor *= 2;
  return factor;
}

function getDesiredX(unit, target) {
  const range = getUnitRange(unit);
  if (target && target.kind !== "statue" && isInsideBlindSpot(unit, target)) {
    const dir = unit.side === "player" ? -1 : 1;
    const retreatX = target.x + dir * (UNIT[unit.type].blindSpot + 18);
    return Math.max(FIELD.playerGate + 34, Math.min(FIELD.enemyGate - 34, retreatX));
  }
  if (unit.side === "player") {
    if (unit.forceCharge) return FIELD.enemyBase;
    if (state.command === "retreat") return UNIT[unit.type]?.giant ? FIELD.playerGate + 58 : FIELD.playerBase + 42;
    if (target && target.kind !== "statue") return target.x - range + 8;
    if (state.command === "guard") return getPlayerRallyX(unit);
    if (target) return target.x - range + 8;
    return FIELD.enemyBase;
  }

  if (unit.forceCharge) return FIELD.playerBase;
  if (state.enemyCommand === "retreat") return FIELD.enemyBase - 42;
  if (target && target.kind !== "statue") return target.x + range - 8;
  if (state.enemyCommand === "guard") return getEnemyFormationX(unit);
  if (target) return target.x + range - 8;
  return FIELD.playerBase;
}

function getEnemyFormationX(unit) {
  const slot = (unit.id % 9) * 24;
  const jitter = unit.type === "miner" ? 120 : slot;
  return Math.min(getEnemyRallyBaseX() + RALLY.maxSpread, Math.max(FIELD.playerGate + 220, state.enemyLineX + jitter));
}

function getPlayerRallyBaseX() {
  return FIELD.playerMineX + RALLY.playerOffset;
}

function getEnemyRallyBaseX() {
  return FIELD.enemyMineX - RALLY.enemyOffset;
}

function getPlayerRallyX(unit) {
  return Math.min(getPlayerRallyBaseX() + RALLY.maxSpread, getPlayerRallyBaseX() + (unit.id % 18) * RALLY.spacing);
}

function getEnemyRallyX(unit) {
  return Math.min(getEnemyRallyBaseX() + RALLY.maxSpread, getEnemyRallyBaseX() + (unit.id % 18) * RALLY.spacing);
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

function canAttackFromDistance(unit, target, range) {
  if (!target) return false;
  if (isInsideBlindSpot(unit, target)) return false;
  return Math.abs(unit.x - target.x) <= range;
}

function findTarget(unit) {
  if (isUnitHidden(unit)) return null;
  if (UNIT[unit.type]?.statueOnly) {
    return {
      kind: "statue",
      side: unit.side === "player" ? "enemy" : "player",
      x: unit.side === "player" ? FIELD.enemyBase : FIELD.playerBase,
      y: FIELD.ground - 80,
    };
  }
  let nearby = null;
  let nearestDistance = Infinity;

  for (const other of state.units) {
    if (other.side === unit.side || other.hp <= 0) continue;
    if (isUnitHidden(other)) continue;
    if (!canTarget(unit, other)) continue;
    if (!isAheadOf(unit, other)) continue;
    if (unit.type === "waterElement" && other.frozenBy) continue;

    const searchRange = Math.max(260, getUnitRange(unit));
    const distance = Math.abs(other.x - unit.x);
    if (distance < searchRange && distance < nearestDistance) {
      nearby = other;
      nearestDistance = distance;
    }
  }

  if (nearby) return nearby;

  if (unit.side === "player" && state.command === "attack") {
    return { kind: "statue", side: "enemy", x: FIELD.enemyBase, y: FIELD.ground - 80 };
  }

  if (unit.side === "enemy" && state.enemyCommand === "attack") {
    return { kind: "statue", side: "player", x: FIELD.playerBase, y: FIELD.ground - 80 };
  }

  return null;
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
  if (UNIT[target.type]?.untargetable) return false;
  return !(UNIT[target.type]?.flying && isMelee(attacker) && !UNIT[attacker.type]?.antiAir);
}

function isMelee(unit) {
  return getUnitRange(unit) <= 60;
}

function isAheadOf(unit, target) {
  return unit.side === "player" ? target.x > unit.x : target.x < unit.x;
}

function attack(unit, target) {
  const data = UNIT[unit.type];
  if (isUnitHidden(unit) || isUnitHidden(target)) return;
  if (unit.type === "spearman" && unit.spearRecoverTimer > 0) return;
  if (unit.cooldown > 0) return;
  unit.cooldown = data.cooldown ?? 0.9;
  unit.combatTimer = 3;

  if (unit.type === "spearman" && !unit.spearThrown) {
    throwSpear(unit, target);
    return;
  }

  if (unit.type === "waterElement") {
    bindFreeze(unit, target);
    return;
  }

  if (unit.type === "bomber") {
    unit.exploded = true;
    unit.hp = 0;
    explodeAt(target.x, unit.y - 20, unit.side, data.damage, data.splash, "轰", {
      burnDps: data.burnDps,
      burnDuration: data.burnDuration,
    });
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

  if (unit.type === "mage") {
    castMageSpell(unit, target);
    return;
  }

  if (unit.type === "dreadfire") {
    castDreadfireSpell(unit, target);
    return;
  }

  if (unit.type === "hurricane") {
    launchTornado(unit, target);
    return;
  }

  if (unit.type === "catapult" || unit.type === "enslavedGiant") {
    throwBoulder(unit, target);
    return;
  }

  if (unit.type === "rocketCart") {
    launchRocketVolley(unit, target);
    return;
  }

  if (unit.type === "undeadMage") {
    castUndeadPierce(unit, target);
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
    unit.type === "crossbow" ||
    unit.type === "poisonZombie" ||
    unit.type === "musketeer" ||
    unit.type === "demonArcher" ||
    unit.type === "fireElement"
  ) {
    state.arrows.push({
      x: unit.x,
      y: unit.y - 52 + (data.flying ? -42 : 0),
      tx: target.x,
      ty: target.y ? target.y - 38 + (UNIT[target.type]?.flying ? -42 : 0) : unit.y - 52,
      side: unit.side,
      damage: data.damage,
      target,
      life: unit.type === "crossbow" ? 0.42 : 0.55,
      type: unit.type,
    });
    return;
  }

  applyDamage(target, unit.damage ?? data.damage, unit.side);
  if (unit.poisonOnHit && target.kind !== "statue") {
    applyPoison(target, unit.poisonHitDps ?? 2, Infinity, { sourceSide: unit.side });
  }
  if (data.stunDuration) applyStun(target, data.stunDuration);
}

function explodeDeadCorpse(unit) {
  const data = UNIT.deadCorpse;
  unit.exploded = true;
  unit.hp = 0;
  getUnitsInRadius(unit.x, data.poisonRadius, unit.side, Infinity).forEach((enemy) => {
    applyDamage(enemy, data.damage, unit.side);
    applyPoison(enemy, data.poisonDps, data.poisonDuration, {
      slow: data.poisonSlow,
      raisesUndead: true,
      sourceSide: unit.side,
    });
  });
  state.blasts.push({ x: unit.x, y: unit.y - 34, radius: data.poisonRadius, life: 0.34, duration: 0.34, color: "#93d96b" });
  popText(unit.x, unit.y - 92, "毒爆", "#93d96b");
}

function explodeScaldStrike(unit) {
  const data = UNIT.scaldStrike;
  unit.hp = 0;
  getUnitsInRadius(unit.x, data.splash, unit.side, Infinity).forEach((enemy) => {
    applyDamage(enemy, data.damage, unit.side);
    applyStun(enemy, data.stunDuration);
    applyBurn(enemy, data.burnDps, data.burnDuration);
  });

  if (unit.side === "enemy" && Math.abs(FIELD.playerBase - unit.x) <= data.splash + 28) {
    applyDamage({ kind: "statue", side: "player", x: FIELD.playerBase }, data.damage, unit.side);
  }
  if (unit.side === "player" && Math.abs(FIELD.enemyBase - unit.x) <= data.splash + 28) {
    applyDamage({ kind: "statue", side: "enemy", x: FIELD.enemyBase }, data.damage, unit.side);
  }

  state.blasts.push({ x: unit.x, y: unit.y - 28, radius: data.splash, life: 0.45, duration: 0.45, color: "#ffb36e" });
  popText(unit.x, unit.y - 105, "烫水爆裂", "#ffb36e");
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
    const damage = getModifiedDamage(enemy, data.damage);
    enemy.hp -= damage;
    hitCount += 1;
    popText(enemy.x, enemy.y - 82, `树根 -${damage}`, "#8ee0cf");
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

function castMageSpell(unit, target) {
  if (unit.nextSpell === "blast") {
    castMagicBlast(unit, target);
    unit.nextSpell = "ice";
    return;
  }

  castIceField(unit, target);
  unit.nextSpell = "blast";
}

function castMagicBlast(unit, target) {
  const data = UNIT.mage;
  if (target.kind === "statue") {
    applyDamage(target, data.damage, unit.side);
  }
  getUnitsInRadius(target.x, data.explosionRadius, unit.side).forEach((other) => {
    const damage = getModifiedDamage(other, data.damage);
    other.hp -= damage;
    popText(other.x, other.y - 82, `魔爆 -${damage}`, "#b88cff");
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

function castUndeadPierce(unit, target) {
  const data = UNIT.undeadMage;
  applyDamage(target, data.damage, unit.side);
  state.spikes.push({
    x1: unit.x,
    x2: target.x,
    y: FIELD.ground - 18,
    side: unit.side,
    life: 0.34,
    duration: 0.34,
  });
  popText(target.x, target.y ? target.y - 80 : FIELD.ground - 130, `穿刺 -${data.damage}`, "#b8b0a5");
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

function throwBoulder(unit, target) {
  const data = UNIT[unit.type];
  state.arrows.push({
    x: unit.x,
    y: unit.y - 95,
    tx: target.x,
    ty: target.y ? target.y - 42 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 115,
    side: unit.side,
    damage: data.damage,
    stun: data.stunDuration,
    target,
    life: 0.8,
    type: "boulder",
  });
  popText(unit.x, unit.y - 138, "投石", "#c0a36d");
}

function launchRocketVolley(unit, target) {
  const data = UNIT.rocketCart;
  const centerX = target.kind === "statue" ? target.x : target.x;
  const centerY = target.y ? target.y - 28 : FIELD.ground - 110;
  const startY = unit.y - 82;
  for (let i = 0; i < data.volleyCount; i += 1) {
    const ratio = data.volleyCount <= 1 ? 0.5 : i / (data.volleyCount - 1);
    const wave = Math.sin(i * 2.399963);
    const offset = (ratio - 0.5) * data.volleyRadius * 2 + wave * 8;
    state.arrows.push({
      x: unit.x + (Math.random() - 0.5) * 20,
      y: startY - Math.random() * 18,
      tx: centerX + offset,
      ty: centerY + Math.cos(i * 1.7) * 16,
      side: unit.side,
      damage: data.damage,
      splash: data.splash,
      target,
      life: data.arrowLife + (i % 8) * 0.035,
      duration: data.arrowLife + (i % 8) * 0.035,
      type: "rocketVolley",
    });
  }
  state.screenShake = Math.max(state.screenShake ?? 0, 0.35);
  popText(unit.x, unit.y - 118, "火箭齐射", "#ffce7a");
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
  for (let i = 0; i < data.meteorCount; i += 1) {
    const ratio = (i + 0.5) / data.meteorCount;
    const offset = (ratio - 0.5) * data.meteorRadius * 2;
    state.meteors.push({
      x: target.x + offset,
      y: FIELD.ground - 30,
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
  const startY = unit.y - 92;
  const endY = target.y ? target.y - 44 + (UNIT[target.type]?.flying ? -42 : 0) : FIELD.ground - 120;
  applyDamage(target, data.damage, unit.side);
  state.lightning.push({ x1: unit.x, y1: startY, x2: target.x, y2: endY, life: 0.22, duration: 0.22 });
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
    applyDamage(enemy, damage, unit.side);
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
    applyDamage(target, data.arcaneDamage, unit.side);
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
  target.frozenTick = 0;
  water.cooldown = 999;
  popText(target.x, target.y - 92, "冰冻", "#9ee8ff");
}

function updateFrozenDamage(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (!unit.frozenBy || unit.hp <= 0) return;
    unit.frozenTick += dt;
    if (unit.frozenTick < 1) return;
    unit.frozenTick = 0;
    const damage = getModifiedDamage(unit, UNIT.waterElement.freezeDps);
    unit.hp -= damage;
    popText(unit.x, unit.y - 100, `冻 -${damage}`, "#9ee8ff");
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

function updateArrows(dt) {
  for (const arrow of state.arrows) {
    arrow.life -= dt;
    if (arrow.life <= 0) {
      if (arrow.type === "crossbow") {
        explodeBolt(arrow);
      } else if (arrow.type === "poisonZombie") {
        applyDamage(arrow.target, arrow.damage, arrow.side);
        applyPoison(arrow.target, UNIT.poisonZombie.poisonDps, UNIT.poisonZombie.poisonDuration);
      } else if (arrow.type === "fireElement") {
        applyDamage(arrow.target, arrow.damage, arrow.side);
        applyBurn(arrow.target, UNIT.fireElement.burnDps, UNIT.fireElement.burnDuration);
      } else if (arrow.type === "campaignRain") {
        const [target] = getUnitsInRadius(arrow.tx, arrow.radius, arrow.side, 1);
        if (target) applyDamage(target, arrow.damage, arrow.side);
      } else if (arrow.type === "rocketVolley") {
        explodeRocketArrow(arrow);
      } else {
        applyDamage(arrow.target, arrow.damage, arrow.side);
        if (arrow.stun) applyStun(arrow.target, arrow.stun);
      }
    }
  }
  state.arrows = state.arrows.filter((arrow) => arrow.life > 0);
}

function explodeRocketArrow(arrow) {
  const targets = getUnitsInRadius(arrow.tx, arrow.splash, arrow.side, 3);
  targets.forEach((target) => {
    applyDamage(target, arrow.damage, arrow.side);
  });
  if (arrow.target?.kind === "statue" && Math.abs(arrow.target.x - arrow.tx) <= arrow.splash + 28) {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }
  state.blasts.push({ x: arrow.tx, y: arrow.ty, radius: arrow.splash, life: 0.22, duration: 0.22, color: "#ffce7a" });
}

function explodeBolt(arrow) {
  const data = UNIT.crossbow;
  const unitLimit = arrow.target.kind === "statue" ? AOE_TARGET_LIMIT : AOE_TARGET_LIMIT - 1;
  if (arrow.target.kind === "statue") {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  } else {
    applyDamage(arrow.target, arrow.damage, arrow.side);
  }

  getUnitsInRadius(arrow.tx, data.splash, arrow.side, unitLimit, arrow.target).forEach((unit) => {
    const damage = getModifiedDamage(unit, data.splashDamage);
    unit.hp -= damage;
    popText(unit.x, unit.y - 76, `爆 -${damage}`, "#ffce7a");
  });

  if (arrow.target.kind === "statue") {
    popText(arrow.tx, FIELD.ground - 176, "爆炸", "#ffce7a");
  }

  state.blasts.push({ x: arrow.tx, y: arrow.ty + 26, radius: data.splash, life: 0.32, duration: 0.32 });
}

function explodeAt(x, y, attackerSide, damage, radius, label, options = {}) {
  getUnitsInRadius(x, radius, attackerSide).forEach((unit) => {
    const finalDamage = getModifiedDamage(unit, damage);
    unit.hp -= finalDamage;
    if (options.burnDps) applyBurn(unit, options.burnDps, options.burnDuration);
    popText(unit.x, unit.y - 76, `${label} -${finalDamage}`, "#ffb45e");
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
  if (options.raisesUndead) {
    target.poisonRaisesUndead = true;
    target.poisonSourceSide = options.sourceSide;
  }
  target.poisonTick = 0;
  popText(target.x, target.y - 88, "中毒", "#93d96b");
}

function isPoisonImmune(unit) {
  return unit.type === "undead" || unit.type === "poisonZombie" || unit.type === "deadCorpse";
}

function clearPoison(unit, label = "解毒") {
  if (unit.poisonTimer <= 0 && unit.poisonTimer !== Infinity) return false;
  unit.poisonTimer = 0;
  unit.poisonDps = 0;
  unit.poisonTick = 0;
  unit.poisonSlow = 1;
  unit.poisonRaisesUndead = false;
  unit.poisonSourceSide = null;
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

function updatePoison(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (unit.poisonTimer <= 0 && unit.poisonTimer !== Infinity) return;
    if (unit.poisonTimer !== Infinity) unit.poisonTimer -= dt;
    unit.poisonTick += dt;
    if (unit.poisonTick >= 1) {
      unit.poisonTick = 0;
      unit.hp -= unit.poisonDps;
      popText(unit.x, unit.y - 92, `毒 -${unit.poisonDps}`, "#93d96b");
    }
  });
}

function updateBurn(dt) {
  state.units.forEach((unit) => {
    if (isUnitHidden(unit)) return;
    if (unit.burnTimer <= 0) return;
    unit.burnTimer -= dt;
    unit.burnTick += dt;
    if (unit.burnTick >= 1) {
      unit.burnTick = 0;
      const damage = getModifiedDamage(unit, unit.burnDps);
      unit.hp -= damage;
      popText(unit.x, unit.y - 104, `燃 -${damage}`, "#ff9b45");
    }
  });
}

function updateChaosRecovery(dt) {
  const regenPerSecond = 4;
  state.units.forEach((unit) => {
    if (unit.hp <= 0 || isUnitHidden(unit) || factionForSide(unit.side) !== "chaos" || unit.combatTimer > 0) return;
    unit.chaosRegenTick += dt;
    unit.chaosCleanseTimer -= dt;

    if (unit.chaosRegenTick >= 1) {
      unit.chaosRegenTick = 0;
      const healed = Math.min(regenPerSecond, unit.maxHp - unit.hp);
      if (healed > 0) {
        unit.hp += healed;
        popText(unit.x, unit.y - 96, `恢复 +${healed}`, "#b7f56e");
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
    state.blasts.push({ x: meteor.x, y: meteor.y, radius: meteor.campaign ? radius : 22, life: 0.32, duration: 0.32, color: meteor.color ?? "#ffb45e" });
  }
  state.meteors = state.meteors.filter((meteor) => meteor.life > 0);
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
      unit.hp -= damage;
      popText(unit.x, unit.y - 98, `冰 -${damage}`, "#9ee8ff");
    });
  }
}

function damageUnitsInRadius(x, radius, attackerSide, amount, label) {
  getUnitsInRadius(x, radius, attackerSide).forEach((unit) => {
    const damage = getModifiedDamage(unit, amount);
    unit.hp -= damage;
    popText(unit.x, unit.y - 80, `${label} -${damage}`, "#ffb45e");
  });
}

function stunUnitsInRadius(x, radius, attackerSide, duration) {
  getUnitsInRadius(x, radius, attackerSide).forEach((unit) => {
    applyStun(unit, duration);
  });
}

function getUnitsInRadius(x, radius, attackerSide, limit = AOE_TARGET_LIMIT, exclude = null) {
  return state.units
    .filter((unit) => (attackerSide === "neutral" || unit.side !== attackerSide) && unit.hp > 0 && unit !== exclude && !isUnitHidden(unit) && !UNIT[unit.type]?.untargetable && Math.abs(unit.x - x) <= radius)
    .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))
    .slice(0, limit);
}

function applyDamage(target, amount, attackerSide) {
  if (isUnitHidden(target)) return;
  if (target.kind === "statue") {
    if (target.side === "enemy") state.enemyHp -= amount;
    if (target.side === "player") state.playerHp -= amount;
    popText(target.x, FIELD.ground - 145, `-${amount}`, attackerSide === "player" ? "#9fc0ff" : "#ff9b8d");
    return;
  }

  const damage = getModifiedDamage(target, amount);
  target.hp -= damage;
  target.combatTimer = 3;
  popText(target.x, target.y - 68, `-${damage}`, "#f0a36a");
}

function getModifiedDamage(target, amount) {
  if (target.kind === "statue") return amount;
  let damage = isPoisoned(target) ? amount * 2 : amount;
  if (activeCampaign?.enemySpartanDamageReduction && target.side === "enemy" && target.type === "spartan") {
    damage *= 1 - activeCampaign.enemySpartanDamageReduction;
  }
  return Math.max(1, Math.round(damage));
}

function isPoisoned(unit) {
  return unit.poisonTimer > 0 || unit.poisonTimer === Infinity;
}

function removeDead() {
  const deathSpawns = [];
  state.units = state.units.filter((unit) => {
    if (unit.hp > 0) return true;
    if (unit.type === "vUnit") {
      releaseVControl(unit);
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
    if (unit.type === "waterElement") {
      releaseFrozenTarget(unit);
      healNearbyAllies(unit);
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
    if (activeCampaign?.enemyDeathsBecomePlayerUndead && unit.side === "enemy" && unit.type !== "undead" && !UNIT[unit.type]?.hero) {
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
    if (unit.type === "electricGate" && unit.expired) {
      deathSpawns.push({
        type: UNIT.electricGate.respawnType,
        side: unit.side,
        x: unit.x,
        y: unit.y,
        text: "土元素重生",
        color: "#c0a36d",
      });
    }
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
    if (unit.frozenBy) {
      const water = state.units.find((candidate) => candidate.id === unit.frozenBy);
      if (water) water.boundTargetId = null;
    }
    if (activeCampaign?.failOnDeath === unit.type && unit.side === "player") {
      state.over = true;
      state.winner = "enemy";
      statusEl.textContent = `${UNIT[unit.type].name}倒下，挑战失败`;
    }
    popText(unit.x, unit.y - 35, "倒下", "#a7a7a7");
    return false;
  });
  deathSpawns.forEach(spawnDeathUnit);
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
  target.frozenBy = null;
  target.frozenTick = 0;
  popText(target.x, target.y - 88, "解冻", "#d8f8ff");
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
  state.playerHp = Math.max(0, state.playerHp);
  state.enemyHp = Math.max(0, state.enemyHp);

  if (activeCampaign?.secondPhase?.winByKillingType && state.campaignPhase === 2) {
    if (state.playerHp <= 0) {
      state.over = true;
      state.winner = "enemy";
      statusEl.textContent = "失败，我方雕像倒塌";
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

  if (state.enemyHp <= 0 || state.playerHp <= 0) {
    state.over = true;
    state.winner = state.enemyHp <= 0 ? "player" : "enemy";
    if (state.winner === "player" && activeCampaign) {
      completeCampaignVictory();
      return;
    }
    statusEl.textContent =
      state.winner === "player" ? `胜利！${FACTIONS[opponentFaction()].name}雕像已被摧毁` : "失败，我方雕像倒塌";
    homeBtn.classList.remove("hidden");
  }
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
  state.enemyHp = STATUE_MAX_HP;
  state.enemyGold = phase.enemyGold ?? state.enemyGold;
  state.enemySpawnTimer = 1.2;
  state.enemyMinerTimer = 3;
  state.enemyAttackMood = 12;
  state.enemyCommand = "guard";
  state.enemyCommandTimer = 0;
  state.enemyLineX = getEnemyRallyBaseX();
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
  state.spikes = [];
  phase.enemyStart.forEach((type, index) => {
    spawnUnit(type, "enemy", FIELD.enemyGate + 28 - index * 32);
  });
  renderFactionUi();
  updateHud();
  statusEl.textContent = phase.message ?? "第二场战斗开始";
  popText(FIELD.enemyBase, FIELD.ground - 170, "第二场战斗", "#ffb0a3");
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
  if (state.floaters.length > 90) state.floaters.splice(0, state.floaters.length - 90);
  state.floaters.push({ x, y, text, color, life: 0.9 });
}

function draw() {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  ctx.save();
  if ((state.screenShake ?? 0) > 0) {
    const shake = state.screenShake * 7;
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
  }
  drawSky();
  drawStormClouds();
  drawGround();
  drawIceRoadGround();
  if (isGoldRushActive()) {
    drawGoldRushMines();
  } else {
    drawMine(FIELD.playerMineX, "player");
    drawMine(FIELD.enemyMineX, "enemy");
  }
  drawCastle("player");
  drawCastle("enemy");

  const sortedUnits = state.units.filter((unit) => !isUnitHidden(unit)).sort((a, b) => a.y - b.y);
  sortedUnits.forEach(drawUnit);
  state.arrows.forEach(drawArrow);
  state.delayedSpells.forEach(drawDelayedSpell);
  state.meteors.forEach(drawMeteor);
  state.tornadoes.forEach(drawTornado);
  state.iceFields.forEach(drawIceField);
  state.spikes.forEach(drawSpike);
  state.blasts.forEach(drawBlast);
  state.lightning.forEach(drawLightning);
  drawSnow();
  drawCampaignDarkness();
  state.floaters.forEach(drawFloater);

  if (state.over) drawEndOverlay();
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
  const gradient = ctx.createLinearGradient(0, FIELD.ground - 12, 0, FIELD.ground + 72);
  gradient.addColorStop(0, "rgba(198, 239, 255, 0.38)");
  gradient.addColorStop(1, "rgba(118, 194, 230, 0.22)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, FIELD.ground - 8, FIELD.width, 92);
  ctx.strokeStyle = "rgba(235, 252, 255, 0.55)";
  ctx.lineWidth = 2;
  for (let x = -80; x < FIELD.width; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, FIELD.ground + 18);
    ctx.lineTo(x + 88, FIELD.ground + 4);
    ctx.stroke();
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
  ctx.fillStyle = "#29351f";
  ctx.fillRect(0, FIELD.ground, FIELD.width, FIELD.height - FIELD.ground);
  ctx.fillStyle = "#5b4b2c";
  ctx.fillRect(0, FIELD.ground + 30, FIELD.width, 34);

  for (let x = 0; x < FIELD.width; x += 42) {
    ctx.fillStyle = x % 84 === 0 ? "#344323" : "#41512a";
    ctx.fillRect(x, FIELD.ground + 4, 25, 5);
  }
}

function drawMine(x, side) {
  const faction = factionForSide(side);
  ctx.fillStyle = "#403421";
  ctx.beginPath();
  ctx.moveTo(x - 58, FIELD.ground + 18);
  ctx.lineTo(x - 16, FIELD.ground - 52);
  ctx.lineTo(x + 56, FIELD.ground + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = FACTIONS[faction].mineColor;
  ctx.beginPath();
  ctx.arc(x + 7, FIELD.ground - 8, 15, 0, Math.PI * 2);
  ctx.arc(x - 17, FIELD.ground + 8, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawGoldRushMines() {
  ctx.save();
  state.goldRushMines.forEach((mine) => {
    const ratio = mine.capacity > 0 ? mine.remaining / mine.capacity : 0;
    ctx.fillStyle = mine.remaining > 0 ? "#3b301f" : "#2a2925";
    ctx.beginPath();
    ctx.moveTo(mine.x - 42, FIELD.ground + 16);
    ctx.lineTo(mine.x - 12, FIELD.ground - 42);
    ctx.lineTo(mine.x + 44, FIELD.ground + 16);
    ctx.closePath();
    ctx.fill();

    if (mine.remaining > 0) {
      ctx.fillStyle = "#f5c542";
      ctx.beginPath();
      ctx.arc(mine.x + 3, FIELD.ground - 3, 11, 0, Math.PI * 2);
      ctx.arc(mine.x - 14, FIELD.ground + 8, 7, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(mine.x - 28, FIELD.ground + 24, 56, 6);
    ctx.fillStyle = "#f5c542";
    ctx.fillRect(mine.x - 28, FIELD.ground + 24, 56 * ratio, 6);
    ctx.fillStyle = "#efe6c8";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(Math.ceil(mine.remaining).toString(), mine.x, FIELD.ground + 44);
  });
  ctx.restore();
}

function drawCastle(side) {
  const isPlayer = side === "player";
  const baseX = isPlayer ? FIELD.playerBase : FIELD.enemyBase;
  const faction = factionForSide(side);
  const color = faction === "order" ? "#415f8f" : faction === "element" ? "#5e8d85" : "#813b34";
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
}

function drawUnit(unit) {
  const color = getUnitColor(unit);
  const headColor = getHeadColor(unit);
  const dir = unit.side === "player" ? 1 : -1;
  const bob = Math.sin(unit.anim) * 2;
  const flightOffset = UNIT[unit.type]?.flying ? -42 : 0;
  const size = UNIT[unit.type]?.visualScale ?? (UNIT[unit.type]?.giant ? 1.55 : 1);

  ctx.save();
  ctx.translate(unit.x, unit.y + bob + flightOffset);
  ctx.scale(dir * size, size);
  if (unit.type === "vClone") {
    ctx.shadowColor = "#78ff9a";
    ctx.shadowBlur = 18;
  }
  if (unit.rageTimer > 0) {
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
  if (unit.type === "catapult") {
    drawCatapultUnit(unit);
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
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#191919";
  ctx.fillStyle = headColor;

  ctx.beginPath();
  ctx.arc(0, -62, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  if (unit.godV || unit.godVClone) drawGodVHeadpiece();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -50);
  ctx.lineTo(0, -22);
  ctx.moveTo(0, -41);
  ctx.lineTo(18, -33);
  ctx.moveTo(0, -39);
  ctx.lineTo(-16, -30);
  ctx.moveTo(0, -22);
  ctx.lineTo(16, 0);
  ctx.moveTo(0, -22);
  ctx.lineTo(-14, 0);
  ctx.stroke();

  drawWeapon(unit.type);
  drawUnitHp(unit);
  ctx.shadowBlur = 0;
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

function drawCatapultUnit(unit) {
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
  if (factionForSide(unit.side) === "order") return unit.side === "player" ? "#75a7ff" : "#8dbbff";
  if (unit.type === "earthElement") return "#9b8051";
  if (unit.type === "waterElement") return "#72c8e8";
  if (unit.type === "fireElement") return "#f07845";
  if (unit.type === "windElement") return "#d7f6ee";
  if (unit.type === "treeEnt") return "#5f8a57";
  if (unit.type === "waterScorpion") return "#56a8c8";
  if (unit.type === "rog") return "#7f4a34";
  if (unit.type === "dreadfire") return "#8e2f32";
  if (unit.type === "hurricane") return "#92d8d0";
  if (unit.type === "scaldStrike") return "#c7795a";
  if (unit.type === "electricGate") return "#4f79a7";
  if (unit.type === "vUnit") return "#f7f7f2";
  if (unit.type === "vClone") return "#7369c8";
  if (unit.type === "mage") return "#786bd8";
  if (unit.type === "berserker") return "#a84032";
  if (unit.type === "archmage") return "#4c55b8";
  if (unit.type === "monk") return "#d8d0b2";
  if (unit.type === "catapult") return "#8b6f46";
  if (unit.type === "enslavedGiant") return "#8b6f46";
  const type = unit.type;
  if (type === "creeper") return "#9ee06b";
  if (type === "largeCreeper") return "#6fcf59";
  if (type === "undead") return "#b8b0a5";
  if (type === "deadCorpse") return "#72836c";
  if (type === "medusa") return "#587a5f";
  if (type === "poisonZombie") return "#6bd28f";
  if (type === "bomber") return "#f09a47";
  if (type === "demonArcher") return "#d05b8f";
  if (type === "darkKnight") return "#55505f";
  if (type === "chaosGiant") return "#493b4e";
  if (type === "superGiant") return "#2f2634";
  if (type === "undeadMage") return "#766487";
  if (type === "suikai") return "#4c4058";
  return "#e2675d";
}

function getHeadColor(unit) {
  if (unit.type === "miner" && unit.earthMiner) return "#8a5b32";
  if (unit.type === "earthElement") return "#c0a36d";
  if (unit.type === "waterElement") return "#b8f0ff";
  if (unit.type === "fireElement") return "#ffd08a";
  if (unit.type === "windElement") return "#ffffff";
  if (unit.type === "treeEnt") return "#9fc082";
  if (unit.type === "waterScorpion") return "#b8f0ff";
  if (unit.type === "rog") return "#ffb35f";
  if (unit.type === "dreadfire") return "#ff8963";
  if (unit.type === "hurricane") return "#ffffff";
  if (unit.type === "scaldStrike") return "#ffd08a";
  if (unit.type === "electricGate") return "#d7f6ee";
  if (unit.type === "vUnit") return "#ffffff";
  if (unit.type === "vClone") return "#d7ceff";
  if (unit.type === "mage") return "#d7ceff";
  if (unit.type === "berserker") return "#ffd0bd";
  if (unit.type === "archmage") return "#f0e8ff";
  if (unit.type === "monk") return "#fff4d0";
  if (unit.type === "catapult") return "#c0a36d";
  if (unit.type === "enslavedGiant") return "#c0a36d";
  if (unit.type === "undeadMage") return "#d8c8e8";
  if (unit.type === "suikai") return "#ece1ff";
  if (unit.type === "chaosGiant") return "#c7b0d8";
  if (unit.type === "superGiant") return "#e0c8ff";
  if (factionForSide(unit.side) !== "chaos") return getUnitColor(unit);
  if (unit.type === "creeper") return "#b8b0a5";
  if (unit.type === "undead") return "#9ee06b";
  if (unit.type === "deadCorpse") return "#93d96b";
  if (unit.type === "medusa") return "#d8f6b8";
  return getUnitColor(unit);
}

function drawTreeEntUnit(unit) {
  ctx.lineCap = "round";
  ctx.strokeStyle = "#3e5f38";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(0, -72);
  ctx.moveTo(-6, -38);
  ctx.lineTo(-33, -58);
  ctx.moveTo(6, -44);
  ctx.lineTo(34, -66);
  ctx.moveTo(0, -24);
  ctx.lineTo(-22, -6);
  ctx.moveTo(0, -24);
  ctx.lineTo(21, -6);
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
  ctx.lineCap = "round";
  ctx.strokeStyle = "#d7f6ee";
  ctx.lineWidth = 6;
  for (let i = 0; i < 4; i += 1) {
    const y = -78 + i * 18;
    const radius = 35 - i * 7;
    ctx.beginPath();
    ctx.ellipse(0, y, radius, 8 + i * 2, -0.22, Math.PI * 0.08, Math.PI * 1.72);
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

function drawWeapon(type) {
  ctx.strokeStyle = "#e7dfc7";
  ctx.lineWidth = 3;
  if (type === "miner") {
    ctx.beginPath();
    ctx.moveTo(16, -38);
    ctx.lineTo(29, -55);
    ctx.moveTo(21, -52);
    ctx.lineTo(37, -43);
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
  } else if (type === "greatsword") {
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
  } else if (type === "spartan") {
    ctx.strokeStyle = "#f2f6f8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, -35);
    ctx.lineTo(54, -45);
    ctx.stroke();
    ctx.fillStyle = "#aab7c2";
    ctx.beginPath();
    ctx.moveTo(12, -48);
    ctx.lineTo(28, -42);
    ctx.lineTo(25, -21);
    ctx.lineTo(9, -26);
    ctx.closePath();
    ctx.fill();
  } else if (type === "spearman") {
    ctx.strokeStyle = "#c8a35a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, -34);
    ctx.lineTo(58, -54);
    ctx.stroke();
    ctx.fillStyle = "#dfe8ff";
    ctx.beginPath();
    ctx.moveTo(58, -54);
    ctx.lineTo(46, -57);
    ctx.lineTo(50, -45);
    ctx.closePath();
    ctx.fill();
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
  } else if (type === "creeper" || type === "largeCreeper") {
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
  } else if (type === "earthElement") {
    ctx.fillStyle = "#8a7348";
    ctx.beginPath();
    ctx.moveTo(18, -45);
    ctx.lineTo(35, -56);
    ctx.lineTo(53, -47);
    ctx.lineTo(48, -29);
    ctx.lineTo(24, -27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4c3e28";
    ctx.lineWidth = 3;
    ctx.stroke();
  } else if (type === "waterElement") {
    return;
  } else if (type === "fireElement") {
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.arc(42, -40, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff7a3d";
    ctx.beginPath();
    ctx.moveTo(39, -53);
    ctx.lineTo(48, -42);
    ctx.lineTo(37, -31);
    ctx.lineTo(31, -42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffd08a";
    ctx.beginPath();
    ctx.arc(44, -41, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "dreadfire") {
    ctx.strokeStyle = "#3a1718";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(14, -25);
    ctx.lineTo(31, -63);
    ctx.stroke();
    ctx.fillStyle = "#ff6a3a";
    ctx.beginPath();
    ctx.arc(34, -66, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 122, 61, 0.45)";
    ctx.beginPath();
    ctx.moveTo(45, -52);
    ctx.lineTo(60, -40);
    ctx.lineTo(45, -30);
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
  } else if (type === "darkKnight") {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#1f1f26";
    ctx.beginPath();
    ctx.moveTo(15, -32);
    ctx.lineTo(45, -55);
    ctx.stroke();
    ctx.fillStyle = "#34313d";
    ctx.fillRect(-11, -49, 22, 22);
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
}

function drawUnitHp(unit) {
  ctx.scale(unit.side === "player" ? 1 : -1, 1);
  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillRect(-19, -86, 38, 5);
  ctx.fillStyle = "#6ee07c";
  ctx.fillRect(-19, -86, 38 * (unit.hp / unit.maxHp), 5);

  if (unit.poisonTimer > 0) {
    ctx.fillStyle = "#93d96b";
    ctx.beginPath();
    ctx.arc(24, -84, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (unit.burnTimer > 0) {
    ctx.fillStyle = "#ff9b45";
    ctx.beginPath();
    ctx.arc(31, -84, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  if (unit.stunTimer > 0) {
    ctx.fillStyle = "#d7b978";
    ctx.fillRect(-8, -98, 16, 4);
  }

  if (unit.frozenBy || unit.boundTargetId) {
    ctx.strokeStyle = "#b8f0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -45, 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (unit.type === "miner") {
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(-18, -77, 36, 5);
    ctx.fillStyle = unit.side === "player" ? "#f5c542" : "#b7f56e";
    ctx.fillRect(-18, -77, 36 * (unit.carry / UNIT.miner.bagSize), 5);
  }
}

function drawArrow(arrow) {
  const duration = arrow.duration ?? (arrow.type === "crossbow" ? 0.42 : arrow.type === "boulder" ? 0.8 : arrow.type === "spearThrow" ? 0.45 : arrow.type === "campaignRain" ? 0.9 : 0.55);
  const t = 1 - arrow.life / duration;
  const x = arrow.x + (arrow.tx - arrow.x) * t;
  const y = arrow.y + (arrow.ty - arrow.y) * t - (arrow.type === "campaignRain" ? 0 : Math.sin(t * Math.PI) * (arrow.type === "boulder" ? 70 : arrow.type === "rocketVolley" ? 52 : 34));
  if (arrow.type === "boulder") {
    ctx.fillStyle = "#8b6f46";
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3f3324";
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
  ctx.strokeStyle =
    arrow.type === "crossbow"
      ? "#ffce7a"
      : arrow.type === "spearThrow"
        ? "#dfe8ff"
      : arrow.type === "poisonZombie"
        ? "#93d96b"
        : arrow.type === "musketeer"
          ? "#f5f0df"
          : arrow.type === "fireElement"
            ? "#ff9b45"
          : arrow.type === "demonArcher"
            ? "#ff7cb1"
            : arrow.side === "player"
              ? "#d8e8ff"
              : "#ffd0c9";
  ctx.lineWidth = arrow.type === "crossbow" || arrow.type === "musketeer" ? 5 : arrow.type === "spearThrow" ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 3);
  ctx.lineTo(x + 12, y - 3);
  ctx.stroke();
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
  const y = FIELD.ground - 260 + progress * 230;
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
  const winnerName = state.winner === "player" ? FACTIONS[selectedFaction].name : FACTIONS[opponentFaction()].name;
  ctx.fillText(`${winnerName}胜利`, FIELD.width / 2, 285);
  ctx.font = "500 22px system-ui, sans-serif";
  ctx.fillText("可重新开始，或回到主界面", FIELD.width / 2, 328);
}

function returnToMainMenu() {
  activeCampaign = null;
  selectedMode = "versus";
  modeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === selectedMode);
  });
  campaignMap.classList.add("hidden");
  factionSelect.classList.remove("hidden");
  homeBtn.classList.add("hidden");
  statusEl.textContent = "选择模式与阵营，开始下一场战斗";
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

function updateHud() {
  goldEl.textContent = Math.floor(state.gold);
  enemyGoldEl.textContent = Math.floor(state.enemyGold);
  playerHpBar.style.width = `${(state.playerHp / STATUE_MAX_HP) * 100}%`;
  enemyHpBar.style.width = `${(state.enemyHp / STATUE_MAX_HP) * 100}%`;
  trainButtons.forEach((button) => {
    if (button.dataset.action === "convertEarth") {
      button.disabled = state.over || !state.units.some((unit) => unit.side === "player" && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
      return;
    }
    if (button.dataset.action === "mergeTreeEnt") {
      const hasEarth = state.units.some((unit) => unit.side === "player" && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
      const hasWater = state.units.some((unit) => unit.side === "player" && unit.type === "waterElement" && unit.hp > 0 && !isUnitHidden(unit) && !unit.boundTargetId);
      button.disabled = state.over || state.gold < MERGE_COST || !hasEarth || !hasWater;
      return;
    }
    if (button.dataset.action === "mergeRog") {
      const hasEarth = state.units.some((unit) => unit.side === "player" && unit.type === "earthElement" && unit.hp > 0 && !isUnitHidden(unit));
      const hasFire = state.units.some((unit) => unit.side === "player" && unit.type === "fireElement" && unit.hp > 0 && !isUnitHidden(unit));
      button.disabled = state.over || state.gold < MERGE_COST || !hasEarth || !hasFire;
      return;
    }
    if (button.dataset.action === "mergeDreadfire") {
      button.disabled = state.over || state.gold < MERGE_COST || !canMergeDreadfire("player");
      return;
    }
    if (button.dataset.action === "mergeHurricane") {
      button.disabled = state.over || state.gold < MERGE_COST || !canMergeHurricane("player");
      return;
    }
    if (button.dataset.action === "mergeScaldStrike") {
      button.disabled = state.over || state.gold < MERGE_COST || !canMergeScaldStrike("player");
      return;
    }
    if (button.dataset.action === "mergeElectricGate") {
      button.disabled = state.over || state.gold < MERGE_COST || !canMergeElectricGate("player");
      return;
    }
    if (button.dataset.action === "mergeV") {
      button.disabled = state.over || state.gold < MERGE_COST || !canMergeV("player");
      return;
    }
    const type = button.dataset.unit;
    button.disabled = state.gold < getUnitCost(type, selectedFaction) || state.over || !canQueueCampaignUnit(type);
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
  return {
    x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
    y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
  };
}

function findPlayerVAt(point) {
  return state.units.find((unit) => {
    if (unit.side !== "player" || unit.type !== "vUnit" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 42 && Math.abs(unit.y - 48 - point.y) <= 78;
  });
}

function findPlayerMedusaAt(point) {
  return state.units.find((unit) => {
    if (unit.side !== "player" || unit.type !== "medusa" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 54 && Math.abs(unit.y - 48 - point.y) <= 92;
  });
}

function findUnitAt(point) {
  return state.units.find((unit) => {
    if (unit.hp <= 0 || isUnitHidden(unit)) return false;
    const height = UNIT[unit.type]?.giant ? 150 : unit.type === "treeEnt" ? 120 : 86;
    const width = UNIT[unit.type]?.giant ? 74 : unit.type === "treeEnt" ? 72 : 48;
    return Math.abs(unit.x - point.x) <= width && Math.abs(unit.y - 48 - point.y) <= height;
  });
}

function canMedusaSlay(medusa, target) {
  if (!medusa || !target || medusa.hp <= 0 || target.hp <= 0) return false;
  if (target.side === medusa.side) return false;
  if (UNIT[target.type]?.slayImmune) return false;
  if (isHeroUnit(target)) return false;
  if (UNIT[target.type]?.giant) return false;
  return true;
}

function canVControl(v, target) {
  if (!v || !target || v.hp <= 0 || target.hp <= 0) return false;
  if (target.side === v.side) return false;
  if (isControlImmune(target)) return false;
  if (v.canControlAll) return true;
  return true;
}

function isHeroUnit(unit) {
  return !!unit && (UNIT[unit.type]?.hero || unit.type === "vUnit");
}

function isControlImmune(unit) {
  return isHeroUnit(unit) || unit.type === "vClone" || UNIT[unit.type]?.giant || UNIT[unit.type]?.controlImmune;
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
    if (unit.side !== "player" || unit.type !== "treeEnt" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 52 && Math.abs(unit.y - 48 - point.y) <= 92;
  });
}

function findPlayerWaterElementAt(point) {
  return state.units.find((unit) => {
    if (unit.side !== "player" || unit.type !== "waterElement" || unit.hp <= 0 || isUnitHidden(unit)) return false;
    return Math.abs(unit.x - point.x) <= 46 && Math.abs(unit.y - 48 - point.y) <= 86;
  });
}

function sacrificeWaterElement(unit) {
  releaseFrozenTarget(unit);
  unit.hp = 0;
  popText(unit.x, unit.y - 120, "水愈爆发", "#8ee0cf");
}

function handleSpecialPress(point) {
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
  button.addEventListener("click", () => setCommand(button.dataset.command));
});

minerCommandButtons.forEach((button) => {
  button.addEventListener("click", () => setMinerCommand(button.dataset.minerCommand));
});

canvas.addEventListener("dblclick", (event) => {
  if (state.over) return;
  handleSpecialPress(canvasPoint(event));
});

canvas.addEventListener("click", (event) => {
  if (state.over) return;
  if (longPressTriggered) {
    longPressTriggered = false;
    return;
  }
  const point = canvasPoint(event);
  if (tryMedusaSlay(point) || tryManualVControl(point)) updateHud();
});

let longPressTimer = null;
let longPressStart = null;
let longPressTriggered = false;

canvas.addEventListener("pointerdown", (event) => {
  if (state.over || event.pointerType === "mouse") return;
  longPressStart = { clientX: event.clientX, clientY: event.clientY, point: canvasPoint(event) };
  longPressTriggered = false;
  window.clearTimeout(longPressTimer);
  longPressTimer = window.setTimeout(() => {
    if (!longPressStart) return;
    longPressTriggered = handleSpecialPress(longPressStart.point);
  }, 520);
});

canvas.addEventListener("pointermove", (event) => {
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
  canvas.addEventListener(eventName, () => {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
    longPressStart = null;
  });
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

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedMode = button.dataset.mode;
    if (selectedMode !== "campaign") activeCampaign = null;
    modeButtons.forEach((candidate) => {
      candidate.classList.toggle("active", candidate === button);
    });
  });
});

factionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    enterFullscreen();
    selectedFaction = button.dataset.faction;
    if (selectedMode === "campaign") {
      openCampaignMap();
      return;
    }
    activeCampaign = null;
    factionSelect.classList.add("hidden");
    newGame();
  });
});

loadCampaignSave();
newGame();
requestAnimationFrame(loop);
