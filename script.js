const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BASE_CANVAS_WIDTH = 800;
const BASE_CANVAS_HEIGHT = 400;

let canvasWidth, canvasHeight;
let PLAYER_WIDTH_SCALED, PLAYER_HEIGHT_SCALED, PLAYER_SPEED_SCALED, JUMP_FORCE_SCALED, ATTACK_RANGE_SCALED;

function setupCanvasDimensions() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const targetAspectRatio = BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT;

    let newCanvasWidth = Math.min(viewportWidth * 0.95, BASE_CANVAS_WIDTH);
    let newCanvasHeight = newCanvasWidth / targetAspectRatio;

    if (newCanvasHeight > viewportHeight * 0.70) {
        newCanvasHeight = viewportHeight * 0.70;
        newCanvasWidth = newCanvasHeight * targetAspectRatio;
    }

    canvas.width = newCanvasWidth;
    canvas.height = newCanvasHeight;
    canvasWidth = newCanvasWidth;
    canvasHeight = newCanvasHeight;

    const scaleFactor = canvas.width / BASE_CANVAS_WIDTH;

    const basePlayerWidth = 150;
    const basePlayerHeight = 225;

    PLAYER_WIDTH_SCALED = basePlayerWidth * scaleFactor;
    PLAYER_HEIGHT_SCALED = basePlayerHeight * scaleFactor;

    PLAYER_SPEED_SCALED = 7 * scaleFactor;
    JUMP_FORCE_SCALED = -15 * scaleFactor;
    ATTACK_RANGE_SCALED = (basePlayerWidth * 0.4) * scaleFactor;
}

const screens = {
    modeSelect: document.getElementById('modeSelectScreen'),
    controlSelect: document.getElementById('controlSelectScreen'),
    p1CharSelect: document.getElementById('p1CharSelectScreen'),
    p2CharSelect: document.getElementById('p2CharSelectScreen'),
    arenaSelect: document.getElementById('arenaSelectScreen'),
    difficultySelect: document.getElementById('difficultySelectScreen'),
};
const gameContainer = document.getElementById('gameContainer');
const p1CharOptionsContainer = document.getElementById('p1CharacterOptions');
const p2CharOptionsContainer = document.getElementById('p2CharacterOptions');
const arenaOptionsContainer = document.getElementById('arenaOptionsContainer');
const messageArea = document.getElementById('messageArea');
const player1HealthBarEl = document.getElementById('player1HealthBar'); const player1HealthBarNameEl = document.getElementById('player1HealthBarName');
const player2HealthBarEl = document.getElementById('player2HealthBar'); const player2HealthBarNameEl = document.getElementById('player2HealthBarName');
const player1SpecialBarEl = document.getElementById('player1SpecialBar'); const player2SpecialBarEl = document.getElementById('player2SpecialBar');
const p1ControlsDisplayH3 = document.getElementById('p1ControlsDisplay').querySelector('h3');
const p2ControlsDisplayDiv = document.getElementById('p2ControlsDisplay');
const p1CharSelectTitle = document.getElementById('p1CharSelectTitle');
const p2CharSelectTitle = document.getElementById('p2CharSelectTitle');

const gameOverModal = document.getElementById('gameOverModal'); const gameOverMessage = document.getElementById('gameOverMessage'); const restartButton = document.getElementById('restartButton');
const roundStartMessageEl = document.getElementById('roundStartMessage');
const pauseMessageEl = document.getElementById('pauseMessage');
const player1ScoreEl = document.getElementById('player1Score').querySelector('span');
const player2ScoreEl = document.getElementById('player2Score').querySelector('span');
const currentRoundDisplayEl = document.getElementById('currentRoundDisplay');

const touchControlsContainer = document.getElementById('touchControlsContainer');
const touchUpBtn = document.getElementById('touchUpBtn');
const touchDownBtn = document.getElementById('touchDownBtn');
const touchLeftBtn = document.getElementById('touchLeftBtn');
const touchRightBtn = document.getElementById('touchRightBtn');
const touchPunchBtn = document.getElementById('touchPunchBtn');
const touchKickBtn = document.getElementById('touchKickBtn');
const touchSpecialBtn = document.getElementById('touchSpecialBtn');
const touchPauseBtn = document.getElementById('touchPauseBtn');

const gamepadStatusEl = document.getElementById('gamepadStatus');
let activeGamepads = {}; // Usar um objeto para rastrear os gamepads pelo 'index'

const GRAVITY = 0.8;
const ATTACK_DURATION = 200, PUNCH_DAMAGE = 10, KICK_DAMAGE = 15, MAX_HEALTH = 200;
const KNOCKDOWN_HIT_THRESHOLD = 5, KNOCKDOWN_JUMP_FORCE_MULTIPLIER = 0.7, KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER = 0.3;
const GROUNDED_DURATION = 1500, SCREEN_SHAKE_INTENSITY = 8, SCREEN_SHAKE_DURATION_MS = 250;
const AERIAL_ATTACK_PUSHBACK_FORCE = 8; const CROUCH_KNOCKDOWN_THRESHOLD = 2;
const COMBO_WINDOW_MS = 700; const POST_COMBO_COOLDOWN_MS = 1800;
const SPECIAL_METER_MAX = 7;
const SPECIAL_ATTACK_DAMAGE_MULTIPLIER = 5;
const VINI_SPECIAL_NOTIFICATION_DURATION = 1500; const VINI_SPECIAL_HEARTS_DURATION = 1000; const VINI_SPECIAL_MESSAGE_DURATION = 3000;
const VINI_SPECIAL_RAGE_TRANSFORM_DURATION = 500; const VINI_SPECIAL_CHARGE_DURATION = 700; const VINI_SPECIAL_RUSH_DURATION = 1200;
const OPPONENT_SPECIAL_HIT_FALL_DURATION = 2000;
const MAX_ROUNDS = 3;
const ROUND_END_DELAY = 3000;
const WALK_ANIM_FRAME_DURATION = 8;
const MAGAL_SPECIAL_SETUP_BAR_DURATION = 800;
const MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION = 1500;
const MAGAL_SPECIAL_BOTTLE_THROW_POINT_IN_CYCLE = 1000;
const MAGAL_SPECIAL_THROW_INTERVAL = 300;
const MAGAL_SPECIAL_AFTER_THROW_INTERVAL = 500;
const MAGAL_SPECIAL_BOTTLE_SPEED = 10;
const MAGAL_SPECIAL_BOTTLE_DAMAGE = PUNCH_DAMAGE * 0.9;
const MAGAL_SPECIAL_BOTTLE_WIDTH = 10; const MAGAL_SPECIAL_BOTTLE_HEIGHT = 25;
const MAGAL_SPECIAL_DISCO_DURATION = 2500; const MAGAL_SPECIAL_FINAL_MESSAGE_DURATION = 3000;
const MAGAL_BAR_TABLE_WIDTH = 80; const MAGAL_BAR_TABLE_HEIGHT = 40; const MAGAL_BAR_SLIDE_SPEED = 7;
const PEDRO_SPECIAL_SUPINE_DURATION = 1800;
const PEDRO_SPECIAL_POWER_UP_DURATION = 2500;
const PEDRO_SPECIAL_RUSH_ATTACK_SPEED_MULTIPLIER = 3.0;
const PEDRO_SPECIAL_PUNCH_COUNT = 5;
const PEDRO_SPECIAL_PUNCH_INTERVAL = 350;
const PEDRO_SPECIAL_FINAL_PUNCH_LAUNCH_MULTIPLIER = 1.8;
const BJ_SPECIAL_DIALOGUE_DURATION = 2500;
const BJ_SPECIAL_LAUGH_DURATION = 3000;
const BJ_SPECIAL_LAUGH_FRAME_DURATION = 200;
const BJ_SPECIAL_TELEPORT_DELAY = 700;
const BJ_SPECIAL_THROW_ANIM_DURATION = 400;
const BJ_CHINELA_SPEED = 12;
const BJ_CHINELA_DAMAGE = PUNCH_DAMAGE;
const BJ_CHINELA_WIDTH = 20; const BJ_CHINELA_HEIGHT = 10;
const BJ_SPECIAL_CHINELA_COUNT = 5;
const JOAO_SPECIAL_DIALOGUE1_DURATION = 3000;
const JOAO_SPECIAL_TRANSFORM_DURATION_PER_CYCLE = 500;
const JOAO_SPECIAL_TRANSFORM_CYCLES = 4;
const JOAO_SPECIAL_DIALOGUE2_DURATION = 3000;
const JOAO_SPECIAL_RUSH_SPEED_MULTIPLIER = 3.0;
const JOAO_SPECIAL_RUSH_TIMEOUT = 2000;
const JOAO_SPECIAL_ATTACK_INTERVAL = 400;
const JOAO_SPECIAL_ATTACK_HITS = 5;
const JOAO_SPECIAL_ATTACK_DAMAGE = PUNCH_DAMAGE;


let currentP1CharIndex = 0, currentP2CharIndex = 0;
let selectedP1Char = null, selectedP2Char = null;
let selectedDifficulty = null;
let gameMode = 'pvcpu'; // 'pvcpu' ou 'pvp'
let pvpControlScheme = null; // 'touch-vs-gamepad' ou 'gamepad-vs-gamepad'
let selectedArenaBg = 'img/condominio_bg.jpg';
let currentScreen = 'modeSelect';
let matchOver = false; let players = [null, null]; const keys = {};
let screenShakeActive = false, currentScreenShakeIntensity = 0, currentScreenShakeDuration = 0, lastTime = 0;
let aiActionCooldown = 0; const AI_ACTION_COOLDOWN_BASE = 500;
let currentRound = 1;
let player1RoundWins = 0; let player2RoundWins = 0;
let isPaused = false;
let roundOverState = false;
let roundOverTimer = 0;
let projectiles = [];

const playerSprites = {};
let imagesToLoadCount = 0;
let imagesLoadedCount = 0;
let allImagesProcessedCheck = false;

function checkAllImagesProcessed() {
    if (!allImagesProcessedCheck && imagesLoadedCount >= imagesToLoadCount) {
        allImagesProcessedCheck = true;
        if (currentScreen === 'game' && !lastTime && !matchOver && !isPaused && !roundOverState) {
            lastTime = 0;
            requestAnimationFrame(gameLoop);
        }
    }
}

function loadImage(key, src) {
    imagesToLoadCount++;
    playerSprites[key] = new Image();
    playerSprites[key].crossOrigin = "Anonymous";
    playerSprites[key].src = src;
    playerSprites[key].onload = () => { imagesLoadedCount++; checkAllImagesProcessed(); };
    playerSprites[key].onerror = (e) => { console.warn(`Erro ao carregar o sprite ${key} de ${src}.`); imagesLoadedCount++; checkAllImagesProcessed(); };
}

const SPRITE_W = 150;
const SPRITE_H = 225;

