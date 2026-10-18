
/* =========================================
   1. DỮ LIỆU MẪU MẶC ĐỊNH
========================================= */

const DEFAULT_MENU = [
    { id: "home", title: "Trang chủ", type: "home" },
    { id: "moi-nhat", title: "Mới nhất", type: "category" },
    { id: "the-gioi", title: "Thế giới", type: "category" },
    { id: "thoi-su", title: "Thời sự", type: "category" },
    { id: "phap-luat", title: "Pháp luật", type: "category" },
    { id: "suc-khoe", title: "Sức khỏe", type: "category" },
    { id: "doi-song", title: "Đời sống", type: "category" },
    { id: "du-lich", title: "Du lịch", type: "category" },
    { id: "kinh-doanh", title: "Kinh doanh", type: "category" },
    { id: "the-thao", title: "Thể thao", type: "category" },
    { id: "bat-dong-san", title: "Bất động sản", type: "category" },
    { id: "giai-tri", title: "Giải trí", type: "category" },
    { id: "giao-duc", title: "Giáo dục", type: "category" }
];

const DEFAULT_POSTS = [
    {
        id: "dtri-20261017001",
        title: "Loạt đề xuất mới về biển báo, khoảng cách đặt biển cảnh báo trên cao tốc",
        slug: "loat-de-xuat-moi-ve-bien-bao-khoang-cach-dat-bien-canh-bao-tren-cao-toc",
        excerpt: "Cục Đường bộ Việt Nam đề xuất nhiều thay đổi về biển báo, đèn tín hiệu, khoảng cách đặt biển cảnh báo và hệ thống chỉ dẫn trên đường cao tốc.",
        content: "Cục Đường bộ Việt Nam vừa hoàn thiện bản dự thảo đề xuất quy chuẩn mới về hệ thống biển báo giao thông trên đường cao tốc.\n\nMột trong những nội dung trọng tâm là việc quy định khoảng cách tối thiểu từ biển cảnh báo đến vị trí sự cố hoặc công trường thi công trên đường cao tốc nhằm giúp tài xế chủ động giảm tốc độ an toàn.",
        thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
        author: "Văn Hưng",
        category: "Thời sự",
        categoryId: "thoi-su",
        publishedAt: "2026-10-14 23:30",
        source: "dantri.com.vn",
        url: "https://dantri.com.vn/thoi-su/loat-de-xuat-moi.htm"
    }
];


/* =========================================
   2. HÀM TIỆN ÍCH
========================================= */

