
/* =========================================
   1. DỮ LIỆU MẪU MẶC ĐỊNH
========================================= */

const DEFAULT_MENU = [
    { id: "home", title: "Trang chủ", type: "home" },
    { id: "Thời sự", title: "Thời sự", type: "category" },
    { id: "Thế giới", title: "Thế giới", type: "category" },
    { id: "Bất động sản", title: "Bất động sản", type: "category" },
    { id: "Thể thao", title: "Thể thao", type: "category" }
    { id: "moi-nhat", title: "Mới nhất", type: "category" },
    {
        id: "the-gioi",
        title: "Thế giới",
        type: "category",
        children: [
            { id: "quan-su", title: "Quân sự", type: "category" },
            { id: "phan-tich", title: "Phân tích - Bình luận", type: "category" },
            { id: "the-gioi-do-day", title: "Thế giới đó đây", type: "category" },
            { id: "kieu-bao", title: "Kiều bào", type: "category" }
        ]
    },
    {
        id: "thoi-su",
        title: "Thời sự",
        type: "category",
        children: [
            { id: "chinh-tri", title: "Chính trị", type: "category" },
            { id: "giao-thong", title: "Giao thông", type: "category" },
            { id: "moi-truong", title: "Môi trường", type: "category" },
            { id: "nong-tren-mang", title: "Nóng trên mạng", type: "category" }
        ]
    },
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
        excerpt: "(Dân trí) - Cục Đường bộ Việt Nam đề xuất nhiều thay đổi về biển báo, đèn tín hiệu, khoảng cách đặt biển cảnh báo và hệ thống chỉ dẫn trên đường cao tốc.",
        excerpt: "Cục Đường bộ Việt Nam đề xuất nhiều thay đổi về biển báo, đèn tín hiệu, khoảng cách đặt biển cảnh báo và hệ thống chỉ dẫn trên đường cao tốc.",
        content: "Cục Đường bộ Việt Nam vừa hoàn thiện bản dự thảo đề xuất quy chuẩn mới về hệ thống biển báo giao thông trên đường cao tốc.\n\nMột trong những nội dung trọng tâm là việc quy định khoảng cách tối thiểu từ biển cảnh báo đến vị trí sự cố hoặc công trường thi công trên đường cao tốc nhằm giúp tài xế chủ động giảm tốc độ an toàn.",
        thumbnail: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
@@ -34,8 +61,6 @@ const DEFAULT_POSTS = [
   2. HÀM TIỆN ÍCH
========================================= */

// Chuyển tên chuyên mục thành ID thống nhất.
// Ví dụ: "Thế giới" -> "the-gioi"
function normalizeCategoryId(value) {
    return String(value || "")
        .normalize("NFD")
@@ -47,7 +72,6 @@ function normalizeCategoryId(value) {
        .replace(/^-+|-+$/g, "");
}

// Mã hóa nội dung trước khi đưa vào HTML.
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
@@ -58,12 +82,10 @@ function escapeHtml(value) {
    })[char]);
}

// Tạo tham số an toàn cho các hàm onclick trong HTML.
function makeClickArg(value) {
    return encodeURIComponent(String(value ?? ""));
}

