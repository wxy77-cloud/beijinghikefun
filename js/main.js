// 全局变量
let hikingRoutes = [];
let currentRoute = null;

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 加载数据
    loadData();
    
    // 初始化鼠标拖尾特效
    initCursorTrail();
});

// 加载数据
function loadData() {
    fetch('routine_data.json')
        .then(response => response.json())
        .then(data => {
            hikingRoutes = data;
            // 根据当前页面执行不同的操作
            if (window.location.pathname.includes('routes.html')) {
                renderRouteList();
            } else if (window.location.pathname.includes('route-detail.html')) {
                renderRouteDetail();
            } else if (window.location.pathname.includes('filter.html')) {
                renderFilterPage();

            } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                renderHomePage();
            }
            
            // 数据加载完成后绑定事件
            bindEvents();
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('content').innerHTML = '<div class="alert alert-danger">数据加载失败，请稍后重试</div>';
        });
}

// 绑定事件
function bindEvents() {
    // 筛选表单提交
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            filterRoutes();
        });
    }
    
    // 搜索框
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchRoutes();
        });
    }
    
    // 标记筛选按钮
    const filterAll = document.getElementById('filter-all');
    const filterPending = document.getElementById('filter-pending');
    const filterDesired = document.getElementById('filter-desired');
    const filterMet = document.getElementById('filter-met');
    
    if (filterAll && filterPending && filterDesired && filterMet) {
        filterAll.addEventListener('click', function() {
            filterRoutesByMark('all');
            setActiveButton(filterAll);
        });
        
        filterPending.addEventListener('click', function() {
            filterRoutesByMark('pending');
            setActiveButton(filterPending);
        });
        
        filterDesired.addEventListener('click', function() {
            filterRoutesByMark('desired');
            setActiveButton(filterDesired);
        });
        
        filterMet.addEventListener('click', function() {
            filterRoutesByMark('met');
            setActiveButton(filterMet);
        });
    }
}

// 初始化鼠标拖尾特效
function initCursorTrail() {
    const colors = ['purple', 'blue', 'cyan', 'lavender', 'indigo'];
    let lastX = 0;
    let lastY = 0;
    let isMoving = false;
    let moveTimeout;
    
    document.addEventListener('mousemove', function(e) {
        const x = e.clientX;
        const y = e.clientY;
        
        // 计算移动距离
        const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
        
        // 只有当移动距离超过一定阈值时才创建粒子
        if (distance > 8) {
            createParticle(x, y, colors);
            lastX = x;
            lastY = y;
        }
        
        // 清除之前的timeout
        clearTimeout(moveTimeout);
        
        // 设置新的timeout，在鼠标停止移动后重置
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
    });
    
    // 触摸设备支持
    document.addEventListener('touchmove', function(e) {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        
        const distance = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
        
        if (distance > 8) {
            createParticle(x, y, colors);
            lastX = x;
            lastY = y;
        }
    }, { passive: true });
}

// 创建光点粒子
function createParticle(x, y, colors) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle ' + colors[Math.floor(Math.random() * colors.length)];
    
    // 随机大小变化
    const size = 4 + Math.random() * 4;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // 设置位置（居中于鼠标）
    particle.style.left = (x - size / 2) + 'px';
    particle.style.top = (y - size / 2) + 'px';
    
    // 添加到页面
    document.body.appendChild(particle);
    
    // 动画结束后移除元素
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1000);
}

// 渲染首页
function renderHomePage() {
    const hero = document.querySelector('.hero');
    if (hero) {
        // 直接选择指定的三条路线作为特色路线
        const featuredRouteNames = ['银山塔林', '东指壶', '藤萝谷'];
        
        // 更新特色路线的标记按钮文本和图片
        setTimeout(() => {
            featuredRouteNames.forEach(routeName => {
                const markStatus = getRouteMarkStatus(routeName);
                const buttonTexts = ['有待来日', '心向往之', '已然相逢'];
                const buttonText = buttonTexts[markStatus];
                
                // 查找对应的按钮并更新文本
                const btn = document.getElementById(`featured-btn-${routeName}`);
                if (btn) {
                    btn.textContent = buttonText;
                }
                
                // 查找对应的图片元素并更新图片
                const img = document.getElementById(`featured-img-${routeName}`);
                if (img) {
                    const imageUrl = getRouteImage(routeName);
                    img.style.backgroundImage = `url('${imageUrl}')`;
                }
            });
        }, 100);
    }
}