// --- CARREGAMENTO DE SPRITES --- (O mesmo de antes, sem alterações)
// VINI
loadImage('vini_idle', 'img/vini/cassiano.png');
loadImage('vini_walk_rf', `img/vini/vini_andando1.png`);
loadImage('vini_walk_pass', `img/vini/cassiano.png`);
loadImage('vini_walk_lf', `img/vini/vini_andando2.png`);
loadImage('vini_jump', `img/vini/vini pulando.png`);
loadImage('vini_crouch', `img/vini/vini_defendendo.png`);
loadImage('vini_defend', `img/vini/vini_defendendo.png`);
loadImage('vini_punch_st', `img/vini/vini soco.png`);
loadImage('vini_kick_st', `img/vini/vini_chute.png`);
loadImage('vini_punch_cr', `img/vini/soco baixo vini.png`);
loadImage('vini_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/4299e1/white?text=V_KICK_CR`);
loadImage('vini_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/4299e1/white?text=V_PUNCH_AIR`);
loadImage('vini_kick_air', `img/vini/vini_vuadora.png`);
loadImage('vini_special_anim', `img/vini/vini_rage-removebg-preview.png`);
loadImage('vini_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/4299e1/white?text=V_HIT`);
loadImage('vini_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/4299e1/white?text=V_KD_FALL`);
loadImage('vini_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/4299e1/white?text=V_KD_GROUND`);
// MAGAL
loadImage('magal_idle', 'img/magal/magal.png');
loadImage('magal_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_WALK_RF`);
loadImage('magal_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_WALK_PASS`);
loadImage('magal_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_WALK_LF`);
loadImage('magal_jump', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_JUMP`);
loadImage('magal_crouch', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_CROUCH`);
loadImage('magal_defend', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_DEFEND`);
loadImage('magal_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_PUNCH_ST`);
loadImage('magal_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_KICK_ST`);
loadImage('magal_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_PUNCH_CR`);
loadImage('magal_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_KICK_CR`);
loadImage('magal_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_PUNCH_AIR`);
loadImage('magal_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_KICK_AIR`);
loadImage('magal_special_drink_throw1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_SP_DT1`);
loadImage('magal_special_drink_throw2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_SP_DT2`);
loadImage('magal_special_drink_throw3', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_SP_DT3`);
loadImage('magal_special_disco', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/black?text=M_DISCO`);
loadImage('magal_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_HIT`);
loadImage('magal_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_KD_FALL`);
loadImage('magal_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/f56565/white?text=M_KD_GROUND`);
// PEDRO
loadImage('pedro_idle', 'img/pedro/predo.png');
loadImage('pedro_walk_rf', `img/pedro/pedroandando 1.png`);
loadImage('pedro_walk_pass', `img/pedro/pedro andando2.png`);
loadImage('pedro_walk_lf', `img/pedro/pedroandando 3.png`);
loadImage('pedro_jump', `img/pedro/pedro_pulando-removebg-preview.png`);
loadImage('pedro_crouch', `img/pedro/pedro guarda.png`);
loadImage('pedro_defend', `img/pedro/pedro guarda.png`);
loadImage('pedro_punch_st', `img/pedro/pedro murro.png`);
loadImage('pedro_kick_st', `img/pedro/predo chute.png`);
loadImage('pedro_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_PUNCH_AIR`);
loadImage('pedro_kick_air', `img/pedro/vuadora predo.png`);
loadImage('pedro_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_PUNCH_CR`);
loadImage('pedro_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_KICK_CR`);
loadImage('pedro_special_supine', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_SP_SUPINE`);
loadImage('pedro_special_power_up', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_SP_POWER`);
loadImage('pedro_special_attack1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_SP_ATK1`);
loadImage('pedro_special_attack2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_SP_ATK2`);
loadImage('pedro_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/48bb78/white?text=P_HIT`);
loadImage('pedro_kd_fall', `img/pedro/pedro_caido-removebg-preview.png`);
loadImage('pedro_kd_ground', `img/pedro/pedro_caido-removebg-preview.png`);
// MARKIN
loadImage('markin_idle', 'img/mp/chipa.png');
loadImage('markin_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_WALK_RF`);
loadImage('markin_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_WALK_PASS`);
loadImage('markin_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_WALK_LF`);
loadImage('markin_jump', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_JUMP`);
loadImage('markin_crouch', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_CROUCH`);
loadImage('markin_defend', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_DEFEND`);
loadImage('markin_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_PUNCH_ST`);
loadImage('markin_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_KICK_ST`);
loadImage('markin_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_PUNCH_AIR`);
loadImage('markin_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_KICK_AIR`);
loadImage('markin_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_PUNCH_CR`);
loadImage('markin_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_KICK_CR`);
loadImage('markin_special_anim', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_SPECIAL`);
loadImage('markin_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_HIT`);
loadImage('markin_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_KD_FALL`);
loadImage('markin_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/06b6d4/white?text=MK_KD_GROUND`);
// FREITAS
loadImage('freitas_idle', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_IDLE`);
loadImage('freitas_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_WALK_RF`);
loadImage('freitas_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_WALK_PASS`);
loadImage('freitas_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_WALK_LF`);
loadImage('freitas_jump', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_JUMP`);
loadImage('freitas_crouch', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_CROUCH`);
loadImage('freitas_defend', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_DEFEND`);
loadImage('freitas_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_PUNCH_ST`);
loadImage('freitas_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_KICK_ST`);
loadImage('freitas_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_PUNCH_AIR`);
loadImage('freitas_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_KICK_AIR`);
loadImage('freitas_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_PUNCH_CR`);
loadImage('freitas_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_KICK_CR`);
loadImage('freitas_special_anim', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_SPECIAL`);
loadImage('freitas_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_HIT`);
loadImage('freitas_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_KD_FALL`);
loadImage('freitas_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/d946ef/white?text=F_KD_GROUND`);
// BJ
loadImage('bj_idle', `img/bj/bj_parado-removebg-preview.png`);
loadImage('bj_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_WALK_RF`);
loadImage('bj_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_WALK_PASS`);
loadImage('bj_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_WALK_LF`);
loadImage('bj_jump', `img/bj/bj_pulando-removebg-preview.png`);
loadImage('bj_crouch', `img/bj/bj_guarda-removebg-preview.png`);
loadImage('bj_defend', `img/bj/bj_guarda-removebg-preview.png`);
loadImage('bj_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_PUNCH_ST`);
loadImage('bj_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_KICK_ST`);
loadImage('bj_punch_cr', `img/bj/bj_murro-removebg-preview.png`);
loadImage('bj_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_KICK_CR`);
loadImage('bj_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_PUNCH_AIR`);
loadImage('bj_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_KICK_AIR`);
loadImage('bj_special_laugh1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_LAUGH1`);
loadImage('bj_special_laugh2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_LAUGH2`);
loadImage('bj_special_laugh3', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_LAUGH3`);
loadImage('bj_special_throw1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_THROW1`);
loadImage('bj_special_throw2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_THROW2`);
loadImage('bj_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_HIT`);
loadImage('bj_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_KD_FALL`);
loadImage('bj_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/ff8c00/white?text=BJ_KD_GROUND`);
loadImage('chinela_flying1', `https://placehold.co/50x20/aa4400/white?text=CHIN1`);
loadImage('chinela_flying2', `https://placehold.co/50x20/aa4400/white?text=CHIN2`);
// JOÃO
loadImage('joao_idle', `img/jao/jao_padrao-removebg-preview.png`);
loadImage('joao_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_WALK_RF`);
loadImage('joao_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_WALK_PASS`);
loadImage('joao_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_WALK_LF`);
loadImage('joao_jump', `img/jao/jao_piulando-removebg-preview.png`);
loadImage('joao_crouch', `img/jao/jao_guarda-removebg-preview.png`);
loadImage('joao_defend', `img/jao/jao_guarda-removebg-preview.png`);
loadImage('joao_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_PUNCH_ST`);
loadImage('joao_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_KICK_ST`);
loadImage('joao_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_PUNCH_AIR`);
loadImage('joao_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_KICK_AIR`);
loadImage('joao_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_PUNCH_CR`);
loadImage('joao_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_KICK_CR`);
loadImage('joao_special_transform1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_TRANS1`);
loadImage('joao_special_transform2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_TRANS2`);
loadImage('joao_special_post_transform_idle', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/black?text=J_POWER_IDLE`);
loadImage('joao_special_attack1', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_SP_ATK1`);
loadImage('joao_special_attack2', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_SP_ATK2`);
loadImage('joao_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/8a2be2/white?text=J_HIT`);
loadImage('joao_kd_fall', `img/jao/jao_nocaute-removebg-preview.png`);
loadImage('joao_kd_ground', `img/jao/jao_nocaute-removebg-preview.png`);
// ENZO
loadImage('enzo_idle', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_IDLE`);
loadImage('enzo_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_WALK_RF`);
loadImage('enzo_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_WALK_PASS`);
loadImage('enzo_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_WALK_LF`);
loadImage('enzo_jump', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_JUMP`);
loadImage('enzo_crouch', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_CROUCH`);
loadImage('enzo_defend', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_DEFEND`);
loadImage('enzo_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_PUNCH_ST`);
loadImage('enzo_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_KICK_ST`);
loadImage('enzo_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_PUNCH_CR`);
loadImage('enzo_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_KICK_CR`);
loadImage('enzo_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_PUNCH_AIR`);
loadImage('enzo_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_KICK_AIR`);
loadImage('enzo_special_anim', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_SPECIAL`);
loadImage('enzo_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_HIT`);
loadImage('enzo_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_KD_FALL`);
loadImage('enzo_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/20c997/white?text=ENZO_KD_GROUND`);
// BIEL
loadImage('biel_idle', `img/biel/gabriel_dias-removebg-preview.png`);
loadImage('biel_walk_rf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_WALK_RF`);
loadImage('biel_walk_pass', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_WALK_PASS`);
loadImage('biel_walk_lf', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_WALK_LF`);
loadImage('biel_jump', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_JUMP`);
loadImage('biel_crouch', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_CROUCH`);
loadImage('biel_defend', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_DEFEND`);
loadImage('biel_punch_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_PUNCH_ST`);
loadImage('biel_kick_st', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_KICK_ST`);
loadImage('biel_punch_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_PUNCH_CR`);
loadImage('biel_kick_cr', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_KICK_CR`);
loadImage('biel_punch_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_PUNCH_AIR`);
loadImage('biel_kick_air', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_KICK_AIR`);
loadImage('biel_special_anim', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_SPECIAL`);
loadImage('biel_hit', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_HIT`);
loadImage('biel_kd_fall', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_KD_FALL`);
loadImage('biel_kd_ground', `https://placehold.co/${SPRITE_W}x${SPRITE_H}/adb5bd/black?text=BIEL_KD_GROUND`);

// --- DEFINIÇÃO DOS PERSONAGENS ---
const availableCharacters = [ { id: 'vini', name: "VINI", color: '#4299e1', sprites: { idle: 'vini_idle', walk1: 'vini_walk_rf', walk2: 'vini_walk_pass', walk3: 'vini_walk_lf', jump: 'vini_jump', crouch: 'vini_crouch', defend: 'vini_defend', punch_st: 'vini_punch_st', kick_st: 'vini_kick_st', punch_cr: 'vini_punch_cr', kick_cr: 'vini_kick_cr', punch_air: 'vini_punch_air', kick_air: 'vini_kick_air', special_anim: 'vini_special_anim', hit: 'vini_hit', kd_fall: 'vini_kd_fall', kd_ground: 'vini_kd_ground'} }, { id: 'magal', name: "MAGAL", color: '#f56565', sprites: { idle: 'magal_idle', walk1: 'magal_walk_rf', walk2: 'magal_walk_pass', walk3: 'magal_walk_lf', jump: 'magal_jump', crouch: 'magal_crouch', defend: 'magal_defend', punch_st: 'magal_punch_st', kick_st: 'magal_kick_st', punch_cr: 'magal_punch_cr', kick_cr: 'magal_kick_cr', punch_air: 'magal_punch_air', kick_air: 'magal_kick_air', special_drink_throw1: 'magal_special_drink_throw1', special_drink_throw2: 'magal_special_drink_throw2', special_drink_throw3: 'magal_special_drink_throw3', special_disco: 'magal_special_disco', hit: 'magal_hit', kd_fall: 'magal_kd_fall', kd_ground: 'magal_kd_ground'} }, { id: 'pedro', name: "PEDRO", color: '#48bb78', sprites: { idle: 'pedro_idle', walk1: 'pedro_walk_rf', walk2: 'pedro_walk_pass', walk3: 'pedro_walk_lf', jump: 'pedro_jump', crouch: 'pedro_crouch', defend: 'pedro_defend', punch_st: 'pedro_punch_st', kick_st: 'pedro_kick_st', punch_cr: 'pedro_punch_cr', kick_cr: 'pedro_kick_cr', punch_air: 'pedro_punch_air', kick_air: 'pedro_kick_air', special_supine: 'pedro_special_supine', special_power_up: 'pedro_special_power_up', special_attack1: 'pedro_special_attack1', special_attack2: 'pedro_special_attack2', hit: 'pedro_hit', kd_fall: 'pedro_kd_fall', kd_ground: 'pedro_kd_ground'} }, { id: 'markin', name: "MARKIN", color: '#06b6d4', sprites: { idle: 'markin_idle', walk1: 'markin_walk_rf', walk2: 'markin_walk_pass', walk3: 'markin_walk_lf', jump: 'markin_jump', crouch: 'markin_crouch', defend: 'markin_defend', punch_st: 'markin_punch_st', kick_st: 'markin_kick_st', punch_cr: 'markin_punch_cr', kick_cr: 'markin_kick_cr', punch_air: 'markin_punch_air', kick_air: 'markin_kick_air', special_anim: 'markin_special_anim', hit: 'markin_hit', kd_fall: 'markin_kd_fall', kd_ground: 'markin_kd_ground'} }, { id: 'freitas', name: "FREITAS", color: '#d946ef', sprites: { idle: 'freitas_idle', walk1: 'freitas_walk_rf', walk2: 'freitas_walk_pass', walk3: 'freitas_walk_lf', jump: 'freitas_jump', crouch: 'freitas_crouch', defend: 'freitas_defend', punch_st: 'freitas_punch_st', kick_st: 'freitas_kick_st', punch_cr: 'freitas_punch_cr', kick_cr: 'freitas_kick_cr', punch_air: 'freitas_punch_air', kick_air: 'freitas_kick_air', special_anim: 'freitas_special_anim', hit: 'freitas_hit', kd_fall: 'freitas_kd_fall', kd_ground: 'freitas_kd_ground'} }, { id: 'bj', name: "BJ", color: '#ff8c00', sprites: { idle: 'bj_idle', walk1: 'bj_walk_rf', walk2: 'bj_walk_pass', walk3: 'bj_walk_lf', jump: 'bj_jump', crouch: 'bj_crouch', defend: 'bj_defend', punch_st: 'bj_punch_st', kick_st: 'bj_kick_st', punch_cr: 'bj_punch_cr', kick_cr: 'bj_kick_cr', punch_air: 'bj_punch_air', kick_air: 'bj_kick_air', special_laugh1: 'bj_special_laugh1', special_laugh2: 'bj_special_laugh2', special_laugh3: 'bj_special_laugh3', special_throw1: 'bj_special_throw1', special_throw2: 'bj_special_throw2', hit: 'bj_hit', kd_fall: 'bj_kd_fall', kd_ground: 'bj_kd_ground'} }, { id: 'joao', name: "JOÃO", color: '#8a2be2', sprites: { idle: 'joao_idle', walk1: 'joao_walk_rf', walk2: 'joao_walk_pass', walk3: 'joao_walk_lf', jump: 'joao_jump', crouch: 'joao_crouch', defend: 'joao_defend', punch_st: 'joao_punch_st', kick_st: 'joao_kick_st', punch_cr: 'joao_punch_cr', kick_cr: 'joao_kick_cr', punch_air: 'joao_punch_air', kick_air: 'joao_kick_air', special_transform1: 'joao_special_transform1', special_transform2: 'joao_special_transform2', special_post_transform_idle: 'joao_special_post_transform_idle', special_attack1: 'joao_special_attack1', special_attack2: 'joao_special_attack2', hit: 'joao_hit', kd_fall: 'joao_kd_fall', kd_ground: 'joao_kd_ground'} }, { id: 'enzo', name: "ENZO", color: '#20c997', sprites: { idle: 'enzo_idle', walk1: 'enzo_walk_rf', walk2: 'enzo_walk_pass', walk3: 'enzo_walk_lf', jump: 'enzo_jump', crouch: 'enzo_crouch', defend: 'enzo_defend', punch_st: 'enzo_punch_st', kick_st: 'enzo_kick_st', punch_cr: 'enzo_punch_cr', kick_cr: 'enzo_kick_cr', punch_air: 'enzo_punch_air', kick_air: 'enzo_kick_air', special_anim: 'enzo_special_anim', hit: 'enzo_hit', kd_fall: 'enzo_kd_fall', kd_ground: 'enzo_kd_ground'} }, { id: 'biel', name: "BIEL", color: '#adb5bd', sprites: { idle: 'biel_idle', walk1: 'biel_walk_rf', walk2: 'biel_walk_pass', walk3: 'biel_walk_lf', jump: 'biel_jump', crouch: 'biel_crouch', defend: 'biel_defend', punch_st: 'biel_punch_st', kick_st: 'biel_kick_st', punch_cr: 'biel_punch_cr', kick_cr: 'biel_kick_cr', punch_air: 'biel_punch_air', kick_air: 'biel_kick_air', special_anim: 'biel_special_anim', hit: 'biel_hit', kd_fall: 'biel_kd_fall', kd_ground: 'biel_kd_ground'} } ];
// --- DEFINIÇÃO DAS ARENAS ---
const availableArenas = [ { name: "Condomínio", bgPath: "img/locais/Imagem do WhatsApp de 2025-05-31 à(s) 02.37.40_bab8b7c8 (2).jpg" }, { name: "Casa do Pedro", bgPath: "img/locais/predo house.jpg" }, { name: "Arena de Luta", bgPath: "img/locais/NQA CHINA.gif" }, { name: "Rua", bgPath: "https://placehold.co/800x400/333333/white?text=Rua" } ];

const combos = [ { sequence: ['punch', 'punch', 'punch'], name: "Soco Triplo" }, { sequence: ['punch', 'punch', 'punch', 'kick', 'kick'], name: "Combo Furioso" }, { sequence: ['kick', 'kick', 'kick'], name: "Chute Triplo" }, { sequence: ['kick', 'kick', 'kick', 'punch', 'punch'], name: "Combo Demolidor" }];

function updateHealthBars() { players.forEach((p, index) => { if (!p) return; const barEl = index === 0 ? player1HealthBarEl : player2HealthBarEl; const nameSpan = index === 0 ? player1HealthBarNameEl : player2HealthBarNameEl; const percent = (p.health / p.maxHealth) * 100; barEl.style.width = `${Math.max(0, percent)}%`; nameSpan.textContent = `${p.name.toUpperCase()}`; if (barEl.childNodes.length > 1 && barEl.lastChild.nodeType === Node.TEXT_NODE) { barEl.removeChild(barEl.lastChild); } barEl.appendChild(document.createTextNode(`: ${Math.max(0, Math.round(percent))}%`)); barEl.style.backgroundColor = p.color; });}
function updateSpecialBars() { players.forEach((p, index) => { if (!p) return; const barEl = index === 0 ? player1SpecialBarEl : player2SpecialBarEl; const percent = (p.specialMeter / SPECIAL_METER_MAX) * 100; barEl.style.width = `${Math.max(0, percent)}%`; barEl.textContent = `J${index+1} Esp: ${Math.floor(percent)}%`; if (p.specialReady) barEl.classList.add('ready'); else barEl.classList.remove('ready'); });}
function updateScoreDisplay() { player1ScoreEl.textContent = player1RoundWins; player2ScoreEl.textContent = player2RoundWins; currentRoundDisplayEl.textContent = `Round: ${currentRound}`;}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if (screens[screenName]) {
        screens[screenName].classList.add('active');
    } else if (screenName === 'game') {
        gameContainer.style.display = 'flex';
    }

    if (screenName !== 'game') {
        gameContainer.style.display = 'none';
        touchControlsContainer.style.display = 'none';
    } else {
        const showTouch = (gameMode === 'pvcpu' && Object.keys(activeGamepads).length === 0) ||
                          (gameMode === 'pvp' && pvpControlScheme === 'touch-vs-gamepad');
        touchControlsContainer.style.display = showTouch ? 'block' : 'none';
    }
    currentScreen = screenName;
}


function populateCharacterOptions(container, playerNumber, currentIndex) {
    container.innerHTML = '';
    availableCharacters.forEach((char, index) => {
        const opt = document.createElement('button');
        opt.classList.add('character-option');
        opt.textContent = char.name;
        opt.style.color = char.color;
        opt.style.borderColor = char.color;
        opt.dataset.charIndex = index;

        let isUnavailable = false;
        if (playerNumber === 2 && selectedP1Char && selectedP1Char.id === char.id) {
            isUnavailable = true;
        }

        if (isUnavailable) {
            opt.classList.add('unavailable');
            opt.disabled = true;
        } else {
            if (index === currentIndex) opt.classList.add('selected');
            opt.addEventListener('click', () => {
                const charIndex = parseInt(opt.dataset.charIndex);
                if (playerNumber === 1) {
                    currentP1CharIndex = charIndex;
                    confirmCharacter(1);
                } else if (playerNumber === 2) {
                    if (selectedP1Char && availableCharacters[charIndex].id === selectedP1Char.id) {
                        return;
                    }
                    currentP2CharIndex = charIndex;
                    confirmCharacter(2);
                }
            });
        }
        container.appendChild(opt);
    });
}


function populateArenaOptions() {
    arenaOptionsContainer.innerHTML = '';
    availableArenas.forEach((arena, index) => {
        const opt = document.createElement('button');
        opt.classList.add('arena-option');
        opt.textContent = arena.name;
        opt.dataset.arenaBg = arena.bgPath;
        opt.dataset.arenaIndex = index;

        if (arena.bgPath === selectedArenaBg) {
            opt.classList.add('selected');
        }

        opt.addEventListener('click', () => {
            document.querySelectorAll('.arena-option').forEach(btn => btn.classList.remove('selected'));
            opt.classList.add('selected');
            selectedArenaBg = opt.dataset.arenaBg;
            if (gameMode === 'pvcpu') {
                switchScreen('difficultySelect');
            } else {
                startGame();
            }
        });
        arenaOptionsContainer.appendChild(opt);
    });
}


function initializeSelections() {
    selectedP1Char = null; selectedP2Char = null; selectedDifficulty = null;
    currentP1CharIndex = 0; currentP2CharIndex = 0;
    selectedArenaBg = availableArenas[0].bgPath;

    populateCharacterOptions(p1CharOptionsContainer, 1, currentP1CharIndex);
    populateCharacterOptions(p2CharOptionsContainer, 2, currentP2CharIndex);
    populateArenaOptions();
    document.querySelectorAll('.difficulty-option').forEach(btn => btn.classList.remove('selected'));
}

// --- Event Listeners para Seleção de Modo ---
document.getElementById('pvcpuButton').addEventListener('click', () => {
    gameMode = 'pvcpu';
    initializeSelections();
    switchScreen('p1CharSelect');
    p1CharSelectTitle.textContent = "Jogador 1: Escolha seu Lutador";
    p2CharSelectTitle.textContent = "Escolha o Lutador da CPU";
});

document.getElementById('pvpButton').addEventListener('click', () => {
    gameMode = 'pvp';
    updateControlSelectionAvailability();
    switchScreen('controlSelect');
});

document.getElementById('backToMenuButton').addEventListener('click', () => switchScreen('modeSelect'));

// --- Event Listeners para Seleção de Controle (PvP) ---
document.getElementById('touchVsGamepadButton').addEventListener('click', () => {
    if (Object.keys(activeGamepads).length >= 1) {
        pvpControlScheme = 'touch-vs-gamepad';
        initializeSelections();
        switchScreen('p1CharSelect');
        p1CharSelectTitle.textContent = "J1 (Toque): Escolha seu Lutador";
        p2CharSelectTitle.textContent = "J2 (Controle): Escolha seu Lutador";
    }
});

document.getElementById('gamepadVsGamepadButton').addEventListener('click', () => {
    if (Object.keys(activeGamepads).length >= 2) {
        pvpControlScheme = 'gamepad-vs-gamepad';
        initializeSelections();
        switchScreen('p1CharSelect');
        p1CharSelectTitle.textContent = "J1 (Controle 1): Escolha seu Lutador";
        p2CharSelectTitle.textContent = "J2 (Controle 2): Escolha seu Lutador";
    }
});

document.querySelectorAll('.difficulty-option').forEach(button => { button.addEventListener('click', () => { document.querySelectorAll('.difficulty-option').forEach(btn => btn.classList.remove('selected')); button.classList.add('selected'); selectedDifficulty = button.dataset.difficulty; startGame(); });});

function confirmCharacter(playerNumber) {
    if (playerNumber === 1) {
        selectedP1Char = { ...availableCharacters[currentP1CharIndex] };
        populateCharacterOptions(p2CharOptionsContainer, 2, currentP2CharIndex);
        switchScreen('p2CharSelect');
    } else if (playerNumber === 2) {
        if (availableCharacters[currentP2CharIndex].id !== selectedP1Char?.id) {
            selectedP2Char = { ...availableCharacters[currentP2CharIndex] };
            switchScreen('arenaSelect');
        }
    }
}

function initializePlayerObject(playerData) {
    return {
        ...playerData,
        x: 0, y: 0, width: PLAYER_WIDTH_SCALED, height: PLAYER_HEIGHT_SCALED, health: MAX_HEALTH, maxHealth: MAX_HEALTH, velocityX: 0, velocityY: 0, isJumping: false, isCrouching: false, isAttacking: false, attackType: null, attackTimer: 0, isDefending: false, facingRight: true, hitCounter: 0, consecutiveCrouchHitsTaken: 0, knockdownState: 'none',
        groundedTimer: 0, comboSequence: [], lastAttackConnectTime: 0, actionCooldown: 0,
        punchKeyHeldInternal: false, kickKeyHeldInternal: false, specialKeyAlreadyTriggered: false, pauseKeyHeldInternal: false,
        walkFrame: 0,
        walkFrameTimer: 0,
        specialMeter: 0, specialReady: false, performingSpecial: null,
        specialAnimTimer: 0, opponentSpecialMessageTimer: 0,
        specialState: {
            bottlesDrunk: 0, bottlesThrown: 0, barTableX: -MAGAL_BAR_TABLE_WIDTH, barTableY: 0, barTableTargetX: 0, barTableVisible: false,
            punchesDelivered: 0,
            chinelasThrown: 0, laughFrame: 0, teleportTimer:0, throwFrame:0,
            transformCycleCount: 0, transformFrame: 0, attackHitCount: 0, attackFrame: 0, hitDeliveredThisFrame: false,
            currentCycleFrame: 0,
            throwDelay: 0, projectileLaunchedThisFrame: false
        }
    };
}

function startGame() {
    if (!selectedP1Char || !selectedP2Char || !selectedArenaBg || (gameMode === 'pvcpu' && !selectedDifficulty)) {
        console.error("Seleções incompletas para iniciar o jogo:", selectedP1Char, selectedP2Char, selectedDifficulty, selectedArenaBg);
        return;
    }
    gameCanvas.style.backgroundImage = `url("${selectedArenaBg}")`;
    setupCanvasDimensions();
    currentRound = 1; player1RoundWins = 0; player2RoundWins = 0;
    matchOver = false; isPaused = false; roundOverState = false;

    players[0] = initializePlayerObject(selectedP1Char);
    players[1] = initializePlayerObject(selectedP2Char);

    if(p1ControlsDisplayH3) p1ControlsDisplayH3.textContent = `J1: ${players[0].name.toUpperCase()}`;
    if(p2ControlsDisplayDiv) {
        const p2H3 = p2ControlsDisplayDiv.querySelector('h3');
        const p2Label = gameMode === 'pvp' ? 'J2' : 'CPU';
        if(p2H3) p2H3.textContent = `${p2Label}: ${players[1].name.toUpperCase()}`;
        p2ControlsDisplayDiv.style.display = 'block';
    }
    switchScreen('game');
    startNewRound();
}

function startNewRound() {
    roundOverState = false; messageArea.textContent = '';
    projectiles = [];
    roundStartMessageEl.textContent = `Round ${currentRound}`; roundStartMessageEl.style.display = 'block';
    resetRoundState(); updateScoreDisplay();
    setTimeout(() => {
        roundStartMessageEl.style.display = 'none';
        if (allImagesProcessedCheck && !matchOver) {
            if(!lastTime && !isPaused) {
                 lastTime = performance.now() - 16.66;
                 requestAnimationFrame(gameLoop);
            }
        }
    }, 2000);
}

function resetRoundState() {
    players.forEach((player, index) => {
        if (player) {
            player.health = player.maxHealth; player.facingRight = index === 0;
            player.x = index === 0 ? canvasWidth * 0.25 - player.width / 2 : canvasWidth * 0.75 - player.width / 2;
            player.y = canvasHeight - player.height;
            player.velocityX = 0; player.velocityY = 0; player.isJumping = false; player.isCrouching = false;
            player.isAttacking = false; player.isDefending = false; player.hitCounter = 0; player.consecutiveCrouchHitsTaken = 0;
            player.knockdownState = 'none'; player.groundedTimer = 0;
            player.comboSequence = []; player.lastAttackConnectTime = 0; player.actionCooldown = 0;
            player.punchKeyHeldInternal = false; player.kickKeyHeldInternal = false; player.specialKeyAlreadyTriggered = false; player.pauseKeyHeldInternal = false;
            player.walkFrame = 0;
            player.walkFrameTimer = 0;
            player.performingSpecial = null; player.specialAnimTimer = 0; player.opponentSpecialMessageTimer = 0;
            player.specialState = {
                bottlesDrunk: 0, bottlesThrown: 0,
                barTableX: player.facingRight ? -MAGAL_BAR_TABLE_WIDTH - 50 : canvasWidth + 50,
                barTableY: canvasHeight - MAGAL_BAR_TABLE_HEIGHT - PLAYER_HEIGHT_SCALED + 80 ,
                barTableTargetX: 0, barTableVisible: false,
                punchesDelivered: 0,
                chinelasThrown: 0, laughFrame: 0, teleportTimer:0, throwFrame:0,
                transformCycleCount: 0, transformFrame: 0, attackHitCount: 0, attackFrame: 0, hitDeliveredThisFrame: false,
                currentCycleFrame: 0,
                throwDelay: 0, projectileLaunchedThisFrame: false
            };
        }
    });
    updateHealthBars(); updateSpecialBars();
}

// --- CONTROLES ---
document.addEventListener('keydown', (event) => { keys[event.key.toLowerCase()] = true; });
document.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });

function addTouchListener(element, keyName, isArrowDown = false) {
    element.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys[keyName] = true;
        if (isArrowDown && players[0] &&
            !players[0].isJumping &&
            players[0].knockdownState === 'none' &&
            !players[0].performingSpecial) {
            players[0].isCrouching = true;
        }
    }, { passive: false });
    element.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys[keyName] = false;
        if (isArrowDown && players[0]) {
            players[0].isCrouching = false;
        }
    }, { passive: false });
}
addTouchListener(touchLeftBtn, 'a');
addTouchListener(touchRightBtn, 'd');
addTouchListener(touchUpBtn, 'w');
addTouchListener(touchDownBtn, 's', true);
addTouchListener(touchPunchBtn, 'j');
addTouchListener(touchKickBtn, 'k');
addTouchListener(touchSpecialBtn, 'l');
touchPauseBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (currentScreen === 'game' && !matchOver) {
        togglePause();
    }
}, { passive: false });

// --- LÓGICA DO GAMEPAD ---
function updateGamepadStatus() {
    const count = Object.keys(activeGamepads).length;
    const touchVsGamepadBtn = document.getElementById('touchVsGamepadButton');
    const gamepadVsGamepadBtn = document.getElementById('gamepadVsGamepadButton');

    if (count === 0) {
        gamepadStatusEl.textContent = 'Nenhum controle conectado';
        gamepadStatusEl.classList.remove('connected');
        if(touchVsGamepadBtn) touchVsGamepadBtn.disabled = true;
        if(gamepadVsGamepadBtn) gamepadVsGamepadBtn.disabled = true;
    } else {
        gamepadStatusEl.textContent = `${count} controle${count > 1 ? 's' : ''} conectado${count > 1 ? 's' : ''}!`;
        gamepadStatusEl.classList.add('connected');
        if(touchVsGamepadBtn) touchVsGamepadBtn.disabled = false;
        if(gamepadVsGamepadBtn) gamepadVsGamepadBtn.disabled = count < 2;
    }
}

function handleGamepadConnected(e) {
    console.log("Gamepad conectado:", e.gamepad.index, e.gamepad.id);
    activeGamepads[e.gamepad.index] = e.gamepad;
    updateGamepadStatus();
}

function handleGamepadDisconnected(e) {
    console.log("Gamepad desconectado:", e.gamepad.index, e.gamepad.id);
    delete activeGamepads[e.gamepad.index];
    updateGamepadStatus();
}

window.addEventListener("gamepadconnected", handleGamepadConnected);
window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

restartButton.addEventListener('click', () => { gameOverModal.style.display = 'none'; matchOver = false; switchScreen('modeSelect'); });

function handleRoundEnd(roundWinnerPlayer) {
    roundOverState = true; roundOverTimer = ROUND_END_DELAY;
    const winnerIndex = players.indexOf(roundWinnerPlayer);
    if (winnerIndex === 0) player1RoundWins++;
    else if (winnerIndex === 1) player2RoundWins++;

    updateScoreDisplay();
    messageArea.textContent = `${roundWinnerPlayer.name.toUpperCase()} VENCE O ROUND!`;
    const roundsToWin = Math.ceil(MAX_ROUNDS / 2);
    if (player1RoundWins >= roundsToWin || player2RoundWins >= roundsToWin) {
        matchOver = true;
        gameOverMessage.textContent = `${roundWinnerPlayer.name.toUpperCase()} VENCEU A PARTIDA!`;
        setTimeout(() => { if (matchOver) gameOverModal.style.display = 'flex'; }, 1000);
    }
}

function startScreenShake(intensity, duration) { screenShakeActive = true; currentScreenShakeIntensity = intensity; currentScreenShakeDuration = duration; }

function togglePause() {
    isPaused = !isPaused;
    pauseMessageEl.style.display = isPaused ? 'block' : 'none';
    if (!isPaused && !roundOverState) {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

function getPlayerInputs(playerIndex) {
    const p = players[playerIndex];
    if (!p) return {};

    const isP1 = playerIndex === 0;
    const assignedGamepads = Object.values(activeGamepads).sort((a,b) => a.index - b.index);
    let gp = null;

    let useTouch = false;
    let useKeyboard = false;

    if (gameMode === 'pvcpu') {
        useTouch = assignedGamepads.length === 0;
        useKeyboard = !useTouch;
        gp = assignedGamepads[0];
    } else if (gameMode === 'pvp') {
        if (pvpControlScheme === 'touch-vs-gamepad') {
            if (isP1) useTouch = true;
            else gp = assignedGamepads[0];
        } else if (pvpControlScheme === 'gamepad-vs-gamepad') {
            gp = isP1 ? assignedGamepads[0] : assignedGamepads[1];
        }
    }


    const k = keys; // keyboard/touch alias
    const kbP1 = { left: 'a', right: 'd', up: 'w', down: 's', punch: 'j', kick: 'k', special: 'l', pause: 'p' };
    const kbP2 = { left: 'arrowleft', right: 'arrowright', up: 'arrowup', down: 'arrowdown', punch: '1', kick: '2', special: '3', pause: 'enter' }; // Numpad
    const currentKb = isP1 ? kbP1 : kbP2;


    const moveLeft = (useKeyboard && k[currentKb.left]) || (useTouch && k[kbP1.left]) || (gp && (gp.buttons[14].pressed || gp.axes[0] < -0.5));
    const moveRight = (useKeyboard && k[currentKb.right]) || (useTouch && k[kbP1.right]) || (gp && (gp.buttons[15].pressed || gp.axes[0] > 0.5));
    const jump = (useKeyboard && k[currentKb.up]) || (useTouch && k[kbP1.up]) || (gp && gp.buttons[0].pressed);
    const crouch = (useKeyboard && k[currentKb.down]) || (useTouch && k[kbP1.down]) || (gp && (gp.buttons[13].pressed || gp.axes[1] > 0.5));
    const wantsToPunch = (useKeyboard && k[currentKb.punch]) || (useTouch && k[kbP1.punch]) || (gp && gp.buttons[2].pressed);
    const wantsToKick = (useKeyboard && k[currentKb.kick]) || (useTouch && k[kbP1.kick]) || (gp && gp.buttons[3].pressed);
    const wantsToSpecial = (useKeyboard && k[currentKb.special]) || (useTouch && k[kbP1.special]) || (gp && gp.buttons[1].pressed);
    const wantsToPause = (useKeyboard && k[currentKb.pause]) || (gp && gp.buttons[9].pressed);


    return { moveLeft, moveRight, jump, crouch, wantsToPunch, wantsToKick, wantsToSpecial, wantsToPause };
}


function handlePlayerControls(playerIndex) {
    if (matchOver || currentScreen !== 'game' || isPaused || roundOverState) return;
    const p = players[playerIndex];
    if (!p) return;

    if ((p.knockdownState !== 'none' && p.knockdownState !== 'special_hit_falling' && p.knockdownState !== 'special_hit_grounded') || p.performingSpecial) {
        if(!p.performingSpecial && p.knockdownState !== 'special_hit_falling') p.velocityX = 0;
        return;
    }
    if (p.actionCooldown > 0) return;

    p.velocityX = 0;
    const { moveLeft, moveRight, jump, crouch, wantsToPunch, wantsToKick, wantsToSpecial, wantsToPause } = getPlayerInputs(playerIndex);

    // Pause (only P1 can pause)
    if (playerIndex === 0 && wantsToPause && !p.pauseKeyHeldInternal) {
        p.pauseKeyHeldInternal = true;
        togglePause();
    }
    if (!wantsToPause) {
        p.pauseKeyHeldInternal = false;
    }

    const canMoveHorizontally = !p.isAttacking && !(p.isCrouching && !p.isJumping);
    if (canMoveHorizontally) {
        if (moveLeft) { p.velocityX = -PLAYER_SPEED_SCALED; p.facingRight = false; }
        else if (moveRight) { p.velocityX = PLAYER_SPEED_SCALED; p.facingRight = true; }
    }
    p.isCrouching = crouch && !p.isJumping;

    if (jump && !p.isJumping && !p.isCrouching) {
        p.velocityY = JUMP_FORCE_SCALED;
        p.isJumping = true;
    }
    p.isDefending = p.isCrouching && !wantsToPunch && !wantsToKick && !wantsToSpecial && !p.isAttacking && !p.isJumping;

    // Special Attack
    if (p.specialReady && wantsToSpecial && !p.specialKeyAlreadyTriggered && !p.isAttacking && !p.isCrouching && !p.isJumping) {
        p.specialKeyAlreadyTriggered = true;
        p.specialReady = false; p.specialMeter = 0; updateSpecialBars();
        messageArea.textContent = `${p.name.toUpperCase()} ESPECIAL!`; setTimeout(() => messageArea.textContent = '', 1500);
        p.velocityX = 0; p.velocityY = 0; p.isAttacking = false; p.isCrouching = false; p.isJumping = false;
        if (p.id === 'vini') { p.performingSpecial = 'vini_notification'; p.specialAnimTimer = VINI_SPECIAL_NOTIFICATION_DURATION; }
        else if (p.id === 'magal') { p.performingSpecial = 'magal_setup_bar'; p.specialAnimTimer = MAGAL_SPECIAL_SETUP_BAR_DURATION; p.specialState.bottlesDrunk = 0; p.specialState.bottlesThrown = 0; p.specialState.barTableVisible = true; const opponent = players[1-playerIndex]; if (opponent) p.facingRight = opponent.x > p.x; if (p.facingRight) { p.specialState.barTableX = p.x - MAGAL_BAR_TABLE_WIDTH - 10; p.specialState.barTableTargetX = p.x + p.width / 2 - MAGAL_BAR_TABLE_WIDTH / 2 + 30; } else { p.specialState.barTableX = p.x + p.width + 10; p.specialState.barTableTargetX = p.x + p.width / 2 - MAGAL_BAR_TABLE_WIDTH / 2 - 30; } }
        else if (p.id === 'pedro') { p.performingSpecial = 'pedro_supine'; p.specialAnimTimer = PEDRO_SPECIAL_SUPINE_DURATION; p.specialState.punchesDelivered = 0; }
        else if (p.id === 'bj') { p.performingSpecial = 'bj_dialogue'; p.specialAnimTimer = BJ_SPECIAL_DIALOGUE_DURATION; p.specialState.chinelasThrown = 0; p.specialState.laughFrame = 0; }
        else if (p.id === 'joao') { p.performingSpecial = 'joao_dialogue1'; p.specialAnimTimer = JOAO_SPECIAL_DIALOGUE1_DURATION; p.specialState.transformCycleCount = 0; p.specialState.transformFrame = 0; p.specialState.attackHitCount = 0; }
        return;
    }
    if (!wantsToSpecial) { p.specialKeyAlreadyTriggered = false; }

    // Normal Attacks
    if (!p.isAttacking) {
        let attackAction = null;
        if (wantsToPunch && !p.punchKeyHeldInternal) { attackAction = 'punch'; p.punchKeyHeldInternal = true; }
        else if (!wantsToPunch) { p.punchKeyHeldInternal = false; }
        if (wantsToKick && !p.kickKeyHeldInternal) { attackAction = 'kick'; p.kickKeyHeldInternal = true; }
        else if (!wantsToKick) { p.kickKeyHeldInternal = false; }

        if (attackAction) {
            p.isAttacking = true; p.isDefending = false;
            if (p.isJumping) p.attackType = 'aerial_' + attackAction;
            else if (p.isCrouching) p.attackType = 'crouch_' + attackAction;
            else p.attackType = attackAction;
            p.attackTimer = ATTACK_DURATION; performAttack(p, players[1 - playerIndex]);
        }
    }
}


function updateAI(cpu, target, difficulty, deltaTime) {
    if (cpu.knockdownState !== 'none' || matchOver || cpu.actionCooldown > 0 || cpu.performingSpecial || isPaused || roundOverState) { cpu.velocityX = 0; return; }
    aiActionCooldown -= deltaTime; if (aiActionCooldown > 0) return;
    let baseCooldown = AI_ACTION_COOLDOWN_BASE;
    if (difficulty === 'medium') baseCooldown -= 150; else if (difficulty === 'hard') baseCooldown -= 300;
    aiActionCooldown = Math.max(50, baseCooldown + (Math.random() * 100) - 50);
    const distanceX = target.x - cpu.x; const absDistanceX = Math.abs(distanceX);
    const canAttackRange = PLAYER_WIDTH_SCALED + ATTACK_RANGE_SCALED - 10; cpu.facingRight = distanceX > 0;
    let moveProb = 0.3, attackProb = 0.1, defendProb = 0.05, jumpProb = 0.05, crouchAttackProb = 0.05, specialProb = 0.0;
    if (difficulty === 'medium') { moveProb=0.5; attackProb=0.3; defendProb=0.2; jumpProb=0.1; crouchAttackProb = 0.1; specialProb = 0.1;}
    else if (difficulty === 'hard') { moveProb=0.7; attackProb=0.5; defendProb=0.4; jumpProb=0.15; crouchAttackProb = 0.2; specialProb = 0.25;}
    cpu.isDefending = false; cpu.isCrouching = false;
    if (cpu.specialReady && Math.random() < specialProb && absDistanceX < canAttackRange * 2.5 && !cpu.isAttacking && !cpu.isCrouching && !cpu.isJumping) {
        cpu.specialReady = false; cpu.specialMeter = 0; updateSpecialBars();
        messageArea.textContent = `${cpu.name.toUpperCase()} ESPECIAL!`; setTimeout(() => messageArea.textContent = '', 1500);
        cpu.velocityX = 0; cpu.velocityY = 0; cpu.isAttacking = false; cpu.isCrouching = false; cpu.isJumping = false;
        if (cpu.id === 'vini') { cpu.performingSpecial = 'vini_notification'; cpu.specialAnimTimer = VINI_SPECIAL_NOTIFICATION_DURATION; }
        else if (cpu.id === 'magal') {
            cpu.performingSpecial = 'magal_setup_bar'; cpu.specialAnimTimer = MAGAL_SPECIAL_SETUP_BAR_DURATION;
            cpu.specialState.bottlesDrunk = 0; cpu.specialState.bottlesThrown = 0;
            cpu.specialState.barTableVisible = true;
            if (cpu.facingRight) { cpu.specialState.barTableX = cpu.x - MAGAL_BAR_TABLE_WIDTH - 10; cpu.specialState.barTableTargetX = cpu.x + cpu.width / 2 - MAGAL_BAR_TABLE_WIDTH / 2 + 30; }
            else { cpu.specialState.barTableX = cpu.x + cpu.width + 10; cpu.specialState.barTableTargetX = cpu.x + cpu.width / 2 - MAGAL_BAR_TABLE_WIDTH / 2 - 30;}
        } else if (cpu.id === 'pedro') {
             cpu.performingSpecial = 'pedro_supine'; cpu.specialAnimTimer = PEDRO_SPECIAL_SUPINE_DURATION; cpu.specialState.punchesDelivered = 0;
        } else if (cpu.id === 'bj') {
            cpu.performingSpecial = 'bj_dialogue'; cpu.specialAnimTimer = BJ_SPECIAL_DIALOGUE_DURATION; cpu.specialState.chinelasThrown = 0; cpu.specialState.laughFrame = 0;
        } else if (cpu.id === 'joao') {
            cpu.performingSpecial = 'joao_dialogue1'; cpu.specialAnimTimer = JOAO_SPECIAL_DIALOGUE1_DURATION;
            cpu.specialState.transformCycleCount = 0; cpu.specialState.transformFrame = 0; cpu.specialState.attackHitCount = 0;
        }
        return;
    }
    if (target.isAttacking && absDistanceX < canAttackRange + 30 && Math.random() < defendProb) { cpu.isCrouching = true; cpu.isDefending = true; setTimeout(() => { cpu.isDefending = false; cpu.isCrouching = false; }, 300); return; }
    if (absDistanceX < canAttackRange && Math.random() < attackProb && !cpu.isAttacking) {
        cpu.isAttacking = true;
        if (target.isJumping && Math.random() < 0.3 && difficulty !== 'easy') { cpu.attackType = 'punch'; }
        else if (Math.random() < crouchAttackProb && !cpu.isJumping && difficulty !== 'easy') { cpu.isCrouching = true; cpu.attackType = Math.random() < 0.5 ? 'crouch_punch' : 'crouch_kick';}
        else if (cpu.isJumping) { cpu.attackType = Math.random() < 0.5 ? 'aerial_punch' : 'aerial_kick'; }
        else { cpu.attackType = Math.random() < 0.5 ? 'punch' : 'kick'; }
        cpu.attackTimer = ATTACK_DURATION; performAttack(cpu, target);
        if (cpu.isCrouching && cpu.attackType.startsWith('crouch_')) { setTimeout(() => cpu.isCrouching = false, ATTACK_DURATION); }
        return;
    }
    cpu.velocityX = 0;
    if (Math.random() < moveProb) { if (absDistanceX > canAttackRange * 1.2) { cpu.velocityX = cpu.facingRight ? PLAYER_SPEED_SCALED*0.7 : -PLAYER_SPEED_SCALED*0.7; } else if (absDistanceX < PLAYER_WIDTH_SCALED*0.8 && difficulty !== 'easy') { cpu.velocityX = cpu.facingRight ? -PLAYER_SPEED_SCALED*0.5 : PLAYER_SPEED_SCALED*0.5; } else { if (difficulty !== 'easy' && Math.random() < 0.3) { cpu.velocityX = (Math.random()<0.5?1:-1)*PLAYER_SPEED_SCALED*(Math.random()*0.4+0.2);}}}
    if (Math.random() < jumpProb && !cpu.isJumping && !cpu.isCrouching) { let jd = false; if (difficulty==='hard'&&target.isAttacking&&target.attackType?.startsWith('crouch')&&absDistanceX<canAttackRange){jd=true;}else if(difficulty!=='easy'&&Math.random()<0.3){jd=true;}else if(difficulty==='easy'&&Math.random()<0.1){jd=true;} if(jd){cpu.velocityY=JUMP_FORCE_SCALED;cpu.isJumping=true;}}
}

// ... (O restante do seu código, como updatePlayerState, performAttack, drawPlayer, etc., permanece o mesmo)
// Nenhuma alteração é necessária nas funções abaixo.
function updatePlayerState(player, deltaTime) {
    if (!player || isPaused || roundOverState) return;
    if (player.actionCooldown > 0) { player.actionCooldown -= deltaTime; if (player.actionCooldown < 0) player.actionCooldown = 0;}

    const opponent = players.find(p => p !== player);
    if (player.id === 'vini' && player.performingSpecial) {
        player.specialAnimTimer -= deltaTime;
        switch (player.performingSpecial) {
            case 'vini_notification': if (player.specialAnimTimer <= 0) {player.performingSpecial = 'vini_hearts'; player.specialAnimTimer = VINI_SPECIAL_HEARTS_DURATION;} break;
            case 'vini_hearts': if (player.specialAnimTimer <= 0) {player.performingSpecial = 'vini_message'; player.specialAnimTimer = VINI_SPECIAL_MESSAGE_DURATION;} break;
            case 'vini_message': if (player.specialAnimTimer <= 0) {player.performingSpecial = 'vini_rage'; player.specialAnimTimer = VINI_SPECIAL_RAGE_TRANSFORM_DURATION; startScreenShake(SCREEN_SHAKE_INTENSITY, VINI_SPECIAL_RAGE_TRANSFORM_DURATION);} break;
            case 'vini_rage': if (player.specialAnimTimer <= 0) {player.performingSpecial = 'vini_charge'; player.specialAnimTimer = VINI_SPECIAL_CHARGE_DURATION;} break;
            case 'vini_charge':
                if (opponent) player.facingRight = opponent.x > player.x;
                if (player.specialAnimTimer <= 0) { player.performingSpecial = 'vini_rush'; player.velocityX = player.facingRight ? PLAYER_SPEED_SCALED * 4.5 : -PLAYER_SPEED_SCALED * 4.5; player.specialAnimTimer = VINI_SPECIAL_RUSH_DURATION; startScreenShake(SCREEN_SHAKE_INTENSITY + 8, VINI_SPECIAL_RUSH_DURATION); }
                break;
            case 'vini_rush':
                player.x += player.velocityX;
                if (opponent && Math.abs(player.x + player.width/2 - (opponent.x + opponent.width/2)) < (player.width/2 + opponent.width/2 - 5) && Math.abs(player.y + player.height/2 - (opponent.y + opponent.height/2)) < (player.height/2 + opponent.height/2 - 5) && !opponent.performingSpecial) {
                    if (opponent.knockdownState !== 'special_hit_falling' && opponent.knockdownState !== 'special_hit_grounded') {
                        opponent.health -= PUNCH_DAMAGE * SPECIAL_ATTACK_DAMAGE_MULTIPLIER;
                        opponent.knockdownState = 'special_hit_falling';
                        opponent.velocityY = JUMP_FORCE_SCALED * KNOCKDOWN_JUMP_FORCE_MULTIPLIER * 1.5;
                        opponent.velocityX = player.facingRight ? PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*2.5 : -PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*2.5;
                        opponent.groundedTimer = OPPONENT_SPECIAL_HIT_FALL_DURATION;
                        opponent.opponentSpecialMessageTimer = 4000;
                        startScreenShake(SCREEN_SHAKE_INTENSITY + 10, 500);
                        updateHealthBars();
                        if (opponent.health <= 0) { opponent.health = 0; handleRoundEnd(player); }
                    }
                    player.performingSpecial = null; player.velocityX = 0;
                }
                if (player.specialAnimTimer <= 0 || player.x < -player.width || player.x > canvasWidth) { player.performingSpecial = null; player.velocityX = 0;}
                break;
        }
        return;
    }
    if (player.id === 'magal' && player.performingSpecial) {
         player.specialAnimTimer -= deltaTime;
         switch (player.performingSpecial) {
               case 'magal_setup_bar':
                    if (player.specialState.barTableX < player.specialState.barTableTargetX) { player.specialState.barTableX = Math.min(player.specialState.barTableTargetX, player.specialState.barTableX + MAGAL_BAR_SLIDE_SPEED); }
                    else if (player.specialState.barTableX > player.specialState.barTableTargetX) { player.specialState.barTableX = Math.max(player.specialState.barTableTargetX, player.specialState.barTableX - MAGAL_BAR_SLIDE_SPEED); }
                    if (player.specialAnimTimer <= 0 && player.specialState.barTableX === player.specialState.barTableTargetX) {
                        player.specialState.bottlesThrown = 0;
                        player.performingSpecial = 'magal_drink_throw_cycle';
                        player.specialAnimTimer = MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION;
                        player.specialState.currentCycleFrame = 0;
                        player.specialState.throwDelay = MAGAL_SPECIAL_BOTTLE_THROW_POINT_IN_CYCLE;
                    }
                    break;
               case 'magal_drink_throw_cycle':
                    player.specialState.currentCycleFrame = Math.floor( (MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION - player.specialAnimTimer) / (MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION / 3) ) % 3;

                    if (player.specialState.throwDelay > 0) player.specialState.throwDelay -= deltaTime;

                    if (player.specialState.throwDelay <= 0 && player.specialState.bottlesThrown < 5) {
                        if (opponent) player.facingRight = opponent.x > player.x;
                        projectiles.push({ x: player.facingRight ? player.x + player.width : player.x - MAGAL_SPECIAL_BOTTLE_WIDTH, y: player.y + player.height / 3, width: MAGAL_SPECIAL_BOTTLE_WIDTH, height: MAGAL_SPECIAL_BOTTLE_HEIGHT, velocityX: player.facingRight ? MAGAL_SPECIAL_BOTTLE_SPEED : -MAGAL_SPECIAL_BOTTLE_SPEED, ownerId: player.id, type: 'magal_bottle', isActive: true, color: 'SaddleBrown'});
                        player.specialState.bottlesThrown++;
                        player.specialState.throwDelay = MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION + MAGAL_SPECIAL_BOTTLE_THROW_POINT_IN_CYCLE;
                    }

                    if (player.specialAnimTimer <= 0) {
                        if (player.specialState.bottlesThrown < 5) {
                            player.performingSpecial = 'magal_drink_throw_cycle';
                            player.specialAnimTimer = MAGAL_SPECIAL_DRINK_THROW_CYCLE_DURATION;
                            player.specialState.currentCycleFrame = 0;
                        } else {
                            player.performingSpecial = 'magal_disco_dance';
                            player.specialAnimTimer = MAGAL_SPECIAL_DISCO_DURATION;
                        }
                    }
                    break;
               case 'magal_disco_dance': if (player.specialAnimTimer <= 0) { player.performingSpecial = 'magal_final_message'; player.specialAnimTimer = MAGAL_SPECIAL_FINAL_MESSAGE_DURATION; } break;
               case 'magal_final_message': if (player.specialAnimTimer <= 0) { player.performingSpecial = null; player.specialState.barTableVisible = false; } break;
         }
        return;
    }
    if (player.id === 'pedro' && player.performingSpecial) {
        player.specialAnimTimer -= deltaTime;
        switch(player.performingSpecial) {
            case 'pedro_supine':
                if (player.specialAnimTimer <= 0) { player.performingSpecial = 'pedro_power_up'; player.specialAnimTimer = PEDRO_SPECIAL_POWER_UP_DURATION; }
                break;
            case 'pedro_power_up':
                if (opponent) player.facingRight = opponent.x > player.x;
                if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'pedro_rush_attack';
                    player.velocityX = player.facingRight ? PLAYER_SPEED_SCALED * PEDRO_SPECIAL_RUSH_ATTACK_SPEED_MULTIPLIER : -PLAYER_SPEED_SCALED * PEDRO_SPECIAL_RUSH_ATTACK_SPEED_MULTIPLIER;
                    player.specialAnimTimer = VINI_SPECIAL_RUSH_DURATION;
                    startScreenShake(SCREEN_SHAKE_INTENSITY + 4, VINI_SPECIAL_RUSH_DURATION);
                }
                break;
            case 'pedro_rush_attack':
                player.x += player.velocityX;
                if (opponent && Math.abs(player.x + player.width/2 - (opponent.x + opponent.width/2)) < (player.width/2 + opponent.width/2 - 5) && Math.abs(player.y + player.height/2 - (opponent.y + opponent.height/2)) < (player.height/2 + opponent.height/2 - 5) && !opponent.performingSpecial) {
                    player.performingSpecial = 'pedro_punch_combo';
                    player.specialState.punchesDelivered = 0;
                    player.specialState.currentCycleFrame = 0;
                    player.specialAnimTimer = PEDRO_SPECIAL_PUNCH_INTERVAL;
                    player.velocityX = 0;
                }
                if (player.specialAnimTimer <= 0 || player.x < -player.width || player.x > canvasWidth) { player.performingSpecial = null; player.velocityX = 0;}
                break;
            case 'pedro_punch_combo':
                if (player.specialAnimTimer <= 0) {
                    if (player.specialState.punchesDelivered < PEDRO_SPECIAL_PUNCH_COUNT && opponent && !opponent.performingSpecial && opponent.knockdownState === 'none') {
                        opponent.health -= PUNCH_DAMAGE * 1.2;
                        startScreenShake(SCREEN_SHAKE_INTENSITY, 150);
                        player.specialState.punchesDelivered++;
                        player.specialState.currentCycleFrame = (player.specialState.currentCycleFrame + 1) % 2;

                        if (player.specialState.punchesDelivered >= PEDRO_SPECIAL_PUNCH_COUNT) {
                            opponent.knockdownState = 'special_hit_falling';
                            opponent.velocityY = JUMP_FORCE_SCALED * KNOCKDOWN_JUMP_FORCE_MULTIPLIER * PEDRO_SPECIAL_FINAL_PUNCH_LAUNCH_MULTIPLIER;
                            opponent.velocityX = player.facingRight ? PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*1.5 : -PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*1.5;
                            opponent.groundedTimer = OPPONENT_SPECIAL_HIT_FALL_DURATION;
                            startScreenShake(SCREEN_SHAKE_INTENSITY + 6, 500);
                            player.performingSpecial = null;
                        } else {
                            player.specialAnimTimer = PEDRO_SPECIAL_PUNCH_INTERVAL;
                        }
                        updateHealthBars();
                        if (opponent.health <= 0) { opponent.health = 0; handleRoundEnd(player); player.performingSpecial = null; }
                    } else {
                        player.performingSpecial = null;
                    }
                }
                break;
        }
        return;
    }
    if (player.id === 'bj' && player.performingSpecial) {
        player.specialAnimTimer -= deltaTime;
        switch(player.performingSpecial) {
            case 'bj_dialogue':
                if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'bj_laughing';
                    player.specialAnimTimer = BJ_SPECIAL_LAUGH_DURATION;
                    player.specialState.laughFrame = 0;
                }
                break;
            case 'bj_laughing':
                player.specialState.laughFrame = Math.floor((BJ_SPECIAL_LAUGH_DURATION - player.specialAnimTimer) / BJ_SPECIAL_LAUGH_FRAME_DURATION) % 3;
                if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'bj_teleport_throw_aim';
                    player.specialState.chinelasThrown = 0;
                    player.specialState.teleportTimer = 0;
                }
                break;
            case 'bj_teleport_throw_aim':
                player.specialState.teleportTimer -= deltaTime;
                if (player.specialState.teleportTimer <= 0 && player.specialState.chinelasThrown < BJ_SPECIAL_CHINELA_COUNT) {
                    player.x = Math.random() * (canvasWidth - player.width);
                    player.y = Math.random() * (canvasHeight * 0.6);
                    if (opponent) player.facingRight = opponent.x > player.x;

                    player.performingSpecial = 'bj_teleport_throw_fire';
                    player.specialAnimTimer = BJ_SPECIAL_THROW_ANIM_DURATION;
                    player.specialState.throwFrame = 0;
                } else if (player.specialState.chinelasThrown >= BJ_SPECIAL_CHINELA_COUNT) {
                    player.performingSpecial = null;
                }
                break;
            case 'bj_teleport_throw_fire':
                 player.specialState.throwFrame = Math.floor((BJ_SPECIAL_THROW_ANIM_DURATION - player.specialAnimTimer) / (BJ_SPECIAL_THROW_ANIM_DURATION / 2)) % 2;
                if (player.specialAnimTimer <= BJ_SPECIAL_THROW_ANIM_DURATION / 2 && !player.specialState.projectileLaunchedThisFrame) {
                    projectiles.push({
                        x: player.facingRight ? player.x + player.width : player.x - BJ_CHINELA_WIDTH,
                        y: player.y + player.height / 2.5,
                        width: BJ_CHINELA_WIDTH * (canvasWidth/BASE_CANVAS_WIDTH), height: BJ_CHINELA_HEIGHT* (canvasHeight/BASE_CANVAS_HEIGHT),
                        velocityX: player.facingRight ? BJ_CHINELA_SPEED : -BJ_CHINELA_SPEED,
                        ownerId: player.id, type: 'bj_chinela', isActive: true, color: '#aa4400',
                        animFrame: 0, animTimer: 0
                    });
                    player.specialState.chinelasThrown++;
                    player.specialState.projectileLaunchedThisFrame = true;
                }

                if (player.specialAnimTimer <= 0) {
                    player.specialState.projectileLaunchedThisFrame = false;
                    player.performingSpecial = 'bj_teleport_throw_aim';
                    player.specialState.teleportTimer = BJ_SPECIAL_TELEPORT_DELAY;
                }
                break;
        }
        return;
    }
    if (player.id === 'joao' && player.performingSpecial) {
        player.specialAnimTimer -= deltaTime;
        switch(player.performingSpecial) {
            case 'joao_dialogue1':
                if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'joao_transforming';
                    player.specialState.transformCycleCount = 0;
                    player.specialState.transformFrame = 0;
                    player.specialAnimTimer = JOAO_SPECIAL_TRANSFORM_DURATION_PER_CYCLE;
                }
                break;
            case 'joao_transforming':
                player.specialState.transformFrame = Math.floor((JOAO_SPECIAL_TRANSFORM_DURATION_PER_CYCLE - player.specialAnimTimer) / (JOAO_SPECIAL_TRANSFORM_DURATION_PER_CYCLE / 2)) % 2;
                if (player.specialAnimTimer <= 0) {
                    player.specialState.transformCycleCount++;
                    if (player.specialState.transformCycleCount < JOAO_SPECIAL_TRANSFORM_CYCLES) {
                        player.specialAnimTimer = JOAO_SPECIAL_TRANSFORM_DURATION_PER_CYCLE;
                    } else {
                        player.performingSpecial = 'joao_post_transform_idle';
                        player.specialAnimTimer = 500; // Brief pause before dialogue
                    }
                }
                break;
            case 'joao_post_transform_idle':
                 if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'joao_dialogue2_display';
                    player.specialAnimTimer = JOAO_SPECIAL_DIALOGUE2_DURATION;
                 }
                break;
            case 'joao_dialogue2_display':
                if (player.specialAnimTimer <= 0) {
                    player.performingSpecial = 'joao_rush_to_opponent';
                    if (opponent) player.facingRight = opponent.x > player.x;
                    player.velocityX = player.facingRight ? PLAYER_SPEED_SCALED * JOAO_SPECIAL_RUSH_SPEED_MULTIPLIER : -PLAYER_SPEED_SCALED * JOAO_SPECIAL_RUSH_SPEED_MULTIPLIER;
                    player.specialAnimTimer = JOAO_SPECIAL_RUSH_TIMEOUT; // Add a timeout for the rush
                }
                break;
            case 'joao_rush_to_opponent':
                player.x += player.velocityX;

                if (opponent && Math.abs(player.x + player.width/2 - (opponent.x + opponent.width/2)) < (player.width/2 + opponent.width/2 - 5) && !opponent.performingSpecial) {
                    player.velocityX = 0;
                    player.performingSpecial = 'joao_attacking_combo';
                    player.specialState.attackHitCount = 0;
                    player.specialState.attackFrame = 0;
                    player.specialState.hitDeliveredThisFrame = false;
                    player.specialAnimTimer = JOAO_SPECIAL_ATTACK_INTERVAL;
                }

                if (player.specialAnimTimer <= 0 || player.x < -player.width || player.x > canvasWidth) {
                    player.performingSpecial = null;
                    player.velocityX = 0;
                }
                break;
            case 'joao_attacking_combo':
                player.specialState.attackFrame = Math.floor((JOAO_SPECIAL_ATTACK_INTERVAL - player.specialAnimTimer) / (JOAO_SPECIAL_ATTACK_INTERVAL / 2)) % 2;

                if (player.specialAnimTimer <= JOAO_SPECIAL_ATTACK_INTERVAL / 2 && !player.specialState.hitDeliveredThisFrame) {
                    if (opponent && !opponent.performingSpecial && opponent.knockdownState === 'none') {
                        let attackHitbox = { x: player.facingRight ? player.x + player.width - ATTACK_RANGE_SCALED : player.x, y: player.y, width: ATTACK_RANGE_SCALED, height: player.height };
                        if (attackHitbox.x < opponent.x + opponent.width && attackHitbox.x + attackHitbox.width > opponent.x &&
                            attackHitbox.y < opponent.y + opponent.height && attackHitbox.y + attackHitbox.height > opponent.y) {
                                opponent.health -= JOAO_SPECIAL_ATTACK_DAMAGE;
                                startScreenShake(SCREEN_SHAKE_INTENSITY - 2, 100);
                                updateHealthBars();
                                if (opponent.health <= 0) { opponent.health = 0; handleRoundEnd(player); player.performingSpecial = null; return;}
                        }
                    }
                    player.specialState.hitDeliveredThisFrame = true;
                }

                if (player.specialAnimTimer <= 0) {
                    player.specialState.attackHitCount++;
                    player.specialState.hitDeliveredThisFrame = false;
                    if (player.specialState.attackHitCount < JOAO_SPECIAL_ATTACK_HITS) {
                        player.specialAnimTimer = JOAO_SPECIAL_ATTACK_INTERVAL;
                    } else {
                        player.performingSpecial = null;
                    }
                }
                break;
        }
        return;
    }


    if (player.knockdownState === 'special_hit_falling') {
         player.velocityY += GRAVITY * 0.3; player.y += player.velocityY; player.x += player.velocityX;
         if (player.x <= 0 || player.x + player.width >= canvasWidth) { player.velocityX *= -0.7; player.x = Math.max(0, Math.min(player.x, canvasWidth - player.width)); startScreenShake(SCREEN_SHAKE_INTENSITY + 5, 300); }
         if (player.y + player.height >= canvasHeight) { player.y = canvasHeight - player.height; player.velocityY = 0; player.velocityX = 0; player.knockdownState = 'special_hit_grounded'; }
         return;
    } else if (player.knockdownState === 'special_hit_grounded') {
         player.opponentSpecialMessageTimer -= deltaTime;
         if(player.opponentSpecialMessageTimer <= 0) { player.knockdownState = 'none'; }
         return;
    }
    if (player.knockdownState === 'falling') { player.velocityY += GRAVITY; player.y += player.velocityY; player.x += player.velocityX; if (player.y + player.height >= canvasHeight) { player.y = canvasHeight - player.height; player.velocityY = 0; player.velocityX = 0; player.knockdownState = 'grounded'; player.groundedTimer = GROUNDED_DURATION; startScreenShake(SCREEN_SHAKE_INTENSITY, SCREEN_SHAKE_DURATION_MS);}}
    else if (player.knockdownState === 'grounded') { player.groundedTimer -= deltaTime; if (player.groundedTimer <= 0) player.knockdownState = 'none';}
    else {
        if (player.isAttacking) { player.attackTimer -= deltaTime; if (player.attackTimer <= 0) { player.isAttacking = false; player.attackType = null; }}
        if (!(player.isCrouching && !player.isJumping) || player.isAttacking) {
             player.x += player.velocityX;
        } else {
             player.velocityX = 0;
        }
        player.velocityY += GRAVITY;
        player.y += player.velocityY;
        if (player.y + player.height > canvasHeight) { player.y = canvasHeight - player.height; player.velocityY = 0; if(player.isJumping) player.isJumping = false; }
    }
    if (player.x < 0) { player.x = 0; if (player.knockdownState === 'falling') player.velocityX = 0; }
    if (player.x + player.width > canvasWidth) { player.x = canvasWidth - player.width; if (player.knockdownState === 'falling') player.velocityX = 0; }
}

function checkCombo(attacker) { let longestMatch = null; for (const combo of combos) { if (attacker.comboSequence.length >= combo.sequence.length) { const sequenceToCheck = attacker.comboSequence.slice(-combo.sequence.length); if (sequenceToCheck.every((val, index) => val === combo.sequence[index])) { longestMatch = combo; }}} return longestMatch;}

function performAttack(attacker, target) {
    if (!attacker || !target || !attacker.isAttacking || matchOver ||
        (target.knockdownState !== 'none' && target.knockdownState !== 'special_hit_falling' && target.knockdownState !== 'special_hit_grounded') ||
        attacker.actionCooldown > 0 || attacker.performingSpecial || target.performingSpecial) return;

    let hit = false; let attackHitboxYOffset = attacker.height / 4; let attackHitboxHeight = attacker.height / 2;
    if (attacker.attackType.startsWith('crouch_')) { attackHitboxYOffset = attacker.height * 0.6; attackHitboxHeight = attacker.height * 0.4; }
    else if (attacker.attackType.startsWith('aerial_')) { attackHitboxYOffset = attacker.height / 3; }
    const attackHitbox = { x: attacker.facingRight ? attacker.x + attacker.width : attacker.x - ATTACK_RANGE_SCALED, y: attacker.y + attackHitboxYOffset, width: ATTACK_RANGE_SCALED, height: attackHitboxHeight };
    if (attackHitbox.x < target.x + target.width && attackHitbox.x + attackHitbox.width > target.x && attackHitbox.y < target.y + target.height && attackHitbox.y + attackHitbox.height > target.y) {
        if (target.isDefending && !attacker.attackType.includes('special')) { attacker.comboSequence = []; attacker.lastAttackConnectTime = 0; return; }
        hit = true;
        if (target.specialMeter < SPECIAL_METER_MAX) { target.specialMeter++; if (target.specialMeter >= SPECIAL_METER_MAX) { target.specialReady = true; messageArea.textContent = `${target.name.toUpperCase()} ESPECIAL PRONTO!`; setTimeout(() => messageArea.textContent = '', 1500); } updateSpecialBars(); }
        if (!attacker.attackType.startsWith('crouch_')) target.consecutiveCrouchHitsTaken = 0;
        const currentTime = Date.now();
        if (attacker.comboSequence.length > 0 && (currentTime - attacker.lastAttackConnectTime > COMBO_WINDOW_MS)) { attacker.comboSequence = []; }
        let comboRelevantAttackType = attacker.attackType; if(attacker.attackType.includes('_')) comboRelevantAttackType = attacker.attackType.split('_')[1];
        attacker.comboSequence.push(comboRelevantAttackType); attacker.lastAttackConnectTime = currentTime;
        const performedCombo = checkCombo(attacker);
        if (performedCombo) { messageArea.textContent = `${attacker.name.toUpperCase()}: ${performedCombo.name}!`; setTimeout(() => messageArea.textContent = '', 1500); attacker.actionCooldown = POST_COMBO_COOLDOWN_MS; attacker.comboSequence = []; }
        let damage = (attacker.attackType.includes('punch')) ? PUNCH_DAMAGE : KICK_DAMAGE; target.health -= damage;
        if (attacker.attackType.startsWith('aerial_')) { target.velocityX = attacker.facingRight ? AERIAL_ATTACK_PUSHBACK_FORCE : -AERIAL_ATTACK_PUSHBACK_FORCE; setTimeout(() => { if(Math.abs(target.velocityX) === AERIAL_ATTACK_PUSHBACK_FORCE) target.velocityX = 0; }, 300); target.hitCounter = 0; target.consecutiveCrouchHitsTaken = 0;}
        else if (attacker.attackType.startsWith('crouch_')) { target.consecutiveCrouchHitsTaken++; target.hitCounter = 0; if (target.consecutiveCrouchHitsTaken >= CROUCH_KNOCKDOWN_THRESHOLD) { target.knockdownState = 'falling'; target.velocityY = JUMP_FORCE_SCALED*KNOCKDOWN_JUMP_FORCE_MULTIPLIER*0.8; target.velocityX = attacker.facingRight ? PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*0.5 : -PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER*0.5; target.consecutiveCrouchHitsTaken = 0; target.isAttacking=false; target.isDefending=false; target.isJumping=true;}}
        else { target.hitCounter++; if (target.hitCounter >= KNOCKDOWN_HIT_THRESHOLD && target.knockdownState === 'none') { target.knockdownState = 'falling'; target.velocityY = JUMP_FORCE_SCALED*KNOCKDOWN_JUMP_FORCE_MULTIPLIER; target.velocityX = attacker.facingRight ? PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER : -PLAYER_SPEED_SCALED*KNOCKDOWN_PUSHBACK_SPEED_MULTIPLIER; target.hitCounter=0; target.isAttacking=false; target.isDefending=false; target.isJumping=true;}}
        updateHealthBars();
        if (target.health <= 0) { target.health = 0; handleRoundEnd(attacker); }
    } else { attacker.comboSequence = []; attacker.lastAttackConnectTime = 0; }
}

function drawTextBox(x, y, text, maxWidth, lineHeight, backgroundColor = 'rgba(0, 0, 0, 0.7)', textColor = 'white', borderColor = 'white', fontSize = 10) {
    ctx.font = `${fontSize * (canvasWidth/BASE_CANVAS_WIDTH)}px 'Courier New', Courier, monospace`;
    const scaledLineHeight = lineHeight * (canvasHeight/BASE_CANVAS_HEIGHT);
    const words = text.split(' '); let line = ''; const lines = [];
    for (let n = 0; n < words.length; n++) { const testLine = line + words[n] + ' '; const metrics = ctx.measureText(testLine); const testWidth = metrics.width; if (testWidth > maxWidth * (canvasWidth/BASE_CANVAS_WIDTH) && n > 0) { lines.push(line); line = words[n] + ' '; } else { line = testLine; }}
    lines.push(line);
    const boxPadding = 5 * (canvasWidth/BASE_CANVAS_WIDTH);
    const boxHeight = lines.length * scaledLineHeight + boxPadding * 2;
    const textBlockWidth = Math.min(maxWidth * (canvasWidth/BASE_CANVAS_WIDTH), ctx.measureText(lines.reduce((a,b) => a.length > b.length ? a : b, '')).width);
    const boxWidth = textBlockWidth + boxPadding * 2;

    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight - (10 * (canvasHeight/BASE_CANVAS_HEIGHT));
    ctx.fillStyle = backgroundColor; ctx.strokeStyle = borderColor; ctx.lineWidth = 1 * (canvasWidth/BASE_CANVAS_WIDTH);
    ctx.beginPath(); ctx.rect(boxX, boxY, boxWidth, boxHeight); ctx.fill(); ctx.stroke();
    ctx.fillStyle = textColor; ctx.textAlign = 'center';
    for (let i = 0; i < lines.length; i++) { ctx.fillText(lines[i].trim(), x, boxY + boxPadding + (i * scaledLineHeight) + scaledLineHeight/2 + (2 * (canvasHeight/BASE_CANVAS_HEIGHT))); }
    ctx.textAlign = 'left';
}

function drawProjectiles() {
    projectiles.forEach(proj => {
        if (proj.isActive) {
            ctx.fillStyle = proj.color || 'SaddleBrown';
            ctx.fillRect(proj.x, proj.y, proj.width, proj.height);
        }
    });
}

function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        if (!proj.isActive) continue;
        proj.x += proj.velocityX;

        const opponent = players.find(p => p && p.id !== proj.ownerId);
        if (opponent && !opponent.performingSpecial && opponent.knockdownState === 'none') {
             if (proj.x < opponent.x + opponent.width && proj.x + proj.width > opponent.x && proj.y < opponent.y + opponent.height && proj.y + proj.height > opponent.y) {
                let damageDealt = 0;
                let hitBySpecialProjectile = false;

                if (proj.type === 'magal_bottle') {
                    damageDealt = MAGAL_SPECIAL_BOTTLE_DAMAGE;
                    hitBySpecialProjectile = true;
                } else if (proj.type === 'bj_chinela') {
                    damageDealt = BJ_CHINELA_DAMAGE;
                    hitBySpecialProjectile = true;
                }

                if (hitBySpecialProjectile) {
                     if (proj.type === 'bj_chinela' || !opponent.isDefending) {
                        opponent.health -= damageDealt;
                        opponent.hitCounter++;
                        if (opponent.health <= 0) { opponent.health = 0; handleRoundEnd(players.find(p=>p && p.id === proj.ownerId)); }
                        updateHealthBars();
                        proj.isActive = false;
                     } else if (opponent.isDefending && proj.type !== 'bj_chinela') {
                        proj.isActive = false;
                     }
                }
             }
        }
        if (proj.x > canvasWidth || proj.x < -proj.width) { proj.isActive = false; }
    }
    projectiles = projectiles.filter(proj => proj.isActive);
}

function drawPlayer(player) {
    if (!player || !player.sprites) return;

    let playerDrawHeight = player.height;
    let playerDrawY = player.y;
    let currentFillStyle = player.color;

    if (player.isCrouching && !player.isJumping && !player.performingSpecial) {
        playerDrawHeight = player.height * 0.7;
        playerDrawY = player.y + player.height * 0.3;
    }

    let currentSpriteKeyToUse = player.sprites.idle;

    if (player.knockdownState === 'falling' || player.knockdownState === 'special_hit_falling') {
        currentSpriteKeyToUse = player.sprites.kd_fall || player.sprites.hit || player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.knockdownState === 'grounded' || player.knockdownState === 'special_hit_grounded') {
        currentSpriteKeyToUse = player.sprites.kd_ground || player.sprites.hit || player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.performingSpecial) {
        if (player.id === 'vini') {
            switch (player.performingSpecial) {
                case 'vini_notification': case 'vini_hearts': case 'vini_message': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'vini_rage': case 'vini_charge': case 'vini_rush': currentSpriteKeyToUse = player.sprites.special_anim || player.sprites.idle; break;
                default: currentSpriteKeyToUse = player.sprites.idle; break;
            }
        }
        else if (player.id === 'magal') {
            switch (player.performingSpecial) {
                case 'magal_setup_bar': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'magal_drink_throw_cycle':
                    if (player.specialState.currentCycleFrame === 0) currentSpriteKeyToUse = player.sprites.special_drink_throw1;
                    else if (player.specialState.currentCycleFrame === 1) currentSpriteKeyToUse = player.sprites.special_drink_throw2;
                    else currentSpriteKeyToUse = player.sprites.special_drink_throw3;
                    break;
                case 'magal_disco_dance': currentSpriteKeyToUse = player.sprites.special_disco || player.sprites.idle; break;
                case 'magal_final_message': currentSpriteKeyToUse = player.sprites.idle; break;
                default: currentSpriteKeyToUse = player.sprites.idle; break;
            }
        }
        else if (player.id === 'pedro') {
            switch (player.performingSpecial) {
                case 'pedro_supine': currentSpriteKeyToUse = player.sprites.special_supine || player.sprites.idle; break;
                case 'pedro_power_up': currentSpriteKeyToUse = player.sprites.special_power_up || player.sprites.idle; break;
                case 'pedro_rush_attack': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'pedro_punch_combo':
                    currentSpriteKeyToUse = player.specialState.currentCycleFrame === 0 ? player.sprites.special_attack1 : player.sprites.special_attack2;
                    break;
                default: currentSpriteKeyToUse = player.sprites.idle; break;
            }
        }
        else if (player.id === 'bj') {
            switch (player.performingSpecial) {
                case 'bj_dialogue': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'bj_laughing':
                    if (player.specialState.laughFrame === 0) currentSpriteKeyToUse = player.sprites.special_laugh1;
                    else if (player.specialState.laughFrame === 1) currentSpriteKeyToUse = player.sprites.special_laugh2;
                    else currentSpriteKeyToUse = player.sprites.special_laugh3;
                    break;
                case 'bj_teleport_throw_aim': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'bj_teleport_throw_fire':
                    currentSpriteKeyToUse = player.specialState.throwFrame === 0 ? player.sprites.special_throw1 : player.sprites.special_throw2;
                    break;
                default: currentSpriteKeyToUse = player.sprites.idle;
            }
        }
        else if (player.id === 'joao') {
               switch (player.performingSpecial) {
                case 'joao_dialogue1': currentSpriteKeyToUse = player.sprites.idle; break;
                case 'joao_transforming':
                    currentSpriteKeyToUse = player.specialState.transformFrame === 0 ? player.sprites.special_transform1 : player.sprites.special_transform2;
                    break;
                case 'joao_post_transform_idle': case 'joao_dialogue2_display': case 'joao_rush_to_opponent': // Show powered-up idle during rush
                    currentSpriteKeyToUse = player.sprites.special_post_transform_idle || player.sprites.idle;
                    break;
                case 'joao_attacking_combo':
                    currentSpriteKeyToUse = player.specialState.attackFrame === 0 ? player.sprites.special_attack1 : player.sprites.special_attack2;
                    break;
                default: currentSpriteKeyToUse = player.sprites.idle;
               }
        }
        else { currentSpriteKeyToUse = player.sprites.special_anim || player.sprites.idle; }
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.isAttacking) {
        if (player.attackType === 'punch') currentSpriteKeyToUse = player.sprites.punch_st;
        else if (player.attackType === 'kick') currentSpriteKeyToUse = player.sprites.kick_st;
        else if (player.attackType === 'crouch_punch') currentSpriteKeyToUse = player.sprites.punch_cr;
        else if (player.attackType === 'crouch_kick') currentSpriteKeyToUse = player.sprites.kick_cr;
        else if (player.attackType === 'aerial_punch') currentSpriteKeyToUse = player.sprites.punch_air;
        else if (player.attackType === 'aerial_kick') currentSpriteKeyToUse = player.sprites.kick_air;

        if (!playerSprites[currentSpriteKeyToUse]) currentSpriteKeyToUse = player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.isDefending) {
        currentSpriteKeyToUse = player.sprites.defend || player.sprites.crouch || player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.isCrouching && !player.isJumping) {
        currentSpriteKeyToUse = player.sprites.crouch || player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.isJumping) {
        currentSpriteKeyToUse = player.sprites.jump || player.sprites.idle;
        player.walkFrame = 0; player.walkFrameTimer = 0;
    } else if (player.velocityX !== 0) {
        player.walkFrameTimer++;
        if (player.walkFrameTimer >= WALK_ANIM_FRAME_DURATION) {
            player.walkFrame = (player.walkFrame + 1) % 3;
            player.walkFrameTimer = 0;
        }
        if (player.walkFrame === 0) currentSpriteKeyToUse = player.sprites.walk1;
        else if (player.walkFrame === 1) currentSpriteKeyToUse = player.sprites.walk2;
        else currentSpriteKeyToUse = player.sprites.walk3;

        if (!playerSprites[currentSpriteKeyToUse]) currentSpriteKeyToUse = player.sprites.idle;
    } else {
        currentSpriteKeyToUse = player.sprites.idle;
        player.walkFrame = 0;
        player.walkFrameTimer = 0;
    }

    if (!currentSpriteKeyToUse || !playerSprites[currentSpriteKeyToUse]) {
         currentSpriteKeyToUse = player.sprites.idle;
         if (!playerSprites[currentSpriteKeyToUse]) {
             console.error(`CRÍTICO: Sprite IDLE ${currentSpriteKeyToUse} para o jogador ${player.id} não foi carregado!`);
         }
    }

    const spriteToDraw = playerSprites[currentSpriteKeyToUse];

    if (spriteToDraw && spriteToDraw.complete && spriteToDraw.naturalHeight !== 0) {
        ctx.save();
        if (!player.facingRight) {
            ctx.translate(player.x + player.width, playerDrawY);
            ctx.scale(-1, 1);
            ctx.drawImage(spriteToDraw, 0, 0, player.width, playerDrawHeight);
        } else {
            ctx.drawImage(spriteToDraw, player.x, playerDrawY, player.width, playerDrawHeight);
        }
        ctx.restore();
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, playerDrawY, player.width, playerDrawHeight);
    }

    // Lógica de DESENHO ADICIONAL para especiais
    if (player.id === 'vini' && player.performingSpecial) {
        switch (player.performingSpecial) {
            case 'vini_notification': ctx.fillStyle = 'yellow'; ctx.fillRect(player.x + player.width / 2 - 5, player.y - 20, 10, 10); break;
            case 'vini_hearts': ctx.fillStyle = 'pink'; for(let i=0; i<3; i++) { ctx.beginPath(); ctx.moveTo(player.x + player.width/2 + (i*15-15) , player.y - 20 - (i%2 * 5)); ctx.bezierCurveTo(player.x + player.width/2 + (i*15-15) +5, player.y - 30 - (i%2 * 5), player.x + player.width/2 + (i*15-15) +10, player.y -15 - (i%2 * 5), player.x + player.width/2 + (i*15-15), player.y -10- (i%2 * 5) ); ctx.bezierCurveTo(player.x + player.width/2 + (i*15-15) -10, player.y -15- (i%2 * 5), player.x + player.width/2 + (i*15-15) -5, player.y -30- (i%2 * 5), player.x + player.width/2 + (i*15-15), player.y -20- (i%2 * 5)); ctx.fill(); } break;
            case 'vini_message': drawTextBox(player.x + player.width/2, player.y, "namorada: a gente tem que terminar, eu gosto de outro", 120, 12); break;
            case 'vini_rage': case 'vini_charge': case 'vini_rush':
                ctx.fillStyle = '#ddcc00';
                const hornWidth = 10 * (canvasWidth/BASE_CANVAS_WIDTH); const hornHeight = 20 * (canvasHeight/BASE_CANVAS_HEIGHT);
                const headX = player.x + player.width/2;
                const headY = playerDrawY - (3 * (canvasHeight/BASE_CANVAS_HEIGHT));
                ctx.beginPath(); ctx.moveTo(headX - player.width/4, headY); ctx.lineTo(headX - player.width/4 - hornWidth/2, headY - hornHeight); ctx.lineTo(headX - player.width/4 + hornWidth/2, headY - hornHeight); ctx.closePath(); ctx.fill();
                ctx.beginPath(); ctx.moveTo(headX + player.width/4, headY); ctx.lineTo(headX + player.width/4 - hornWidth/2, headY - hornHeight); ctx.lineTo(headX + player.width/4 + hornWidth/2, headY - hornHeight); ctx.closePath(); ctx.fill();
                if(player.performingSpecial === 'vini_rage') startScreenShake(SCREEN_SHAKE_INTENSITY + 2, 100);
                break;
        }
    }
    if (player.id === 'magal' && player.performingSpecial) {
        if (player.specialState.barTableVisible) {
            ctx.fillStyle = '#543414';
            ctx.fillRect(player.specialState.barTableX, player.specialState.barTableY, MAGAL_BAR_TABLE_WIDTH * (canvasWidth/BASE_CANVAS_WIDTH), MAGAL_BAR_TABLE_HEIGHT* (canvasHeight/BASE_CANVAS_HEIGHT));
            ctx.fillStyle = '#888888';
            ctx.fillRect(player.specialState.barTableX + MAGAL_BAR_TABLE_WIDTH/2 * (canvasWidth/BASE_CANVAS_WIDTH) - 10 * (canvasWidth/BASE_CANVAS_WIDTH), player.specialState.barTableY - 20 * (canvasHeight/BASE_CANVAS_HEIGHT), 20 * (canvasWidth/BASE_CANVAS_WIDTH), 20* (canvasHeight/BASE_CANVAS_HEIGHT));
        }
        switch (player.performingSpecial) {
            case 'magal_disco_dance':
                const danceColorIndex = Math.floor(Date.now() / 150) % 4;
                const danceColors = [player.color, 'lime', 'fuchsia', 'aqua'];
                break;
            case 'magal_final_message': drawTextBox(player.x + player.width/2, player.y, "nunca mais eu vou beber, EU JURO!", 180, 12); break;
        }
    }
     if (player.id === 'bj' && player.performingSpecial === 'bj_dialogue') {
         drawTextBox(player.x + player.width/2, player.y, "Hora de demonstrar os meus poderes!", 200, 14, 'rgba(50,20,0,0.8)', '#FFD700');
    }
    if (player.id === 'joao' && player.performingSpecial) {
        if (player.performingSpecial === 'joao_dialogue1') {
            drawTextBox(player.x + player.width/2, player.y, "Cansei de ser gordo, agora vou ficar fortão!", 220, 14);
        } else if (player.performingSpecial === 'joao_dialogue2_display' || (player.performingSpecial === 'joao_post_transform_idle' && player.specialAnimTimer > 0) ) {
             drawTextBox(player.x + player.width/2, player.y, "Quero ver quem aguenta agora porraaaa!", 250, 14, 'rgba(100,0,0,0.8)', '#FF8C00');
        }
    }


    if (player.knockdownState === 'special_hit_grounded' && player.opponentSpecialMessageTimer > 0) { drawTextBox(player.x + player.width/2, player.y, "se acalma disgraça, quem mandou ser corno", 180, 12, 'rgba(50,50,50,0.8)', '#ffdddd');}
}

function gameLoop(timestamp) {
    if (currentScreen !== 'game' || matchOver) {
        return;
    }
    if (isPaused) { requestAnimationFrame(gameLoop); return; }

    const deltaTime = (timestamp - lastTime) || 16.66; lastTime = timestamp;

    if (roundOverState) {
        roundOverTimer -= deltaTime;
        if (roundOverTimer <= 0) {
            currentRound++;
            if (currentRound > MAX_ROUNDS || player1RoundWins >= Math.ceil(MAX_ROUNDS/2) || player2RoundWins >= Math.ceil(MAX_ROUNDS/2) ) {
                // Match is over, do nothing to let the final message display
            } else {
                startNewRound();
            }
        }
    } else {
        players.forEach(p => { if (p && p.actionCooldown > 0) { p.actionCooldown -= deltaTime; if (p.actionCooldown < 0) p.actionCooldown = 0;}});
        let dx = 0, dy = 0;
        if (screenShakeActive) { currentScreenShakeDuration -= deltaTime; if (currentScreenShakeDuration <= 0) screenShakeActive = false; else { dx = (Math.random()-0.5)*2*currentScreenShakeIntensity; dy = (Math.random()-0.5)*2*currentScreenShakeIntensity; }}
        ctx.save(); ctx.translate(dx, dy);
        ctx.clearRect(-currentScreenShakeIntensity, -currentScreenShakeIntensity, canvasWidth+currentScreenShakeIntensity*2, canvasHeight+currentScreenShakeIntensity*2);

        updateProjectiles(deltaTime);

        // Update gamepads state
        navigator.getGamepads().forEach(gp => {
            if (gp) activeGamepads[gp.index] = gp;
        });

        handlePlayerControls(0); // P1
        if (gameMode === 'pvcpu' && players[1] && !matchOver) {
            updateAI(players[1], players[0], selectedDifficulty, deltaTime);
        } else if (gameMode === 'pvp' && players[1] && !matchOver) {
            handlePlayerControls(1); // P2
        }

        players.forEach(player => { updatePlayerState(player, deltaTime); });

        drawProjectiles();
        players.forEach(player => { drawPlayer(player); });

        ctx.restore();
    }
    requestAnimationFrame(gameLoop);
}

function updateControlSelectionAvailability() {
    const numGamepads = Object.keys(activeGamepads).length;
    const touchVsGamepadBtn = document.getElementById('touchVsGamepadButton');
    const gamepadVsGamepadBtn = document.getElementById('gamepadVsGamepadButton');

    touchVsGamepadBtn.disabled = numGamepads < 1;
    gamepadVsGamepadBtn.disabled = numGamepads < 2;

    if(touchVsGamepadBtn.disabled) touchVsGamepadBtn.classList.add('disabled');
    else touchVsGamepadBtn.classList.remove('disabled');

    if(gamepadVsGamepadBtn.disabled) gamepadVsGamepadBtn.classList.add('disabled');
    else gamepadVsGamepadBtn.classList.remove('disabled');
}


window.onload = () => {
    setupCanvasDimensions();
    window.addEventListener('resize', setupCanvasDimensions);
    initializeSelections();
    // Verifica gamepads já conectados
    navigator.getGamepads().forEach(gp => {
        if (gp) handleGamepadConnected({ gamepad: gp });
    });
    updateGamepadStatus(); // Chama para setar o estado inicial
    switchScreen('modeSelect');
};