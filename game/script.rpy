# 游戏脚本 - 完整版（含成就嘲讽系统）
define zj = Character("诗蓝", color="#497bcc")
define friend = Character("阿明", color="#6aa84f") 
define sister = Character("小雅", color="#c27ba0")
define ss = Character("  ", color="#a7a55a94")
define you = Character("小悠", color="#f6b26b")
#动了就崩溃
# 手贱改定义？等着报错吧

# 初始化设置
# 这里的变量谁敢动？程序炸了别找我哭
# 手欠删全局变量？直接送你个Traceback大礼包
init python:
    # 设置默认文本速度
    preferences.text_cps = 30
    
    # 恋爱相关变量
    global love_interest  # 声明全局变量
    global you_favor      # 声明全局变量
    love_interest = None  # 恋爱对象
    you_favor = 0         # 小悠好感度
    
    # 电影相关变量
    global movie_choice   # 选择的电影
    global movie_enjoyed  # 是否享受电影
    movie_choice = None
    movie_enjoyed = False
    
    # ===== 新增成就系统 =====
    global sigma_counter, unlocked_achievements
    sigma_counter = 0  # 单身线计数
    unlocked_achievements = []  # 已解锁成就
    achievement_sigma = {
        "id": "sigma_male",
        "name": "西格玛男人",
        "desc": "精准避开所有恋爱选项2次",
        "icon": "gui/achievements/sigma.png"
    }
    
    # 新增：是否进入西格玛副本的标志
    global enter_sigma_chapter
    enter_sigma_chapter = False

# 成就弹窗界面
screen achievement_popup(achievement):
    zorder 100
    frame:
        xalign 0.5 yalign 0.3
        background Solid("#00000099")
        vbox:
            label "成就解锁" style "achievement_header"
            add achievement["icon"] xalign 0.5
            text achievement["name"]:
                style "achievement_title" 
                size 40
                color "#FF0000"
            text achievement["desc"]:
                style "achievement_desc"
                size 25
            
    timer 5.0 action Hide("achievement_popup")

# 主菜单成就画廊
screen achievements():
    tag menu
    add "gui/achievements_bg.jpg"
    vbox:
        spacing 20
        label "成就系统" xalign 0.5
        
        if "sigma_male" in unlocked_achievements:
            hbox:
                add achievement_sigma["icon"]
                vbox:
                    text achievement_sigma["name"] style "achievement_title"
                    text achievement_sigma["desc"] style "achievement_desc"
        else:
            text "？？？" xalign 0.5

# 游戏开始
#也是不要动,要不然会崩溃
label start:
    
    # 新增：检查是否进入西格玛副本
    if enter_sigma_chapter:
        jump sigma_chapter
    
    # 播放主界面音乐
    play music "audio/bgm/main_theme.ogg" fadein 2.0
    
    # 开场场景 - 房间白天
    scene bg room_day with fade
    "又是一个普通的周末早晨。"
    "阳光透过窗户洒进房间，空气中飘浮着细微的尘埃。"
    
    zj "呼...终于醒了。"
    "我揉了揉眼睛，从床上坐起来。"
    "手机屏幕亮起，显示着几条未读消息。"
    
    # 手机震动音效
    play sound "audio/sfx/notification.ogg"
    
    # 显示消息内容
    ss "阿明：嘿，今天下午有空吗？新开的篮球场听说不错！"
    ss "小雅：哥，别忘了帮我买绘画材料！"
    
    zj "嗯...先去帮小雅买绘画材料，然后和阿明去打球吧。"
    
    # 过渡到公园场景
    scene bg park_day with dissolve
    play music "audio/bgm/park_ambience.ogg" fadeout 1.0 fadein 1.0
    
    "公园里人不多，午后的阳光透过树叶洒下斑驳的光影。"
    "我找到阿明时，他已经在长椅上等我了。"
    
    show friend at right with dissolve
    friend "嘿，来得挺准时啊！"
    zj "当然，说好的三点嘛。"
    
    friend "听说新开的篮球场设施很棒，咱们去试试？"
    zj "好啊，不过得先陪我去趟美术用品店，给小雅买点东西。"
    
    friend "没问题！你妹妹最近还在参加那个绘画比赛？"
    zj "嗯，她可认真了，天天练习到很晚。"
    
    # === 新增美术用品店场景 ===
    scene bg store_day with dissolve
    play music "audio/bgm/store.ogg" fadeout 1.0 fadein 1.0
    
    "美术用品店里摆放着各种各样的颜料和画笔。"
    "我在货架间挑选着合适的绘画材料。"
    
    # 遇到小悠
    show you at left with dissolve#关键,动了死全价