// 渲染路线列表
function renderRouteList() {
    const routeList = document.getElementById('route-list');
    if (routeList) {
        routeList.innerHTML = '';
        hikingRoutes.forEach(route => {
            const routeItem = createRouteItem(route);
            routeList.appendChild(routeItem);
        });
    }
}

// 渲染路线详情
function renderRouteDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const routeName = urlParams.get('name');
    if (routeName) {
        const route = hikingRoutes.find(r => r['名称'] === routeName);
        if (route) {
            currentRoute = route;
            const routeDetail = document.getElementById('route-detail');
            if (routeDetail) {
                routeDetail.innerHTML = createRouteDetailHTML(route);
            }
        } else {
            document.getElementById('route-detail').innerHTML = '<div class="alert alert-danger">路线不存在</div>';
        }
    } else {
        document.getElementById('route-detail').innerHTML = '<div class="alert alert-danger">请选择一个路线</div>';
    }
}

// 渲染筛选页面
function renderFilterPage() {
    // 初始化筛选表单
    initFilterForm();
    // 初始显示所有路线
    renderFilteredRoutes(hikingRoutes);
}

// 初始化筛选表单
function initFilterForm() {
    // 填充区域选项
    const areaSelect = document.getElementById('area');
    if (areaSelect) {
        const areas = [...new Set(hikingRoutes.map(route => route['所在区域']))];
        areas.forEach(area => {
            const option = document.createElement('option');
            option.value = area;
            option.textContent = area;
            areaSelect.appendChild(option);
        });
    }
    
    // 填充难度选项
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        const difficulties = ['全年龄段', '户外爱好者', '进阶级户外爱好者'];
        difficulties.forEach(difficulty => {
            const option = document.createElement('option');
            option.value = difficulty;
            option.textContent = difficulty;
            difficultySelect.appendChild(option);
        });
    }
    
    // 填充季节选项
    const seasonSelect = document.getElementById('season');
    if (seasonSelect) {
        const seasons = ['春', '夏', '秋', '冬'];
        seasons.forEach(season => {
            const option = document.createElement('option');
            option.value = season;
            option.textContent = season + '季';
            seasonSelect.appendChild(option);
        });
    }
    

}

// 筛选路线
function filterRoutes() {
    const area = document.getElementById('area').value;
    const difficulty = document.getElementById('difficulty').value;
    const season = document.getElementById('season').value;
    
    let filteredRoutes = hikingRoutes;
    
    if (area) {
        filteredRoutes = filteredRoutes.filter(route => route['所在区域'] === area);
    }
    
    if (difficulty) {
        filteredRoutes = filteredRoutes.filter(route => route['适合人群'] === difficulty || route['适合人群'].includes(difficulty));
    }
    
    if (season) {
        filteredRoutes = filteredRoutes.filter(route => {
            if (route['最佳季节']) {
                // 处理多个季节的情况，如"春、夏、秋"
                const routeSeasons = route['最佳季节'].split('、');
                // 检查是否包含所选季节的关键字
                return routeSeasons.some(s => s.includes(season));
            }
            return false;
        });
    }
    
    renderFilteredRoutes(filteredRoutes);
}


// 渲染筛选后的路线
function renderFilteredRoutes(routes) {
    const filteredList = document.getElementById('filtered-routes');
    const resultCount = document.getElementById('result-count');
    
    if (resultCount) {
        resultCount.textContent = routes.length;
    }
    
    if (filteredList) {
        filteredList.innerHTML = '';
        if (routes.length === 0) {
            filteredList.innerHTML = '<div class="alert alert-info">没有找到符合条件的路线</div>';
        } else {
            routes.forEach(route => {
                const routeCard = createRouteCard(route);
                filteredList.appendChild(routeCard);
            });
        }
    }
}

