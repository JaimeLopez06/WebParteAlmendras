const shopFilters = document.querySelectorAll(".shop-filter");
const shopCards = document.querySelectorAll(".shop-card");
const shopCount = document.querySelector("#shop-count");

shopFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const category = filter.dataset.filter;
    let visibleCount = 0;

    shopFilters.forEach((button) => {
      button.setAttribute("aria-pressed", String(button === filter));
    });

    shopCards.forEach((card) => {
      const isVisible = category === "todos" || card.dataset.category === category;
      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (shopCount) {
      shopCount.textContent = `${visibleCount} ${visibleCount === 1 ? "producto" : "productos"}`;
    }
  });
});

const productImage = document.querySelector("#product-image");
const productThumbnails = document.querySelectorAll(".product-thumbnail");

productThumbnails.forEach((thumbnail) => {
  thumbnail.addEventListener("click", () => {
    if (!productImage || !thumbnail.dataset.image) {
      return;
    }

    productImage.src = thumbnail.dataset.image;
    productImage.alt = thumbnail.dataset.alt || "";
    productThumbnails.forEach((button) => {
      button.setAttribute("aria-pressed", String(button === thumbnail));
    });
  });
});
