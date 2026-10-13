const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

if (menuToggle && mainNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    mainNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menú" : "Cerrar menú");
    mainNav.classList.toggle("is-open", !isExpanded);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

const year = document.querySelector("#year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

const products = {
  "manual-ld2021": {
    name: "Máquina partir almendras manual LD-2021",
    price: 17000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2020/09/maquina-partir-almendras-888-2-scaled.jpg",
    page: "producto-manual.html",
  },
  "electrica-ld2022": {
    name: "Máquina partir almendras eléctrica LD 2022",
    price: 59000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2020/09/maquina-partir-almendras-ele-1.png",
    page: "producto-electrico.html",
  },
  "estufa-con-radiador": {
    name: "Estufa de biomasa con radiador",
    price: 36900,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2022/09/cropped-estufa-radiador.jpg",
    page: "producto-estufa-radiador.html",
  },
  "estufa-sin-radiador": {
    name: "Estufa de biomasa sin radiador",
    price: 27900,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2022/09/Estufa.jpg",
    page: "producto-estufa.html",
  },
  "molino-veleta": {
    name: "Molino veleta espantapájaros",
    price: 3000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2026/06/molino-veleta-espantapajaros-huerto-1.jpg",
    page: "producto-molino.html",
  },
  "ayuda-alquiler": {
    name: "Ayuda alquiler",
    price: 70000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2024/12/ayuda-alquiler.png",
    page: "ayuda-alquiler.html",
  },
  "ayuda-compra": {
    name: "Ayuda compra",
    price: 18000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2024/12/ayuda-compra-comida.png",
    page: "ayuda-compra.html",
  },
  "ayuda-consumibles": {
    name: "Ayuda consumibles",
    price: 10000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2024/12/AYUDA-CONSUMIBLES.jpg",
    page: "ayuda-consumibles.html",
  },
  "ayuda-combustible": {
    name: "Ayuda combustible",
    price: 5000,
    image: "https://www.maquinapartiralmendras.com/wp-content/uploads/2024/12/AYUDA-COMBUSTIBLE.png",
    page: "ayuda-combustible.html",
  },
};

const cartStorageKey = "partir-almendras-cart";
const money = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const productPage = window.location.pathname.split("/").pop();
const productPageSlugs = {
  "producto-manual.html": "manual-ld2021",
  "producto-electrico.html": "electrica-ld2022",
  "producto-estufa-radiador.html": "estufa-con-radiador",
  "producto-estufa.html": "estufa-sin-radiador",
  "producto-molino.html": "molino-veleta",
  "ayuda-alquiler.html": "ayuda-alquiler",
  "ayuda-compra.html": "ayuda-compra",
  "ayuda-consumibles.html": "ayuda-consumibles",
  "ayuda-combustible.html": "ayuda-combustible",
};
let cartItems = [];
let cartLoadError = null;
let orderDemonstrationCompleted = false;

try {
  const savedCart = localStorage.getItem(cartStorageKey);
  if (savedCart) {
    const parsedCart = JSON.parse(savedCart);
    if (!Array.isArray(parsedCart)) {
      throw new Error("El carrito guardado no tiene un formato válido.");
    }

    const itemMap = new Map();
    parsedCart.forEach((item) => {
      if (
        item &&
        typeof item.slug === "string" &&
        Object.hasOwn(products, item.slug) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0 &&
        item.quantity <= 99
      ) {
        itemMap.set(item.slug, Math.min(99, (itemMap.get(item.slug) || 0) + item.quantity));
      }
    });
    cartItems = [...itemMap].map(([slug, quantity]) => ({ slug, quantity }));
  }
} catch (error) {
  console.error("No se pudo leer el carrito guardado.", error);
  cartLoadError = error;
  cartItems = [];
}

const showCartMessage = (message, isError = false) => {
  let feedback = document.querySelector("[data-cart-feedback]");
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.className = "cart-feedback cart-toast";
    feedback.setAttribute("data-cart-feedback", "");
    feedback.setAttribute("role", "status");
    feedback.setAttribute("aria-live", "polite");
    document.body.append(feedback);
  }

  feedback.textContent = message;
  feedback.classList.toggle("is-error", isError);
  feedback.hidden = false;
};

const updateCartCount = () => {
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((count) => {
    count.textContent = String(itemCount);
  });
  document.querySelectorAll("[data-cart-link]").forEach((link) => {
    link.setAttribute("aria-label", `Carrito de compra, ${itemCount} ${itemCount === 1 ? "producto" : "productos"}`);
  });
};

const saveCart = (nextItems) => {
  try {
    localStorage.setItem(cartStorageKey, JSON.stringify(nextItems));
    cartItems = nextItems;
    updateCartCount();
    renderCart();
    return true;
  } catch (error) {
    console.error("No se pudo guardar el carrito.", error);
    showCartMessage("No se pudo guardar el carrito en este navegador. Comprueba el espacio disponible o la configuración de privacidad.", true);
    return false;
  }
};

const createElement = (tagName, className, text) => {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
};

const renderCart = () => {
  const itemContainer = document.querySelector("[data-cart-items]");
  if (!itemContainer) {
    return;
  }

  const emptyMessage = document.querySelector("[data-cart-empty]");
  const summary = document.querySelector("[data-cart-summary]");
  const checkout = document.querySelector("[data-cart-checkout]");
  const checkoutPanel = document.querySelector("[data-checkout-panel]");
  const items = cartItems.filter((item) => Object.hasOwn(products, item.slug));
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + products[item.slug].price * item.quantity, 0);

  itemContainer.replaceChildren();
  if (emptyMessage) {
    emptyMessage.hidden = items.length > 0;
  }
  if (summary) {
    summary.hidden = items.length === 0;
  }
  if (checkout) {
    checkout.hidden = items.length === 0;
  }
  if (checkoutPanel && items.length === 0) {
    checkoutPanel.hidden = true;
  }

  items.forEach((item) => {
    const product = products[item.slug];
    const row = createElement("article", "cart-item");
    const imageLink = document.createElement("a");
    imageLink.className = "cart-item-image";
    imageLink.href = product.page;
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";
    imageLink.append(image);

    const details = createElement("div", "cart-item-details");
    const title = document.createElement("a");
    title.className = "cart-item-title";
    title.href = product.page;
    title.textContent = product.name;
    const unitPrice = createElement("p", "cart-item-unit-price", `${money.format(product.price / 100)} / unidad`);
    details.append(title, unitPrice);

    const quantityLabel = createElement("label", "cart-quantity-label", "Cantidad");
    const quantityInput = document.createElement("input");
    quantityInput.className = "cart-quantity-input";
    quantityInput.type = "number";
    quantityInput.min = "1";
    quantityInput.max = "99";
    quantityInput.step = "1";
    quantityInput.value = String(item.quantity);
    quantityInput.setAttribute("data-cart-quantity", item.slug);
    quantityLabel.append(quantityInput);

    const actions = createElement("div", "cart-item-actions");
    const lineTotal = createElement("strong", "cart-line-total", money.format((product.price * item.quantity) / 100));
    const removeButton = createElement("button", "cart-remove", "Quitar");
    removeButton.type = "button";
    removeButton.setAttribute("aria-label", `Quitar ${product.name} del carrito`);
    removeButton.dataset.removeFromCart = item.slug;
    actions.append(quantityLabel, lineTotal, removeButton);
    row.append(imageLink, details, actions);
    itemContainer.append(row);
  });

  const count = document.querySelector("[data-cart-total-quantity]");
  const subtotalOutput = document.querySelector("[data-cart-subtotal]");
  if (count) {
    count.textContent = `${totalQuantity} ${totalQuantity === 1 ? "artículo" : "artículos"}`;
  }
  if (subtotalOutput) {
    subtotalOutput.textContent = money.format(subtotal / 100);
  }
};

