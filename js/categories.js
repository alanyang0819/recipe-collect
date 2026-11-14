(function () {
  "use strict";

  const listElement = document.querySelector("#category-list");

  if (!listElement) {
    return;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  fetch("data/recipes.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`無法讀取料理索引：${response.status}`);
      }
      return response.json();
    })
    .then((recipes) => {
      if (!Array.isArray(recipes)) {
        throw new Error("料理索引格式必須是陣列。");
      }

      const categories = recipes.reduce((result, recipe) => {
        if (recipe.category) {
          result[recipe.category] = (result[recipe.category] || 0) + 1;
        }
        return result;
      }, {});

      const entries = Object.entries(categories).sort(([a], [b]) => (
        a.localeCompare(b, "zh-Hant")
      ));

      if (entries.length === 0) {
        listElement.innerHTML = `
          <div class="empty-state">
            <strong>分類還在等第一道料理。</strong>
            <span>新增料理並填入分類後，這裡會自動整理。</span>
          </div>
        `;
        return;
      }

      listElement.innerHTML = entries.map(([category, count]) => `
        <a class="category-card" href="index.html?category=${encodeURIComponent(category)}">
          <h2>${escapeHtml(category)}</h2>
          <span>${count} 道料理</span>
        </a>
      `).join("");
    })
    .catch((error) => {
      listElement.innerHTML = `
        <div class="empty-state">
          <strong>分類資料暫時無法載入。</strong>
          <span>${escapeHtml(error.message)}</span>
        </div>
      `;
    });
})();