function normalizeCategoryId(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function makeClickArg(value) {
    return encodeURIComponent(String(value ?? ""));
}

function getAppViewElement() {
    return (
        document.getElementById("appView") ||
        document.getElementById("postList") ||
        document.getElementById("mainContent")
    );
}

function normalizePost(post) {
    if (!post || typeof post !== "object") return null;

    const title = String(post.title || "").trim();
    const id = String(post.id || post.slug || "").trim();

    if (!title || !id) return null;

    const category = String(
        post.category ||
        post.categoryName ||
        post.categoryId ||
        "Thời sự"
    ).trim();

    const categoryId = normalizeCategoryId(
        post.categoryId || category
    );

    return {
        ...post,
        id,
        title,
        slug: post.slug || id,
        category,
        categoryId,
        excerpt: String(post.excerpt || "")
            .trim()
            .replace(/^(\(Dân trí\)|Dân trí)\s*[-–—]\s*/i, ""),
        content: String(post.content || ""),
        author: String(post.author || "").trim(),
        publishedAt: post.publishedAt || post.date || "",
        thumbnail: post.thumbnail || post.image || "",
        image: post.image || post.thumbnail || "",
        url: String(post.url || ""),
        source: String(post.source || "dantri.com.vn")
    };
}

function normalizeMenuItem(item) {
    if (!item || typeof item !== "object") return null;

    const title = String(
        item.title || item.name || item.id || ""
    ).trim();

    const id = normalizeCategoryId(item.id || title);

    if (!title || !id) return null;

    return {
        ...item,
        id,
        title,
        type: item.type || (id === "home" ? "home" : "category"),
        children: Array.isArray(item.children)
            ? item.children
                .map(child => {
                    if (!child || typeof child !== "object") return null;

                    const childTitle = String(
                        child.title || child.name || child.id || ""
                    ).trim();

                    const childId = normalizeCategoryId(
                        child.id || childTitle
                    );

                    if (!childTitle || !childId) return null;

                    return {
                        ...child,
                        id: childId,
                        title: childTitle,
                        type: child.type || "category"
                    };
                })
                .filter(Boolean)
            : []
    };
}

function isPostInCategory(post, catId) {
    if (!post || !catId) return false;

    const targetId = normalizeCategoryId(catId);
    if (!targetId || targetId === "home") return false;

    const normalizedPost = normalizePost(post);
    if (!normalizedPost) return false;
    if (targetId === "moi-nhat") return true;

    const values = [
        normalizedPost.categoryId,
        normalizedPost.category,
        normalizedPost.categoryName,
        normalizedPost.subCategoryId,
        normalizedPost.subCategory,
        normalizedPost.subcategoryId,
        normalizedPost.subcategory,
        normalizedPost.section,
        normalizedPost.sectionId
    ].filter(Boolean).map(normalizeCategoryId);

    if (values.includes(targetId)) return true;

    const url = String(normalizedPost.url || "").toLowerCase();

    if (url) {
        const path = url.replace(/^https?:\/\/[^/]+/i, "");
        const urlCategoryIds = path
            .split("/")
            .filter(Boolean)
            .map(part =>
                normalizeCategoryId(
                    part.replace(/\.htm(l)?$/i, "")
                )
            );

        if (urlCategoryIds.includes(targetId)) return true;
    }

    const categories = getCategories();

    const parent = categories.find(category =>
        normalizeCategoryId(category.id) === targetId ||
        normalizeCategoryId(category.title) === targetId
    );

    if (parent && Array.isArray(parent.children)) {
        const childIds = parent.children.map(child =>
            normalizeCategoryId(child.id)
        );

        if (values.some(value => childIds.includes(value))) {
            return true;
        }
    }

    return false;
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(String(value).replace(" ", "T"));

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function getPostImage(post) {
    return (
        post?.thumbnail ||
        post?.image ||
        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop"
    );
}

function getExcerpt(post) {
    return String(post?.excerpt || "")
        .trim()
        .replace(/^(\(Dân trí\)|Dân trí)\s*[-–—]\s*/i, "")
        .trim();
}

function sortPostsByDate(posts) {
    return [...posts].sort((a, b) => {
        const timeA = a.publishedAt
            ? new Date(String(a.publishedAt).replace(" ", "T")).getTime()
            : 0;

        const timeB = b.publishedAt
            ? new Date(String(b.publishedAt).replace(" ", "T")).getTime()
            : 0;

        return (
            (Number.isNaN(timeB) ? 0 : timeB) -
            (Number.isNaN(timeA) ? 0 : timeA)
        );
    });
}


/* =========================================
   3. QUẢN LÝ LOCALSTORAGE
========================================= */

function getCategories() {
    try {
        const raw = localStorage.getItem("categories");

        if (raw) {
            const data = JSON.parse(raw);
            const menu = Array.isArray(data) ? data : data?.menu;

            if (Array.isArray(menu) && menu.length > 0) {
                const normalized = menu
                    .map(normalizeMenuItem)
                    .filter(Boolean);

                if (normalized.length > 0) return normalized;
            }
        }
    } catch (error) {
        console.warn("Không đọc được categories:", error);
    }

    return DEFAULT_MENU.map(normalizeMenuItem).filter(Boolean);
}

function getPosts() {
    try {
        const raw = localStorage.getItem("posts");

        if (raw) {
            const data = JSON.parse(raw);
            const posts = Array.isArray(data) ? data : data?.posts;

            if (Array.isArray(posts)) {
                const normalized = posts
                    .map(normalizePost)
                    .filter(Boolean);

                if (normalized.length > 0) return normalized;
            }
        }
    } catch (error) {
        console.warn("Không đọc được posts:", error);
    }

    return DEFAULT_POSTS.map(normalizePost).filter(Boolean);
}

function savePostToStorage(newPost) {
    const normalizedPost = normalizePost(newPost);

    if (!normalizedPost || !normalizedPost.content.trim()) {
        throw new Error("Bài viết thiếu tiêu đề hoặc nội dung.");
    }

    const posts = getPosts();

    const index = posts.findIndex(
        post => String(post.id) === String(normalizedPost.id)
    );

    if (index >= 0) {
        posts[index] = {
            ...posts[index],
            ...normalizedPost
        };
    } else {
        posts.unshift(normalizedPost);
    }

    try {
        localStorage.setItem("posts", JSON.stringify(posts));
    } catch (error) {
        console.error("Không thể lưu bài viết:", error);
        throw new Error("Không lưu được dữ liệu vào LocalStorage.");
    }

    return normalizedPost;
}

async function initDataFromFiles() {
    try {
        const menuResponse = await fetch(`./data/menu.json?v=${Date.now()}`);

        if (menuResponse.ok) {
            const data = await menuResponse.json();
            const menu = Array.isArray(data) ? data : data?.menu;

            if (Array.isArray(menu) && menu.length > 0) {
                localStorage.setItem("categories", JSON.stringify(menu));
            }
        }
    } catch (error) {
        console.warn(
            "Không tải được menu.json; dùng menu đã lưu hoặc mặc định:",
            error
        );
    }

    try {
        const postsResponse = await fetch(`./data/posts.json?v=${Date.now()}`);

        if (postsResponse.ok) {
            const data = await postsResponse.json();
            const filePosts = Array.isArray(data) ? data : data?.posts;

            if (Array.isArray(filePosts)) {
                const normalizedFilePosts = filePosts
                    .map(normalizePost)
                    .filter(Boolean);

                let savedPosts = [];

                try {
                    const savedData = JSON.parse(
                        localStorage.getItem("posts") || "[]"
                    );

                    savedPosts = Array.isArray(savedData)
                        ? savedData
                        : (savedData?.posts || []);
                } catch (error) {
                    console.warn("Không đọc được bài viết đã lưu:", error);
                }

                const merged = new Map();

                normalizedFilePosts.forEach(post => {
                    merged.set(String(post.id), post);
                });

                savedPosts
                    .map(normalizePost)
                    .filter(Boolean)
                    .forEach(post => {
                        merged.set(String(post.id), {
                            ...(merged.get(String(post.id)) || {}),
                            ...post
                        });
                    });

                localStorage.setItem(
                    "posts",
                    JSON.stringify(Array.from(merged.values()))
                );
            }
        }
    } catch (error) {
        console.warn(
            "Không tải được posts.json; dùng bài đã lưu hoặc dữ liệu mẫu:",
            error
        );
    }

    renderNavbar();

    if (
        window.currentNewsPage !== "crawler" &&
        window.currentNewsPage !== "article"
    ) {
        renderCategory("home");
    }
}

/* =========================================
   4. THANH ĐIỀU HƯỚNG
========================================= */

function renderNavbar() {
    const categories = getCategories();
    const navMenuEl = document.getElementById("navbarMenu");
    const footerCatEl = document.getElementById("footerCategories");

    let navHtml = "";
    let footerHtml = "";

    categories.forEach(cat => {
        if (!cat || !cat.id) return;

        const idArg = makeClickArg(cat.id);
        const title = escapeHtml(cat.title || cat.id);
        const navId = escapeHtml(normalizeCategoryId(cat.id));

        if (Array.isArray(cat.children) && cat.children.length > 0) {
            let subHtml = '<ul class="dropdown-menu">';

            cat.children.forEach(child => {
                if (!child || !child.id) return;

                subHtml += `
                    <li>
                        <a href="#"
                           onclick="event.preventDefault();renderCategory(decodeURIComponent('${makeClickArg(child.id)}'))">
                            ${escapeHtml(child.title || child.id)}
                        </a>
                    </li>
                `;
            });

            subHtml += "</ul>";

            navHtml += `
                <li class="has-dropdown">
                    <a href="#"
                       onclick="event.preventDefault();renderCategory(decodeURIComponent('${idArg}'))"
                       id="nav-${navId}">
                        ${title} ▾
                    </a>
                    ${subHtml}
                </li>
            `;
        } else {
            navHtml += `
                <li>
                    <a href="#"
                       onclick="event.preventDefault();renderCategory(decodeURIComponent('${idArg}'))"
                       id="nav-${navId}">
                        ${title}
                    </a>
                </li>
            `;
        }

        footerHtml += `
            <li>
                <a href="#"
                   onclick="event.preventDefault();renderCategory(decodeURIComponent('${idArg}'))">
                    ${title}
                </a>
            </li>
        `;
    });

    navHtml += `
        <li>
            <a href="#"
               onclick="event.preventDefault();renderCrawlerPage()"
               class="btn-crawler">
                Crawler Page
            </a>
        </li>
    `;

    if (navMenuEl) navMenuEl.innerHTML = navHtml;
    if (footerCatEl) footerCatEl.innerHTML = footerHtml;
}

function setActiveNavigation(catId) {
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.classList.remove("active");
    });

    const targetId = normalizeCategoryId(catId);
    const activeNav = document.getElementById(`nav-${targetId}`);

    if (activeNav) {
        activeNav.classList.add("active");
    }
}


