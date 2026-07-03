#!/usr/bin/env python3
"""
GA4 每周数据报告生成器

通过 Google Analytics Data API 拉取最近 7 天的网站数据，
与上周对比，生成 report-data.js 供 weekly-report 页面展示。

触发：GitHub Actions 每周一自动运行
数据好 → 开头用 "good everyday"
数据差 → 开头用 "hello everyone"
"""

import json
import os
import sys
from datetime import datetime, timedelta, timezone

# ── 配置 ──────────────────────────────────────────
PROPERTY_ID = os.environ.get("GA4_PROPERTY_ID", "")
CREDENTIALS_JSON = os.environ.get("GA4_SERVICE_ACCOUNT_KEY", "")
DATA_FILE = "weekly-report/report-data.js"
TZ_SHANGHAI = timezone(timedelta(hours=8))

# ── 指标定义 ──────────────────────────────────────
METRICS_DEF = [
    {"name": "activeUsers"},
    {"name": "newUsers"},
    {"name": "totalUsers"},
    {"name": "screenPageViews"},
    {"name": "sessions"},
    {"name": "averageSessionDuration"},
    {"name": "bounceRate"},
    {"name": "eventCount"},
    {"name": "engagedSessions"},
]

# 用于判断好坏的指标（为主指标）
JUDGE_METRIC = "activeUsers"


def make_client():
    """用服务账号密钥初始化 GA4 Data API 客户端。"""
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        RunReportRequest,
        DateRange,
        Metric,
    )
    from google.oauth2 import service_account

    info = json.loads(CREDENTIALS_JSON)
    creds = service_account.Credentials.from_service_account_info(
        info,
        scopes=["https://www.googleapis.com/auth/analytics.readonly"],
    )
    return BetaAnalyticsDataClient(credentials=creds)


def fetch_metrics(client, start_date: str, end_date: str) -> dict:
    """拉取指定日期范围的 GA4 指标。

    Args:
        client: 已认证的 GA4 Data API 客户端
        start_date: 起始日期 (YYYY-MM-DD)
        end_date: 结束日期 (YYYY-MM-DD)

    Returns:
        dict: {metric_name: value}
    """
    from google.analytics.data_v1beta.types import (
        RunReportRequest,
        DateRange,
        Metric,
    )

    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        metrics=[Metric(name=m["name"]) for m in METRICS_DEF],
    )

    try:
        response = client.run_report(request)
    except Exception as e:
        print(f"⚠️  API 请求失败 ({start_date} ~ {end_date}): {e}", file=sys.stderr)
        return {}

    result = {}
    if response.rows:
        row = response.rows[0]
        for i, metric in enumerate(METRICS_DEF):
            val = row.metric_values[i].value
            name = metric["name"]
            # 数值型指标转换
            if name in ("averageSessionDuration",):
                result[name] = round(float(val), 1)
            elif name in ("bounceRate",):
                result[name] = round(float(val) * 100, 1)
            else:
                result[name] = int(val)
    else:
        # 无数据时全部返回 0
        for m in METRICS_DEF:
            result[m["name"]] = 0

    return result


def format_number(n) -> str:
    """美化数字（千分位）。"""
    if isinstance(n, float):
        return f"{n:,.1f}"
    return f"{n:,}"