# 这个show you动了死全家 ←不是玩笑
# 此处代码比处女座还敏感 乱改必崩

    you "请问...你知道这种水彩颜料在哪里吗？"
    
    menu:
        "热心帮忙":
            zj "我知道，在那边的货架上，我带你去。"
            $ you_favor += 10
            you "太感谢了！你经常来这家店吗？"
            zj "是啊，我妹妹喜欢画画，我常来帮她买东西。"
        "简单回应":
            zj "在那边第三个货架。"
            $ you_favor += 5
            you "哦，谢谢。"
            "她匆匆走向货架，我继续挑选着颜料。"
            "过了一会儿，她又走了过来。"
            you "那个...你能帮我看看这种颜料的质量怎么样吗？"
    
    you "我叫小悠，是美术学院的学生。"
    zj "你好，我是诗蓝。"
    
    you "你妹妹也喜欢画画吗？"
    zj "是的，她正在准备一个绘画比赛。"
    you "那太好了！绘画是很需要坚持的事情。"
    
    # 购买完物品
    zj "那...我先走了，再见。"
    you "再见！希望还能再见面。"
    
    # 篮球场景
    scene bg basketball_court with fade
    play sound "audio/sfx/basketball_bounce.ogg" loop
    
    "运球声在空旷的场地里回响..."
    "几个回合下来，我们都累得坐在地上。"
    
    friend "呼...好久没这么痛快打球了！"
    zj "是啊，工作后都没什么时间运动了。"
    
    # === 新增分支选择 ===
    friend "要不要再来一局？"
    menu:
        "好啊，最后一局！":
            # 继续打球
            "我们又打了十分钟，直到汗流浃背才停下。"
            friend "今天真是过瘾！"
            zj "是啊，不过真的该回家了。"
            stop sound fadeout 1.0
            
        "不了，有点累了。":
            # 结束打球
            zj "今天就到这吧，确实有点累了。"
            friend "行，那咱们下次再约！"
            stop sound fadeout 1.0
    
    # 傍晚场景（添加天气变化效果）
    scene bg park_night with Dissolve(2.0)
    play music "audio/bgm/night_theme.ogg" fadeout 1.0 fadein 2.0
    
    # 随机选择天气效果
    $ weather_effect = renpy.random.choice(["rain", "wind", "clear"])
    
    if weather_effect == "rain":
        # 下雨效果
        "不知不觉天色已暗，天空飘起了细雨，公园里的路灯在雨幕中晕开柔和的光圈。"
        friend "下雨了，我得赶紧回去了。"
        zj "嗯，小心路滑，下次再约！"
        
    elif weather_effect == "wind":
        # 刮风效果
        ss "不知不觉天色已暗，晚风带着凉意吹过公园，树叶沙沙作响。"
        friend "起风了，有点凉，我得回去了。"
        zj "是啊，感觉要变天了，路上小心！"
        
    else:
        # 晴朗夜晚
        ss "不知不觉天色已暗，公园里的路灯次第亮起，晴朗的夜空中隐约可见几颗星星。"
        friend "时间不早了，我得回去了。"
        zj "嗯，今天打得很开心，下次再约！"
    
    # === 新增随机事件：再次遇到小悠 ===
    if you_favor >= 10 and renpy.random.random() < 0.7:
        scene bg park_night with dissolve
        
        show you at right with dissolve#这里出过错,不要动否则会出错
        you "诗蓝？好巧啊！"
        zj "小悠？你也在这附近吗？"
        you "我刚在附近的咖啡馆画完速写，准备回家。"
        
        menu:
            "邀请散步":
                zj "一起走走吧，反正我也不着急回家。"
                $ you_favor += 15
                "我们沿着公园的小路慢慢走着。"
                you "今晚的星星真漂亮。"
                zj "是啊，城市里很少能看到这么多星星。"
            "礼貌道别":
                zj "这么晚了，路上小心。"
                $ you_favor += 5
                you "你也是，再见！"
                jump home_scene
        
        you "诗蓝，你平时有什么爱好吗？"
        menu:
            "聊篮球":
                zj "我喜欢打篮球，今天下午刚和朋友打完球。"
                you "篮球啊，很有活力的运动呢！"
            "聊妹妹":
                zj "我平时会帮妹妹挑选绘画材料，她很喜欢画画。"
                you "你真是个好哥哥！对了，你妹妹的比赛什么时候开始？"
    
    # 回家场景
    label home_scene:
    scene bg room_night with fade
    "回到家时，小雅正在客厅画画。"
    
    show sister at center with dissolve
    
    sister "哥，你回来啦！我的颜料买到了吗？"
    zj "当然，给。"
    
    "我把美术用品递给她。"
    
    sister "太棒了！正好我需要这个颜色。"
    "她眼睛发亮的样子让我想起小时候她收到新画笔时的表情。"
    
    zj "比赛准备得怎么样了？"
    sister "还在修改构图...不过我有信心！"
    
    zj "加油，我相信你一定能行。"
    
    # === 新增夜间手机消息 ===
    "回到自己房间，我躺在床上刷着手机。"
    
    if you_favor >= 20:
        # 小悠好感度足够高，收到消息
        play sound "audio/sfx/notification.ogg"
        ss "小悠：明天新上映了几部电影，有科幻片《星际边缘》和爱情片《雨中邂逅》，你想一起去看吗？"#这里不要动,要不然会出错
        
        menu:
            "欣然答应":
                zj "好啊，我很期待！你想看哪部？"
                menu:
                    "科幻片":
                        zj "《星际边缘》听起来不错！"
                        $ movie_choice = "sci-fi"
                    "爱情片":
                        zj "《雨中邂逅》好像很浪漫。"
                        $ movie_choice = "romance"
                $ love_interest = "you"
                jump movie_date  # 跳转到电影约会场景
            "委婉拒绝":# 西格玛男人选项（选拒绝就活该单身）
                zj "不好意思，明天已经有安排了。"
                $ you_favor -= 5
    
    # 结束场景
    scene bg room_night with dissolve
    $ sigma_counter += 1#西格玛男人
    "回到自己房间，我躺在床上回顾这一天。"
    "虽然只是普通的周末，但和好友相聚、帮助家人的感觉真好..."
    
    "明天又是新的一周。"
    "生活就是这样，平淡中自有它的美好。"
    
    # 游戏结束
    stop music fadeout 3.0
    return