// 搜索路线
function searchRoutes() {
    // 获取搜索输入框和路线列表
    const searchInput = document.getElementById('search-input');
    const routeList = document.getElementById('route-list');
    
    // 检查元素是否存在
    if (!searchInput || !routeList) {
        return;
    }
    
    // 获取搜索词
    const searchTerm = searchInput.value.toLowerCase();
    
    // 基于原始数据筛选
    const filteredRoutes = hikingRoutes.filter(route => {
        return route['名称'].toLowerCase().includes(searchTerm);
    });
    
    // 清空列表并重新渲染
    routeList.innerHTML = '';
    
    // 无结果提示
    if (filteredRoutes.length === 0) {
        routeList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">未找到匹配的路线</div>';
        return;
    }
    
    // 渲染筛选后的路线
    filteredRoutes.forEach(route => {
        const routeItem = createRouteItem(route);
        routeList.appendChild(routeItem);
    });
}

// 按标记状态筛选路线
function filterRoutesByMark(status) {
    const routeList = document.getElementById('route-list');
    if (!routeList) return;
    
    let filteredRoutes = [];
    
    switch(status) {
        case 'all':
            filteredRoutes = hikingRoutes;
            break;
        case 'pending':
            filteredRoutes = hikingRoutes.filter(route => getRouteMarkStatus(route['名称']) === 0);
            break;
        case 'desired':
            filteredRoutes = hikingRoutes.filter(route => getRouteMarkStatus(route['名称']) === 1);
            break;
        case 'met':
            filteredRoutes = hikingRoutes.filter(route => getRouteMarkStatus(route['名称']) === 2);
            break;
    }
    
    routeList.innerHTML = '';
    
    if (filteredRoutes.length === 0) {
        let message = '';
        switch(status) {
            case 'pending':
                message = '没有"有待来日"的路线';
                break;
            case 'desired':
                message = '没有"心向往之"的路线';
                break;
            case 'met':
                message = '没有"已然相逢"的路线';
                break;
        }
        routeList.innerHTML = `<div style="text-align: center; padding: 2rem; color: #666;">${message}</div>`;
        return;
    }
    
    filteredRoutes.forEach(route => {
        const routeItem = createRouteItem(route);
        routeList.appendChild(routeItem);
    });
}

// 设置激活按钮样式
function setActiveButton(activeButton) {
    const buttons = [
        document.getElementById('filter-all'),
        document.getElementById('filter-pending'),
        document.getElementById('filter-desired'),
        document.getElementById('filter-met')
    ];
    
    buttons.forEach(button => {
        if (button) {
            if (button === activeButton) {
                button.style.background = 'var(--accent-color)';
                button.style.color = 'var(--dark-color)';
            } else {
                button.style.background = '#e6e0ff';
                button.style.color = 'var(--dark-color)';
            }
        }
    });
}

// 创建路线卡片
function createRouteCard(route) {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    
    // 使用本地图片
    const imageUrl = getRouteImage(route['名称']);
    const markStatus = getRouteMarkStatus(route['名称']);
    const buttonTexts = ['有待来日', '心向往之', '已然相逢'];
    const buttonText = buttonTexts[markStatus];
    
    card.innerHTML = `
        <div class="card-img" style="background-image: url('${imageUrl}');" onerror="this.style.backgroundImage='url(\'pic.png\')'""></div>
        <div class="card-content">
            <h3 class="card-title">${route['名称']}</h3>
            <p class="card-text">${route['核心体验'] || route['路线特色'] || '暂无描述'}</p>
            <div style="margin-bottom: 1rem;">
                <span class="tag">${route['所在区域']}</span>
                <span class="tag">${route['适合人群']}</span>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: auto;">
                <a href="route-detail.html?name=${encodeURIComponent(route['名称'])}" class="btn">查看详情</a>
                <button class="btn" onclick="toggleRouteMark('${route['名称']}')">${buttonText}</button>
            </div>
        </div>
    `;
    
    return card;
}