const nav = document.querySelector(".main-nav");
if (nav && !nav.querySelector("[data-cart-link]")) {
  const cartLink = document.createElement("a");
  cartLink.className = "cart-link";
  cartLink.href = "carrito.html";
  cartLink.dataset.cartLink = "";
  cartLink.append("Carrito ");
  const count = createElement("span", "cart-count", "0");
  count.dataset.cartCount = "";
  cartLink.append(count);
  const navCta = nav.querySelector(".nav-cta");
  nav.insertBefore(cartLink, navCta || null);
}

document.querySelectorAll(".shop-card").forEach((card) => {
  const productLink = card.querySelector(".shop-card-title a[href]");
  const product = Object.values(products).find((item) => item.page === productLink?.getAttribute("href"));
  const bottom = card.querySelector(".shop-card-bottom");
  if (!product || !bottom || bottom.querySelector("[data-add-to-cart]")) {
    return;
  }

  const slug = Object.keys(products).find((key) => products[key] === product);
  if (!slug) {
    return;
  }

  const addButton = createElement("button", "button shop-card-add", "Añadir al carrito");
  addButton.type = "button";
  addButton.dataset.addToCart = slug;
  bottom.append(addButton);
});

const currentProductSlug = productPageSlugs[productPage];
if (currentProductSlug) {
  const buyRow = document.querySelector(".product-buy-row");
  if (buyRow && !buyRow.querySelector("[data-add-to-cart]")) {
    const addButton = createElement("button", "button button-accent cart-add-button", "Añadir al carrito");
    addButton.type = "button";
    addButton.dataset.addToCart = currentProductSlug;
    buyRow.prepend(addButton);
  }
}

