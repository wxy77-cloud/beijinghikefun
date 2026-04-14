// 社区功能JavaScript代码

// 全局变量
let posts = [];
let currentSort = 'time';
let currentUser = null;

// 加载当前用户
function loadCurrentUser() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
}

// 检查是否是帖子作者
function isPostAuthor(authorId) {
    if (!currentUser) return false;
    return currentUser.id === authorId;
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    loadCurrentUser();
    loadPosts();
    bindEvents();
});

// 加载帖子数据
function loadPosts() {
    const storedPosts = localStorage.getItem('hikingPosts');
    if (storedPosts) {
        posts = JSON.parse(storedPosts);
    } else {
        posts = getInitialPosts();
        savePosts();
    }
    renderPosts();
}

// 获取初始示例帖子
function getInitialPosts() {
    return [
        {
            id: 1,
            title: '香山红叶之旅',
            content: '今天去了香山，红叶真的很美！建议大家早点去，避开人流高峰。从东门上山，路线比较平缓，适合新手。',
            author: '徒步爱好者',
            avatar: '徒',
            image: '香山.jpg',
            timestamp: Date.now() - 86400000,
            likes: 15,
            liked: false,
            comments: [
                {
                    id: 1,
                    author: '户外达人',
                    content: '确实，香山的红叶季节人很多，建议工作日去',
                    timestamp: Date.now() - 72000000
                }
            ]
        },
        {
            id: 2,
            title: '百望山晨练',
            content: '早上六点就到了百望山，空气清新，晨练的人不多。爬到山顶俯瞰北京城，心情特别好！',
            author: '晨跑者',
            avatar: '晨',
            image: '百望山.png',
            timestamp: Date.now() - 172800000,
            likes: 8,
            liked: false,
            comments: []
        },
        {
            id: 3,
            title: '西山森林公园一日游',
            content: '西山森林公园真的很适合周末放松，路线多样，有难有易。我们走了小环线，大概4个小时，强度适中。',
            author: '周末徒步',
            avatar: '周',
            image: '西山国家森林公园.png',
            timestamp: Date.now() - 259200000,
            likes: 23,
            liked: false,
            comments: [
                {
                    id: 1,
                    author: '新手小白',
                    content: '请问小环线大概多长？适合新手吗？',
                    timestamp: Date.now() - 250000000
                },
                {
                    id: 2,
                    author: '周末徒步',
                    content: '大概8公里左右，坡度不大，新手完全可以',
                    timestamp: Date.now() - 240000000
                }
            ]
        }
    ];
}

// 保存帖子到localStorage
function savePosts() {
    localStorage.setItem('hikingPosts', JSON.stringify(posts));
}

// 绑定事件
function bindEvents() {
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }

    const sortButtons = document.querySelectorAll('.sort-btn');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', handleSortChange);
    });
}

// 处理发帖提交
function handlePostSubmit(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('post-title');
    const contentInput = document.getElementById('post-content');
    const imageInput = document.getElementById('post-image');
    
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    // 获取当前用户信息
    let currentUser = null;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    const newPost = {
        id: Date.now(),
        title: title,
        content: content,
        author: currentUser ? currentUser.id : '匿名用户',
        avatar: currentUser ? currentUser.avatar : '匿',
        image: null,
        timestamp: Date.now(),
        likes: 0,
        liked: false,
        comments: []
    };
    
    if (imageInput.files && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newPost.image = e.target.result;
            addPost(newPost);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        addPost(newPost);
    }
}

// 添加帖子
function addPost(post) {
    posts.unshift(post);
    savePosts();
    renderPosts();
    
    const postForm = document.getElementById('post-form');
    postForm.reset();
    
    alert('发布成功！');
}

// 处理排序变更
function handleSortChange(e) {
    const sortType = e.target.dataset.sort;
    currentSort = sortType;
    
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    renderPosts();
}

// 渲染帖子列表
function renderPosts() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    let sortedPosts = [...posts];
    
    if (currentSort === 'time') {
        sortedPosts.sort((a, b) => b.timestamp - a.timestamp);
    } else if (currentSort === 'hot') {
        sortedPosts.sort((a, b) => {
            const scoreA = calculateHotScore(a);
            const scoreB = calculateHotScore(b);
            return scoreB - scoreA;
        });
    }
    
    postsList.innerHTML = '';
    
    if (sortedPosts.length === 0) {
        postsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">暂无帖子，快来发布第一条吧！</div>';
        return;
    }
    
    sortedPosts.forEach(post => {
        const postCard = createPostCard(post);
        postsList.appendChild(postCard);
    });
}

