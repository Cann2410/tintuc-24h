
"use strict";

/* =========================================================
   DÂN TRÍ NEWS APP - MAIN.JS
   - Đọc menu và bài viết từ JSON
   - Hỗ trợ chuyên mục cha và chuyên mục con
   - Tải lại dữ liệu JSON mới nhất
   - Giữ bài viết trong localStorage khi cần
   ========================================================= */

const DEFAULT_MENU = [
  { id: "home", title: "Trang chủ", type: "home", url: "/" },
  { id: "moi-nhat", title: "Mới nhất", type: "category", url: "/tin-moi-nhat.htm" },
  {
    id: "the-gioi",
    title: "Thế giới",
    type: "category",
    url: "/the-gioi.htm",
    children: [
      { id: "quan-su", title: "Quân sự", type: "category", url: "/the-gioi/quan-su.htm" },
      { id: "phan-tich", title: "Phân tích - Bình luận", type: "category", url: "/the-gioi/phan-tich-binh-luan.htm" }
    ]
  },
  { id: "thoi-su", title: "Thời sự", type: "category", url: "/thoi-su.htm" },
  { id: "kinh-doanh", title: "Kinh doanh", type: "category", url: "/kinh-doanh.htm" },
  { id: "bat-dong-san", title: "Bất động sản", type: "category", url: "/bat-dong-san.htm" },
  { id: "the-thao", title: "Thể thao", type: "category", url: "/the-thao.htm" },
  { id: "giao-duc", title: "Giáo dục", type: "category", url: "/giao-duc.htm" },
  { id: "suc-khoe", title: "Sức khỏe", type: "category", url: "/suc-khoe.htm" },
  { id: "van-hoa", title: "Văn hóa", type: "category", url: "/van-hoa.htm" },
  { id: "giai-tri", title: "Giải trí", type: "category", url: "/giai-tri.htm" },
  { id: "phap-luat", title: "Pháp luật", type: "category", url: "/phap-luat.htm" },
  { id: "cong-nghe", title: "Công nghệ", type: "category", url: "/cong-nghe.htm" },
  { id: "doi-song", title: "Đời sống", type: "category", url: "/doi-song.htm" },
  { id: "du-lich", title: "Du lịch", type: "category", url: "/du-lich.htm" },
  { id: "dan-tri-360", title: "Dân trí 360", type: "category", url: "/dt360.htm" }
];

const DEFAULT_POSTS = [];

const STORAGE_POSTS_KEY = "newsWebsitePosts";
const STORAGE_MENU_KEY = "newsWebsiteMenu";

let allPosts = [];
let allMenu = [];
let currentCategory = "home";
let currentSearch = "";

/* ---------------------------------------------------------
   TÌM ĐƯỜNG DẪN JSON
   Hỗ trợ main.js ở thư mục gốc hoặc trong thư mục js/
   --------------------------------------------------------- */

function getJSONPaths(fileName) {
  const script = document.currentScript;
  const scriptURL = script && script.src ? script.src : "";
  const scriptDirectory = scriptURL
    ? new URL(".", scriptURL).pathname
    : "";

  const candidates = [
    `./data/${fileName}`,
    `../data/${fileName}`,
    `${scriptDirectory}../data/${fileName}`,
    `${scriptDirectory}data/${fileName}`
  ];

  return [...new Set(candidates)];
}

async function loadJSON(fileName) {
  const paths = getJSONPaths(fileName);

  for (const path of paths) {
    try {
      const url = new URL(path, window.location.href);
      url.searchParams.set("_", String(Date.now()));

      const response = await fetch(url.toString(), {
        cache: "no-store"
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data && typeof data === "object") return data;
    } catch (error) {
      console.warn("Không tải được JSON:", path, error);
    }
  }

  return null;
}

/* ---------------------------------------------------------
   CHUẨN HÓA CHUỖI VÀ ID
   --------------------------------------------------------- */

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("vi");
}

function slugify(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeId(value) {
  return slugify(value);
}

function getArrayFromJSON(data, key) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data[key])) return data[key];
  return [];
}

