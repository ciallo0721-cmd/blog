import re
from datetime import datetime, timezone, timedelta, date

# ========== 配置 ==========

# 春节日期查找表（正月初一，2027-2035）
CNY_DATES = {
    2027: (2, 6),
    2028: (1, 26),
    2029: (2, 13),
    2030: (2, 3),
    2031: (1, 23),
    2032: (2, 12),
    2033: (1, 31),
    2034: (2, 19),
    2035: (2, 8),
}

# 春节公告显示范围：除夕（-1天）到初六（+6天）
CNY_RANGE_DAYS = 8  # 覆盖除夕到初六

# 端午节查找表（农历五月初五，2026-2035）
DUANWU_DATES = {
    2026: (6, 19),
    2027: (6, 9),
    2028: (5, 28),
    2029: (6, 16),
    2030: (6, 5),
    2031: (6, 24),
    2032: (6, 12),
    2033: (6, 1),
    2034: (6, 20),
    2035: (6, 10),
}

# 重阳节查找表（农历九月初九，2026-2035）
CHONGYANG_DATES = {
    2026: (10, 18),
    2027: (10, 8),
    2028: (10, 26),
    2029: (10, 16),
    2030: (10, 5),
    2031: (10, 24),
    2032: (10, 12),
    2033: (10, 1),
    2034: (10, 20),
    2035: (10, 9),
}

# 中元节查找表（农历七月十五，2026-2035）
ZHONGYUAN_DATES = {
    2026: (8, 27),
    2027: (8, 16),
    2028: (9, 3),
    2029: (8, 24),
    2030: (8, 13),
    2031: (9, 1),
    2032: (8, 20),
    2033: (8, 9),
    2034: (8, 28),
    2035: (8, 18),
}

# 中秋节查找表（农历八月十五，2026-2035）
ZHONGQIU_DATES = {
    2026: (9, 25),
    2027: (9, 15),
    2028: (10, 3),
    2029: (9, 22),
    2030: (9, 12),
    2031: (10, 1),
    2032: (9, 19),
    2033: (9, 8),
    2034: (9, 27),
    2035: (9, 16),
}

# 节日文案定义：(month, day) -> (标题, 公告HTML内容)
HOLIDAYS = {
    (1, 1): ("元旦",
        '<p>🎉 元旦快乐喵！新的一年的说～愿所有美好如约而至，万事胜意！</p>'
    ),
    (3, 8): ("妇女节",
        '<p>🌸 妇女节快乐喵～致敬每一位闪耀的她，愿你们被世界温柔以待的说！</p>'
    ),
    (5, 1): ("劳动节",
        '<p>💪 劳动节快乐喵！勤劳的小伙伴们辛苦了，好好休息犒劳自己一下吧～</p>'
    ),
    (5, 4): ("青年节",
        '<p>🔥 青年节快乐喵～青春正当时，不负韶华，勇敢追梦的说！</p>'
    ),
    (5, 24): ("站长生日",
        '<p>🎂 站长生日喵！感谢大家的支持与陪伴，新的一岁继续加油的说～</p>'
    ),
    (6, 7): ("高考",
        '<p>📚 高考加油喵！愿所有考生笔下生花，金榜题名，前程似锦的说～放下包袱，正常发挥就好！</p>'
    ),
    (6, 18): ("618购物节",
        '<p>🛒 618来啦的说～理性消费快乐买买买，看好自己的钱包喵！</p>'
    ),
    (6, 26): ("国际禁毒日",
        '<p>🚫 珍爱生命，远离毒品。健康生活，从我做起的说喵～</p>'
    ),
    (7, 1): ("七一建党节",
        '<p>🇨🇳 七一建党节，不忘初心，砥砺前行的说喵～</p>'
    ),
    (8, 1): ("八一建军节",
        '<p>🇨🇳 八一建军节，致敬最可爱的人！感谢守护家国的每一位军人喵～</p>'
    ),
    (8, 15): ("日本投降纪念日",
        '<p>🕊️ 铭记历史，珍爱和平。吾辈当自强的说喵～</p>'
    ),
    (9, 1): ("开学季",
        '<p>📖 开学季喵～新的学期新气象，flag立起来，冲冲冲的说！</p>'
    ),
    (9, 3): ("抗战胜利纪念日",
        '<p>🕊️ 纪念抗日战争胜利，珍惜来之不易的和平。铭记历史，吾辈自强的说喵～</p>'
    ),
    (9, 10): ("教师节",
        '<p>📚 教师节快乐喵！感谢每一位辛勤付出的老师，您辛苦了的说～</p>'
    ),
    (9, 18): ("九一八纪念日",
        '<p>🕯️ 勿忘国耻，吾辈自强。铭记历史，珍爱和平的说喵～</p>'
    ),
    (9, 21): ("国际和平日",
        '<p>🕊️ 国际和平日喵～愿世界没有战争与纷争，和平永驻，人人安好的说！</p>'
    ),
    (10, 1): ("国庆节",
        '<p>🇨🇳 国庆快乐喵！祝祖国繁荣昌盛，大家假期愉快的说～</p>'
    ),
    (10, 23): ("建站纪念日",
        '<p>🎂 建站纪念日快乐喵！感谢一路相伴，未来继续一起走下去的说～</p>'
    ),
    (10, 31): ("万圣节",
        '<p>🎃 不给糖就捣蛋！万圣节快乐喵～今晚会做美梦的说～</p>'
    ),
    (12, 4): ("国家宪法日",
        '<p>📜 国家宪法日，弘扬法治精神，共建法治社会的说喵～</p>'
    ),
    (12, 13): ("国家公祭日",
        '<p>🕯️ 铭记历史，祭奠同胞。勿忘国耻，吾辈自强的说喵～</p>'
    ),
    (12, 24): ("平安夜",
        '<p>🎄 平安夜快乐喵～愿平安喜乐伴你左右的说～</p>'
    ),
    (12, 25): ("圣诞节",
        '<p>🎄 圣诞节快乐喵～愿你收到的都是好消息的说～</p>'
    ),
}

