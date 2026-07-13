window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TR4FT7JPDZ');

(function() {
            function checkHTTP() {
                if (window.location.protocol === 'http:') {
                    var urlSpan = document.getElementById('currentHttpUrl');
                    if (urlSpan) urlSpan.textContent = window.location.href;
                    var overlay = document.getElementById('httpWarningOverlay');
                    if (overlay) overlay.style.display = 'flex';
                }
            }
            function switchToHTTPS() {
                var url = window.location.href;
                url = url.replace(/^http:/i, 'https:');
                window.location.href = url;
            }
            function continueHTTP() {
                var overlay = document.getElementById('httpWarningOverlay');
                if (overlay) overlay.style.display = 'none';
            }
            window.switchToHTTPS = switchToHTTPS;
            window.continueHTTP = continueHTTP;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', checkHTTP);
            } else {
                checkHTTP();
            }
        })();

// ===== Data =====
const NAMES = {
    cute: {
        female: ['星野琉璃','猫音棉花','桃月蜜柑','雪见草莓','柚木花音','月城铃酱','樱花牛奶','萌木桃子','虹色喵喵','碧海珊瑚','蜜桃波波','星空糖糖'],
        male: ['月见优希','樱庭飒太','猫屋喵介','星奈暖','萌木桃太郎','花丸元气'],
        neutral: ['虚空旅人','彩虹桥守门人','量子纠缠体','薛定谔的猫','宇宙废柴']
    },
    cool: {
        female: ['苍月凛','影山朱璃','鬼灯冷','夜叉银','黑铁刹那','冰室雪奈','神无月夜'],
        male: ['黑钢零式','苍炎烈','神崎剑','影山铁','龙牙荒','冥王星刻'],
        neutral: ['虚空旅人','彩虹桥守门人','量子纠缠体','薛定谔的猫','宇宙废柴']
    },
    mysterious: {
        female: ['虚月幻','雾雨幽','镜界双子','永夜冥','深渊凝望','幻影Nyx'],
        male: ['虚无寂','迷途Specter','暗影虚空','轮回Zero','深渊Echo'],
        neutral: ['虚空旅人','彩虹桥守门人','量子纠缠体','薛定谔的猫','宇宙废柴']
    },
    funny: {
        female: ['铁锅炖自己','社畜本畜','摆烂女王','摸鱼大师','奶茶续命'],
        male: ['头秃程序猿','干饭王','躺平达人','摆烂仙人','648警告'],
        neutral: ['虚空旅人','彩虹桥守门人','量子纠缠体','薛定谔的猫','宇宙废柴']
    }
};

const PERSONAS = {
    cute: {
        female: [
            '一个从星星上掉下来的精灵，目标是成为全世界最会撒娇的VTuber！',
            '喜爱甜食和午睡的猫系少女，直播时经常不小心睡着。',
            '自称"偶像候补生"的元气少女，每天都在努力练习打招呼。',
            '在异世界开了一家甜品店的魔法少女，偶尔会直播做蛋糕。'
        ],
        male: [
            '温柔的大哥哥系VTuber，声音治愈但打游戏超凶。',
            '梦想成为魔法少年的普通高中生，每天都在练习变身。',
            '喜欢猫咪的阳光少年，直播时猫咪经常会抢镜。'
        ],
        neutral: [
            '来自平行宇宙的旅行者，对地球上的一切都充满好奇。',
            '自称"全知全能"但其实啥都不会的神秘存在。',
            '量子状态下的存在，每次直播前都不确定自己是什么性格。'
        ]
    },
    cool: {
        female: [
            '暗夜中独自行动的特工型VTuber，实力强大话却很少。',
            '拥有冰系魔力的冷艳女王，誓要冻结所有弹幕中的水军。',
            '以压倒性游戏实力闻名，打Boss从不看攻略。',
            '退役佣兵转行做VTuber，直播风格干净利落。'
        ],
        male: [
            '沉默寡言的独狼型VTuber，只用操作说话。',
            '前电竞职业选手，直播主打高难度游戏速通。',
            '继承了古武道传承的硬派主播，对游戏的态度如同战斗。'
        ],
        neutral: [
            '行走在时空裂缝中的无名旅者，据说见过所有游戏的结局。',
            '被遗忘的英雄，正在通过直播重新找回自己的名字。',
            '来自未来的观察者，据说能预判游戏的每一个版本。'
        ]
    },
    mysterious: {
        female: [
            '自称来自"镜之国"的存在，直播画面偶尔会出现诡异的镜像。',
            '只在深夜出没的月之子，声音空灵如同来自彼岸。',
            '拥有预知能力，但预测准确率似乎只有50%……',
            '据说她的直播间连接着另一个次元，有时会出现不明弹幕。'
        ],
        male: [
            '自称已存在了千年的存在，但对现代科技一窍不通。',
            '在虚拟世界的废墟中游荡的灵魂，正在寻找失去的记忆。',
            '深渊的观测者，偶尔会分享一些令人不安的"知识"。'
        ],
        neutral: [
            '没有人知道它的真实身份，包括它自己。',
            '在数据和代码的海洋中诞生的意识体，正在理解"情感"。',
            '来自高维空间的投影，无法被完全理解的存在。'
        ]
    },
    funny: {
        female: [
            '自称"摆烂艺术创始人"，直播主打一个随缘更新。',
            '社恐但不得不社交的矛盾体，每句话都在硬撑。',
            '游戏黑洞本洞，但心态好到让观众怀疑她是不是故意的。'
        ],
        male: [
            '头发日渐稀少的程序员转型VTuber，直播bug比代码还多。',
            '直播三大爱好：吃、睡、继续吃。偶尔也打游戏。',
            '号称"躺平界天花板"，但每次躺下都会被队友拉起来。'
        ],
        neutral: [
            '薛定谔的直播状态：在你打开直播间之前，它同时在线和离线。',
            '一个由AI生成的虚拟存在，但行为完全无法预测。',
            '自称宇宙级废柴，但粉丝觉得这是最高级的自嘲。'
        ]
    }
};