/* =========================================
   5. TẠO THẺ BÀI VIẾT
========================================= */

function createGridHtml(postsList) {
    if (!Array.isArray(postsList) || postsList.length === 0) {
        return "<p>Chưa có bài viết để hiển thị.</p>";
    }

    const featuredLarge = postsList[0];
    const featuredSmall = postsList.slice(1, 3);

    let html = '<div class="featured-grid">';

    html += `
        <div class="card-clean"
             onclick="renderArticleDetail(decodeURIComponent('${makeClickArg(featuredLarge.id)}'))">

            <img src="${escapeHtml(getPostImage(featuredLarge))}"
                 class="card-img-large"
                 alt="${escapeHtml(featuredLarge.title)}"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';">

            <div class="card-category-green">
                ${escapeHtml((featuredLarge.category || "Thời sự").toUpperCase())}
            </div>

            <h3 class="card-title-large-green">
                ${escapeHtml(featuredLarge.title)}
            </h3>

            <p class="card-excerpt-clean">
                ${escapeHtml(getExcerpt(featuredLarge))}
            </p>

            <div class="card-time-clean">
                ${escapeHtml(formatDate(featuredLarge.publishedAt))}
            </div>
        </div>
    `;

    html += '<div class="featured-small-group">';

    featuredSmall.forEach(post => {
        html += `
            <div class="card-clean"
                 onclick="renderArticleDetail(decodeURIComponent('${makeClickArg(post.id)}'))">

                <img src="${escapeHtml(getPostImage(post))}"
                     class="card-img-small"
                     alt="${escapeHtml(post.title)}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';">

                <h4 class="card-title-small-clean">
                    ${escapeHtml(post.title)}
                </h4>

                <div class="card-time-clean">
                    ${escapeHtml(formatDate(post.publishedAt))}
                </div>
            </div>
        `;
    });

    html += "</div></div>";

    return html;
}

