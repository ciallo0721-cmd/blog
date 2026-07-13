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

(function() {
        // ─── Usage Counter ──────────────────────────────
        function getUsageCount() {
            const stored = localStorage.getItem('anime_color_analyzer_count');
            if (stored !== null) return parseInt(stored, 10);
            const initial = 73;
            localStorage.setItem('anime_color_analyzer_count', initial);
            return initial;
        }

        function incrementUsage() {
            const current = getUsageCount();
            const next = current + 1;
            localStorage.setItem('anime_color_analyzer_count', next);
            document.getElementById('usageCount').textContent = next;
        }

        document.getElementById('usageCount').textContent = getUsageCount();

        // ─── DOM References ────────────────────────────
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const previewArea = document.getElementById('previewArea');
        const previewImg = document.getElementById('previewImg');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const loadingSection = document.getElementById('loadingSection');
        const resultsSection = document.getElementById('resultsSection');
        const colorSwatches = document.getElementById('colorSwatches');
        const styleResult = document.getElementById('styleResult');
        const schemeResults = document.getElementById('schemeResults');
        const resetBtn = document.getElementById('resetBtn');
        const copyBtn = document.getElementById('copyBtn');
        const downloadBtn = document.getElementById('downloadBtn');

        let currentImage = null;
        let analysisResult = null;

        // ─── Upload handlers ──────────────────────────
        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImage(file);
            }
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) handleImage(file);
        });

        function handleImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImage = e.target.result;
                previewImg.src = currentImage;
                previewArea.classList.add('visible');
                resultsSection.classList.remove('visible');
                analysisResult = null;
            };
            reader.readAsDataURL(file);
        }

        // ─── Color analysis ──────────────────────────
        function rgbToHex(r, g, b) {
            return '#' + [r, g, b].map(c => {
                const hex = c.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('');
        }

        function hexToRgb(hex) {
            const h = hex.replace('#', '');
            return {
                r: parseInt(h.substring(0, 2), 16),
                g: parseInt(h.substring(2, 4), 16),
                b: parseInt(h.substring(4, 6), 16)
            };
        }

        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;

            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                    case g: h = ((b - r) / d + 2) / 6; break;
                    case b: h = ((r - g) / d + 4) / 6; break;
                }
            }
            return { h: h * 360, s: s * 100, l: l * 100 };
        }

        // Simplified K-Means clustering
        function kMeansClustering(pixels, k, maxIterations) {
            k = k || 5;
            maxIterations = maxIterations || 10;

            // Initialize centroids randomly from the data
            const centroids = [];
            const usedIndices = new Set();
            while (centroids.length < k) {
                const idx = Math.floor(Math.random() * pixels.length);
                if (!usedIndices.has(idx)) {
                    usedIndices.add(idx);
                    centroids.push([...pixels[idx]]);
                }
            }

            for (let iter = 0; iter < maxIterations; iter++) {
                // Assign each pixel to nearest centroid
                const clusters = Array.from({ length: k }, () => []);
                for (const pixel of pixels) {
                    let minDist = Infinity;
                    let bestCluster = 0;
                    for (let i = 0; i < k; i++) {
                        const dr = pixel[0] - centroids[i][0];
                        const dg = pixel[1] - centroids[i][1];
                        const db = pixel[2] - centroids[i][2];
                        const dist = dr * dr + dg * dg + db * db;
                        if (dist < minDist) {
                            minDist = dist;
                            bestCluster = i;
                        }
                    }
                    clusters[bestCluster].push(pixel);
                }

                // Update centroids
                let moved = false;
                for (let i = 0; i < k; i++) {
                    if (clusters[i].length === 0) continue;
                    const sum = clusters[i].reduce((acc, p) => {
                        acc[0] += p[0]; acc[1] += p[1]; acc[2] += p[2];
                        return acc;
                    }, [0, 0, 0]);
                    const newCentroid = [
                        Math.round(sum[0] / clusters[i].length),
                        Math.round(sum[1] / clusters[i].length),
                        Math.round(sum[2] / clusters[i].length)
                    ];
                    if (newCentroid[0] !== centroids[i][0] ||
                        newCentroid[1] !== centroids[i][1] ||
                        newCentroid[2] !== centroids[i][2]) {
                        moved = true;
                    }
                    centroids[i] = newCentroid;
                }

                if (!moved) break;
            }

            // Count cluster sizes
            const counts = new Array(k).fill(0);
            for (const pixel of pixels) {
                let minDist = Infinity;
                let bestCluster = 0;
                for (let i = 0; i < k; i++) {
                    const dr = pixel[0] - centroids[i][0];
                    const dg = pixel[1] - centroids[i][1];
                    const db = pixel[2] - centroids[i][2];
                    const dist = dr * dr + dg * dg + db * db;
                    if (dist < minDist) {
                        minDist = dist;
                        bestCluster = i;
                    }
                }
                counts[bestCluster]++;
            }

            const totalPixels = pixels.length;
            const result = centroids.map((c, i) => ({
                r: c[0],
                g: c[1],
                b: c[2],
                hex: rgbToHex(c[0], c[1], c[2]),
                percent: Math.round((counts[i] / totalPixels) * 100)
            }));

            // Sort by percentage descending
            result.sort((a, b) => b.percent - a.percent);
            return result;
        }

        // Determine style from colors
        function determineStyle(colors) {
            // Use the top color (most dominant) for style detection
            const top = colors[0];
            const hsl = rgbToHsl(top.r, top.g, top.b);
            const avgSat = colors.reduce((sum, c) => sum + rgbToHsl(c.r, c.g, c.b).s, 0) / colors.length;
            const avgLight = colors.reduce((sum, c) => sum + rgbToHsl(c.r, c.g, c.b).l, 0) / colors.length;

            const isWarm = (hsl.h >= 0 && hsl.h <= 60) || (hsl.h >= 330 && hsl.h <= 360);
            const isCool = hsl.h >= 180 && hsl.h <= 270;
            const isDeep = avgLight < 25;
            const isLight = avgLight > 70;
            const isHighSat = avgSat > 50;
            const isLowSat = avgSat < 25;

            // 高饱和度+暖色 → 可爱
            if (isHighSat && isWarm) {
                return { type: 'cute', label: '可爱', cssClass: 'style-cute', emoji: 'fa-heart' };
            }
            // 高饱和度+极深色 → 暗黑
            if (isHighSat && isDeep) {
                return { type: 'dark', label: '暗黑', cssClass: 'style-dark', emoji: 'fa-skull' };
            }
            // 高饱和度+冷色 → 帅气
            if (isHighSat && isCool) {
                return { type: 'cool', label: '帅气', cssClass: 'style-cool', emoji: 'fa-bolt' };
            }
            // 低饱和度+深色 → 神秘
            if (isLowSat && isDeep) {
                return { type: 'mysterious', label: '神秘', cssClass: 'style-mysterious', emoji: 'fa-moon' };
            }
            // 低饱和度+亮色 → 清新
            if (isLowSat && isLight) {
                return { type: 'fresh', label: '清新', cssClass: 'style-fresh', emoji: 'fa-leaf' };
            }
            // Fallback logic
            if (isWarm && isHighSat) return { type: 'cute', label: '可爱', cssClass: 'style-cute', emoji: 'fa-heart' };
            if (isCool && isHighSat) return { type: 'cool', label: '帅气', cssClass: 'style-cool', emoji: 'fa-bolt' };
            if (isDeep && isLowSat) return { type: 'mysterious', label: '神秘', cssClass: 'style-mysterious', emoji: 'fa-moon' };
            if (isLight) return { type: 'fresh', label: '清新', cssClass: 'style-fresh', emoji: 'fa-leaf' };
            return { type: 'fresh', label: '清新', cssClass: 'style-fresh', emoji: 'fa-leaf' };
        }

        // Generate color schemes
        function generateSchemes(colors) {
            const mainColor = colors[0];
            const hsl = rgbToHsl(mainColor.r, mainColor.g, mainColor.b);

            function hslToRgb(h, s, l) {
                s /= 100; l /= 100;
                const a = s * Math.min(l, 1 - l);
                const f = (n) => {
                    const k = (n + h / 30) % 12;
                    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
                };
                return {
                    r: Math.round(f(0) * 255),
                    g: Math.round(f(8) * 255),
                    b: Math.round(f(4) * 255)
                };
            }

            // Complementary
            const compColor = hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l);
            const complementary = {
                name: '互补色方案',
                icon: 'fa-circle-half-stroke',
                description: '对比强烈，视觉冲击力强',
                colors: [
                    rgbToHex(mainColor.r, mainColor.g, mainColor.b),
                    rgbToHex(compColor.r, compColor.g, compColor.b),
                    rgbToHex(Math.round((mainColor.r + compColor.r) / 2),
                              Math.round((mainColor.g + compColor.g) / 2),
                              Math.round((mainColor.b + compColor.b) / 2))
                ]
            };

            // Analogous
            const analog1 = hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, Math.min(hsl.l + 10, 90));
            const analog2 = hslToRgb((hsl.h + 30) % 360, hsl.s, Math.max(hsl.l - 5, 10));
            const analogous = {
                name: '类似色方案',
                icon: 'fa-grip-lines',
                description: '和谐统一，柔和舒适',
                colors: [
                    rgbToHex(mainColor.r, mainColor.g, mainColor.b),
                    rgbToHex(analog1.r, analog1.g, analog1.b),
                    rgbToHex(analog2.r, analog2.g, analog2.b)
                ]
            };

            // Triadic
            const tri1 = hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l);
            const tri2 = hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l);
            const triadic = {
                name: '三色方案',
                icon: 'fa-circle-nodes',
                description: '色彩丰富，平衡稳重',
                colors: [
                    rgbToHex(mainColor.r, mainColor.g, mainColor.b),
                    rgbToHex(tri1.r, tri1.g, tri1.b),
                    rgbToHex(tri2.r, tri2.g, tri2.b)
                ]
            };

            return [complementary, analogous, triadic];
        }

        // ─── Analyze image ────────────────────────────
        function analyzeImage() {
            if (!currentImage) return;

            // Show loading
            loadingSection.classList.add('visible');
            resultsSection.classList.remove('visible');

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const size = 100;
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, size, size);

                const imageData = ctx.getImageData(0, 0, size, size);
                const pixels = [];
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];
                    // Skip transparent/very low opacity pixels
                    if (a < 60) continue;
                    pixels.push([r, g, b]);
                }

                if (pixels.length < 10) {
                    alert('图片可用像素太少，请上传清晰的二次元头像。');
                    loadingSection.classList.remove('visible');
                    return;
                }

                // Run K-means
                const colors = kMeansClustering(pixels, 5, 12);

                // Normalize percentages
                const total = colors.reduce((sum, c) => sum + c.percent, 0);
                if (total > 0) {
                    colors.forEach(c => c.percent = Math.round((c.percent / total) * 100));
                }
                // Ensure sum is ~100
                let sumPerc = colors.reduce((s, c) => s + c.percent, 0);
                if (sumPerc !== 100 && colors.length > 0) {
                    colors[0].percent += (100 - sumPerc);
                }

                // Determine style
                const style = determineStyle(colors);

                // Generate schemes
                const schemes = generateSchemes(colors);

                // Store result
                analysisResult = { colors, style, schemes };

                // Render
                renderResults(colors, style, schemes);

                // Hide loading, show results
                loadingSection.classList.remove('visible');
                resultsSection.classList.add('visible');

                // Scroll to results smoothly
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            };

            img.src = currentImage;
        }

        // ─── Render results ──────────────────────────
        function renderResults(colors, style, schemes) {
            // Color swatches
            colorSwatches.innerHTML = colors.map(c => `
                <div class="color-swatch">
                    <div class="color-circle" style="background-color:${c.hex}"></div>
                    <div class="color-hex">${c.hex.toUpperCase()}</div>
                    <div class="color-rgb">rgb(${c.r}, ${c.g}, ${c.b})</div>
                    <div class="color-percent">占比 ${c.percent}%</div>
                </div>
            `).join('');

            // Style
            styleResult.innerHTML = `
                <span class="style-badge ${style.cssClass}">
                    <i class="fa-solid ${style.emoji}"></i> ${style.label} 风格
                </span>
                <p style="margin-top:8px;font-size:0.85em;color:var(--text-secondary);">
                    根据主色的色相、饱和度和明度综合判断
                </p>
            `;

            // Schemes
            schemeResults.innerHTML = schemes.map(s => `
                <div class="scheme-card">
                    <h4><i class="fa-solid ${s.icon}"></i> ${s.name}</h4>
                    <div class="scheme-colors">
                        ${s.colors.map(hex => `<div class="scheme-dot" style="background-color:${hex}"></div>`).join('')}
                    </div>
                    <p style="font-size:0.82em;color:var(--text-secondary);margin-bottom:6px;">${s.description}</p>
                    <div class="scheme-codes">${s.colors.map(h => h.toUpperCase()).join(' / ')}</div>
                </div>
            `).join('');
        }

        // ─── Share handlers ──────────────────────────
        copyBtn.addEventListener('click', () => {
            if (!analysisResult) return;
            const colors = analysisResult.colors;
            const text = '二次元头像色彩分析 - 主色板:\n' +
                colors.map(c => `${c.hex.toUpperCase()} (rgb(${c.r},${c.g},${c.b}) - ${c.percent}%)`).join('\n') +
                '\n风格: ' + analysisResult.style.label +
                '\n分析工具: ciallo0721-cmd.top';
            navigator.clipboard.writeText(text).then(() => {
                const orig = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> 已复制！';
                setTimeout(() => { copyBtn.innerHTML = orig; }, 2000);
            }).catch(() => {
                alert('复制失败，请手动复制。');
            });
        });

        downloadBtn.addEventListener('click', () => {
            if (!analysisResult) return;
            const colors = analysisResult.colors;
            const canvas = document.createElement('canvas');
            const swatchW = 100;
            const swatchH = 140;
            const padding = 16;
            const labelH = 56;
            const cols = colors.length;
            const w = cols * swatchW + (cols + 1) * padding;
            const h = swatchH + labelH + padding * 2;
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');

            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, w, h);

            // Title
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 13px -apple-system, "PingFang SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('二次元头像色彩分析 - ciallo0721-cmd', w / 2, padding + 15);

            // Draw swatches
            colors.forEach((c, i) => {
                const x = padding + i * (swatchW + padding);
                const y = labelH + padding;

                // Swatch rectangle
                const radius = 12;
                ctx.fillStyle = c.hex;
                ctx.beginPath();
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + swatchW - radius, y);
                ctx.quadraticCurveTo(x + swatchW, y, x + swatchW, y + radius);
                ctx.lineTo(x + swatchW, y + swatchH - radius);
                ctx.quadraticCurveTo(x + swatchW, y + swatchH, x + swatchW - radius, y + swatchH);
                ctx.lineTo(x + radius, y + swatchH);
                ctx.quadraticCurveTo(x, y + swatchH, x, y + swatchH - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
                ctx.closePath();
                ctx.fill();

                // Border
                ctx.strokeStyle = 'rgba(0,0,0,0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();

                // Hex label
                ctx.fillStyle = '#2c3e50';
                ctx.font = 'bold 12px "SF Mono", "Consolas", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(c.hex.toUpperCase(), x + swatchW / 2, y + swatchH + 18);

                // Percent label
                ctx.fillStyle = '#5a6e85';
                ctx.font = '11px -apple-system, sans-serif';
                ctx.fillText(c.percent + '%', x + swatchW / 2, y + swatchH + 34);
            });

            // Download
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'anime-color-palette.png';
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png');
        });

        // ─── Reset ───────────────────────────────────
        resetBtn.addEventListener('click', () => {
            currentImage = null;
            analysisResult = null;
            previewImg.src = '';
            previewArea.classList.remove('visible');
            resultsSection.classList.remove('visible');
            colorSwatches.innerHTML = '';
            styleResult.innerHTML = '';
            schemeResults.innerHTML = '';
            fileInput.value = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // ─── Analyze button ──────────────────────────
        analyzeBtn.addEventListener('click', () => {
            analyzeImage();
            incrementUsage();
        });

        // ─── CTA: track if used ─────────────────────
        // No extra logic needed; CTA is a direct link

    })();