/* ---------------------------------------------------------
   CHUẨN HÓA MENU
   Giữ tên chuyên mục trong JSON; tạo ID phụ để so sánh.
   --------------------------------------------------------- */

function normalizeMenuItem(item) {
  if (!item || typeof item !== "object") return null;

  const title = String(
    item.title ?? item.name ?? item.label ?? item.id ?? ""
  ).trim();

  if (!title) return null;

  const id = String(item.id ?? slugify(title)).trim();

  const childrenSource = Array.isArray(item.children)
    ? item.children
    : Array.isArray(item.subCategories)
      ? item.subCategories
      : [];

  return {
    ...item,
    id,
    title,
    type: item.type || "category",
    children: childrenSource.map(normalizeMenuItem).filter(Boolean)
  };
}

function flattenMenu(items, parent = null, result = []) {
  for (const item of items || []) {
    result.push({ ...item, parent });
    flattenMenu(item.children || [], item, result);
  }
  return result;
}

function findMenuItem(value) {
  const wanted = normalizeId(value);
  const wantedText = normalizeText(value);

  return flattenMenu(allMenu).find(({ id, title }) =>
    normalizeId(id) === wanted ||
    normalizeId(title) === wanted ||
    normalizeText(title) === wantedText
  ) || null;
}

/* ---------------------------------------------------------
   CHUẨN HÓA BÀI VIẾT
   Hỗ trợ nhiều cách đặt tên trường trong posts.json.
   --------------------------------------------------------- */

function detectCategoryFromUrl(url) {
  if (!url) return "";

  let pathname = String(url);

  try {
    pathname = new URL(url, "https://dantri.com.vn").pathname;
  } catch (_) {}

  const path = slugify(pathname);

  const rules = [
    ["moi-nhat", ["tin-moi-nhat", "moi-nhat"]],
    ["the-gioi", ["the-gioi"]],
    ["quan-su", ["quan-su"]],
    ["phan-tich", ["phan-tich-binh-luan", "phan-tich"]],
    ["thoi-su", ["thoi-su"]],
    ["kinh-doanh", ["kinh-doanh"]],
    ["bat-dong-san", ["bat-dong-san"]],
    ["the-thao", ["the-thao"]],
    ["giao-duc", ["giao-duc"]],
    ["suc-khoe", ["suc-khoe"]],
    ["van-hoa", ["van-hoa"]],
    ["giai-tri", ["giai-tri"]],
    ["phap-luat", ["phap-luat"]],
    ["cong-nghe", ["cong-nghe"]],
    ["doi-song", ["doi-song"]],
    ["du-lich", ["du-lich"]],
    ["dan-tri-360", ["dt360", "dan-tri-360"]]
  ];

  for (const [id, slugs] of rules) {
    if (slugs.some(slug => path.includes(slug))) return id;
  }

  return "";
}

function normalizePost(post, index = 0) {
  if (!post || typeof post !== "object") return null;

  const title = String(
    post.title ?? post.name ?? post.headline ?? ""
  ).trim();

  if (!title) return null;

  const url = String(
    post.url ?? post.link ?? post.sourceUrl ?? post.source_url ?? ""
  ).trim();

  const rawCategory = String(
    post.categoryId ??
    post.category_id ??
    post.category ??
    post.categoryName ??
    post.category_name ??
    ""
  ).trim();

  const rawSubCategory = String(
    post.subCategoryId ??
    post.sub_category_id ??
    post.subCategory ??
    post.sub_category ??
    post.subCategoryName ??
    ""
  ).trim();

  const detectedCategory = detectCategoryFromUrl(url);

  const categoryItem = findMenuItem(rawCategory);
  const subCategoryItem = findMenuItem(rawSubCategory);

  let categoryId = categoryItem
    ? categoryItem.id
    : normalizeId(rawCategory);

  let subCategoryId = subCategoryItem
    ? subCategoryItem.id
    : normalizeId(rawSubCategory);

  if (!categoryId && detectedCategory) {
    const detectedItem = findMenuItem(detectedCategory);
    categoryId = detectedItem ? detectedItem.id : detectedCategory;
  }

  const parentItem = subCategoryItem?.parent;

  if (!categoryId && parentItem) {
    categoryId = parentItem.id;
  }

  const content = String(
    post.content ?? post.description ?? post.summary ?? post.excerpt ?? ""
  ).trim();

  const image = String(
    post.image ?? post.thumbnail ?? post.imageUrl ?? post.image_url ?? ""
  ).trim();

  return {
    ...post,
    id: String(post.id ?? post.articleId ?? post.article_id ?? url ?? `post-${index}-${slugify(title)}`),
    title,
    url,
    content,
    description: String(post.description ?? post.summary ?? content).trim(),
    image,
    author: String(post.author ?? post.writer ?? "").trim(),
    date: String(post.date ?? post.publishedAt ?? post.published_at ?? "").trim(),
    source: String(post.source ?? "Dân Trí").trim(),
    category: String(post.category ?? categoryItem?.title ?? rawCategory ?? ""),
    categoryId,
    subCategory: String(
      post.subCategory ?? post.subCategoryName ?? subCategoryItem?.title ?? rawSubCategory ?? ""
    ),
    subCategoryId
  };
}