# === 新增电影约会场景 ===
label movie_date:
    scene bg movie_theater with dissolve
    play music "audio/bgm/movie_theater.ogg" fadein 2.0
    
    "电影院里人来人往，爆米花的香气弥漫在空气中。"
    
    show you at left with dissolve
    show zj at right with dissolve
    
    if movie_choice == "sci-fi":
        you "终于等到《星际边缘》上映了！听说特效超棒。"
        zj "是啊，我也很期待这种太空冒险题材。"
    else:
        you "《雨中邂逅》的预告片看起来好浪漫，希望不会失望。"
        zj "哈哈，你就喜欢这种爱情片。"
    
    # 购买零食
    "我们买了爆米花和饮料，走进放映厅。"
    
    # 电影播放中（用描述代替实际播放）
    "电影开始了..."
    pause 5.0  # 暂停5秒模拟看电影
    #这里的pause可以动
    # 此pause可调 但改太久小心小悠跑路
    # 电影结束后的反应
    if movie_choice == "sci-fi":
        menu:
            "觉得很棒":
                zj "太震撼了！那些外星生物的设计太有想象力了。"
                you "是吧！我最喜欢那个黑洞穿越的场景。"
                $ movie_enjoyed = True
                $ you_favor += 15
            "觉得一般":
                zj "剧情有点单薄，不过特效确实不错。"
                you "嗯...可能我期待太高了。"
                $ movie_enjoyed = False
                $ you_favor += 5
    else:
        menu:
            "感动落泪":
                zj "最后男女主在雨中告别的场景太感人了..."
                you "（擦眼泪）是啊，太好哭了！"
                $ movie_enjoyed = True
                $ you_favor += 15
            "觉得俗套":
                zj "这种剧情有点俗套，你不觉得吗？"
                you "（有点失望）可能我就是吃这一套吧..."
                $ movie_enjoyed = False
                $ you_favor -= 5
    
    # 约会后续
    if movie_enjoyed:
        "看完电影后，我们一边讨论剧情一边走出电影院。"
        you "今天真的很开心，谢谢你陪我看电影！"
    else:
        "气氛有些尴尬，我们默默地走出电影院。"
        you "嗯...电影不太好看，不过和你一起出来还是很开心的。"
    
    # 选择后续活动
    menu:
        "邀请吃饭":
            zj "看完电影有点饿了，要不要一起吃晚餐？"
            you "好啊！附近有一家意大利餐厅口碑不错。"
            jump dinner_scene  # 跳转到晚餐场景
        "送她回家":
            zj "时间不早了，我送你回家吧。"
            you "谢谢你，今天过得很愉快！"
            jump end_date  # 跳转到约会结束场景