function createListItemHtml(post) {
    return `
        <div class="list-item"
             onclick="renderArticleDetail(decodeURIComponent('${makeClickArg(post.id)}'))">

            <img src="${escapeHtml(getPostImage(post))}"
                 class="list-item-img"
                 alt="${escapeHtml(post.title)}"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';">

            <div class="list-content">
                <div class="card-category-green">
                    ${escapeHtml((post.category || "").toUpperCase())}
                </div>

                <h4 class="list-item-title">
                    ${escapeHtml(post.title)}
                </h4>

                <p class="list-item-excerpt">
                    ${escapeHtml(getExcerpt(post))}
                </p>

                <div class="list-item-meta">
                    ${escapeHtml(formatDate(post.publishedAt))}
                    ${post.author ? " · " + escapeHtml(post.author) : ""}
                </div>
            </div>
        </div>
    `;
}

/* =========================================
   6. TRANG CHỦ VÀ CHUYÊN MỤC
========================================= */

function renderCategory(catId = "home") {
    const app = getAppViewElement();

    if (!app) {
        console.error(
            "Không tìm thấy vùng hiển thị bài viết: appView, postList hoặc mainContent."
        );
        return;
    }

    let requestedId = normalizeCategoryId(catId);

    if (
        !requestedId ||
        requestedId === "home" ||
        requestedId === "trang-chu"
    ) {
        catId = "home";
        requestedId = "home";
    }

    window.currentNewsPage = "category";

    const posts = sortPostsByDate(getPosts());
    setActiveNavigation(catId);

    if (requestedId === "moi-nhat") {
        let html = '<h2 class="section-title">Tin mới nhất</h2>';

        html += createGridHtml(posts.slice(0, 3));

        const remaining = posts.slice(3);

        if (remaining.length > 0) {
            html += '<div class="recent-list">';

            remaining.forEach(post => {
                html += createListItemHtml(post);
            });

            html += "</div>";
        }

        app.innerHTML = html;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    if (requestedId === "home") {
        let html = '<h2 class="section-title">Tin mới nhất</h2>';

        html += createGridHtml(posts.slice(0, 3));

        const listPosts = posts.slice(3, 10);

        if (listPosts.length > 0) {
            html += '<div class="recent-list">';

            listPosts.forEach(post => {
                html += createListItemHtml(post);
            });

            html += "</div>";
        }

        const sectionCategories = [
            "Thế giới",
            "Thời sự",
            "Pháp luật",
            "Sức khỏe",
            "Đời sống",
            "Du lịch",
            "Kinh doanh",
            "Bất động sản",
            "Thể thao"
        ];

        sectionCategories.forEach(catName => {
            const catPosts = posts.filter(post =>
                isPostInCategory(post, catName)
            );

            if (catPosts.length > 0) {
                const categoryId = normalizeCategoryId(catName);

                html += `
                    <div class="category-block">
                        <h3 class="category-section-title"
                            onclick="renderCategory('${categoryId}')">
                            ${escapeHtml(catName.toUpperCase())}
                            <span class="arrow">&gt;</span>
                        </h3>

                        ${createGridHtml(catPosts)}
                    </div>
                `;
            }
        });

        app.innerHTML = html;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    const categories = getCategories();
    const allCategories = [];

    categories.forEach(category => {
        allCategories.push(category);

        if (Array.isArray(category.children)) {
            allCategories.push(...category.children);
        }
    });

    const matchedCategory = allCategories.find(category =>
        normalizeCategoryId(category.id) === requestedId ||
        normalizeCategoryId(category.title) === requestedId
    );

    const targetTitle = matchedCategory?.title || String(catId);

    const filteredPosts = posts.filter(post =>
        isPostInCategory(post, requestedId)
    );

    let html = `
        <h2 class="section-title">
            ${escapeHtml(targetTitle)}
        </h2>
    `;

    if (filteredPosts.length === 0) {
        html += `
            <p style="margin-top:15px;">
                Chưa có bài viết nào trong chuyên mục này.
            </p>
        `;

        app.innerHTML = html;
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
    }

    html += createGridHtml(filteredPosts.slice(0, 3));

    const remaining = filteredPosts.slice(3);

    if (remaining.length > 0) {
        html += '<div class="recent-list" style="margin-top:20px;">';

        remaining.forEach(post => {
            html += createListItemHtml(post);
        });

        html += "</div>";
    }

    app.innerHTML = html;
    window.scrollTo({ top: 0, behavior: "smooth" });
}


/* =========================================
   7. HIỂN THỊ NỘI DUNG BÀI VIẾT
========================================= */

function renderArticleContent(content) {
    const source = String(content || "")
        .replace(/\r\n/g, "\n")
        .trim();

    if (!source) {
        return "<p>Nội dung bài viết đang được cập nhật.</p>";
    }

    const escaped = escapeHtml(source);

    let formatted = escaped.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (match, label, url) => {
            const safeUrl = url.replace(/&amp;/g, "&");

            if (!/^https?:\/\//i.test(safeUrl)) {
                return label;
            }

            return `<a href="${escapeHtml(safeUrl)}"
                       target="_blank"
                       rel="noopener noreferrer">${label}</a>`;
        }
    );

    formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
    );

    return formatted
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
        .join("");
}