const productFaqs = {
  "manual-ld2021": [
    ["¿Qué frutos se pueden partir?", "La ficha indica almendras, nueces, avellanas, pistachos y otros frutos secos de cáscara dura. El resultado puede variar según el tipo de fruto y su calibrado."],
    ["¿Cómo se acciona?", "Se acciona con manivela o con un atornillador profesional compatible y con regulación del par. No se recomienda un taladro sin control de velocidad."],
    ["¿La máquina separa o limpia el grano?", "No. La máquina parte el fruto, pero no separa, clasifica ni limpia el grano."]
  ],
  "electrica-ld2022": [
    ["¿Qué motor incorpora?", "La ficha indica un motor monofásico con reductor de 0,18 kW y 220 V."],
    ["¿Qué frutos admite?", "La ficha indica almendras, nueces, avellanas, pistachos y cacahuetes; el resultado depende del fruto y del ajuste."],
    ["¿La mesa soporte está incluida?", "No. La mesa soporte no está incluida."]
  ],
  "estufa-con-radiador": [
    ["¿Qué combustibles se indican?", "La ficha menciona pellets, hueso de aceituna, cáscara de almendra y otros frutos secos. Confirma con el fabricante las condiciones adecuadas de uso."],
    ["¿Qué potencia y salida de humos tiene?", "La ficha publica una potencia regulable de 8–15 kW y una salida de humos de 120 mm."],
    ["¿Qué debo confirmar antes de instalarla?", "Consulta al fabricante las condiciones de instalación y uso adecuadas para tu espacio."]
  ],
  "estufa-sin-radiador": [
    ["¿Qué especificaciones están publicadas?", "La ficha identifica el modelo como una estufa de biomasa sin radiador. No publica dimensiones ni una descripción técnica completa."],
    ["¿Qué combustible utiliza y cómo se instala?", "Confirma con el vendedor el combustible compatible, la configuración y las condiciones de instalación antes de realizar un pedido."],
    ["¿El precio y la disponibilidad están confirmados?", "El precio que aparece en la ficha es orientativo a efectos de consulta. Confirma precio vigente y disponibilidad con el vendedor."]
  ],
  "molino-veleta": [
    ["¿De qué material está hecho y cuánto mide?", "La ficha lo describe como metálico y de aproximadamente 40 cm."],
    ["¿Cómo se instala?", "Consulta las indicaciones de montaje y el método de sujeción antes de instalarlo."],
    ["¿Garantiza que no se acerquen pájaros?", "No se ofrece una eficacia garantizada; el artículo está diseñado para ayudar a ahuyentarlos."]
  ],
  "ayuda-alquiler": [
    ["¿Qué representa este artículo?", "Consulta con el vendedor el destino, las condiciones y el alcance actuales de esta iniciativa solidaria antes de contribuir."],
    ["¿Cómo se confirma una contribución?", "El carrito de esta web es una demostración y no transmite ni registra contribuciones."],
    ["¿Dónde consulto más información?", "Contacta directamente con el equipo para confirmar los detalles vigentes."]
  ],
  "ayuda-compra": [
    ["¿Qué representa este artículo?", "Consulta con el vendedor el destino, las condiciones y el alcance actuales de esta iniciativa solidaria antes de contribuir."],
    ["¿Cómo se confirma una contribución?", "El carrito de esta web es una demostración y no transmite ni registra contribuciones."],
    ["¿Dónde consulto más información?", "Contacta directamente con el equipo para confirmar los detalles vigentes."]
  ],
  "ayuda-consumibles": [
    ["¿Qué representa este artículo?", "Consulta con el vendedor el destino, las condiciones y el alcance actuales de esta iniciativa solidaria antes de contribuir."],
    ["¿Cómo se confirma una contribución?", "El carrito de esta web es una demostración y no transmite ni registra contribuciones."],
    ["¿Dónde consulto más información?", "Contacta directamente con el equipo para confirmar los detalles vigentes."]
  ],
  "ayuda-combustible": [
    ["¿Qué representa este artículo?", "Consulta con el vendedor el destino, las condiciones y el alcance actuales de esta iniciativa solidaria antes de contribuir."],
    ["¿Cómo se confirma una contribución?", "El carrito de esta web es una demostración y no transmite ni registra contribuciones."],
    ["¿Dónde consulto más información?", "Contacta directamente con el equipo para confirmar los detalles vigentes."]
  ]
};