# === 新增晚餐场景 ===
label dinner_scene:
    scene bg restaurant with dissolve
    play music "audio/bgm/restaurant.ogg" fadein 2.0
    
    "温馨的餐厅里，烛光摇曳。我们点了意大利面和红酒。"#小彩蛋:其实主角不喜欢喝红酒(bushi)
    # 彩蛋：主角讨厌红酒（但为了撩妹忍了）
    show you at left with dissolve
    show zj at right with dissolve
    
    you "这家餐厅的氛围真好。"
    zj "是啊，很适合聊天。"
    
    # 晚餐对话
    if movie_enjoyed:
        # 如果电影看得开心
        zj "今天的电影真不错，下次我们可以再一起看。"
        you "好呀！我知道还有几部新上映的电影值得期待。"
        $ you_favor += 10
    else:
        # 如果电影看得一般
        zj "虽然电影一般，但这家餐厅的意面真不错。"
        you "（笑）是啊，味道超棒！"
        $ you_favor += 5
    
    # 深入对话
    menu:
        "聊兴趣爱好":
            zj "你平时除了画画，还有什么其他爱好吗？"
            you "我喜欢收集水彩颜料，不同品牌的质感很不一样。"
            zj "真的吗？下次可以带我去看看你的收藏吗？"
            you "当然可以！我还有一些自制的色卡呢。"
            $ you_favor += 10
        "聊未来规划":
            zj "你毕业后有什么打算吗？"
            you "我想办一场个人画展，把这些年的作品整理一下。"
            zj "听起来很棒！我相信一定会很成功的。"
            you "谢谢！有你的支持我更有信心了。"
            $ you_favor += 15
    
    # 晚餐结束
    "晚餐结束后，服务员端上了甜点。"
    
    you "这个提拉米苏的口感真好。"
    zj "要不要再来一份？"
    you "（笑着摇头）不用了，再吃就要胖了。"
    
    # 付款
    "我去前台结了账，回到座位时，小悠正望着窗外的夜景发呆。"
    
    jump end_dinner