// 创建路线列表项
function createRouteItem(route) {
    const item = document.createElement('div');
    item.className = 'route-item fade-in';
    
    const markStatus = getRouteMarkStatus(route['名称']);
    const buttonTexts = ['有待来日', '心向往之', '已然相逢'];
    const buttonText = buttonTexts[markStatus];
    
    item.innerHTML = `
        <h3>${route['名称']}</h3>
        <p>${route['核心体验'] || route['路线特色'] || '暂无描述'}</p>
        <div class="meta">
            <span>📍 ${route['所在区域']}</span>
            <span>👥 ${route['适合人群']}</span>
            <span>🌼 ${route['最佳季节'] || '四季皆宜'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
            <a href="route-detail.html?name=${encodeURIComponent(route['名称'])}" class="btn">查看详情</a>
            <button class="btn" id="mark-btn-${route['名称']}" onclick="toggleRouteMark('${route['名称']}')">${buttonText}</button>
        </div>
    `;
    
    return item;
}

// 检查路线是否已标记（兼容旧代码，返回是否已被标记过）
function isRouteMarked(routeName) {
    const markStatus = getRouteMarkStatus(routeName);
    return markStatus > 0;
}

// 获取路线标记状态（0: 有待来日, 1: 心向往之, 2: 然然相逢）
function getRouteMarkStatus(routeName) {
    // 数据迁移：将旧的markedRoutes迁移到新的routeMarkStatus格式
    migrateRouteMarkData();
    
    const routeMarks = JSON.parse(localStorage.getItem('routeMarkStatus') || '{}');
    return routeMarks[routeName] || 0;
}

// 数据迁移函数
function migrateRouteMarkData() {
    const oldMarkedRoutes = localStorage.getItem('markedRoutes');
    if (oldMarkedRoutes) {
        const markedRoutes = JSON.parse(oldMarkedRoutes);
        const routeMarks = JSON.parse(localStorage.getItem('routeMarkStatus') || '{}');
        
        markedRoutes.forEach(routeName => {
            if (!routeMarks[routeName]) {
                routeMarks[routeName] = 2; // 将旧标记设为"已然相逢"
            }
        });
        
        localStorage.setItem('routeMarkStatus', JSON.stringify(routeMarks));
        localStorage.removeItem('markedRoutes'); // 删除旧数据
    }
}

// 设置路线标记状态（循环：0 -> 1 -> 2 -> 0）
function setRouteMarkStatus(routeName) {
    const routeMarks = JSON.parse(localStorage.getItem('routeMarkStatus') || '{}');
    const currentStatus = routeMarks[routeName] || 0;
    const newStatus = (currentStatus + 1) % 3;
    routeMarks[routeName] = newStatus;
    localStorage.setItem('routeMarkStatus', JSON.stringify(routeMarks));
    return newStatus;
}

// 切换路线标记状态
function toggleRouteMark(routeName) {
    const newStatus = setRouteMarkStatus(routeName);
    
    // 检查是否在路线详情页面
    const detailMarkBtn = document.getElementById('detail-mark-btn');
    if (detailMarkBtn) {
        const buttonTexts = ['有待来日', '心向往之', '已然相逢'];
        detailMarkBtn.textContent = buttonTexts[newStatus];
        return;
    }
    
    // 检查是否在筛选页面
    const filteredList = document.getElementById('filtered-routes');
    if (filteredList) {
        // 重新应用筛选
        filterRoutes();
        return;
    }
    
    // 重新渲染路线列表
    renderRouteList();
    
    // 检查当前是否有激活的筛选按钮
    const activeButton = document.querySelector('#filter-all, #filter-pending, #filter-desired, #filter-met');
    if (activeButton) {
        // 重新应用当前筛选
        if (activeButton.id === 'filter-all') {
            filterRoutesByMark('all');
        } else if (activeButton.id === 'filter-pending') {
            filterRoutesByMark('pending');
        } else if (activeButton.id === 'filter-desired') {
            filterRoutesByMark('desired');
        } else if (activeButton.id === 'filter-met') {
            filterRoutesByMark('met');
        }
    }
}

