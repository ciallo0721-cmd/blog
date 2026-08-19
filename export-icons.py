#!/usr/bin/env python3
"""导出24个后台管理线性图标为独立SVG文件 - 修正版"""

import os

OUTPUT_DIR = r"G:\EmoScan Pro\ciallo0721-cmd.github.io\css\svg"

ICONS = {
    "home": (
        "首页",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "user": (
        "用户",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "settings": (
        "设置",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M19.4 15C19.1277 15.6171 19.2588 16.3377 19.658 16.8581L19.7246 16.9577C20.2228 17.6856 20.0165 18.6573 19.2886 19.1682L19.1817 19.2412C18.7184 19.558 18.2726 19.9182 17.8186 20.3822L17.6736 20.5271C17.1385 21.0622 16.2757 21.0522 15.7644 20.5252L15.6823 20.4414C15.2043 19.9177 14.5728 19.5 13.9091 19.5H10.0909C9.42718 19.5 8.79571 19.9177 8.31767 20.4414L8.23556 20.5252C7.72435 21.0622 6.86151 21.0622 6.32637 20.5271L6.18138 20.3822C5.72737 19.9182 5.28158 19.558 4.81826 19.2412L4.71136 19.1682C3.98349 18.6573 3.77723 17.6856 4.27542 16.9577L4.34196 16.8581C4.7412 16.3377 4.87233 15.6171 4.6 15H4.50988C3.73027 15 3.00093 14.5527 3.00093 14V13.5C3.00093 12.9477 2.55222 12.5 2 12.5C1.44772 12.5 1 12.0523 1 11.5V11C1 10.4477 1.44772 10 2 10H2.49012C3.26973 10 3.99907 9.55272 3.99907 9V8.5C3.99907 7.94772 4.44778 7.5 5 7.5H5.49012C6.26973 7.5 6.99907 7.05272 6.99907 6.5V6C6.99907 5.44772 7.44778 5 8 5H8.5C9.05228 5 9.5 4.55228 9.5 4V3.5C9.5 2.94772 9.94772 2.5 10.5 2.5H13.5C14.0523 2.5 14.5 2.94772 14.5 3.5V4C14.5 4.55228 14.9477 5 15.5 5H16C16.5523 5 17 5.44772 17 6V6.5C17 7.05228 17.4477 7.5 18 7.5H18.4901C19.2697 7.5 19.9991 7.94772 19.9991 8.5V9C19.9991 9.55228 20.4478 10 21 10H21.5C22.0523 10 22.5 10.4477 22.5 11V11.5C22.5 12.0523 22.0523 12.5 21.5 12.5C21.0523 12.5 20.6056 12.9477 20.6056 13.5V14C20.6056 14.5523 20.1579 15 19.6056 15H19.4Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M15 15C13.3431 15 12 13.6569 12 12C12 10.3431 13.3431 9 15 9C16.6569 9 18 10.3431 18 12C18 13.6569 16.6569 15 15 15Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "data": (
        "数据",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "orders": (
        "订单",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M7 10H17M7 14H13' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "products": (
        "商品",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M12 12V15M12 18H12.01' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "messages": (
        "消息",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M21 12C21 16.4183 16.9706 20 12 20C10.7869 20 9.63058 19.8109 8.5749 19.4567L4 21L5.42065 17.1168C3.95485 15.7791 3 13.9951 3 12C3 7.58172 7.02944 4 12 4C16.9706 4 21 7.58172 21 12Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "notifications": (
        "通知",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M15 17H15.01M15 9V12M12 3H20.408C20.7379 3 21.0522 3.11471 21.3046 3.32487C21.557 3.53502 21.7334 3.82823 21.8124 4.15804C21.8915 4.48786 21.8692 4.8374 21.7484 5.15412C21.6276 5.47083 21.414 5.74082 21.13 5.93L13.27 11.07C12.8786 11.3242 12.5695 11.6569 12.3625 12.0493C12.1555 12.4417 12.0559 12.8841 12.07 13.33V17L9 21V13.33C9.03421 12.4418 9.31374 11.5984 9.80394 10.8944C10.2941 10.1904 10.9774 9.65767 11.78 9.36L15 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H17C18.1046 21 19 20.1046 19 19V9L15 3Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "permissions": (
        "权限",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M12 15V17M6.6 21H17.4C17.5591 21 17.7165 20.9837 17.8678 20.9517C18.0191 20.9196 18.1622 20.8722 18.2932 20.8107C18.4242 20.7493 18.5419 20.6744 18.6434 20.5882C18.7449 20.502 18.8294 20.4054 18.8945 20.3005C18.9595 20.1955 19.0047 20.0831 19.0287 19.9663C19.0527 19.8495 19.0552 19.7294 19.0361 19.6112C19.017 19.493 18.9765 19.3782 18.9157 19.2707C18.8549 19.1632 18.7744 19.0642 18.6769 18.977C18.5794 18.8898 18.4656 18.8155 18.3384 18.7562C18.2112 18.6969 18.072 18.6532 17.9251 18.6262C17.7782 18.5992 17.6251 18.5892 17.47 18.5964H6.53C6.37493 18.5892 6.22182 18.5992 6.0749 18.6262C5.92798 18.6532 5.78883 18.6969 5.66161 18.7562C5.53439 18.8155 5.4206 18.8898 5.32306 18.977C5.22552 19.0642 5.14511 19.1632 5.08429 19.2707C5.02348 19.3782 4.98298 19.493 4.96387 19.6112C4.94476 19.7294 4.94725 19.8495 4.97125 19.9663C4.99525 20.0831 5.04051 20.1955 5.10552 20.3005C5.17054 20.4054 5.25508 20.502 5.35661 20.5882C5.45814 20.6744 5.57585 20.7493 5.70684 20.8107C5.83783 20.8722 5.98091 20.9196 6.13224 20.9517C6.28357 20.9837 6.44093 21 6.6 21ZM12 3C10.3434 3 8.79395 3.50011 7.5 4.39349C6.20605 5.28688 5.22681 6.53322 4.68505 7.96618C4.14329 9.39914 4.05737 10.9634 4.43673 12.4447C4.81609 13.926 5.65045 15.2867 6.82843 16.3394M12 3L14 7M12 3C13.6566 3 15.2061 3.50011 16.5 4.39349C17.7939 5.28688 18.7732 6.53322 19.3149 7.96618C19.8566 9.39914 19.9426 10.9634 19.5633 12.4447C19.1839 13.926 18.3495 15.2867 17.1716 16.3394L19.0711 18.364M14 7H19.2M14 7L15.5 9.5' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "roles": (
        "角色",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M17 20C17 18.3431 15.6569 17 14 17H10C8.34315 17 7 18.3431 7 20M21 17C21 15.3431 19.6569 14 18 14C18 15.1046 17.1046 16 16 16C14.8954 16 14 15.1046 14 14C14 15.1046 13.1046 16 12 16C10.8954 16 10 15.1046 10 14C10 15.1046 9.10455 16 8 16C6.89545 16 6 15.1046 6 14C4.34315 14 3 15.3431 3 17V19C3 20.1046 3.89545 21 5 21H19C20.1046 21 21 20.1046 21 19V17Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<circle cx='12' cy='7' r='4' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "logs": (
        "日志",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5V3M9 5H15M15 5V3M9 5H7M9 14L11 16L15 12' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "menu": (
        "菜单",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M4 6H20M4 12H20M4 18H20' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "dashboard": (
        "仪表盘",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<rect x='3' y='3' width='7' height='7' rx='1' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<rect x='14' y='3' width='7' height='7' rx='1' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<rect x='3' y='14' width='7' height='7' rx='1' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<rect x='14' y='14' width='7' height='7' rx='1' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "statistics": (
        "统计",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M18 20V10M12 20V4M6 20V14' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "export": (
        "导出",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M4 16V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V16M8 12L12 16M12 16L16 12M12 16V4' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "import": (
        "导入",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M4 16V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V16M8 8L12 4M12 4L16 8M12 4V16' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "search": (
        "搜索",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<circle cx='11' cy='11' r='8' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M21 21L16.65 16.65' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "filter": (
        "过滤",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M22 3H2L10 12.46V19L14 21V12.46L22 3Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "edit": (
        "编辑",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M15.5355 3.96447L20.0355 8.46447M2 22L7.87868 16.1213M7.87868 16.1213L14.1213 9.87868M7.87868 16.1213L9.46447 17.7071L3.22182 23.9497L1.63604 22.3639L7.87868 16.1213Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "delete": (
        "删除",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M4 7H20M10 11V17M14 11V17M5 7L6 19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19L19 7M9 7V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V7' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "add": (
        "添加",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "refresh": (
        "刷新",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M4 4V9H9M20 20V15H15M20.1533 4.15336C18.3499 2.36175 15.8477 1.31859 13.1653 1.06695C10.4829 0.815305 7.77999 1.37188 5.41397 2.6494C3.04794 3.92692 1.14899 5.87687 0.0319406 8.28664C-1.08611 10.6964 -1.4333 13.4377 -0.954531 16.0733C-0.475762 18.7089 0.712946 21.0596 2.46447 22.8111C4.216 24.5626 6.43855 25.7513 8.88929 26.238C11.34 26.7247 13.8998 26.4954 16.2475 25.5774C18.5952 24.6594 20.6169 23.0877 22.0509 21.0355C23.4849 18.9833 24.2916 16.5327 24.36 14.0004L20.1533 14.1534C20.1033 16.1173 19.3664 18.0099 18.031 19.5355C16.6956 21.0611 14.8468 22.1296 12.7567 22.5495C10.6666 22.9695 8.48286 22.7225 6.53021 21.8402C4.57755 20.9579 2.98472 19.4856 1.95948 17.6146C0.934232 15.7435 0.534179 13.5933 0.820898 11.4744C1.10762 9.3555 2.06854 7.41383 3.53552 5.94685C5.0025 4.47987 6.91433 3.51894 9.03227 3.23222C11.1502 2.9455 13.2994 3.34555 15.1533 4.37079L14.1533 8.15336L20.1533 4.15336Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "favorite": (
        "收藏",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<path d='M12 17.27L18.18 21.02L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21.02L12 17.27Z' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>"
    ),
    "help": (
        "帮助",
        "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>"
        "<circle cx='12' cy='12' r='10' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<path d='M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03959C13.1255 7.16024 13.7588 7.5259 14.2151 8.08247C14.6713 8.63903 14.9251 9.34619 14.9251 10.08C14.9251 12 11.9251 13 11.9251 15' stroke='#64748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>"
        "<circle cx='12' cy='18' r='0.5' fill='#64748B' stroke='#64748B' stroke-width='1'/></svg>"
    ),
}

def main():
    import os
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    count = 0
    for filename, (chinese_name, svg_content) in ICONS.items():
        path = os.path.join(OUTPUT_DIR, filename + ".svg")
        with open(path, "w", encoding="utf-8") as f:
            f.write(svg_content)
        print("  [OK] " + chinese_name + "  ->  " + filename + ".svg")
        count += 1
    print("\n共导出 " + str(count) + " 个图标到:\n  " + OUTPUT_DIR)

if __name__ == "__main__":
    main()