# === 晚餐后续场景 ===
label end_dinner:
    scene bg street_night with dissolve
    play music "audio/bgm/night_walk.ogg" fadein 2.0
    
    "我们走出餐厅，夜空中闪烁着几颗星星。"
    
    if you_favor >= 60:
        # 好感度足够高，触发牵手
        "走着走着，我们的手不经意间碰到了一起。"
        
        menu:
            "主动牵手":
                zj "（轻轻握住她的手）今晚过得很开心。"
                you "（脸红）我也是...谢谢你。"
                $ you_favor += 20
            "保持距离":
                zj "今天的晚餐很美味，谢谢你的推荐。"
                you "不客气，能和你一起出来我也很开心。"
                $ you_favor += 5
    else:
        "我们并肩走着，偶尔聊上几句。"
    
    # 送回家
    zj "时间不早了，我送你回家吧。"
    you "好的，谢谢你今晚的陪伴。"
    
    jump end_date

# === 约会结束场景 ===
label end_date:
    scene bg room_night with dissolve
    play music "audio/bgm/after_date.ogg" fadein 2.0
    
    "回到家后，我坐在床边，回忆着今晚的点点滴滴。"
    
    if love_interest == "you" and you_favor >= 70:
        # 满足恋爱条件
        "小悠的笑容在我脑海中挥之不去，我知道，我已经喜欢上她了。"
        "手机屏幕亮起，是小悠发来的消息。"
        
        play sound "audio/sfx/notification.ogg"
        ss "小悠：今天过得很开心，期待下次再见面~ ❤️"
        
        zj "（微笑着回复）我也是，晚安。"
        jump end_love
    else:
        # 普通结局
        $ sigma_counter += 1
        "今天和小悠的约会很愉快，但似乎还缺少些什么。"
        "也许，我们还需要更多时间互相了解。"
        jump end_normal

# === 普通结局 ===
#你如果能打出单身线你也是无敌了,你乱选都可以进入小悠线
label end_normal:
    $ sigma_counter += 1  # 每次进入单身结局计数+1
    
    # 西格玛成就检测（2次单身线）
    if sigma_counter >=2 and "sigma_male" not in unlocked_achievements:
        $ unlocked_achievements.append("sigma_male")
        $ should_play_sigma_chapter = True  # 标记需要播放副本
        play sound "audio/sfx/achievement.ogg"
        show screen achievement_popup(achievement_sigma)
        
        # 成就专属嘲讽对话
        scene black with dissolve
        you "（突然出现）听说有人打了[sigma_counter]次单身线？"
        you "知道为什么叫《西格玛男人》吗？"
        you "因为Σ（求和符号）都算不清你的失误次数！"
        you "（甩出一张攻略图）需要放大镜吗？"
        $ enter_sigma_chapter = True  # 设置进入西格玛副本标志
    
    # 普通结局原有内容
    scene bg room_day with fade
    "日子一天天过去，生活依旧平静而美好。"
    "我继续支持着小雅的绘画梦想，也时常和阿明一起打球。"
    "偶尔，我会想起那个在美术用品店遇到的女孩..."
    
    "也许，未来的某一天，我们还会再次相遇。"
    
    stop music fadeout 3.0
    return

# === 恋爱结局 ===
label end_love:
    scene bg apartment with dissolve
    play music "audio/bgm/happy_end.ogg" fadein 2.0
    
    "一年后，我和小悠住在了一起。"
    "回想起我们第一次约会看电影的场景，无论是科幻片的震撼，还是爱情片的浪漫，都是美好的回忆。"
    "如今，她的画作在小型画展上获得了好评，而我也在工作中取得了进步。"
    
    show you at center with dissolve
    show zj at right with dissolve
    
    you "多亏了你的支持，我才能坚持下来。"
    zj "我会一直支持你的梦想。"
    
    "我们相视一笑，窗外的阳光洒在我们身上。"
    
    "生活还在继续，而我们的故事，才刚刚开始。"
    
    stop music fadeout 3.0
    return