// 创建路线详情HTML
function createRouteDetailHTML(route) {
    // 使用本地图片
    const imageUrl = getRouteImage(route['名称']);
    const markStatus = getRouteMarkStatus(route['名称']);
    const buttonTexts = ['有待来日', '心向往之', '已然相逢'];
    const buttonText = buttonTexts[markStatus];
    
    let html = `
        <div style="text-align: center; margin-bottom: 2rem; display: flex; justify-content: center; align-items: center;">
            <img src="${imageUrl}" alt="${route['名称']}" style="max-width: 100%; max-height: 600px; object-fit: contain; border-radius: 10px;" onerror="this.src='pic.png';">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>${route['名称']}</h2>
            <button class="btn" id="detail-mark-btn" onclick="toggleRouteMark('${route['名称']}')">${buttonText}</button>
        </div>
        
        <div class="route-detail-meta">
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; grid-column: 1 / -1;">
                <div style="flex: 0.8;"><strong>所在区域:</strong> ${route['所在区域']}</div>
                <div style="flex: 3.2;"><strong>门票:</strong> ${route['门票'] || '免费'}</div>
            </div>
            <div>
                <strong>里程:</strong> ${route['里程(km)'] || '未知'} km
            </div>
            <div>
                <strong>累计爬升:</strong> ${route['平均累计爬升(m)'] || '未知'} m
            </div>
            <div>
                <strong>预计耗时:</strong> ${route['预计耗时(h)'] || '未知'} h
            </div>
            <div>
                <strong>适合人群:</strong> ${route['适合人群']}
            </div>
            <div>
                <strong>最佳季节:</strong> ${route['最佳季节'] || '四季皆宜'}
            </div>
        </div>
    `;
    
    if (route['路线亮点']) {
        html += `
            <div class="route-detail-section">
                <h3>路线亮点</h3>
                <p>${route['路线亮点']}</p>
            </div>
        `;
    }
    
    if (route['核心体验']) {
        html += `
            <div class="route-detail-section">
                <h3>核心体验</h3>
                <p>${route['核心体验']}</p>
            </div>
        `;
    }
    
    if (route['交通']) {
        html += `
            <div class="route-detail-section">
                <h3>交通信息</h3>
                <p>${route['交通']}</p>
            </div>
        `;
    }
    
    if (route['实用信息']) {
        html += `
            <div class="route-detail-section">
                <h3>实用信息</h3>
                <p>${route['实用信息']}</p>
            </div>
        `;
    }
    
    if (route['危险路段']) {
        html += `
            <div class="route-detail-section">
                <h3>危险路段</h3>
                <p>${route['危险路段']}</p>
            </div>
        `;
    }
    
    if (route['特殊政策']) {
        html += `
            <div class="route-detail-section">
                <h3>特殊政策</h3>
                <p>${route['特殊政策']}</p>
            </div>
        `;
    }
    
    if (route['路线描述']) {
        html += `
            <div class="route-detail-section">
                <h3>路线描述</h3>
                <p>${route['路线描述']}</p>
            </div>
        `;
    }
    
    if (route['路线特色']) {
        html += `
            <div class="route-detail-section">
                <h3>路线特色</h3>
                <p>${route['路线特色']}</p>
            </div>
        `;
    }
    
    // 交通信息
    if (route['自驾信息'] || route['公交地铁信息']) {
        html += `
            <div class="route-detail-section">
                <h3>交通信息</h3>
        `;
        
        if (route['自驾信息']) {
            html += `
                <p><strong>自驾：</strong>${route['自驾信息']}</p>
            `;
        }
        
        if (route['公交地铁信息']) {
            html += `
                <p><strong>公交地铁：</strong>${route['公交地铁信息']}</p>
            `;
        }
        
        html += `
            </div>
        `;
    }
    
    // 实用信息
    if (route['补给点'] || route['卫生间']) {
        html += `
            <div class="route-detail-section">
                <h3>实用信息</h3>
        `;
        
        if (route['补给点']) {
            html += `
                <p><strong>补给点：</strong>${route['补给点']}</p>
            `;
        }
        
        if (route['卫生间']) {
            html += `
                <p><strong>卫生间：</strong>${route['卫生间']}</p>
            `;
        }
        
        if (route['手机信号']) {
            html += `
                <p><strong>手机信号：</strong>${route['手机信号']}</p>
            `;
        }
        
        html += `
            </div>
        `;
    }
    
    // 可参考路线
    if (route['路线1'] || route['路线2'] || route['路线3']) {
        html += `
            <div class="route-detail-section">
                <h3>可参考路线</h3>
        `;
        
        if (route['路线1']) {
            html += `
                <div style="margin-bottom: 1rem;">
                    <p><strong>路线1：</strong>${route['路线1']}</p>
                    ${route['路线1特色'] ? `<p><strong>特色：</strong>${route['路线1特色']}</p>` : ''}
                </div>
            `;
        }
        
        if (route['路线2']) {
            html += `
                <div style="margin-bottom: 1rem;">
                    <p><strong>路线2：</strong>${route['路线2']}</p>
                    ${route['路线2特色'] ? `<p><strong>特色：</strong>${route['路线2特色']}</p>` : ''}
                </div>
            `;
        }
        
        if (route['路线3']) {
            html += `
                <div style="margin-bottom: 1rem;">
                    <p><strong>路线3：</strong>${route['路线3']}</p>
                    ${route['路线3特色'] ? `<p><strong>特色：</strong>${route['路线3特色']}</p>` : ''}
                </div>
            `;
        }
        
        html += `
            </div>
        `;
    }
    
    return html;
}