// 计算热度分数
function calculateHotScore(post) {
    const likeScore = post.likes * 2;
    const commentScore = post.comments.length * 3;
    const timeDecay = Math.max(0, 1 - (Date.now() - post.timestamp) / (7 * 24 * 60 * 60 * 1000));
    return likeScore + commentScore + (timeDecay * 10);
}

// 创建帖子卡片
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card fade-in';
    card.dataset.postId = post.id;
    
    const timeString = formatTime(post.timestamp);
    const likeClass = post.liked ? 'liked' : '';
    
    let imageHTML = '';
    if (post.image) {
        imageHTML = `<img src="${post.image}" alt="帖子图片" class="post-image">`;
    }
    
    let commentsHTML = '';
    post.comments.forEach(comment => {
        const commentTime = formatTime(comment.timestamp);
        commentsHTML += `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-time">${commentTime}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `;
    });
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="post-avatar">${post.avatar}</div>
                <div class="post-author-info">
                    <h4>${post.author}</h4>
                    <span>${timeString}</span>
                </div>
            </div>
        </div>
        <h3 class="post-title">${post.title}</h3>
        <div class="post-content">${post.content}</div>
        ${imageHTML}
        <div class="post-actions">
            <button class="post-action-btn like-btn ${likeClass}" onclick="handleLike(${post.id})"><span>❤️</span>
                <span class="like-count">${post.likes}</span>
            </button>
            <button class="post-action-btn comment-toggle-btn" onclick="toggleComments(${post.id})"><span>💬</span>
                <span>${post.comments.length}</span>
            </button>
            ${isPostAuthor(post.author) ? `
            <button class="post-action-btn delete-btn" onclick="handleDelete(${post.id})"><span>🗑️</span>
                <span>删除</span>
            </button>
            ` : ''}
        </div>
        <div class="post-comments" id="comments-${post.id}" style="display: none;">
            ${commentsHTML}
            <div class="comment-form">
                <input type="text" placeholder="写下你的评论..." id="comment-input-${post.id}">
                <button onclick="handleComment(${post.id})">发送</button>
            </div>
        </div>
    `;
    
    return card;
}

// 处理点赞
function handleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (post.liked) {
        post.likes--;
        post.liked = false;
    } else {
        post.likes++;
        post.liked = true;
    }
    
    savePosts();
    renderPosts();
}

// 切换评论显示
function toggleComments(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    if (commentsSection) {
        const isHidden = commentsSection.style.display === 'none';
        commentsSection.style.display = isHidden ? 'block' : 'none';
    }
}

// 处理评论
function handleComment(postId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    if (!commentInput) return;
    
    const content = commentInput.value.trim();
    if (!content) {
        alert('请输入评论内容');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 获取当前用户信息
    let currentUser = null;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    const newComment = {
        id: Date.now(),
        author: currentUser ? currentUser.id : '匿名用户',
        content: content,
        timestamp: Date.now()
    };
    
    post.comments.push(newComment);
    savePosts();
    renderPosts();
    
    commentInput.value = '';
}

// 处理删除帖子
function handleDelete(postId) {
    // 获取当前用户信息
    let currentUser = null;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }
    
    if (!currentUser) {
        alert('请先登录');
        return;
    }
    
    // 找到要删除的帖子
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 检查是否是帖子作者
    if (post.author !== currentUser.id) {
        alert('只能删除自己发布的帖子');
        return;
    }
    
    if (confirm('确定要删除这篇帖子吗？')) {
        // 过滤掉要删除的帖子
        posts = posts.filter(post => post.id !== postId);
        savePosts();
        renderPosts();
        alert('帖子已删除！');
    }
}

// 格式化时间
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day;
    
    if (diff < minute) {
        return '刚刚';
    } else if (diff < hour) {
        return Math.floor(diff / minute) + '分钟前';
    } else if (diff < day) {
        return Math.floor(diff / hour) + '小时前';
    } else if (diff < month) {
        return Math.floor(diff / day) + '天前';
    } else {
        const date = new Date(timestamp);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    }
}