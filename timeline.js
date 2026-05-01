// timeline.js - 时间线数据源
// 由 admin.py 管理，请勿手动修改
// 最后更新：2026-05-01 05:07:59

window.timelineData = [
        {
            date: "2026年05月01日",
            title: "自动发布 · 再见，白菜",
            desc: "定时文章《再见，白菜》已自动发布！"
        }
        ];

        function escapeHtml(str) {
            var d = document.createElement("div");
            d.textContent = String(str);
            return d.innerHTML;
        }
        function renderTimeline() {
            var list = document.getElementById("timelineList");
            if (!list || !window.timelineData) return;
            list.innerHTML = window.timelineData.map(function(item, i) {
                var safeDate  = escapeHtml(item.date  || '');
                var safeTitle = escapeHtml(item.title || '');
                var safeDesc  = item.desc ? escapeHtml(item.desc) : '';
                return '<div class="timeline-item" style="animation-delay:' + (i * 0.08) + 's">'
                    + '<div class="timeline-date"><i class="fas fa-calendar-alt" style="margin-right:6px;"></i>' + safeDate + '</div>'
                    + '<div class="timeline-content">'
                    + '<div class="timeline-title">' + safeTitle + '</div>'
                    + (safeDesc ? '<p class="timeline-desc">' + safeDesc + '</p>' : '')
                    + '</div></div>';
            }).join('');
        }
        document.addEventListener('DOMContentLoaded', renderTimeline);