/* ---------------------------------------------------------
   LỌC BÀI VIẾT THEO CHUYÊN MỤC
   --------------------------------------------------------- */

function isPostInCategory(postInput, categoryValue) {
  const post = normalizePost(postInput);
  if (!post) return false;

  const selected = findMenuItem(categoryValue);
  const selectedId = selected
    ? normalizeId(selected.id)
    : normalizeId(categoryValue);

  if (!selectedId || selectedId === "home" || selectedId === "trang-chu") {
    return true;
  }

  const categoryId = normalizeId(post.categoryId || post.category);
  const subCategoryId = normalizeId(post.subCategoryId || post.subCategory);

  // Bài thuộc trực tiếp chuyên mục đang chọn.
  if (categoryId === selectedId || subCategoryId === selectedId) {
    return true;
  }

  // Nếu chọn chuyên mục cha, lấy bài của cả các chuyên mục con.
  if (selected && selected.children && selected.children.length) {
    const childIds = selected.children.map(child => normalizeId(child.id));
    if (childIds.includes(categoryId) || childIds.includes(subCategoryId)) {
      return true;
    }
  }

  // Nếu chọn chuyên mục con, kiểm tra bài có khai báo đúng chuyên mục cha.
  if (selected?.parent) {
    return categoryId === normalizeId(selected.parent.id) &&
      subCategoryId === selectedId;
  }

  return false;
}

/* ---------------------------------------------------------
   LƯU VÀ ĐỌC DỮ LIỆU
   --------------------------------------------------------- */

function readLocalPosts() {
  try {
    const stored = localStorage.getItem(STORAGE_POSTS_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return getArrayFromJSON(parsed, "posts")
      .map(normalizePost)
      .filter(Boolean);
  } catch (error) {
    console.warn("Dữ liệu bài viết trong localStorage không hợp lệ.", error);
    return [];
  }
}

function saveLocalPosts(posts) {
  try {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
  } catch (error) {
    console.warn("Không thể lưu bài viết vào localStorage.", error);
  }
}

function getPosts() {
  return allPosts;
}

function mergePosts(filePosts, localPosts) {
  const map = new Map();

  // Dữ liệu JSON trên GitHub là nguồn chính.
  for (const post of filePosts) {
    const normalized = normalizePost(post);
    if (!normalized) continue;

    const key = normalized.url || normalized.id;
    map.set(key, normalized);
  }

  // Giữ bài được thêm bằng công cụ crawler trong trình duyệt.
  for (const post of localPosts) {
    const normalized = normalizePost(post);
    if (!normalized) continue;

    const key = normalized.url || normalized.id;
    if (!map.has(key)) map.set(key, normalized);
  }

  return [...map.values()];
}

async function initDataFromFiles() {
  const [menuData, postsData] = await Promise.all([
    loadJSON("menu.json"),
    loadJSON("posts.json")
  ]);

  if (menuData) {
    const menuItems = getArrayFromJSON(menuData, "menu");
    if (menuItems.length) {
      allMenu = menuItems.map(normalizeMenuItem).filter(Boolean);
    }
  }

  if (!allMenu.length) {
    allMenu = DEFAULT_MENU.map(normalizeMenuItem).filter(Boolean);
  }

  const filePosts = getArrayFromJSON(postsData, "posts");
  const localPosts = readLocalPosts();

  allPosts = mergePosts(
    filePosts.map(normalizePost).filter(Boolean),
    localPosts
  );

  renderNavbar();
  renderCategory(currentCategory);
}

/* ---------------------------------------------------------
   TÌM CÁC PHẦN TỬ HTML
   --------------------------------------------------------- */

function getElement(...selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) return element;
  }
  return null;
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function safeURL(value) {
  const url = String(value ?? "").trim();
  if (!url) return "";

  try {
    const parsed = new URL(url, window.location.href);
    if (["http:", "https:"].includes(parsed.protocol)) return parsed.href;
  } catch (_) {}

  return "";
}

