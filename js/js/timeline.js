window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

function renderFullTimeline() {
            const container = document.getElementById('timelineList');
            if (!container) return;

            const data = window.timelineData;
            if (!data || !data.length) {
                container.innerHTML = '<div class="empty-msg"><i class="fas fa-inbox"></i><p>暂无更新记录喵～</p></div>';
                return;
            }

            // 从旧到新排列
            const sorted = data.slice().reverse();

            container.innerHTML = sorted.map((item, index) => {
                const desc = item.desc ? item.desc.replace(/\n/g, '<br>') : '';
                return `
                    <div class="tl-item" style="animation-delay: ${index * 0.05}s">
                        <div class="tl-line"></div>
                        <div class="tl-dot"></div>
                        <div class="tl-card">
                            <div class="tl-date"><i class="far fa-calendar-alt"></i> ${item.date}</div>
                            <div class="tl-title">${item.title}</div>
                            ${desc ? `<div class="tl-desc">${desc}</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        document.addEventListener('DOMContentLoaded', renderFullTimeline);