function renderArticleDetail(postId) {
    const app = getAppViewElement();

    if (!app) {
        console.error("Không tìm thấy vùng hiển thị bài viết.");
        return;
    }

    const article = getPosts().find(post =>
        post && String(post.id) === String(postId)
    );

    if (!article) {
        app.innerHTML = `
            <h2>Bài viết không tồn tại</h2>
            <button onclick="renderCategory('home')">
                Quay lại trang chủ
            </button>
        `;
        return;
    }

    window.currentNewsPage = "article";

    setActiveNavigation(article.categoryId || article.category);

    const contentHtml = renderArticleContent(article.content);

    app.innerHTML = `
        <div class="article-detail">
            <h1 class="article-title-main">
                ${escapeHtml(article.title)}
            </h1>

            <div class="article-meta-info">
                <span>
                    Tác giả:
                    <b>${escapeHtml(article.author || "Chưa rõ tác giả")}</b>
                </span>
                ·
                <span>
                    Đăng ngày:
                    ${escapeHtml(formatDate(article.publishedAt) || "Chưa có thông tin")}
                </span>
                ·
                <span style="color:#008837;font-weight:bold;">
                    Chuyên mục:
                    ${escapeHtml(article.category || "Chưa phân loại")}
                </span>
            </div>

            ${article.excerpt ? `
                <p class="article-sapo-main">
                    ${escapeHtml(getExcerpt(article))}
                </p>
            ` : ""}

            ${(article.thumbnail || article.image) ? `
                <img src="${escapeHtml(getPostImage(article))}"
                     class="detail-main-img"
                     alt="${escapeHtml(article.title)}"
                     onerror="this.style.display='none';">
            ` : ""}

            <div class="article-content-body">
                ${contentHtml}
            </div>

            ${article.url ? `
                <p class="article-source-link">
                    <a href="${escapeHtml(article.url)}"
                       target="_blank"
                       rel="noopener noreferrer">
                        Xem bài viết gốc
                    </a>
                </p>
            ` : ""}

            <br>
            <hr>
            <br>

            <button
                onclick="renderCategory('home')"
                style="background:#6c757d;border:none;color:#fff;padding:8px 16px;border-radius:4px;cursor:pointer;">
                &larr; Quay lại trang chủ
            </button>
        </div>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================================
   8. TRANG CRAWLER
========================================= */

function renderCrawlerPage() {
    window.currentNewsPage = "crawler";

    const app = getAppViewElement();

    if (!app) {
        console.error("Không tìm thấy vùng hiển thị crawler.");
        return;
    }

    setActiveNavigation("crawler");

    app.innerHTML = `
        <div class="crawler-page">
            <h2>Thu thập bài viết Dân Trí</h2>

            <p>
                Nhập URL bài viết Dân Trí để thêm bài viết vào website.
            </p>

            <div class="crawler-form">
                <label for="crawlUrl">URL bài viết:</label>

                <input
                    id="crawlUrl"
                    type="url"
                    placeholder="https://dantri.com.vn/..."
                    style="width:100%;padding:10px;margin:10px 0;"
                >

                <label for="crawlCategory">Chuyên mục:</label>

                <input
                    id="crawlCategory"
                    type="text"
                    placeholder="Ví dụ: Thế giới"
                    style="width:100%;padding:10px;margin:10px 0;"
                >

                <button
                    type="button"
                    onclick="handleCrawl()"
                    style="padding:10px 18px;cursor:pointer;"
                >
                    Thu thập bài viết
                </button>
            </div>

            <div id="crawlResult" style="margin-top:20px;"></div>

            <hr style="margin:25px 0;">

            <h3>Bài viết đã lưu trên trình duyệt</h3>

            <p>
                Danh sách này được lưu trong localStorage của trình duyệt
                hiện tại, không tự động đồng bộ lên GitHub.
            </p>

            <div id="localStoragePosts"></div>

            <button
                type="button"
                onclick="resetDefaultData()"
                style="margin-top:15px;padding:8px 14px;cursor:pointer;"
            >
                Khôi phục dữ liệu mặc định
            </button>
        </div>
    `;

    renderLocalStorageList();
}


/* =========================================
   9. HIỂN THỊ BÀI ĐÃ LƯU
========================================= */

function renderLocalStorageList() {
    const container = document.getElementById("localStoragePosts");

    if (!container) return;

    const posts = getPosts();

    if (!posts.length) {
        container.innerHTML = "<p>Chưa có bài viết nào được lưu.</p>";
        return;
    }

    let html = '<div class="recent-list">';

    posts.forEach(post => {
        html += `
            <div class="list-item">
                <div class="list-content">
                    <h4 class="list-item-title">
                        ${escapeHtml(post.title || "Chưa có tiêu đề")}
                    </h4>

                    <p>
                        Chuyên mục:
                        ${escapeHtml(post.category || "Chưa phân loại")}
                    </p>

                    <p>
                        ${escapeHtml(formatDate(post.publishedAt))}
                    </p>

                    <button
                        type="button"
                        onclick="deleteLocalPost('${makeClickArg(post.id)}')"
                        style="padding:6px 12px;cursor:pointer;"
                    >
                        Xóa bài
                    </button>
                </div>
            </div>
        `;
    });

    html += "</div>";

    container.innerHTML = html;
}

function deleteLocalPost(postId) {
    const decodedId = decodeURIComponent(postId);

    const confirmed = window.confirm(
        "Mày có chắc muốn xóa bài viết này khỏi dữ liệu trình duyệt không?"
    );

    if (!confirmed) return;

    const remainingPosts = getPosts().filter(post =>
        String(post.id) !== String(decodedId)
    );

    savePostsToStorage(remainingPosts);

    renderLocalStorageList();

    alert("Đã xóa bài viết khỏi localStorage của trình duyệt hiện tại.");
}


/* =========================================
   10. KIỂM TRA URL DÂN TRÍ
========================================= */

function isValidDantriUrl(url) {
    try {
        const parsedUrl = new URL(url);

        const hostname = parsedUrl.hostname.toLowerCase();

        return (
            (hostname === "dantri.com.vn" ||
             hostname.endsWith(".dantri.com.vn")) &&
            parsedUrl.protocol === "https:"
        );
    } catch (error) {
        return false;
    }
}

function showCrawlResult(message, isError = false) {
    const result = document.getElementById("crawlResult");

    if (!result) return;

    result.innerHTML = `
        <div style="
            padding:12px;
            margin-top:10px;
            border-radius:4px;
            background:${isError ? "#f8d7da" : "#d4edda"};
            color:${isError ? "#721c24" : "#155724"};
        ">
            ${escapeHtml(message)}
        </div>
    `;
}

function validateCrawledArticle(article) {
    if (!article || typeof article !== "object") {
        return {
            valid: false,
            message: "Dữ liệu bài viết không hợp lệ."
        };
    }

    if (!article.title || !String(article.title).trim()) {
        return {
            valid: false,
            message: "Bài viết chưa có tiêu đề."
        };
    }

    if (!article.url || !isValidDantriUrl(article.url)) {
        return {
            valid: false,
            message: "URL phải thuộc website dantri.com.vn."
        };
    }

    return {
        valid: true,
        message: "Dữ liệu hợp lệ."
    };
}


/* =========================================
   11. THU THẬP BÀI VIẾT TỪ URL
========================================= */

async function handleCrawl() {
    const urlInput = document.getElementById("crawlUrl");
    const categoryInput = document.getElementById("crawlCategory");

    if (!urlInput) {
        showCrawlResult("Không tìm thấy ô nhập URL.", true);
        return;
    }

    const articleUrl = urlInput.value.trim();

    const category = categoryInput && categoryInput.value.trim()
        ? categoryInput.value.trim()
        : "Chưa phân loại";

    if (!articleUrl) {
        showCrawlResult("Mày chưa nhập URL bài viết.", true);
        return;
    }

    if (!isValidDantriUrl(articleUrl)) {
        showCrawlResult(
            "URL không hợp lệ. Hãy nhập URL HTTPS thuộc dantri.com.vn.",
            true
        );
        return;
    }

    showCrawlResult(
        "Trình duyệt không thể tự do đọc HTML từ Dân Trí nếu bị CORS chặn. " +
        "Hãy sử dụng crawler chạy bằng GitHub Actions để thu thập dữ liệu."
    );

    /*
     * GitHub Pages chỉ phục vụ website tĩnh.
     * Đoạn này không giả vờ rằng đã thu thập thành công.
     * Muốn tự động thu thập dữ liệu, cần crawler chạy ở môi trường
     * có thể truy cập trang nguồn, ví dụ GitHub Actions.
     */
}


/* =========================================
   12. ĐỌC BÀI VIẾT TỪ HTML ĐÃ CÓ
========================================= */

function handleCrawlFromHtml(htmlText, articleUrl, category) {
    if (!htmlText || typeof htmlText !== "string") {
        return {
            success: false,
            message: "HTML đầu vào không hợp lệ."
        };
    }

    if (!isValidDantriUrl(articleUrl)) {
        return {
            success: false,
            message: "URL bài viết không thuộc Dân Trí."
        };
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, "text/html");

    const title =
        doc.querySelector('meta[property="og:title"]')?.content ||
        doc.querySelector("h1")?.textContent?.trim() ||
        doc.querySelector("title")?.textContent?.trim() ||
        "";

    const image =
        doc.querySelector('meta[property="og:image"]')?.content ||
        doc.querySelector('meta[name="twitter:image"]')?.content ||
        "";

    const description =
        doc.querySelector('meta[property="og:description"]')?.content ||
        doc.querySelector('meta[name="description"]')?.content ||
        "";

    const author =
        doc.querySelector('[class*="author"]')?.textContent?.trim() ||
        doc.querySelector('[rel="author"]')?.textContent?.trim() ||
        "";

    const articleContent = doc.querySelector("article");

    const content = articleContent
        ? articleContent.innerText.trim()
        : description;

    const article = {
        id: createPostId(articleUrl),
        title: title,
        category: category || "Chưa phân loại",
        categoryId: normalizeCategoryId(category || "Chưa phân loại"),
        author: author,
        publishedAt:
            doc.querySelector('meta[property="article:published_time"]')?.content ||
            "",
        thumbnail: image,
        image: image,
        excerpt: description,
        content: content,
        url: articleUrl,
        source: "Dân Trí"
    };

    const validation = validateCrawledArticle(article);

    if (!validation.valid) {
        return {
            success: false,
            message: validation.message
        };
    }

    const posts = getPosts();

    const exists = posts.some(post =>
        post.url === article.url ||
        String(post.id) === String(article.id)
    );

    if (exists) {
        return {
            success: false,
            message: "Bài viết này đã tồn tại."
        };
    }

    posts.unshift(article);

    savePostsToStorage(posts);

    return {
        success: true,
        message: "Đã thêm bài viết vào localStorage.",
        article: article
    };
}


/* =========================================
   13. KHÔI PHỤC DỮ LIỆU
========================================= */

function resetDefaultData() {
    const confirmed = window.confirm(
        "Khôi phục dữ liệu mặc định? Những bài viết chỉ lưu trong " +
        "localStorage của trình duyệt này có thể bị mất."
    );

    if (!confirmed) return;

    try {
        localStorage.removeItem("newsWebsitePosts");
    } catch (error) {
        console.error("Không thể xóa dữ liệu localStorage:", error);
    }

    allPosts = [...DEFAULT_POSTS];

    renderCategory("home");

    alert("Đã khôi phục dữ liệu mặc định.");
}


/* =========================================
   14. KHỞI CHẠY ỨNG DỤNG
========================================= */

function initApp() {
    const page = document.body?.dataset?.page || "";

    if (page === "crawler" || window.location.pathname.endsWith("crawler.html")) {
        renderCrawlerPage();
        return;
    }

    initDataFromFiles();
}

document.addEventListener("DOMContentLoaded", initApp);