// Chuẩn hóa dữ liệu bài viết để dùng chung toàn website.
function normalizePost(post) {
    if (!post || typeof post !== "object") return null;

@@ -90,7 +112,9 @@ function normalizePost(post) {
        slug: post.slug || id,
        category,
        categoryId,
        excerpt: String(post.excerpt || "").trim(),
        excerpt: String(post.excerpt || "")
            .trim()
            .replace(/^(\(Dân trí\)|Dân trí)\s*[-–—]\s*/i, ""),
        content: String(post.content || ""),
        author: String(post.author || "").trim(),
        publishedAt: post.publishedAt || post.date || "",
@@ -101,38 +125,63 @@ function normalizePost(post) {
    };
}

// Chuẩn hóa danh mục từ menu.json hoặc dữ liệu dự phòng.
function normalizeMenuItem(item) {
    if (!item || typeof item !== "object") return null;

    const title = String(item.title || item.name || item.id || "").trim();
    const id = String(item.id || normalizeCategoryId(title)).trim();
    const title = String(
        item.title || item.name || item.id || ""
    ).trim();

    const id = normalizeCategoryId(item.id || title);

    if (!title || !id) return null;

    return {
        ...item,
        id,
        title,
        type: item.type || (id === "home" ? "home" : "category")
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

// Kiểm tra bài viết có thuộc chuyên mục được chọn hay không.
function isPostInCategory(post, catId) {
    if (!post || !catId) return false;

    const targetId = normalizeCategoryId(catId);

    if (!targetId || targetId === "home" || targetId === "moi-nhat") {
        return false;
    }
    if (!targetId || targetId === "home") return false;

    const normalizedPost = normalizePost(post);
    if (!normalizedPost) return false;

    if (targetId === "moi-nhat") return true;

    return (
        normalizedPost.categoryId === targetId ||
        normalizeCategoryId(normalizedPost.categoryId) === targetId ||
        normalizeCategoryId(normalizedPost.category) === targetId
    );
}
@@ -163,17 +212,14 @@ function getPostImage(post) {
    );
}

// Không tự thêm tiền tố Dân trí vào mô tả.
function getExcerpt(post) {
    const excerpt = String(post?.excerpt || "").trim();

    if (!excerpt) return "";

    return /^(\(Dân trí\)|Dân trí)\s*[-–—]/i.test(excerpt)
        ? excerpt
        : `(Dân trí) - ${excerpt}`;
    return String(post?.excerpt || "")
        .trim()
        .replace(/^(\(Dân trí\)|Dân trí)\s*[-–—]\s*/i, "")
        .trim();
}

// Sắp xếp bài viết mới nhất lên đầu.
function sortPostsByDate(posts) {
    return [...posts].sort((a, b) => {
        const timeA = a.publishedAt
@@ -184,10 +230,10 @@ function sortPostsByDate(posts) {
            ? new Date(String(b.publishedAt).replace(" ", "T")).getTime()
            : 0;

        const safeA = Number.isNaN(timeA) ? 0 : timeA;
        const safeB = Number.isNaN(timeB) ? 0 : timeB;

        return safeB - safeA;
        return (
            (Number.isNaN(timeB) ? 0 : timeB) -
            (Number.isNaN(timeA) ? 0 : timeA)
        );
    });
}

@@ -196,30 +242,84 @@ function sortPostsByDate(posts) {
   3. QUẢN LÝ LOCALSTORAGE
========================================= */

// Sửa: luôn giữ các mục con mặc định khi menu cũ trong
// LocalStorage chưa có children hoặc còn thiếu mục con.
function getCategories() {
    let storedMenu = [];

    try {
        const raw = localStorage.getItem("categories");

        if (raw) {
            const data = JSON.parse(raw);
            const menu = Array.isArray(data) ? data : data?.menu;

            const menu = Array.isArray(data)
                ? data
                : data?.menu;

            if (Array.isArray(menu) && menu.length > 0) {
                const normalized = menu
            if (Array.isArray(menu)) {
                storedMenu = menu
                    .map(normalizeMenuItem)
                    .filter(Boolean);

                if (normalized.length > 0) return normalized;
            }
        }
    } catch (error) {
        console.warn("Không đọc được categories:", error);
    }

    return DEFAULT_MENU.map(normalizeMenuItem).filter(Boolean);
    const defaultMenu = DEFAULT_MENU
        .map(normalizeMenuItem)
        .filter(Boolean);

    if (storedMenu.length === 0) {
        return defaultMenu;
    }

    return storedMenu.map(item => {
        const defaultItem = defaultMenu.find(
            defaultCat =>
                normalizeCategoryId(defaultCat.id) ===
                normalizeCategoryId(item.id)
        );

        if (!defaultItem) {
            return item;
        }

        const existingChildren = Array.isArray(item.children)
            ? item.children
            : [];

        const defaultChildren = Array.isArray(defaultItem.children)
            ? defaultItem.children
            : [];

        // Giữ nguyên mục con hiện có, bổ sung mục con còn thiếu.
        const mergedChildren = [...existingChildren];

        defaultChildren.forEach(defaultChild => {
            const exists = mergedChildren.some(child =>
                normalizeCategoryId(child.id) ===
                    normalizeCategoryId(defaultChild.id) ||
                normalizeCategoryId(child.title) ===
                    normalizeCategoryId(defaultChild.title)
            );

            if (!exists) {
                mergedChildren.push(defaultChild);
            }
        });

        return {
            ...defaultItem,
            ...item,
            children: mergedChildren
        };
    }).concat(
        defaultMenu.filter(defaultItem =>
            !storedMenu.some(item =>
                normalizeCategoryId(item.id) ===
                normalizeCategoryId(defaultItem.id)
            )
        )
    );
}

function getPosts() {
@@ -228,18 +328,13 @@ function getPosts() {

        if (raw) {
            const data = JSON.parse(raw);

            const posts = Array.isArray(data)
                ? data
                : data?.posts;
            const posts = Array.isArray(data) ? data : data?.posts;

            if (Array.isArray(posts)) {
                const normalized = posts
                    .map(normalizePost)
                    .filter(Boolean);

                // Nếu dữ liệu đã lưu bị rỗng hoặc không hợp lệ,
                // dùng dữ liệu mẫu thay vì làm trang bị trắng.
                if (normalized.length > 0) return normalized;
            }
        }
@@ -258,6 +353,7 @@ function savePostToStorage(newPost) {
    }

    const posts = getPosts();

    const index = posts.findIndex(
        post => String(post.id) === String(normalizedPost.id)
    );
@@ -282,17 +378,13 @@ function savePostToStorage(newPost) {
}

async function initDataFromFiles() {
    // Chỉ tải dữ liệu mẫu từ file nếu chưa có dữ liệu lưu.
    // Không ghi đè các bài viết đã crawl.
    if (!localStorage.getItem("categories")) {
        try {
            const response = await fetch("./data/menu.json");

            if (response.ok) {
                const data = await response.json();
                const menu = Array.isArray(data)
                    ? data
                    : data?.menu;
                const menu = Array.isArray(data) ? data : data?.menu;

                if (Array.isArray(menu) && menu.length > 0) {
                    localStorage.setItem(
@@ -312,18 +404,14 @@ async function initDataFromFiles() {

            if (response.ok) {
                const data = await response.json();
                const posts = Array.isArray(data)
                    ? data
                    : data?.posts;
                const posts = Array.isArray(data) ? data : data?.posts;

                if (Array.isArray(posts) && posts.length > 0) {
                    const normalized = posts
                        .map(normalizePost)
                        .filter(Boolean);

                    localStorage.setItem(
                        "posts",
                        JSON.stringify(normalized)
                        JSON.stringify(
                            posts.map(normalizePost).filter(Boolean)
                        )
                    );
                }
            }
@@ -334,9 +422,10 @@ async function initDataFromFiles() {

    renderNavbar();

    // Chỉ cập nhật trang chủ nếu người dùng chưa chuyển sang trang khác.
    if (window.currentNewsPage !== "crawler" &&
        window.currentNewsPage !== "article") {
    if (
        window.currentNewsPage !== "crawler" &&
        window.currentNewsPage !== "article"
    ) {
        renderCategory("home");
    }
}
@@ -362,15 +451,26 @@ function renderNavbar() {
        const navId = escapeHtml(normalizeCategoryId(cat.id));

        if (Array.isArray(cat.children) && cat.children.length > 0) {
            let subHtml = '<ul class="dropdown-menu">';
            const dropdownClass =
                normalizeCategoryId(cat.id) === "the-gioi"
                    ? "dropdown-world"
                    : normalizeCategoryId(cat.id) === "thoi-su"
                        ? "dropdown-current"
                        : "";

            let subHtml = `
                <ul class="dropdown-menu ${dropdownClass}">
            `;

            cat.children.forEach(child => {
                if (!child || !child.id) return;

                const childArg = makeClickArg(child.id);

                subHtml += `
                    <li>
                        <a href="#"
                           onclick="event.preventDefault();renderCategory(decodeURIComponent('${makeClickArg(child.id)}'))">
                           onclick="event.preventDefault();renderCategory(decodeURIComponent('${childArg}'))">
                            ${escapeHtml(child.title || child.id)}
                        </a>
                    </li>
@@ -383,8 +483,9 @@ function renderNavbar() {
                <li class="has-dropdown">
                    <a href="#"
                       onclick="event.preventDefault();renderCategory(decodeURIComponent('${idArg}'))"
                       id="nav-${navId}">
                        ${title} ▾
                       id="nav-${navId}"
                       aria-haspopup="true">
                        ${title} <span aria-hidden="true">▾</span>
                    </a>
                    ${subHtml}
                </li>
@@ -443,42 +544,40 @@ function setActiveNavigation(catId) {

function createGridHtml(postsList) {
    if (!Array.isArray(postsList) || postsList.length === 0) {
        return '<p>Chưa có bài viết để hiển thị.</p>';
        return "<p>Chưa có bài viết để hiển thị.</p>";
    }

    const featuredLarge = postsList[0];
    const featuredSmall = postsList.slice(1, 3);

    let html = '<div class="featured-grid">';

    if (featuredLarge) {
        html += `
            <div class="card-clean"
                 onclick="renderArticleDetail(decodeURIComponent('${makeClickArg(featuredLarge.id)}'))">
                <img src="${escapeHtml(getPostImage(featuredLarge))}"
                     class="card-img-large"
                     alt="${escapeHtml(featuredLarge.title)}"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800';">
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
            <div class="card-category-green">
                ${escapeHtml((featuredLarge.category || "Thời sự").toUpperCase())}
            </div>

                <h3 class="card-title-large-green">
                    ${escapeHtml(featuredLarge.title)}
                </h3>
            <h3 class="card-title-large-green">
                ${escapeHtml(featuredLarge.title)}
            </h3>

                <p class="card-excerpt-clean">
                    ${escapeHtml(getExcerpt(featuredLarge))}
                </p>
            <p class="card-excerpt-clean">
                ${escapeHtml(getExcerpt(featuredLarge))}
            </p>

                <div class="card-time-clean">
                    ${escapeHtml(formatDate(featuredLarge.publishedAt))}
                </div>
            <div class="card-time-clean">
                ${escapeHtml(formatDate(featuredLarge.publishedAt))}
            </div>
        `;
    }
        </div>
    `;

    html += '<div class="featured-small-group">';

@@ -549,22 +648,44 @@ function renderCategory(catId = "home") {
    const app = document.getElementById("appView");
    if (!app) return;

    const requestedId = normalizeCategoryId(catId);
    let requestedId = normalizeCategoryId(catId);

    // Cho phép các cách gọi "Mới nhất" quay về trang tin mới.
    if (!requestedId ||
    if (
        !requestedId ||
        requestedId === "home" ||
        requestedId === "trang-chu" ||
        requestedId === "moi-nhat") {
        requestedId === "trang-chu"
    ) {
        catId = "home";
        requestedId = "home";
    }

    window.currentNewsPage = "category";

    const posts = sortPostsByDate(getPosts());
    setActiveNavigation(catId);

    if (catId === "home") {
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
@@ -618,27 +739,27 @@ function renderCategory(catId = "home") {
        return;
    }

    const targetId = normalizeCategoryId(catId);
    const categories = getCategories();
    const allCategories = [];

    const matchedCategory = categories.find(category =>
        normalizeCategoryId(category.id) === targetId ||
        normalizeCategoryId(category.title) === targetId
    );
    categories.forEach(category => {
        allCategories.push(category);

    const targetTitle = matchedCategory?.title || String(catId);
        if (Array.isArray(category.children)) {
            allCategories.push(...category.children);
        }
    });

    // Lọc theo ID chuẩn hóa, đồng thời hỗ trợ bài cũ chỉ có category.
    const filteredPosts = posts.filter(post => {
        if (isPostInCategory(post, catId)) return true;
    const matchedCategory = allCategories.find(category =>
        normalizeCategoryId(category.id) === requestedId ||
        normalizeCategoryId(category.title) === requestedId
    );

        if (matchedCategory) {
            if (isPostInCategory(post, matchedCategory.id)) return true;
            if (isPostInCategory(post, matchedCategory.title)) return true;
        }
    const targetTitle = matchedCategory?.title || String(catId);

        return false;
    });
    const filteredPosts = posts.filter(post =>
        isPostInCategory(post, requestedId)
    );

    let html = `<h2 class="section-title">${escapeHtml(targetTitle)}</h2>`;

@@ -677,35 +798,33 @@ function renderCategory(catId = "home") {
   7. HIỂN THỊ NỘI DUNG BÀI VIẾT
========================================= */

// Chuyển Markdown cơ bản sang HTML.
// Nội dung được escape trước khi tạo liên kết để hạn chế XSS.
function renderArticleContent(content) {
    const source = String(content || "").replace(/\r\n/g, "\n").trim();
    const source = String(content || "")
        .replace(/\r\n/g, "\n")
        .trim();

    if (!source) return "<p>Nội dung bài viết đang được cập nhật.</p>";
    if (!source) {
        return "<p>Nội dung bài viết đang được cập nhật.</p>";
    }

    // Nếu nội dung là HTML từ crawler, hiển thị dưới dạng văn bản an toàn.
    // Không chèn HTML thô từ website bên ngoài vào trang.
    const escaped = escapeHtml(source);

    // Hỗ trợ Markdown dạng [tên liên kết](https://...)
    let formatted = escaped.replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        (match, label, url) => {
            const safeUrl = url.replace(/&amp;/g, "&");

            if (!/^https?:\/\//i.test(safeUrl)) {
                return label;
            }
            if (!/^https?:\/\//i.test(safeUrl)) return label;

            return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
        }
    );

    // Hỗ trợ chữ đậm **nội dung**
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(
        /\*\*([^*]+)\*\*/g,
        "<strong>$1</strong>"
    );

    // Mỗi đoạn văn cách nhau bởi một dòng trống.
    return formatted
        .split(/\n{2,}/)
        .map(paragraph => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
@@ -981,15 +1100,13 @@ async function handleCrawl() {
    }

    try {
        let article = null;

        if (typeof getArticle === "function") {
            article = await getArticle(urlInput);
        } else {
        if (typeof getArticle !== "function") {
            alert("Không tìm thấy hàm getArticle trong js/crawler.js!");
            return;
        }

        const article = await getArticle(urlInput);

        if (!validateCrawledArticle(article)) {
            alert(
                "Chưa lấy được đủ tiêu đề và nội dung.\n\n" +
@@ -999,7 +1116,6 @@ async function handleCrawl() {
            return;
        }

        // Đảm bảo URL bài viết gốc được lưu.
        article.url = article.url || urlInput;

        showCrawlResult(article);
@@ -1042,7 +1158,7 @@ function handleCrawlFromHtml() {

    if (/^https?:\/\/\S+$/i.test(htmlText)) {
        alert(
            "Mày đang dán URL, không phải mã HTML. " +
            "Bạn đang dán URL, không phải mã HTML. " +
            "Mở bài viết, nhấn Ctrl+U rồi sao chép mã nguồn."
        );
        return;
@@ -1103,13 +1219,8 @@ function resetDefaultData() {

    window.currentNewsPage = "category";

    renderNavbar();
    renderCategory("home");

    // Nếu đang ở trang crawler thì cập nhật lại danh sách ngay.
    if (document.getElementById("localStorageList")) {
        renderCrawlerPage();
    }
    // Tải lại menu và bài viết từ file JSON sau khi reset.
    initDataFromFiles();
}


@@ -1120,8 +1231,6 @@ function resetDefaultData() {
function initApp() {
    renderNavbar();
    renderCategory("home");

    // Tải JSON sau khi trang đã hiển thị dữ liệu dự phòng.
    initDataFromFiles();
}
