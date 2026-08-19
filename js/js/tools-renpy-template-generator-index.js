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

// 下载计数器
        function getDownloadCount() {
            const count = localStorage.getItem('renpy_template_downloads');
            return count ? parseInt(count) : 89;
        }

        function incrementDownloadCount() {
            let count = getDownloadCount();
            count++;
            localStorage.setItem('renpy_template_downloads', count);
            document.getElementById('downloadCount').textContent = count;
        }

        // 初始化计数器显示
        document.getElementById('downloadCount').textContent = getDownloadCount();

        // 选项卡切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
                updatePreviews();
            });
        });

        // 中文名转拼音首字母/ASCII变量名（Ren'Py变量必须是ASCII）
        // 已使用变量名计数器（防止重复）
        const _varCounter = {};
        function toAsciiVar(charName) {
            // 常见日式/中式角色名映射
            const nameMap = {
                '小樱':'sakura','樱':'sakura',
                '春':'haru','夏':'natsu','秋':'aki','冬':'fuyu',
                '雪':'yuki','月':'tsuki','星':'hoshi','花':'hana',
                '猫':'neko','龙':'ryuu','风':'kaze','云':'kumo',
                '光':'hikari','暗':'yami','火':'hi','水':'mizu',
            };
            let base = nameMap[charName];
            // 英文名直接小写
            if (!base && /^[a-zA-Z]/.test(charName)) base = charName.toLowerCase().replace(/[^a-z0-9_]/g,'_');
            // 其他中文名用拼音首字母+hash
            if (!base) {
                let hash = 0;
                for (let i = 0; i < charName.length; i++) hash = ((hash << 5) - hash + charName.charCodeAt(i)) | 0;
                base = 'char_' + Math.abs(hash).toString(36).slice(0, 4);
            }
            // 重复变量名自动加后缀
            if (!_varCounter[base]) { _varCounter[base] = 1; return base; }
            _varCounter[base]++;
            return base + '_' + _varCounter[base];
        }

        // 基础视觉小说模板代码
        function getBasicTemplate(charName, gameTitle, playerName) {
            const v = toAsciiVar(charName);
            return `define ${v} = Character("${charName}", color="#c8ffc8")
define m = Character("${playerName}", color="#c8c8ff")

image ${v} happy = "characters/${charName}_happy.png"
image ${v} normal = "characters/${charName}_normal.png"

label start:
    scene bg room
    "这是一个普通的房间。"

    show ${v} happy
    ${v} "你好！欢迎来到 ${gameTitle}！"
    ${v} "我是 ${charName}，很高兴见到你～"

    menu:
        "打招呼":
            jump greet
        "保持沉默":
            jump silent

label greet:
    m "你好啊！"
    ${v} "你真是个好人呢！"
    jump ending

label silent:
    ${v} "...你不想说话吗？"
    ${v} "没关系，慢慢来就好。"
    jump ending

label ending:
    ${v} "希望我们能再见面！"
    "— 完 —"
    return`;
        }

        // 养成系统模板代码
        function getRaisingTemplate(charName, gameTitle, initAffection, initEnergy, initMoney) {
            const v = toAsciiVar(charName);
            return `init python:
    # 属性初始化
    affection = ${initAffection}  # 好感度
    energy = ${initEnergy}         # 体力
    money = ${initMoney}           # 金钱
    day = 1                       # 天数

    def add_affection(n):
        global affection
        affection = min(affection + n, 100)

    def add_energy(n):
        global energy
        energy = min(energy + n, 100)

    def add_money(n):
        global money
        money = max(money + n, 0)

    def next_day():
        global day, energy
        day += 1
        energy = min(energy + 30, 100)

define ${v} = Character("${charName}", color="#ffc8c8")
define m = Character("我", color="#c8c8ff")

label start:
    scene bg school
    "第 [day] 天"

    show ${v} normal
    ${v} "早上好！今天要做些什么呢？"

    call show_status
    call daily_menu

label daily_menu:
    menu:
        "和 ${charName} 聊天" if energy >= 10:
            jump talk
        "送礼物" if money >= 50 and energy >= 5:
            jump give_gift
        "休息" if energy < 30:
            jump rest
        "结束今天":
            jump end_day

label talk:
    $ energy -= 10
    $ add_affection(5)
    ${v} "谢谢你陪我聊天～"
    call show_status
    jump daily_menu

label give_gift:
    $ money -= 50
    $ add_affection(15)
    ${v} "哇！这是送给我的吗？谢谢！"
    call show_status
    jump daily_menu

label rest:
    $ energy = 100
    "好好休息了一下，体力恢复了。"
    call show_status
    jump daily_menu

label end_day:
    $ next_day()
    if affection >= 80:
        jump good_ending
    elif day >= 30:
        jump normal_ending
    else:
        jump start

label show_status:
    "${charName}好感度: [affection] | 体力: [energy] | 金钱: [money] | 第 [day] 天"
    return

label good_ending:
    ${v} "我...我喜欢你！"
    "— ${gameTitle} 真结局 —"
    return

label normal_ending:
    ${v} "这段时间真的很开心呢。"
    "— ${gameTitle} 普通结局 —"
    return`;
        }

        // 背包系统模板代码
        function getInventoryTemplate(gameTitle, maxSlots, initGold) {
            return `init python:
    # 背包系统
    inventory = []      # 背包物品列表
    gold = ${initGold}  # 金币
    max_slots = ${maxSlots}   # 最大格子数

    class Item:
        def __init__(self, name, desc, count=1, usable=True):
            self.name = name
            self.desc = desc
            self.count = count
            self.usable = usable

        def use(self):
            if self.count > 0:
                self.count -= 1
                return True
            return False

    def add_item(name, desc, count=1):
        global inventory
        if len(inventory) >= max_slots:
            return False
        inventory.append(Item(name, desc, count))
        return True

    def has_item(name):
        return any(item.name == name for item in inventory)

    def show_inventory():
        if not inventory:
            return "背包是空的。"
        result = "背包内容：\\n"
        for i, item in enumerate(inventory):
            result += f"{i+1}. {item.name} x{item.count} - {item.desc}\\n"
        return result

define m = Character("我", color="#c8c8ff")

label start:
    scene bg field
    "欢迎来到 ${gameTitle}！"

    "你出发去冒险了。"

    # 初始获得物品
    $ add_item("药草", "可恢复体力", 3)
    $ add_item("面包", "可恢复饥饿", 2)
    $ add_item("金币袋", "装金币的袋子", 1)

    call show_menu

label show_menu:
    menu:
        "查看背包":
            jump view_inventory
        "使用物品":
            jump use_item
        "继续冒险":
            jump adventure
        "结束游戏":
            return

label view_inventory:
    $ inventory_text = show_inventory()
    "[inventory_text]"
    "金币: [gold]"
    jump show_menu

label use_item:
    if not inventory:
        "背包里没有物品可以使用。"
        jump show_menu

    $ inventory_text = show_inventory()
    "[inventory_text]"

    menu:
        "使用药草" if has_item("药草"):
            "你使用了药草，体力恢复了！"
            jump use_item
        "使用面包" if has_item("面包"):
            "你吃了面包，不饿了！"
            jump use_item
        "返回":
            jump show_menu

label adventure:
    "你在路上发现了一个宝箱！"
    $ add_item("神秘钥匙", "打開神秘門的钥匙", 1)
    $ gold += 50
    "获得了神秘钥匙和50金币！"
    jump show_menu

label ending:
    "冒险结束了。感谢游玩 ${gameTitle}！"
    return`;
        }

        // 更新代码预览
        function updatePreviews() {
            // 基础模板预览
            const basicChar = document.getElementById('basic-char-name').value || '小樱';
            const basicTitle = document.getElementById('basic-game-title').value || '春日物语';
            const basicPlayer = document.getElementById('basic-player-name').value || '我';
            document.getElementById('basic-preview').textContent = getBasicTemplate(basicChar, basicTitle, basicPlayer);

            // 养成模板预览
            const raisingChar = document.getElementById('raising-char-name').value || '小樱';
            const raisingTitle = document.getElementById('raising-game-title').value || '恋爱养成日记';
            const raisingAff = document.getElementById('raising-init-affection').value || 10;
            const raisingEng = document.getElementById('raising-init-energy').value || 100;
            const raisingMon = document.getElementById('raising-init-money').value || 500;
            document.getElementById('raising-preview').textContent = getRaisingTemplate(raisingChar, raisingTitle, raisingAff, raisingEng, raisingMon);

            // 背包模板预览
            const invTitle = document.getElementById('inventory-game-title').value || '冒险物语';
            const invSlots = document.getElementById('inventory-max-slots').value || 20;
            const invGold = document.getElementById('inventory-init-gold').value || 100;
            document.getElementById('inventory-preview').textContent = getInventoryTemplate(invTitle, invSlots, invGold);
        }

        // 监听输入框变化
        document.querySelectorAll('.customize-section input, .customize-section select').forEach(input => {
            input.addEventListener('input', updatePreviews);
            input.addEventListener('change', updatePreviews);
        });

        // 初始化预览
        updatePreviews();

        // 复制代码
        window.copyCode = function(elementId, evt) {
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = evt.target;
                btn.textContent = '已复制！';
                setTimeout(() => btn.textContent = '复制代码', 2000);
            });
        }

        // 生成 options.rpy 内容（基于标准 Ren'Py 模板）
        function getOptionsRpy(gameTitle) {
            const safeName = gameTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '');
            const saveDir = safeName + '-' + Date.now().toString().slice(-10);
            return `## 此文件包含有可自定义您游戏的设置。
##
## 以"##"开头的语句是注释，您不应该对其取消注释。以"#"开头的语句是注释掉的代码，
## 在适用的时候您可能需要对其取消注释。

## 基础 ##########################################################################

## 用户可读的游戏名称。此命令用来设置默认窗口标题，并且会在界面和错误报告中出
## 现。
##
## 带有 _() 的字符串表示其可被翻译。

define config.name = _("${gameTitle}")

## 决定上面给出的标题是否显示在标题界面屏幕。设置为 False 来隐藏标题。

define gui.show_name = True

## 游戏版本号。

define config.version = "1.0"

## 放置在游戏内"关于"屏幕上的文本。将文本放在三个引号之间，并在段落之间留出空
## 行。

define gui.about = _p("""
""")

## 在构建的发布版中，可执行文件和目录所使用的短名称。此处仅限使用 ASCII 字符，并
## 且不能包含空格、冒号或分号。

define build.name = "${safeName}"

## 音效和音乐 #######################################################################

## 这三个变量控制哪些内置的混音器会默认显示给用户。将其中一个设置为 False 将隐藏
## 对应的混音器。

define config.has_sound = True
define config.has_music = True
define config.has_voice = True

## 为了让用户在音效或语音轨道上播放测试音频，请取消对下面一行的注释并设置播放的
## 样本声音。

# define config.sample_sound = "sample-sound.ogg"
# define config.sample_voice = "sample-voice.ogg"

## 将以下语句取消注释就可以设置标题界面播放的背景音乐文件。此文件将在整个游戏中
## 持续播放，直至音乐停止或其他文件开始播放。

# define config.main_menu_music = "main-menu-theme.ogg"

## 转场 ##########################################################################
##
## 这些变量用来控制某些事件发生时的转场。每一个变量都应设置成一个转场，或者是
## None 来表示无转场。

## 进入或退出游戏菜单。

define config.enter_transition = dissolve
define config.exit_transition = dissolve

## 各个游戏菜单之间的转场。

define config.intra_transition = dissolve

## 载入游戏后使用的转场。

define config.after_load_transition = None

## 在游戏结束之后进入主菜单时使用的转场。

define config.end_game_transition = None

## 用于控制在游戏开始标签不存在时转场的变量。作为替代，在显示初始化场景后使用
## with 语句。

## 窗口管理 ########################################################################
##
## 此命令控制对话框窗口何时显示。若为 show，对话框将总是显示。若为 hide，对话框
## 仅在对话出现时显示。若为 auto，对话框会在 scene 语句前隐藏，并在有新对话时重
## 新显示。
##
## 在游戏开始后，可以用 window show、window hide 和 window auto 语句来改变其状
## 态。

define config.window = "auto"

## 用于显示和隐藏对话框窗口的转场

define config.window_show_transition = Dissolve(.2)
define config.window_hide_transition = Dissolve(.2)

## 默认设置 ########################################################################

## 控制默认的文字显示速度。默认的 0 为瞬间，而其他数字则是每秒显示出的字符数。

default preferences.text_cps = 0

## 默认的自动前进延迟。数字越大，等待时间越长，有效范围为 0 - 30。

default preferences.afm_time = 15

## 存档目录 ########################################################################
##
## 控制 Ren'Py 放置游戏存档的特定操作系统目录。存档文件将放置在：
##
## Windows：%APPDATA\\RenPy\\<config.save_directory>
##
## Macintosh：$HOME/Library/RenPy/<config.save_directory>
##
## Linux：$HOME/.renpy/<config.save_directory>
##
## 该语句通常不应变更，若要变更，应为有效字符串而不是表达式。

define config.save_directory = "${saveDir}"

## 图标 ##########################################################################
##
## 在任务栏或 Dock 上显示的图标。

define config.window_icon = "gui/window_icon.png"

## 构建配置 ########################################################################
##
## 此部分控制 Ren'Py 如何将您的项目转变为发行版文件。

init python:

    ## 以下函数接受文件模式。文件模式不区分大小写，并与基础目录的相对路径相匹
    ## 配，包括或不包括 /。如果多个模式匹配，则使用第一个模式。
    ##
    ## 在一个模式中：
    ##
    ## / 是目录分隔符。
    ##
    ## * 匹配所有字符，目录分隔符除外。
    ##
    ## ** 匹配所有字符，包括目录分隔符。
    ##
    ## 例如，"*.txt"匹配基础目录中的 txt 文件，"game/**.ogg"匹配游戏目录或任何子
    ## 目录中的 ogg 文件，"**.psd"匹配项目中任何位置的 psd 文件。

    ## 将文件列为 None 来使其从构建的发行版中排除。

    build.classify('**~', None)
    build.classify('**.bak', None)
    build.classify('**/.**', None)
    build.classify('**/#**', None)
    build.classify('**/thumbs.db', None)

    ## 若要封装文件，需将其列为"archive"。

    # build.classify('game/**.png', 'archive')
    # build.classify('game/**.jpg', 'archive')

    ## 匹配为文档模式的文件会在 Mac 应用程序构建中被复制，因此它们同时出现在 APP
    ## 和 ZIP 文件中。

    build.documentation('*.html')
    build.documentation('*.txt')

## 执行应用内购需要一个 Google Play 许可密钥。许可密钥可以在 Google Play 开发者
## 控制台的"Monetize" > "Monetization Setup" > "Licensing"页面找到。

# define build.google_play_key = "..."

## 与 itch.io 项目相关的用户名和项目名，以 / 分隔。

# define build.itch_project = "renpytom/test-project"`;
        }

        // 生成并下载模板
        window.generateTemplate = function(type, evt) {
            const btn = evt.target.closest('.generate-btn');
            btn.classList.add('loading');

            const zip = new JSZip();

            if (type === 'basic') {
                const charName = document.getElementById('basic-char-name').value || '小樱';
                const gameTitle = document.getElementById('basic-game-title').value || '春日物语';
                const playerName = document.getElementById('basic-player-name').value || '我';

                zip.file('script.rpy', getBasicTemplate(charName, gameTitle, playerName));
                zip.file('options.rpy', getOptionsRpy(gameTitle));
            } else if (type === 'raising') {
                const charName = document.getElementById('raising-char-name').value || '小樱';
                const gameTitle = document.getElementById('raising-game-title').value || '恋爱养成日记';
                const initAff = document.getElementById('raising-init-affection').value || 10;
                const initEng = document.getElementById('raising-init-energy').value || 100;
                const initMon = document.getElementById('raising-init-money').value || 500;

                zip.file('script.rpy', getRaisingTemplate(charName, gameTitle, initAff, initEng, initMon));
                zip.file('options.rpy', getOptionsRpy(gameTitle));
            } else if (type === 'inventory') {
                const gameTitle = document.getElementById('inventory-game-title').value || '冒险物语';
                const maxSlots = document.getElementById('inventory-max-slots').value || 20;
                const initGold = document.getElementById('inventory-init-gold').value || 100;

                zip.file('script.rpy', getInventoryTemplate(gameTitle, maxSlots, initGold));
                zip.file('options.rpy', getOptionsRpy(gameTitle));
            }

            zip.generateAsync({type: 'blob'}).then(content => {
                const templateName = type === 'basic' ? '基础视觉小说' : type === 'raising' ? '养成系统' : '背包系统';
                saveAs(content, `RenPy_${templateName}_模板.zip`);
                btn.classList.remove('loading');
                incrementDownloadCount();
            });
        }