// 获取路线图片
function getRouteImage(routeName) {
    // 定义路线名称到图片文件的映射
    const routeImageMap = {
        '百望山森林公园': '百望山.png',
        '香山': '香山.jpg',
        '曹雪芹小道环线': '曹雪芹小道环线.webp',
        '大觉寺小环线': '大觉寺小环线.jpg',
        '西山国家森林公园': '西山国家森林公园.png',
        '香巴拉': '香巴拉.jpg',
        '凤凰岭': '凤凰岭.webp',
        '鹫峰': '鹫峰.jpg',
        '玉渡山': '玉渡山.jpg',
        '海坨山': '海坨山.jpg',
        '燕羽山': '燕羽山.webp',
        '百里山水画廊徒步路线': '百里山水画廊.png@q_90',
        '白虎涧': '白虎涧.jpg',
        '银山塔林': '银山塔林.jpg',
        '蟒山国家森林公园': '蟒山.jpg',
        '西峪橡树谷': '西峪橡树谷',
        '十三陵连穿': '十三陵连穿.jpg',
        '金海湖环湖': '金海湖环湖.jpg',
        '京东大峡谷': '京东大峡谷.jpeg@h_1280',
        '三界碑环线': '三界碑环线.jpg',
        '东指壶': '东指壶.jpg',
        '药王谷小环线': '药王谷小环线.webp',
        '圣莲山': '圣莲山.jpg',
        '青龙湖西山': '青龙湖西山.jpg',
        '棺材山': '棺材山.png',
        '老龙窝大环线': '老龙窝大环线.jpg',
        '雁栖湖西山步道': '雁栖湖西山步道.png',
        '藤萝谷': '藤萝谷.png',
        '云蒙山': '云蒙山.webp@watermark=0',
        '白河峡谷穿越路线': '白河峡谷.jpg',
        '鹿皮关长城': '鹿皮关长城.jpg',
        '桃源仙谷': '桃源仙谷.webp',
        '清水河谷': '清水河谷.png',
        '卧虎山长城': '卧虎山长城.jpg',
        '舞彩浅山': '舞彩浅山.jpg',
        '千灵山环线': '千灵山环线.jpg',
        '戒台寺登山步道': '戒台寺登山步道.jpg',
        '京西古道': '京西古道.jpg',
        '定都峰': '定都峰.png',
        '天门山': '天门山.jpg',
        '灵山': '灵山.jpg',
        '黄草梁': '黄草梁.jpg',
        '狗牙山': '狗牙山.jpg',
        '翠微山': '翠微山.webp',
        '念坛公园': '念坛公园.jpg'
    };
    
    // 如果找到对应的图片，返回本地图片路径
    if (routeImageMap[routeName]) {
        return routeImageMap[routeName];
    }
    
    // 如果没有找到对应的图片，返回默认图片
    return 'pic.png';
}

// 滚动到顶部
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 显示/隐藏滚动到顶部按钮
window.addEventListener('scroll', function() {
    const scrollButton = document.getElementById('scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.style.display = 'block';
        } else {
            scrollButton.style.display = 'none';
        }
    }
});