const productDetails = document.querySelector(".product-detail-sections");
const currentProductFaqs = productFaqs[currentProductSlug];
if (productDetails && currentProductFaqs) {
  const faqSection = createElement("section", "product-faq");
  faqSection.setAttribute("aria-labelledby", "product-faq-title");
  const faqHeading = createElement("h2", "", "Preguntas frecuentes");
  faqHeading.id = "product-faq-title";
  const faqList = createElement("div", "faq-list");
  currentProductFaqs.forEach(([question, answer]) => {
    const item = document.createElement("details");
    const summary = createElement("summary", "", question);
    const response = createElement("p", "", answer);
    item.append(summary, response);
    faqList.append(item);
  });
  faqSection.append(faqHeading, faqList);
  const crossSell = document.querySelector(".product-cross-sell");
  if (crossSell) {
    crossSell.before(faqSection);
  } else {
    productDetails.after(faqSection);
  }
}

const whatsappNumber = "34600000000";
const whatsappProduct = currentProductSlug ? products[currentProductSlug] : undefined;
const whatsappMessage = whatsappProduct
  ? `Hola, quiero más información sobre ${whatsappProduct.name}.`
  : "Hola, quiero más información sobre los productos de Partir Almendras.";
const whatsappLink = document.createElement("a");
whatsappLink.className = "whatsapp-fab";
whatsappLink.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
whatsappLink.target = "_blank";
whatsappLink.rel = "noopener noreferrer";
whatsappLink.setAttribute("aria-label", whatsappProduct
  ? `Consultar por WhatsApp sobre ${whatsappProduct.name}`
  : "Consultar por WhatsApp sobre los productos");
const whatsappIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
whatsappIcon.setAttribute("viewBox", "0 0 24 24");
whatsappIcon.setAttribute("aria-hidden", "true");
const whatsappBubble = document.createElementNS("http://www.w3.org/2000/svg", "path");
whatsappBubble.setAttribute("d", "M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.7a8.5 8.5 0 1 1 16.1-4.2Z");
whatsappBubble.setAttribute("fill", "none");
whatsappBubble.setAttribute("stroke", "currentColor");
whatsappBubble.setAttribute("stroke-width", "1.7");
whatsappBubble.setAttribute("stroke-linecap", "round");
whatsappBubble.setAttribute("stroke-linejoin", "round");
const whatsappPhone = document.createElementNS("http://www.w3.org/2000/svg", "path");
whatsappPhone.setAttribute("d", "M8.5 8.1c.3-.6.7-.6 1-.6h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4 0 .6.5.9 1.3 1.6 2.2 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.7-.1l1.6.8c.3.1.4.3.4.5 0 .5-.3 1.2-.8 1.5-.5.4-1.1.5-1.8.3-1.2-.3-2.5-1-3.7-2.2-1.2-1.2-2-2.6-2.2-3.7-.2-.7 0-1.3.3-1.7Z");
whatsappPhone.setAttribute("fill", "currentColor");
whatsappIcon.append(whatsappBubble, whatsappPhone);
const whatsappLabel = createElement("span", "", "WhatsApp");
whatsappLink.append(whatsappIcon, whatsappLabel);
document.body.append(whatsappLink);