const CATCHPHRASES = {
    cute: ['ciallo~！','喵喵喵~','大家今天也要元气满满哦！','欢迎来到我的小世界~','我是不是很可爱？不许说不！','嘿嘿，被发现了~','不可以欺负我哦！','今天也是努力的一天！'],
    cool: ['别眨眼。','结束了。','太弱了。','下一场。','没有挑战。','不过是热身而已。','让我看看你的实力。','完美。'],
    mysterious: ['……你看到了吗？','时间不多了。','真相，往往藏在阴影之中。','你确定……你是在做梦吗？','这个世界，远比你想象的要复杂。','嘘……别回头。','一切皆有因果。'],
    funny: ['我先睡了，你们看着打。','这个bug不是我写的！（其实是）','今天吃什么？这是最重要的问题。','648？不存在的，我白嫖！','今天的我比昨天的我更废了一点。','有钱赚吗？没有的话我先走了。','我不是菜，我是在创新打法。']
};

// ===== State =====
let selectedGender = 'female';
let selectedStyle = 'cute';
let currentResults = [];

// ===== Init =====
(function init() {
    const count = localStorage.getItem('vtuber_gen_count');
    if (!count) localStorage.setItem('vtuber_gen_count', '127');
    document.getElementById('count').textContent = count;
    setupOptionButtons();
    document.getElementById('generateBtn').addEventListener('click', generate);
})();

function setupOptionButtons() {
    document.querySelectorAll('#genderGroup .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#genderGroup .option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedGender = btn.dataset.value;
        });
    });
    document.querySelectorAll('#styleGroup .option-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#styleGroup .option-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedStyle = btn.dataset.value;
        });
    });
}

// ===== Logic =====
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generate() {
    const namePool = NAMES[selectedStyle][selectedGender] || NAMES[selectedStyle].female;
    const personaPool = PERSONAS[selectedStyle][selectedGender] || PERSONAS[selectedStyle].female;
    const phrasePool = CATCHPHRASES[selectedStyle];

    const usedNames = new Set();
    currentResults = [];

    for (let i = 0; i < 3; i++) {
        let name;
        do { name = pick(namePool); } while (usedNames.has(name) && usedNames.size < namePool.length);
        usedNames.add(name);
        currentResults.push({
            name,
            persona: pick(personaPool),
            catchphrase: pick(phrasePool)
        });
    }

    renderResults();

    // Update counter
    let c = parseInt(localStorage.getItem('vtuber_gen_count') || '127');
    c++;
    localStorage.setItem('vtuber_gen_count', c.toString());
    document.getElementById('count').textContent = c;
}

function renderResults() {
    const container = document.getElementById('resultCards');
    container.innerHTML = '';
    currentResults.forEach((r, i) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
            <div class="name">方案 ${i + 1}：${r.name}</div>
            <div class="persona"><i class="fa-solid fa-user-pen"></i>${r.persona}</div>
            <div class="catchphrase"><i class="fa-solid fa-quote-left"></i>"${r.catchphrase}"</div>
        `;
        container.appendChild(card);
    });

    const results = document.getElementById('results');
    results.classList.remove('show');
    // Force reflow to restart animation
    void results.offsetWidth;
    results.classList.add('show');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Share =====
function buildText() {
    return currentResults.map((r, i) =>
        `【方案${i + 1}】${r.name}\n人设：${r.persona}\n口头禅："${r.catchphrase}"`
    ).join('\n\n') + '\n\nfrom VTuber名字生成器 | ciallo0721-cmd';
}

function copyResults() {
    if (!currentResults.length) return;
    navigator.clipboard.writeText(buildText()).then(() => showToast('已复制到剪贴板！')).catch(() => showToast('复制失败，请手动复制'));
}

function shareQQ() {
    if (!currentResults.length) return;
    const url = 'https://ciallo0721-cmd.top/tools/vtuber-name-generator/';
    const title = 'VTuber名字生成器 - 给我生成了超棒的名字！';
    const summary = buildText();
    window.open(`https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`, '_blank', 'width=600,height=500');
}

function shareBili() {
    if (!currentResults.length) return;
    const text = buildText();
    const url = 'https://ciallo0721-cmd.top/tools/vtuber-name-generator/';
    // B站动态分享链接
    window.open(`https://member.bilibili.com/platform/upload/text/article?t=${encodeURIComponent('VTuber名字生成器')}`, '_blank');
    showToast('已打开B站，快来分享你的VTuber名字吧！');
}

// ===== Toast =====
function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2000);
}