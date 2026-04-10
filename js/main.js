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
        // 按区域分组，每个区域选择一条路线
        const routesByArea = {};
        
        // 对路线进行随机排序，确保每次选择不同的路线
        const shuffledRoutes = [...hikingRoutes].sort(() => Math.random() - 0.5);
        
        shuffledRoutes.forEach(route => {
            const area = route['所在区域'];
            if (!routesByArea[area]) {
                routesByArea[area] = route;
            }
        });
        
        // 对区域路线进行随机排序，确保每次显示顺序不同
        const areaRoutes = Object.values(routesByArea);
        const shuffledAreaRoutes = areaRoutes.sort(() => Math.random() - 0.5);
        
        // 从每个区域中选择一条路线，最多选择3条
        const featuredRoutes = shuffledAreaRoutes.slice(0, 3);
        const featuredSection = document.getElementById('featured-routes');
        if (featuredSection) {
            featuredSection.innerHTML = '';
            featuredRoutes.forEach(route => {
                const routeCard = createRouteCard(route);
                featuredSection.appendChild(routeCard);
            });
        }
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

// 创建路线卡片
function createRouteCard(route) {
    const card = document.createElement('div');
    card.className = 'card fade-in';
    
    // 使用本地图片
    const imageUrl = getRouteImage(route['名称']);
    
    card.innerHTML = `
        <div class="card-img" style="background-image: url('${imageUrl}');" onerror="this.style.backgroundImage='url(\'pic.png\')'""></div>
        <div class="card-content">
            <h3 class="card-title">${route['名称']}</h3>
            <p class="card-text">${route['核心体验'] || route['路线特色'] || '暂无描述'}</p>
            <div style="margin-bottom: 1rem;">
                <span class="tag">${route['所在区域']}</span>
                <span class="tag">${route['适合人群']}</span>
            </div>
            <a href="route-detail.html?name=${encodeURIComponent(route['名称'])}" class="btn">查看详情</a>
        </div>
    `;
    
    return card;
}

// 创建路线列表项
function createRouteItem(route) {
    const item = document.createElement('div');
    item.className = 'route-item fade-in';
    
    item.innerHTML = `
        <h3>${route['名称']}</h3>
        <p>${route['核心体验'] || route['路线特色'] || '暂无描述'}</p>
        <div class="meta">
            <span>📍 ${route['所在区域']}</span>
            <span>👥 ${route['适合人群']}</span>
            <span>🌼 ${route['最佳季节'] || '四季皆宜'}</span>
        </div>
        <a href="route-detail.html?name=${encodeURIComponent(route['名称'])}" class="btn" style="margin-top: 1rem;">查看详情</a>
    `;
    
    return item;
}

// 创建路线详情HTML
function createRouteDetailHTML(route) {
    // 使用本地图片
    const imageUrl = getRouteImage(route['名称']);
    
    let html = `
        <div style="text-align: center; margin-bottom: 2rem; display: flex; justify-content: center; align-items: center;">
            <img src="${imageUrl}" alt="${route['名称']}" style="max-width: 100%; max-height: 600px; object-fit: contain; border-radius: 10px;" onerror="this.src='pic.png';">
        </div>
        <h2>${route['名称']}</h2>
        <div class="route-detail-meta">
            <div>
                <strong>所在区域:</strong> ${route['所在区域']}
            </div>
            <div>
                <strong>门票:</strong> ${route['门票'] || '免费'}
            </div>
            <div>
                <strong>里程:</strong> ${route['里程(km)'] || '未知'}
            </div>
            <div>
                <strong>累计爬升:</strong> ${route['平均累计爬升(m)'] || '未知'}
            </div>
            <div>
                <strong>预计耗时:</strong> ${route['预计耗时(h)'] || '未知'}
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