const harvestPlanner = document.querySelector("[data-harvest-planner]");
if (harvestPlanner instanceof HTMLFormElement) {
  const plannerResult = harvestPlanner.querySelector("[data-planner-result]");
  const plannerLink = harvestPlanner.querySelector("[data-planner-link]");
  harvestPlanner.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!harvestPlanner.reportValidity()) {
      return;
    }

    const formData = new FormData(harvestPlanner);
    const kilos = Number(formData.get("kilos"));
    const harvests = Number(formData.get("times"));
    const drive = formData.get("drive");
    const annualVolume = kilos * harvests;
    const recommendation = drive === "electric"
      ? { name: "la máquina eléctrica LD 2022", page: "producto-electrico.html" }
      : { name: "la máquina manual LD-2021", page: "producto-manual.html" };

    if (!Number.isFinite(annualVolume) || annualVolume < 0 || annualVolume > 100000000) {
      if (plannerResult) {
        plannerResult.textContent = "Revisa los kilos y el número de cosechas introducidos.";
      }
      if (plannerLink) {
        plannerLink.hidden = true;
      }
      return;
    }

    if (plannerResult) {
      const formattedVolume = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(annualVolume);
      plannerResult.textContent = `Tu volumen anual estimado es de ${formattedVolume} kg. Según tu preferencia de accionamiento, podrías valorar ${recommendation.name}.`;
    }
    if (plannerLink) {
      plannerLink.href = recommendation.page;
      plannerLink.hidden = false;
    }
  });
}

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const revealTargets = document.querySelectorAll(".section-pad, .machine-card, .shop-card, .work-gallery-item, .product-layout, .product-detail-sections, .product-faq, .product-cross-sell");
  if (revealTargets.length > 0) {
    document.documentElement.classList.add("js-reveal-ready");
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((target) => {
      target.classList.add("reveal-on-scroll");
      revealObserver.observe(target);
    });
  }
}

document.querySelectorAll("img").forEach((image) => {
  image.decoding = "async";
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const addButton = event.target.closest("[data-add-to-cart]");
  if (addButton instanceof HTMLButtonElement) {
    const slug = addButton.dataset.addToCart;
    const product = slug ? products[slug] : undefined;
    if (!slug || !product) {
      showCartMessage("No se pudo identificar el producto. Recarga la página e inténtalo de nuevo.", true);
      return;
    }

    const nextItems = cartItems.map((item) => ({ ...item }));
    const existingItem = nextItems.find((item) => item.slug === slug);
    if (existingItem) {
      if (existingItem.quantity >= 99) {
        showCartMessage("Has alcanzado el máximo de 99 unidades para este producto.", true);
        return;
      }
      existingItem.quantity += 1;
    } else {
      nextItems.push({ slug, quantity: 1 });
    }

    if (saveCart(nextItems)) {
      showCartMessage(`${product.name} se ha añadido al carrito.`);
      const originalLabel = addButton.textContent;
      addButton.textContent = "Añadido al carrito ✓";
      addButton.classList.add("is-added");
      window.setTimeout(() => {
        if (addButton.isConnected) {
          addButton.textContent = originalLabel;
          addButton.classList.remove("is-added");
        }
      }, 1800);
    }
    return;
  }

  const removeButton = event.target.closest("[data-remove-from-cart]");
  if (removeButton instanceof HTMLButtonElement) {
    const slug = removeButton.dataset.removeFromCart;
    if (slug) {
      saveCart(cartItems.filter((item) => item.slug !== slug));
      showCartMessage("Producto eliminado del carrito.");
    }
  }
});

document.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || !event.target.matches("[data-cart-quantity]")) {
    return;
  }

  const slug = event.target.dataset.cartQuantity;
  const quantity = Number(event.target.value);
  if (!slug || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    showCartMessage("Introduce una cantidad entre 1 y 99.", true);
    renderCart();
    return;
  }

  saveCart(cartItems.map((item) => item.slug === slug ? { ...item, quantity } : item));
});

window.addEventListener("storage", (event) => {
  if (event.key !== cartStorageKey && event.key !== null) {
    return;
  }

  try {
    const parsedCart = event.newValue ? JSON.parse(event.newValue) : [];
    if (!Array.isArray(parsedCart)) {
      throw new Error("El carrito actualizado no tiene un formato válido.");
    }
    cartItems = parsedCart.filter((item) =>
      item &&
      typeof item.slug === "string" &&
      Object.hasOwn(products, item.slug) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 99
    );
    updateCartCount();
    renderCart();
    if (cartLoadError) {
      showCartMessage("No se pudo leer el carrito guardado. Comprueba la configuración de privacidad del navegador.", true);
    }
  } catch (error) {
    console.error("No se pudo actualizar el carrito desde otra pestaña.", error);
    showCartMessage("No se pudo actualizar el carrito desde otra pestaña. Recarga esta página.", true);
  }
});