/* ---------------------------------------------------------
   MENU ĐIỀU HƯỚNG
   --------------------------------------------------------- */

function renderNavbar() {
  const menuContainer = getElement(
    "#categoryMenu",
    "#mainMenu",
    "#navbarMenu",
    ".category-menu"
  );

  if (!menuContainer) {
    console.warn("Không tìm thấy phần tử menu trong HTML.");
    return;
  }

  const renderItem = item => {
    const active = normalizeId(currentCategory) === normalizeId(item.id);
    const children = item.children || [];

    return `
      <li class="nav-item ${children.length ? "has-children" : ""}">
        <a href="#${encodeURIComponent(item.id)}"
           class="nav-link ${active ? "active" : ""}"
           data-category="${escapeHTML(item.id)}">
          ${escapeHTML(item.title)}
        </a>
        ${
          children.length
            ? `<ul class="submenu">${children.map(renderItem).join("")}</ul>`
            : ""
        }
      </li>
    `;
  };

  menuContainer.innerHTML = allMenu.map(renderItem).join("");

  menuContainer.querySelectorAll("[data-category]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      const category = link.dataset.category || "home";
      currentCategory = category;
      currentSearch = "";

      const searchInput = getElement("#searchInput", "#search");
      if (searchInput) searchInput.value = "";

      renderNavbar();
      renderCategory(category);

      if (window.location.hash !== `#${encodeURIComponent(category)}`) {
        history.replaceState(null, "", `#${encodeURIComponent(category)}`);
      }
    });
  });
}

/* ---------------------------------------------------------
   HIỂN THỊ DANH SÁCH BÀI VIẾT
   --------------------------------------------------------- */

function createPostCard(post) {
  const imageURL = safeURL(post.image);
  const articleURL = safeURL(post.url);

  return `
    <article class="post-card">
      ${
        imageURL
          ? `<a class="post-image-link" href="${articleURL || "#"}" ${articleURL ? 'target="_blank" rel="noopener noreferrer"' : ""}>
               <img class="post-image" src="${escapeHTML(imageURL)}"
                    alt="${escapeHTML(post.title)}" loading="lazy"
                    onerror="this.style.display='none'">
             </a>`
          : ""
      }
      <div class="post-card-body">
        ${
          post.category
            ? `<p class="post-category">${escapeHTML(post.category)}</p>`
            : ""
        }
        <h3 class="post-title">
          ${
            articleURL
              ? `<a href="${escapeHTML(articleURL)}" target="_blank" rel="noopener noreferrer">${escapeHTML(post.title)}</a>`
              : escapeHTML(post.title)
          }
        </h3>
        ${
          post.date
            ? `<p class="post-date">${escapeHTML(post.date)}</p>`
            : ""
        }
        ${
          post.description
            ? `<p class="post-description">${escapeHTML(post.description)}</p>`
            : ""
        }
        ${
          post.author
            ? `<p class="post-author">Tác giả: ${escapeHTML(post.author)}</p>`
            : ""
        }
      </div>
    </article>
  `;
}