def format_duration(seconds: float) -> str:
    """把秒数转成易读格式。"""
    if seconds < 60:
        return f"{int(seconds)}秒"
    m = int(seconds // 60)
    s = int(seconds % 60)
    if m < 60:
        return f"{m}分{s}秒"
    h = m // 60
    m = m % 60
    return f"{h}小时{m}分"


def generate_report() -> dict:
    """生成完整的周报数据。"""
    today = datetime.now(TZ_SHANGHAI).date()

    # 本周：过去 7 天（不含今天）
    this_end = today - timedelta(days=1)
    this_start = this_end - timedelta(days=6)

    # 上周：再往前 7 天
    last_end = this_start - timedelta(days=1)
    last_start = last_end - timedelta(days=6)

    print(f"📊 本周范围: {this_start} ~ {this_end}")
    print(f"📊 上周范围: {last_start} ~ {last_end}")

    # 初始化客户端
    client = make_client()

    # 并行拉取
    this_metrics = fetch_metrics(
        client,
        this_start.strftime("%Y-%m-%d"),
        this_end.strftime("%Y-%m-%d"),
    )
    last_metrics = fetch_metrics(
        client,
        last_start.strftime("%Y-%m-%d"),
        last_end.strftime("%Y-%m-%d"),
    )

    if not this_metrics or not last_metrics:
        print("❌ 数据拉取失败，中止", file=sys.stderr)
        sys.exit(1)

    # 判断好坏
    this_val = this_metrics.get(JUDGE_METRIC, 0)
    last_val = last_metrics.get(JUDGE_METRIC, 0)

    if this_val >= last_val:
        greeting = "good everyday"
        greeting_cn = "本周表现不错喵～"
    else:
        greeting = "hello everyone"
        greeting_cn = "本周有点平淡呢…"

    # 计算变化百分比
    changes = {}
    for name in this_metrics:
        cur = this_metrics[name]
        prev = last_metrics.get(name, 0)
        if prev == 0 and cur == 0:
            changes[name] = 0
        elif prev == 0:
            changes[name] = 100 if cur > 0 else 0
        else:
            pct = round((cur - prev) / prev * 100, 1)
            changes[name] = pct

    # 生成自然语言总结
    summary = build_summary(this_metrics, last_metrics, changes, greeting_cn)

    return {
        "weekEnding": this_end.strftime("%Y-%m-%d"),
        "weekStart": this_start.strftime("%Y-%m-%d"),
        "lastWeekStart": last_start.strftime("%Y-%m-%d"),
        "lastWeekEnd": last_end.strftime("%Y-%m-%d"),
        "generatedAt": datetime.now(TZ_SHANGHAI).strftime("%Y-%m-%d %H:%M"),
        "greeting": greeting,
        "greetingCn": greeting_cn,
        "isGood": this_val >= last_val,
        "summary": summary,
        "metrics": {
            "thisWeek": this_metrics,
            "lastWeek": last_metrics,
            "changes": changes,
        },
    }


def build_summary(this_metrics, last_metrics, changes, greeting_cn) -> str:
    """用中文生成一段自然语言总结。"""
    au = this_metrics.get("activeUsers", 0)
    pv = this_metrics.get("screenPageViews", 0)
    nu = this_metrics.get("newUsers", 0)
    sessions = this_metrics.get("sessions", 0)
    duration = this_metrics.get("averageSessionDuration", 0)
    bounce = this_metrics.get("bounceRate", 0)

    au_chg = changes.get("activeUsers", 0)
    pv_chg = changes.get("screenPageViews", 0)

    direction_au = "上升" if au_chg >= 0 else "下降"
    direction_pv = "上升" if pv_chg >= 0 else "下降"

    return (
        f"{greeting_cn}本周共有 {format_number(au)} 位活跃用户访问了网站，"
        f"较上周{direction_au}了 {abs(au_chg)}%。"
        f"页面浏览量达到 {format_number(pv)} 次，较上周{direction_pv}了 {abs(pv_chg)}%。"
        f"新增了 {format_number(nu)} 位新朋友，发起了 {format_number(sessions)} 次会话。"
        f"平均每次停留 {format_duration(duration)}，跳出率为 {bounce}%。"
    )


def update_data_file(report: dict):
    """更新 report-data.js，在数组头部插入新报告（保留最近 26 周）。"""
    # 读取现有数据
    existing_reports = []
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            content = f.read()
        # 从 JS 变量中提取 JSON 数组
        prefix = "window.weeklyReports = "
        if prefix in content:
            json_str = content[len(prefix):].strip().rstrip(";")
            try:
                existing_reports = json.loads(json_str)
            except json.JSONDecodeError:
                print("⚠️  解析现有数据失败，从空数据开始", file=sys.stderr)
                existing_reports = []

    # 检查是否已存在本周报告
    week_key = report["weekEnding"]
    existing_reports = [r for r in existing_reports if r.get("weekEnding") != week_key]

    # 插入到头部
    existing_reports.insert(0, report)

    # 只保留最近 26 周（半年）
    existing_reports = existing_reports[:26]

    # 写入文件
    os.makedirs(os.path.dirname(DATA_FILE) or ".", exist_ok=True)
    js = f"window.weeklyReports = {json.dumps(existing_reports, ensure_ascii=False, indent=2)};\n"
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        f.write(js)

    print(f"✅ 已写入 {len(existing_reports)} 条周报记录到 {DATA_FILE}")


def main():
    if not PROPERTY_ID:
        print("❌ 缺少 GA4_PROPERTY_ID 环境变量", file=sys.stderr)
        sys.exit(1)
    if not CREDENTIALS_JSON:
        print("❌ 缺少 GA4_SERVICE_ACCOUNT_KEY 环境变量", file=sys.stderr)
        sys.exit(1)

    print("🚀 GA4 周报生成器启动")
    report = generate_report()
    print(f"📝 开头语: {report['greeting']}")
    print(f"📝 总结: {report['summary']}")

    update_data_file(report)

    # 输出到 GitHub Actions output
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"greeting={report['greeting']}\n")
            f.write(f"is_good={'true' if report['isGood'] else 'false'}\n")
            f.write(f"active_users={report['metrics']['thisWeek'].get('activeUsers', 0)}\n")
            f.write(f"page_views={report['metrics']['thisWeek'].get('screenPageViews', 0)}\n")


if __name__ == "__main__":
    main()