updateCartCount();
renderCart();
if (cartLoadError) {
  showCartMessage("No se pudo leer el carrito guardado. Comprueba la configuración de privacidad del navegador.", true);
}

const checkoutPanel = document.querySelector("[data-checkout-panel]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const cartLayout = document.querySelector(".cart-layout");
const orderConfirmation = document.querySelector("[data-order-confirmation]");

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  if (event.target.closest("[data-start-checkout]")) {
    if (cartItems.length === 0 || !checkoutPanel) {
      return;
    }
    checkoutPanel.hidden = false;
    checkoutPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    checkoutForm?.elements.namedItem("name")?.focus({ preventScroll: true });
    return;
  }

  if (event.target.closest("[data-cancel-checkout]")) {
    if (checkoutPanel) {
      checkoutPanel.hidden = true;
    }
    document.querySelector("[data-start-checkout]")?.focus();
    return;
  }

  if (event.target.closest("[data-new-demo-order]")) {
    orderDemonstrationCompleted = false;
    if (orderConfirmation) {
      orderConfirmation.hidden = true;
    }
    if (cartLayout) {
      cartLayout.hidden = false;
    }
    if (checkoutPanel) {
      checkoutPanel.hidden = true;
    }
    checkoutForm?.reset();
    document.querySelector(".cart-heading h1")?.replaceChildren(document.createTextNode("Tu carrito"));
    document.querySelector(".breadcrumbs [aria-current='page']")?.replaceChildren(document.createTextNode("Carrito"));
    renderCart();
    document.querySelector("[data-cart-empty]")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});

checkoutForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!checkoutForm.reportValidity()) {
    return;
  }

  const orderItems = cartItems
    .filter((item) => Object.hasOwn(products, item.slug))
    .map((item) => ({
      ...products[item.slug],
      quantity: item.quantity,
      lineTotal: products[item.slug].price * item.quantity,
    }));

  if (orderItems.length === 0) {
    showCartMessage("Añade al menos un producto antes de confirmar el pedido de prueba.", true);
    renderCart();
    return;
  }

  const formData = new FormData(checkoutForm);
  const customerName = String(formData.get("name") || "").trim();
  const total = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const confirmationItems = document.querySelector("[data-confirmation-items]");
  const reference = document.querySelector("[data-order-reference]");
  const confirmedName = document.querySelector("[data-customer-name]");
  const confirmedTotal = document.querySelector("[data-confirmation-total]");

  if (!confirmationItems || !reference || !confirmedName || !confirmedTotal) {
    showCartMessage("No se pudo mostrar la confirmación. Recarga la página e inténtalo de nuevo.", true);
    return;
  }

  if (!saveCart([])) {
    return;
  }

  const timestamp = new Date();
  const datePart = timestamp.toISOString().slice(0, 10).replaceAll("-", "");
  const orderReference = `DEMO-${datePart}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  reference.textContent = orderReference;
  confirmedName.textContent = customerName;
  confirmedTotal.textContent = money.format(total / 100);
  confirmationItems.replaceChildren();

  orderItems.forEach((item) => {
    const row = createElement("div", "confirmation-item");
    const name = createElement("span", "", item.name);
    const quantity = createElement("span", "confirmation-quantity", `× ${item.quantity}`);
    const lineTotal = createElement("strong", "", money.format(item.lineTotal / 100));
    row.append(name, quantity, lineTotal);
    confirmationItems.append(row);
  });

  orderDemonstrationCompleted = true;
  if (cartLayout) {
    cartLayout.hidden = true;
  }
  if (checkoutPanel) {
    checkoutPanel.hidden = true;
  }
  if (orderConfirmation) {
    orderConfirmation.hidden = false;
    orderConfirmation.focus();
    orderConfirmation.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.querySelector(".cart-heading h1")?.replaceChildren(document.createTextNode("Pedido de prueba"));
  document.querySelector(".breadcrumbs [aria-current='page']")?.replaceChildren(document.createTextNode("Pedido de prueba"));
  checkoutForm.reset();
});
