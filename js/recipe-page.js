(function () {
  "use strict";

  const detailElement = document.querySelector("#recipe-detail");

  if (!detailElement) {
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

  function showMessage(title, detail) {
    detailElement.innerHTML = `
      <a class="back-link" href="index.html">← 回到所有料理</a>
      <div class="empty-state">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(detail)}</span>
      </div>
    `;
  }

  function renderImage(recipe) {
    if (!recipe.image) {
      return "";
    }

    return `<img class="recipe-detail-image" src="${escapeHtml(recipe.image)}" alt="${escapeHtml(recipe.name)}">`;
  }

  function renderMeta(recipe) {
    return [
      recipe.servings ? `份量｜${recipe.servings}` : "",
      recipe.prepTime ? `準備｜${recipe.prepTime}` : "",
      recipe.cookTime ? `烹調｜${recipe.cookTime}` : ""
    ].filter(Boolean).map((item) => `<span>${escapeHtml(item)}</span>`).join("");
  }

  function renderIngredients(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return "<p>尚未提供材料資訊。</p>";
    }

    return `
      <ul class="ingredient-list">
        ${ingredients.map((ingredient) => `
          <li>
            <span>
              ${escapeHtml(ingredient.name)}
              ${ingredient.note ? `<small>（${escapeHtml(ingredient.note)}）</small>` : ""}
            </span>
            <span class="ingredient-amount">${escapeHtml(ingredient.amount)}</span>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderSteps(steps) {
    if (!Array.isArray(steps) || steps.length === 0) {
      return "<p>尚未提供步驟資訊。</p>";
    }

    return `<ol class="step-list">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
  }

  function renderNotes(notes) {
    if (!Array.isArray(notes) || notes.length === 0) {
      return "";
    }

    return `
      <aside class="recipe-notes">
        <h2>備註</h2>
        <ul>${notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
      </aside>
    `;
  }

  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    showMessage("還沒有選擇料理。", "請從料理列表選擇一篇食譜。");
    return;
  }

  fetch(`data/recipes/${encodeURIComponent(slug)}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("找不到這份料理資料。");
      }
      return response.json();
    })
    .then((recipe) => {
      if (!recipe || recipe.slug !== slug) {
        throw new Error("料理資料的 slug 與網址不一致。");
      }

      detailElement.innerHTML = `
        <a class="back-link" href="index.html">← 回到所有料理</a>
        <header class="recipe-detail-header">
          ${renderImage(recipe)}
          <div class="recipe-detail-copy">
            ${recipe.category ? `<p class="eyebrow">${escapeHtml(recipe.category)}</p>` : ""}
            <h1>${escapeHtml(recipe.name)}</h1>
            ${recipe.description ? `<p class="recipe-detail-description">${escapeHtml(recipe.description)}</p>` : ""}
            <div class="recipe-meta">${renderMeta(recipe)}</div>
          </div>
        </header>
        <div class="recipe-columns">
          <section aria-labelledby="ingredients-title">
            <h2 id="ingredients-title">材料</h2>
            ${renderIngredients(recipe.ingredients)}
          </section>
          <section aria-labelledby="steps-title">
            <h2 id="steps-title">步驟</h2>
            ${renderSteps(recipe.steps)}
            ${renderNotes(recipe.notes)}
          </section>
        </div>
      `;
      document.title = `${recipe.name}｜料理誌`;
    })
    .catch((error) => {
      showMessage("這篇料理目前無法開啟。", error.message);
    });
})();
