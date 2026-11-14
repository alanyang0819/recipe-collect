(function () {
  "use strict";

  const listElement = document.querySelector("#recipe-list");
  const searchElement = document.querySelector("#recipe-search");
  const categoryElement = document.querySelector("#category-filter");
  const countElement = document.querySelector("#recipe-count");

  if (!listElement || !searchElement || !categoryElement || !countElement) {
    return;
  }

  let recipes = [];
  const requestedCategory = new URLSearchParams(window.location.search).get("category") || "";

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderImage(recipe) {
    if (!recipe.image) {
      return '<div class="recipe-card-placeholder" aria-hidden="true">待分享</div>';
    }

    return `<img class="recipe-card-image" src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}">`;
  }

  function renderCard(recipe) {
    const category = recipe.category
      ? `<p class="recipe-card-category">${escapeHtml(recipe.category)}</p>`
      : "";
    const description = recipe.description
      ? `<p class="recipe-card-description">${escapeHtml(recipe.description)}</p>`
      : "";

    return `
      <article class="recipe-card">
        <a class="recipe-card-link" href="recipe.html?slug=${encodeURIComponent(recipe.slug)}">
          ${renderImage(recipe)}
          <div class="recipe-card-body">
            ${category}
            <h3>${escapeHtml(recipe.name)}</h3>
            ${description}
          </div>
        </a>
      </article>
    `;
  }

  function renderEmpty(message, detail) {
    listElement.innerHTML = `
      <div class="empty-state">
        <strong>${escapeHtml(message)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
    `;
  }

  function renderRecipes() {
    const search = searchElement.value.trim().toLocaleLowerCase();
    const category = categoryElement.value;
    const filteredRecipes = recipes.filter((recipe) => {
      const searchableText = [
        recipe.name,
        recipe.category,
        ...(Array.isArray(recipe.tags) ? recipe.tags : [])
      ].join(" ").toLocaleLowerCase();

      return (!search || searchableText.includes(search))
        && (!category || recipe.category === category);
    });

    countElement.textContent = `${filteredRecipes.length} 道料理`;

    if (filteredRecipes.length === 0) {
      renderEmpty(
        recipes.length === 0 ? "料理收藏還在等你填入。" : "找不到符合條件的料理。",
        recipes.length === 0
          ? "新增料理 JSON 後，記得同步更新 data/recipes.json。"
          : "試試其他關鍵字或清除分類篩選。"
      );
      return;
    }

    listElement.innerHTML = filteredRecipes.map(renderCard).join("");
  }

  function populateCategories() {
    const categories = [...new Set(
      recipes
        .map((recipe) => recipe.category)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b, "zh-Hant"));

    categoryElement.innerHTML = '<option value="">所有分類</option>'
      + categories.map((category) => (
        `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`
      )).join("");
  }

  searchElement.addEventListener("input", renderRecipes);
  categoryElement.addEventListener("change", renderRecipes);

  fetch("data/recipes.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`無法讀取料理索引：${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data)) {
        throw new Error("料理索引格式必須是陣列。");
      }
      recipes = data;
      populateCategories();
      if (requestedCategory && recipes.some((recipe) => recipe.category === requestedCategory)) {
        categoryElement.value = requestedCategory;
      }
      renderRecipes();
    })
    .catch((error) => {
      countElement.textContent = "讀取失敗";
      renderEmpty("料理資料暫時無法載入。", error.message);
    });
})();