# 默认公告（无节日时显示）
DEFAULT_CONTENT = (
    '<p>网站正在持续更新中，如果发现问题或有建议，欢迎在 '
    '<a href="./adss.html" style="color:#3366ff;text-decoration:none;font-weight:600;">联系页面</a> '
    '告诉我的说～</p>'
)


# ========== 逻辑 ==========

def get_today_cst():
    """获取北京时间今天的日期"""
    return datetime.now(timezone(timedelta(hours=8))).date()


def is_cny_period(today):
    """判断是否在春节期间"""
    year = today.year
    if year in CNY_DATES:
        cny_month, cny_day = CNY_DATES[year]
        cny_start = date(year, cny_month, cny_day) - timedelta(days=1)  # 除夕
        cny_end = cny_start + timedelta(days=CNY_RANGE_DAYS - 1)        # 初六
        if cny_start <= today <= cny_end:
            return True, cny_start
    return False, None


def get_cny_content(cny_start):
    """生成春节公告内容"""
    year = cny_start.year + 1  # 春节所在的农历年
    zodiac_map = {2027: "🐑", 2028: "🐒", 2029: "🐔", 2030: "🐶",
                  2031: "🐷", 2032: "🐭", 2033: "🐮", 2034: "🐯", 2035: "🐰"}
    zodiac = zodiac_map.get(year, "🎉")
    return (
        f'<p>{zodiac} 春节快乐喵！除夕到初六，吃好喝好玩好，新的一年万事如意的说～</p>'
    )


def nth_weekday_of_month(year, month, weekday, n):
    """计算某月第 n 个星期几的日期
    weekday: 0=周一, 1=周二, ..., 6=周日
    n: 第几个（1=第一个）
    """
    first_day = date(year, month, 1)
    # 第一天是星期几（0=周一, 6=周日）
    first_weekday = first_day.weekday()
    # 到目标星期几需要的偏移
    diff = (weekday - first_weekday) % 7
    target_day = 1 + diff + (n - 1) * 7
    return date(year, month, target_day)


def get_holiday_for_today(today):
    """返回今天的节日内容，如果没有则返回 None"""
    # 先检查春节（农历，范围覆盖）
    is_cny, cny_start = is_cny_period(today)
    if is_cny:
        return get_cny_content(cny_start)

    year = today.year

    # 检查端午节（农历五月初五）
    if year in DUANWU_DATES:
        dw = DUANWU_DATES[year]
        if (today.month, today.day) == dw:
            return '<p>🐉 端午节快乐喵～吃粽子赛龙舟，端午安康，好运连连的说！</p>'

    # 检查重阳节（农历九月初九）
    if year in CHONGYANG_DATES:
        cy = CHONGYANG_DATES[year]
        if (today.month, today.day) == cy:
            return '<p>🏔️ 重阳节快乐喵～登高望远，敬老爱老，愿家人平安健康的说！</p>'

    # 检查中元节（农历七月十五）
    if year in ZHONGYUAN_DATES:
        zy = ZHONGYUAN_DATES[year]
        if (today.month, today.day) == zy:
            return '<p>🕯️ 中元节安康喵～追思先人，心怀感恩，平安是福的说～</p>'

    # 检查中秋节（农历八月十五）
    if year in ZHONGQIU_DATES:
        zq = ZHONGQIU_DATES[year]
        if (today.month, today.day) == zq:
            return '<p>🌙 中秋节快乐喵～月圆人团圆，吃月饼赏明月，幸福美满的说！</p>'

    # 检查母亲节（5月第2个星期日）
    mothers_day = nth_weekday_of_month(year, 5, 6, 2)  # 6=周日
    if today == mothers_day:
        return '<p>💐 母亲节快乐喵～感谢妈妈的无私付出，记得抱抱麻麻说声我爱你的说！</p>'

    # 检查父亲节（6月第3个星期日）
    fathers_day = nth_weekday_of_month(year, 6, 6, 3)  # 6=周日
    if today == fathers_day:
        return '<p>👔 父亲节快乐喵～感谢爸爸的默默守护，爸爸辛苦了的说！</p>'

    # 检查固定节日
    key = (today.month, today.day)
    if key in HOLIDAYS:
        return HOLIDAYS[key][1]

    return None


def update_announcement(filepath, new_content):
    """替换 index.html 中 <!--ANN:START--> 和 <!--ANN:END--> 之间的内容"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    pattern = r'<!--ANN:START-->.*?<!--ANN:END-->'
    replacement = f'<!--ANN:START-->\n            {new_content}\n            <!--ANN:END-->'

    new_content_full, count = re.subn(pattern, replacement, content, flags=re.DOTALL)

    if count == 0:
        print("❌ 未找到 ANN 标记，无法更新公告！")
        return False

    if new_content_full == content:
        print("📋 公告内容无变化，跳过更新")
        return False

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content_full)

    print(f"✅ 公告已更新（共替换 {count} 处）")
    return True


# ========== 主流程 ==========

today = get_today_cst()
print(f"📅 当前北京时间：{today}")

holiday_content = get_holiday_for_today(today)

if holiday_content:
    print(f"🎊 检测到节日，更新公告")
    changed = update_announcement("index.html", holiday_content)
else:
    print(f"📋 今日无特殊节日，使用默认公告")
    changed = update_announcement("index.html", DEFAULT_CONTENT)

if not changed:
    print("✅ 无需更新，正常退出")
    exit(0)

print("✅ 公告更新完成")