function getFilteredPosts(category) {
  let posts = getPosts();

  if (category && !["home", "trang-chu"].includes(normalizeId(category))) {
    posts = posts.filter(post => isPostInCategory(post, category));
  }

  if (currentSearch) {
    const keyword = normalizeText(currentSearch);
    posts = posts.filter(post =>
      normalizeText(post.title).includes(keyword) ||
      normalizeText(post.content).includes(keyword) ||
      normalizeText(post.description).includes(keyword) ||
      normalizeText(post.category).includes(keyword) ||
      normalizeText(post.subCategory).includes(keyword)
    );
  }

  return posts;
}

function renderCategory(category = "home") {
  currentCategory = category || "home";

  const posts = getFilteredPosts(currentCategory);

  const titleElement = getElement(
    "#categoryTitle",
    "#pageTitle",
    "#sectionTitle"
  );

  const selectedItem = findMenuItem(currentCategory);
  const title = selectedItem
    ? selectedItem.title
    : normalizeId(currentCategory) === "home"
      ? "Tin mới nhất"
      : String(currentCategory);

  if (titleElement) titleElement.textContent = title;

  const featuredContainer = getElement(
    "#featuredPosts",
    "#featuredPost",
    ".featured-posts"
  );

  const listContainer = getElement(
    "#postList",
    "#postsList",
    "#newsList",
    "#appView",
    "#app"
  );

  if (!listContainer) {
    console.error(
      "Không tìm thấy vùng hiển thị bài viết. Hãy kiểm tra index.html có #postList hoặc #appView không."
    );
    return;
  }

  const isHome = ["home", "trang-chu"].includes(normalizeId(currentCategory));

  if (isHome && featuredContainer) {
    const featured = posts.slice(0, 3);
    featuredContainer.innerHTML = featured.map(createPostCard).join("");
  }

  // Hiển thị toàn bộ bài, không cắt mất bài mới.
  const listPosts = isHome && featuredContainer
    ? posts.slice(3)
    : posts;

  if (!posts.length) {
    const message = currentSearch
      ? "Không tìm thấy bài viết phù hợp với từ khóa."
      : "Chưa có bài viết trong chuyên mục này.";

    if (featuredContainer) featuredContainer.innerHTML = "";

    listContainer.innerHTML = `
      <div class="empty-state">
        <p>${escapeHTML(message)}</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = listPosts.length
    ? listPosts.map(createPostCard).join("")
    : (isHome && featuredContainer
        ? ""
        : posts.map(createPostCard).join(""));
}

/* ---------------------------------------------------------
   TÌM KIẾM
   --------------------------------------------------------- */

function setupSearch() {
  const searchInput = getElement("#searchInput", "#search");
  const searchForm = getElement("#searchForm");

  if (searchForm) {
    searchForm.addEventListener("submit", event => {
      event.preventDefault();
      currentSearch = searchInput ? searchInput.value.trim() : "";
      renderCategory(currentCategory);
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentSearch = searchInput.value.trim();
      renderCategory(currentCategory);
    });
  }
}

/* ---------------------------------------------------------
   KHỞI TẠO WEBSITE
   --------------------------------------------------------- */

async function initApp() {
  try {
    // Có menu mặc định để giao diện không bị phụ thuộc JSON.
    allMenu = DEFAULT_MENU.map(normalizeMenuItem).filter(Boolean);
    renderNavbar();

    setupSearch();

    // Đọc lại dữ liệu menu và bài viết từ JSON.
    await initDataFromFiles();

    // Nếu người dùng mở URL có hash chuyên mục, hiển thị chuyên mục đó.
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (hash) {
      const item = findMenuItem(hash);
      if (item) {
        currentCategory = item.id;
        renderNavbar();
        renderCategory(currentCategory);
      }
    }

    console.info(
      `Website đã khởi tạo: ${allPosts.length} bài viết, ${allMenu.length} chuyên mục cấp đầu.`
    );
  } catch (error) {
    console.error("Lỗi khởi tạo website:", error);

    const container = getElement(
      "#postList",
      "#postsList",
      "#newsList",
      "#appView",
      "#app"
    );

    if (container) {
      container.innerHTML = `
        <div class="error-state">
          <p>Không thể tải dữ liệu website.</p>
          <p>Hãy kiểm tra Console và các file JSON.</p>
        </div>
      `;
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
