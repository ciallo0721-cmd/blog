window.pageMeta = {
        content_type: "app",
        page_name: "moeface",
        category: ""
    };

window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TR4FT7JPDZ');

// ========== 配置 ==========
        const CONFIG = {
            MODEL_URL: 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/',
            FEATURE_DB_URL: 'https://raw.githubusercontent.com/ciallo0721-cmd/moeface/main/features/%E5%85%A8%E9%83%A8%E7%89%B9%E5%BE%81%E5%BA%93.moe',
            DETECTOR_OPTIONS: {
                inputSize: 512,
                scoreThreshold: 0.12
            }
        };

        let modelsReady = false;
        let database = null;
        let negativeDatabase = null;  // 负面特征库（非人脸样板）
        let currentImage = null;
        let detections = [];
        let activeAnimation = null;

        // DOM 元素
        const els = {
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            loadingProgress: document.getElementById('loadingProgress'),
            statusModels: document.getElementById('statusModels'),
            statusDB: document.getElementById('statusDB'),
            uploadZone: document.getElementById('uploadZone'),
            fileInput: document.getElementById('fileInput'),
            previewContainer: document.getElementById('previewContainer'),
            previewImage: document.getElementById('previewImage'),
            canvasOverlay: document.getElementById('canvasOverlay'),
            controls: document.getElementById('controls'),
            threshold: document.getElementById('threshold'),
            thresholdValue: document.getElementById('thresholdValue'),
            recognizeBtn: document.getElementById('recognizeBtn'),
            clearBtn: document.getElementById('clearBtn'),
            results: document.getElementById('results'),
            faceCount: document.getElementById('faceCount'),
            resultList: document.getElementById('resultList'),
            noResult: document.getElementById('noResult'),
            logContainer: document.getElementById('logContainer'),
            charCount: document.getElementById('charCount')
        };

        function log(message, type = 'info') {
            const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
            const entry = document.createElement('div');
            entry.className = `log-entry ${type}`;
            entry.innerHTML = `<span class="log-time">[${time}]</span>${message}`;
            els.logContainer.appendChild(entry);
            els.logContainer.scrollTop = els.logContainer.scrollHeight;
            console.log(`[${type}] ${message}`);
        }

        function updateStatus(elementId, text, status) {
            const el = document.getElementById(elementId);
            if (!el) return;
            el.className = `status-item ${status}`;
            const span = el.querySelector('span:last-child');
            if (span) span.textContent = text;
        }

        function setProgress(text, percent) {
            els.loadingText.textContent = text;
            els.loadingProgress.style.width = `${percent}%`;
        }

        function hideLoading() {
            els.loadingOverlay.classList.add('hidden');
        }

        // 余弦相似度
        function cosineSimilarity(a, b) {
            if (!a || !b || a.length !== b.length) return 0;
            let dot = 0, normA = 0, normB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            const denom = Math.sqrt(normA) * Math.sqrt(normB);
            return denom > 0 ? dot / denom : 0;
        }

        // 128维 -> 512维映射相似度（用于动漫特征匹配）
        function matchDescriptor(desc128, ref512) {
            if (!desc128 || !ref512) return 0;
            if (desc128.length === 512 && ref512.length === 512) {
                return cosineSimilarity(desc128, ref512);
            }
            if (desc128.length !== 128 || ref512.length !== 512) {
                const minLen = Math.min(desc128.length, ref512.length);
                let dot = 0, n1 = 0, n2 = 0;
                for (let i = 0; i < minLen; i++) {
                    dot += desc128[i] * ref512[i];
                    n1 += desc128[i] * desc128[i];
                    n2 += ref512[i] * ref512[i];
                }
                const denom = Math.sqrt(n1) * Math.sqrt(n2);
                return denom > 0 ? dot / denom : 0;
            }
            
            // 128维投影到512维空间（线性插值）
            const proj512 = new Array(512).fill(0);
            for (let i = 0; i < 512; i++) {
                const srcIdx = (i / 512) * 128;
                const idx1 = Math.floor(srcIdx);
                const idx2 = Math.min(idx1 + 1, 127);
                const frac = srcIdx - idx1;
                const val1 = desc128[idx1] || 0;
                const val2 = desc128[idx2] || 0;
                proj512[i] = val1 * (1 - frac) + val2 * frac;
            }
            let sim = cosineSimilarity(proj512, ref512);
            // 动漫脸补偿：轻微提升匹配度
            if (sim > 0.2 && sim < 0.65) {
                sim = Math.min(0.9, sim * 1.1);
            }
            return Math.min(0.98, Math.max(0, sim));
        }

        // ========== 特征库加载 (单文件 .moe) ==========
        async function loadDatabase() {
            log('正在从 GitHub 加载合并特征库...');
            updateStatus('statusDB', '加载特征库...', '');

            try {
                const response = await fetch(CONFIG.FEATURE_DB_URL);
                if (!response.ok) {
                    throw new Error(`特征库下载失败: HTTP ${response.status} ${response.statusText}`);
                }
                setProgress('下载特征库数据...', 30);

                const text = await response.text();
                setProgress('解析特征库 (.moe 格式)...', 60);

                // .moe 格式：("角色名"{key1:浮点,浮点,...:key2:...:}"角色名2"{...})
                // 解析成 {角色名: [512 浮点数]}，所有部位取平均
                const data = {};
                let raw = text.trim();
                if (!raw.startsWith('(') || !raw.endsWith(')')) {
                    throw new Error('.moe 格式错误：缺少外层括号 ()');
                }
                raw = raw.slice(1, -1); // 去掉外层 ()

                // 按 " 分割：["", "角色名", "{内容}", "角色名2", "{内容}", ""]
                const segments = raw.split('"');
                for (let i = 1; i + 1 < segments.length; i += 2) {
                    const charName = segments[i];
                    const contentBlock = segments[i + 1];
                    if (!contentBlock.startsWith('{') || !contentBlock.endsWith('}')) {
                        log(`跳过格式错误的条目: ${charName}`, 'warning');
                        continue;
                    }

                    let content = contentBlock.slice(1, -1); // 去掉 {}
                    if (!content) continue;
                    // 去掉末尾可能有的 :
                    if (content.endsWith(':')) content = content.slice(0, -1);

                    // 按 : 分割 key:val:key:val:...
                    const parts = content.split(':');
                    let sumVec = null;
                    let partCount = 0;

                    for (let j = 0; j + 1 < parts.length; j += 2) {
                        const key = parts[j];
                        const valStr = parts[j + 1];
                        if (!valStr || valStr === 'placeholder') continue;
                        const floats = valStr.split(',').map(Number);
                        if (floats.length === 0 || floats.some(isNaN)) continue;

                        // 累加该角色的所有部位特征
                        if (!sumVec || sumVec.length !== floats.length) {
                            sumVec = new Array(floats.length).fill(0);
                        }
                        for (let k = 0; k < floats.length; k++) {
                            sumVec[k] += floats[k];
                        }
                        partCount++;
                    }

                    if (sumVec && partCount > 0) {
                        // 取平均
                        for (let k = 0; k < sumVec.length; k++) {
                            sumVec[k] /= partCount;
                        }
                        data[charName] = sumVec;
                    }
                }

                database = data;
                const charCount = Object.keys(database).length;
                log(`特征库加载完成！共 ${charCount} 个条目`, 'success');
                
                // ── 分离负面特征条目（"负面_"前缀） ──────────────────────
                const NEG_PREFIX = '负面_';
                const negEntries = {};
                const posEntries = {};
                for (const [name, vec] of Object.entries(database)) {
                    if (name.startsWith(NEG_PREFIX)) {
                        negEntries[name.slice(NEG_PREFIX.length)] = vec;
                    } else {
                        posEntries[name] = vec;
                    }
                }
                database = posEntries;
                negativeDatabase = Object.keys(negEntries).length > 0 ? negEntries : null;
                
                const posCount = Object.keys(database).length;
                const negCount = negativeDatabase ? Object.keys(negativeDatabase).length : 0;
                log(`🧑 角色特征: ${posCount} 个 | 🚫 负面特征: ${negCount} 个类别`, 'success');
                updateStatus('statusDB', `特征库: ${posCount} 角色`, 'ready');
                els.charCount.textContent = posCount;
                
                // 显示负面特征状态
                const negStatusEl = document.getElementById('statusNegDB');
                if (negStatusEl) {
                    if (negativeDatabase) {
                        negStatusEl.style.display = 'flex';
                        negStatusEl.querySelector('span:last-child').textContent = `负面: ${negCount} 类`;
                        negStatusEl.className = 'status-item ready';
                    } else {
                        negStatusEl.style.display = 'none';
                    }
                }
                
                setProgress(`就绪，共 ${posCount} 个角色`, 90);
                return true;
            } catch (err) {
                log(`特征库加载失败: ${err.message}`, 'error');
                updateStatus('statusDB', '特征库加载失败', 'error');
                els.charCount.textContent = '0';
                throw err;
            }
        }

        // ========== 人脸检测模型加载 ==========
        async function loadModels() {
            log('加载人脸检测模型 (针对动漫优化)...');
            updateStatus('statusModels', '模型加载中...', '');
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(CONFIG.MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(CONFIG.MODEL_URL),
                    faceapi.nets.faceLandmark68TinyNet.loadFromUri(CONFIG.MODEL_URL)
                ]);
                modelsReady = true;
                log('模型加载完成 (TinyFaceDetector + RecognitionNet)', 'success');
                updateStatus('statusModels', '模型就绪', 'ready');
            } catch (err) {
                log(`模型加载失败: ${err.message}`, 'error');
                updateStatus('statusModels', '模型失败', 'error');
                throw err;
            }
        }

        // ========== 初始化 ==========
        async function initialize() {
            try {
                setProgress('加载动态特征库...', 5);
                await loadDatabase();       // 先加载特征库
                setProgress('加载人脸检测AI...', 45);
                await loadModels();          // 再加载模型
                setProgress('优化动漫检测参数', 90);
                await new Promise(r => setTimeout(r, 200));
                setProgress('就绪！', 100);
                setTimeout(() => hideLoading(), 400);
                log('MoeFace 初始化完成，可使用动漫图片识别', 'success');
                if (els.recognizeBtn && currentImage) els.recognizeBtn.disabled = false;
            } catch (err) {
                log(`初始化失败: ${err.message}`, 'error');
                hideLoading();
            }
        }

        // ========== 文件处理 ==========
        function setupUploadHandlers() {
            els.fileInput.addEventListener('change', (e) => {
                if (e.target.files.length) handleFile(e.target.files[0]);
            });
            els.uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                els.uploadZone.classList.add('dragover');
            });
            els.uploadZone.addEventListener('dragleave', () => {
                els.uploadZone.classList.remove('dragover');
            });
            els.uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                els.uploadZone.classList.remove('dragover');
                if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
            });
            els.threshold.addEventListener('input', () => {
                const val = parseFloat(els.threshold.value).toFixed(2);
                els.thresholdValue.textContent = val;
            });
            els.recognizeBtn.addEventListener('click', recognize);
            els.clearBtn.addEventListener('click', clearAll);
        }

        function handleFile(file) {
            if (!file.type.startsWith('image/')) {
                log('请上传图片文件', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                currentImage = e.target.result;
                showPreview(currentImage);
            };
            reader.readAsDataURL(file);
        }

        function showPreview(src) {
            els.previewImage.src = src;
            els.previewContainer.classList.add('show');
            els.uploadZone.style.display = 'none';
            els.controls.style.display = 'flex';
            els.results.classList.remove('show');
            els.previewImage.onload = () => {
                syncCanvasSize();
                log(`图片尺寸: ${els.previewImage.naturalWidth}x${els.previewImage.naturalHeight}`, 'info');
            };
            els.recognizeBtn.disabled = !modelsReady;
        }

        function syncCanvasSize() {
            const img = els.previewImage;
            const rect = img.getBoundingClientRect();
            els.canvasOverlay.width = rect.width;
            els.canvasOverlay.height = rect.height;
            els.canvasOverlay.style.width = `${rect.width}px`;
            els.canvasOverlay.style.height = `${rect.height}px`;
        }

        function clearAll() {
            if (activeAnimation) {
                cancelAnimationFrame(activeAnimation);
                activeAnimation = null;
            }
            currentImage = null;
            detections = [];
            els.previewContainer.classList.remove('show');
            els.uploadZone.style.display = 'block';
            els.controls.style.display = 'none';
            els.results.classList.remove('show');
            els.fileInput.value = '';
            const ctx = els.canvasOverlay.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, els.canvasOverlay.width, els.canvasOverlay.height);
            els.resultList.innerHTML = '';
            els.noResult.style.display = 'none';
            log('已清空，可上传新图片', 'info');
        }

        // ========== 粒子汇聚动画 ==========
        function startParticleConvergence(detectionBoxesOnCanvas, canvasCtx, canvasWidth, canvasHeight, duration = 800, callback) {
            if (activeAnimation) {
                cancelAnimationFrame(activeAnimation);
                activeAnimation = null;
            }
            const PARTICLES_PER_FACE = 220;
            let particles = [];
            const startTime = performance.now();
            
            for (const box of detectionBoxesOnCanvas) {
                const { x, y, w, h } = box;
                const pointsPerEdge = Math.floor(PARTICLES_PER_FACE / 4);
                const targets = [];
                for (let i = 0; i <= pointsPerEdge; i++) {
                    const tx = x + (w * i / pointsPerEdge);
                    targets.push({ x: tx, y: y });
                }
                for (let i = 0; i <= pointsPerEdge; i++) {
                    const tx = x + (w * i / pointsPerEdge);
                    targets.push({ x: tx, y: y + h });
                }
                for (let i = 1; i < pointsPerEdge; i++) {
                    const ty = y + (h * i / pointsPerEdge);
                    targets.push({ x: x, y: ty });
                }
                for (let i = 1; i < pointsPerEdge; i++) {
                    const ty = y + (h * i / pointsPerEdge);
                    targets.push({ x: x + w, y: ty });
                }
                for (let t of targets) {
                    particles.push({
                        x: Math.random() * canvasWidth,
                        y: Math.random() * canvasHeight,
                        targetX: t.x,
                        targetY: t.y,
                        progress: 0
                    });
                }
            }
            
            if (particles.length === 0) {
                if (callback) callback();
                return;
            }
            
            function animate(now) {
                const elapsed = now - startTime;
                let t = Math.min(1, elapsed / duration);
                const ease = 1 - Math.pow(1 - t, 3);
                
                canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                for (let p of particles) {
                    const curX = p.x + (p.targetX - p.x) * ease;
                    const curY = p.y + (p.targetY - p.y) * ease;
                    canvasCtx.beginPath();
                    canvasCtx.arc(curX, curY, 3, 0, Math.PI * 2);
                    canvasCtx.fillStyle = `rgba(80, 220, 100, ${1 - t * 0.5})`;
                    canvasCtx.fill();
                }
                
                if (t < 1) {
                    activeAnimation = requestAnimationFrame(animate);
                } else {
                    canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
                    for (let box of detectionBoxesOnCanvas) {
                        canvasCtx.strokeStyle = '#22c55e';
                        canvasCtx.lineWidth = 4;
                        canvasCtx.strokeRect(box.x, box.y, box.w, box.h);
                        canvasCtx.beginPath();
                        canvasCtx.strokeStyle = '#a3e635';
                        canvasCtx.lineWidth = 2;
                        canvasCtx.strokeRect(box.x-1, box.y-1, box.w+2, box.h+2);
                    }
                    activeAnimation = null;
                    if (callback) callback();
                }
            }
            
            canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
            activeAnimation = requestAnimationFrame(animate);
        }

        // 检测人脸
        async function detectFaces() {
            const img = els.previewImage;
            const optionsLow = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.12 });
            const optionsMid = new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.1 });
            
            try {
                let results = await faceapi.detectAllFaces(img, optionsLow)
                    .withFaceLandmarks(true)
                    .withFaceDescriptors();
                
                if (results.length === 0) {
                    log('尝试更高精度检测模式...', 'info');
                    results = await faceapi.detectAllFaces(img, optionsMid)
                        .withFaceLandmarks(true)
                        .withFaceDescriptors();
                }
                
                if (results.length === 0 && img.naturalWidth > 200) {
                    const optionsUltra = new faceapi.TinyFaceDetectorOptions({ inputSize: 608, scoreThreshold: 0.05 });
                    results = await faceapi.detectAllFaces(img, optionsUltra)
                        .withFaceLandmarks(true)
                        .withFaceDescriptors();
                }
                return results;
            } catch (err) {
                log(`检测出错: ${err.message}`, 'error');
                return [];
            }
        }

        async function recognize() {
            if (!modelsReady || !database) {
                log('模型或特征库未就绪', 'error');
                return;
            }
            if (!currentImage) {
                log('请先上传图片', 'warning');
                return;
            }
            const threshold = parseFloat(els.threshold.value);
            log(`开始识别 (阈值=${threshold})，针对动漫特征增强比对...`, 'info');
            els.recognizeBtn.disabled = true;
            els.recognizeBtn.textContent = '识别中...';
            
            try {
                syncCanvasSize();
                const rawDetections = await detectFaces();
                
                if (rawDetections.length === 0) {
                    log('未检测到明确人脸框，启动全图特征匹配模式...', 'warning');
                    await fullImageMode(threshold);
                    return;
                }
                
                log(`检测到 ${rawDetections.length} 个人脸区域`, 'success');
                detections = rawDetections;
                
                const img = els.previewImage;
                const imgRect = img.getBoundingClientRect();
                const scaleX = imgRect.width / img.naturalWidth;
                const scaleY = imgRect.height / img.naturalHeight;
                const boxesOnCanvas = detections.map(det => {
                    const box = det.detection.box;
                    return {
                        x: box.x * scaleX,
                        y: box.y * scaleY,
                        w: box.width * scaleX,
                        h: box.height * scaleY
                    };
                });
                
                const canvas = els.canvasOverlay;
                const ctx = canvas.getContext('2d');
                const width = canvas.width;
                const height = canvas.height;
                
                await new Promise((resolve) => {
                    startParticleConvergence(boxesOnCanvas, ctx, width, height, 800, resolve);
                });
                
                const allMatches = [];
                for (let i = 0; i < detections.length; i++) {
                    const desc128 = Array.from(detections[i].descriptor);
                    log(`人脸 #${i+1} 特征提取完成，匹配特征库...`);
                    const faceMatches = [];
                    for (const [charName, refVec] of Object.entries(database)) {
                        if (!refVec || !Array.isArray(refVec)) continue;
                        let sim = matchDescriptor(desc128, refVec);
                        if (sim >= threshold) {
                            faceMatches.push({ name: charName, similarity: sim });
                        }
                    }
                    faceMatches.sort((a,b) => b.similarity - a.similarity);
                    allMatches.push(...faceMatches.slice(0, 2));
                }
                
                if (allMatches.length === 0) {
                    log('人脸区域未匹配到特征库（所有匹配分数均低于阈值），可尝试降低阈值', 'warning');
                    let bestSim = 0;
                    let bestName = '';
                    for (let i = 0; i < detections.length; i++) {
                        const desc128 = Array.from(detections[i].descriptor);
                        for (const [charName, refVec] of Object.entries(database)) {
                            if (!refVec) continue;
                            let sim = matchDescriptor(desc128, refVec);
                            if (sim > bestSim) {
                                bestSim = sim;
                                bestName = charName;
                            }
                        }
                    }
                    if (bestSim > 0.25) {
                        log(`最高匹配分数: ${(bestSim*100).toFixed(1)}% (角色: ${bestName})，低于当前阈值 ${threshold}`, 'info');
                        log(`建议将阈值降至 ${Math.max(0.2, bestSim - 0.05).toFixed(2)} 左右重试`, 'info');
                    }
                    await fullImageMode(threshold);
                } else {
                    displayResults(allMatches, detections.length);
                }
            } catch (err) {
                log(`识别异常: ${err.message}`, 'error');
                console.error(err);
                await fullImageMode(parseFloat(els.threshold.value));
            } finally {
                els.recognizeBtn.disabled = false;
                els.recognizeBtn.textContent = '🔍 开始识别';
            }
        }
        
        async function fullImageMode(threshold) {
            log('全图特征比对模式 (针对整体动漫风格)', 'info');
            try {
                const img = els.previewImage;
                let dets = [];
                const optionsList = [
                    { inputSize: 512, scoreThreshold: 0.12 },
                    { inputSize: 608, scoreThreshold: 0.08 },
                    { inputSize: 416, scoreThreshold: 0.1 }
                ];
                
                for (const opt of optionsList) {
                    try {
                        const opts = new faceapi.TinyFaceDetectorOptions(opt);
                        const results = await faceapi.detectAllFaces(img, opts)
                            .withFaceLandmarks(true)
                            .withFaceDescriptors();
                        if (results.length > 0) {
                            dets = results;
                            break;
                        }
                    } catch(e) {
                        console.warn('检测选项失败:', opt, e);
                    }
                }
                
                if (dets.length === 0) {
                    log('无法提取面部描述符，请尝试更清晰的正面图', 'error');
                    els.noResult.style.display = 'block';
                    els.faceCount.textContent = '?';
                    return;
                }
                
                let maxFace = dets[0];
                let maxArea = 0;
                for (const d of dets) {
                    const area = d.detection.box.width * d.detection.box.height;
                    if (area > maxArea) {
                        maxArea = area;
                        maxFace = d;
                    }
                }
                
                const mainDesc = Array.from(maxFace.descriptor);
                const matches = [];
                for (const [charName, refVec] of Object.entries(database)) {
                    if (!refVec) continue;
                    let sim = matchDescriptor(mainDesc, refVec);
                    if (sim >= threshold) {
                        matches.push({ name: charName, similarity: sim });
                    }
                }
                matches.sort((a,b) => b.similarity - a.similarity);
                
                if (matches.length) {
                    log(`全图匹配到 ${matches.length} 个候选`, 'success');
                    displayResults(matches, dets.length);
                } else {
                    let bestSim = 0;
                    let bestName = '';
                    for (const [charName, refVec] of Object.entries(database)) {
                        if (!refVec) continue;
                        let sim = matchDescriptor(mainDesc, refVec);
                        if (sim > bestSim) {
                            bestSim = sim;
                            bestName = charName;
                        }
                    }
                    if (bestSim > 0.25) {
                        log(`最高匹配分数: ${(bestSim*100).toFixed(1)}% (角色: ${bestName})，低于阈值 ${threshold}`, 'info');
                        log(`建议将阈值降至 ${Math.max(0.2, bestSim - 0.05).toFixed(2)} 左右重试`, 'info');
                    }
                    log('未匹配任何角色，请尝试更清晰正脸或降低阈值', 'warning');
                    els.noResult.style.display = 'block';
                    els.faceCount.textContent = `${dets.length} 张人脸`;
                }
            } catch(e) {
                log(`全图匹配失败: ${e.message}`, 'error');
                console.error(e);
                els.noResult.style.display = 'block';
                els.faceCount.textContent = '?';
            }
        }
        
        function displayResults(matches, faceCountVal) {
            els.results.classList.add('show');
            els.faceCount.textContent = `${faceCountVal} 张人脸`;
            if (!matches.length) {
                els.resultList.innerHTML = '';
                els.noResult.style.display = 'block';
                return;
            }
            els.noResult.style.display = 'none';
            const unique = new Map();
            for (let m of matches) {
                if (!unique.has(m.name) || unique.get(m.name).similarity < m.similarity) {
                    unique.set(m.name, m);
                }
            }
            const sorted = Array.from(unique.values()).sort((a,b) => b.similarity - a.similarity);
            els.resultList.innerHTML = '';
            sorted.slice(0, 12).forEach((match, idx) => {
                const scoreClass = match.similarity >= 0.6 ? 'high' : (match.similarity >= 0.45 ? 'medium' : 'low');
                const item = document.createElement('div');
                item.className = `result-item${idx === 0 ? ' top' : ''}`;
                item.innerHTML = `<span class="result-rank">#${idx+1}</span>
                                  <span class="result-name">${escapeHtml(match.name)}</span>
                                  <span class="result-score ${scoreClass}">${(match.similarity*100).toFixed(1)}%</span>`;
                els.resultList.appendChild(item);
                log(`匹配: ${match.name} (${(match.similarity*100).toFixed(1)}%)`, 'success');
            });
        }
        
        function escapeHtml(str) { 
            return str.replace(/[&<>]/g, function(m){
                if(m==='&') return '&amp;';
                if(m==='<') return '&lt;';
                if(m==='>') return '&gt;';
                return m;
            });
        }
        
        window.addEventListener('resize', () => { 
            if (els.previewContainer.classList.contains('show')) syncCanvasSize(); 
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            setupUploadHandlers();
            initialize();
        });