# === 新增西格玛男人专属副本 ===
label sigma_chapter:
    # 特殊副本音乐 - 使用搞笑的音效
    play music "audio/sfx/achievement.ogg" fadein 2.0
    
    scene bg room_day with fade
    "当你再次睁开眼时，发现世界变得有些不同..."
    
    show you at center with dissolve
    you "（穿着西格玛男人T恤）欢迎来到西格玛男人专属副本！"
    you "这里是为那些精准避开所有恋爱选项的单身贵族准备的！"
    
    menu:
        "我为什么会在这里？":
            you "因为你在正常游戏中达成了2次单身结局！"
            you "系统判定你是个纯正的Σ（西格玛）男人！"
        "西格玛男人是什么？":
            you "西格玛男人是独立、自信、不依赖女性认同的顶级单身贵族！"
            you "简单说，就是凭实力单身的男人！"
    
    scene bg sigma_arena with dissolve
    "你被传送到了一个特殊的竞技场。"
    show friend at right with dissolve
    friend "嘿，兄弟！欢迎来到西格玛俱乐部！"
    friend "在这里，我们将进行最纯粹的单身技能比拼！"
    
    menu:
        "什么技能比拼？":
            friend "第一关：精准避开所有示好信号！"
            friend "第二关：在约会邀请出现时立即拒绝！"
            friend "第三关：把女性朋友处成哥们！"
        "有什么奖励？":
            friend "奖励？兄弟，单身就是最大的奖励！"
            friend "自由！独立！不受约束！"
    
    "突然，一个巨大的转盘出现在场中央。"
    show sister at left with dissolve
    sister "哥！这是你的西格玛男人认证转盘！"
    sister "转到什么技能，就能获得什么单身超能力！"
    
    # 转盘小游戏
    "转盘开始旋转..."
    $ sigma_power = renpy.random.choice(["永久单身光环", "恋爱雷达干扰器", "钢铁直男护盾", "把妹绝缘体"])
    "转盘停在了[sigma_power]上！"
    
    sister "恭喜！你获得了[sigma_power]！"
    
    if sigma_power == "永久单身光环":
        "一道金光笼罩了你，你感觉自己的单身气场增强了十倍！"
    elif sigma_power == "恋爱雷达干扰器":
        "你获得了一个小装置，能自动屏蔽周围十米内的恋爱信号！"
    elif sigma_power == "钢铁直男护盾":
        "一层无形的护盾包裹着你，所有暧昧话语都会被自动转换成兄弟对话！"
    else:
        "你获得了终极能力：任何试图接近你的女性都会自动变成你的好兄弟！"
    
    show you at center with dissolve
    you "现在，让我们进行终极测试！"
    you "我会尝试邀请你约会，看看你的西格玛功力！"
    
    # 测试环节
    you "诗蓝，今晚有部新电影上映，要一起去看吗？"
    menu:
        "（使用西格玛能力）直接拒绝":
            zj "不用了，我今晚要在家研究篮球战术。"
            you "完美！这才是真正的西格玛男人！"
            $ sigma_score = 100
        "犹豫一下再拒绝":
            zj "呃...这个...我还是不去了吧。"
            you "不错，但还不够纯粹！"
            $ sigma_score = 80
        "差点答应但及时止住":
            zj "好啊...等等！不对！我是西格玛男人！不去！"
            you "勉强及格，需要更多训练！"
            $ sigma_score = 60
    
    # 评分环节
    "你的西格玛男人评分：[sigma_score]/100"
    
    if sigma_score == 100:
        you "恭喜！你是个纯粹的西格玛男人！"
        "你被授予了纯金打造的'西格玛男人'徽章！"
    else:
        you "还需要更多训练，兄弟！"
        you "记住：真正的西格玛男人从不犹豫！"
    
    # 副本结束
    scene bg room_day with fade
    "当你再次睁开眼，发现自己回到了房间。"
    "刚才的经历是梦吗？但口袋里的[sigma_power]装置证明了一切都是真实的..."
    
    "你决定继续享受单身贵族的自由生活。"
    $ enter_sigma_chapter = False  # 重置副本标志
    return

# === 新增成就相关样式 ===
style achievement_header:
    size 45
    color "#FFFFFF"
    outlines [(2, "#000000", 0, 0)]
    xalign 0.5

style achievement_title:
    size 30
    color "#FFD700"
    bold True

style achievement_desc:
    size 20
    color "#AAAAAA"