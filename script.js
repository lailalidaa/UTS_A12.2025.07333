// Data produk dan harga
const products = {
  fruitbox: { name: "Paket Buah Segar", price: 45000 },
  apple: { name: "Apel Merah", price: 28000 },
  orange: { name: "Jeruk Manis", price: 22000 },
  parcel: { name: "Parcel Buah", price: 120000 },
  banana: { name: "Pisang Cavendish", price: 18000 },
  mango: { name: "Mangga Harum Manis", price: 30000 },
  grapes: { name: "Anggur Merah", price: 35000 },
  strawberry: { name: "Stroberi Segar", price: 32000 }
};

const cart = {};

// Nomor WhatsApp contoh, ganti dengan nomor toko yang benar
const WHATSAPP_NUMBER = "6281234567890";

// Ambil elemen HTML
const orderForm = document.getElementById("orderForm");
const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantity");
const minusBtn = document.getElementById("minusBtn");
const plusBtn = document.getElementById("plusBtn");

const summaryProduct = document.getElementById("summaryProduct");
const summaryPrice = document.getElementById("summaryPrice");
const unitPrice = document.getElementById("unitPrice");
const summaryQuantity = document.getElementById("summaryQuantity");
const totalPrice = document.getElementById("totalPrice");
const orderMessage = document.getElementById("orderMessage");

// Format angka menjadi Rupiah
function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}


// fungsi updateSummary
function updateSummary() {
  const entries = Object.entries(cart).filter(
    ([, quantity]) => quantity > 0
  );

  const total = entries.reduce(
    (sum, [key, quantity]) => sum + products[key].price * quantity,
    0
  );

  const totalQuantity = entries.reduce(
    (sum, [, quantity]) => sum + quantity,
    0
  );

  summaryProduct.textContent = entries.length
    ? entries.map(([key, quantity]) =>
        `${products[key].name} (${quantity})`
      ).join(", ")
    : "Belum ada buah dipilih";

  summaryPrice.textContent = entries.length
    ? "Sesuai isi keranjang"
    : "Tambahkan buah dari katalog";

  unitPrice.textContent = formatRupiah(total);
  summaryQuantity.textContent = totalQuantity;
  totalPrice.textContent = formatRupiah(total);
}

// Tampilkan isi keranjang
function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const entries = Object.entries(cart).filter(
    ([, quantity]) => quantity > 0
  );

  let total = 0;

  if (entries.length === 0) {
    cartItems.innerHTML =
      '<p class="cart-empty">Keranjangmu masih kosong. Tambahkan buah dari katalog, ya!</p>';
  } else {
    cartItems.innerHTML = entries
      .map(([key, quantity]) => {
        const product = products[key];

        total += product.price * quantity;

        return `
          <div class="cart-item">
            <div>
              <strong>${product.name}</strong>
              <p>${formatRupiah(product.price)} / produk</p>
            </div>

            <div class="cart-quantity">
              <button
                type="button"
                data-cart-action="minus"
                data-key="${key}"
                aria-label="Kurangi ${product.name}"
              >−</button>

              <span>${quantity}</span>

              <button
                type="button"
                data-cart-action="plus"
                data-key="${key}"
                aria-label="Tambah ${product.name}"
              >+</button>
            </div>

            <button
              class="remove-item"
              type="button"
              data-cart-action="remove"
              data-key="${key}"
            >Hapus</button>
          </div>
        `;
      })
      .join("");
  }

  document.getElementById("cartTotal").textContent =
    formatRupiah(total);

  const totalQuantity = entries.reduce(
    (sum, [, quantity]) => sum + quantity,
    0
  );

  document.getElementById("cartCount").textContent =
    `(${totalQuantity})`;

  document.getElementById("checkoutBtn").disabled =
    entries.length === 0;
}

// Tambahkan produk ke keranjang
window.addToCart = function (key) {
  if (!Object.prototype.hasOwnProperty.call(products, key)) {
    return;
  }

  cart[key] = Math.min(20, (Number(cart[key]) || 0) + 1);

  renderCart();

  const button = document.querySelector(
    `.add-button[data-product="${key}"]`
  );

  if (button) {
    button.textContent = "✓";

    button.setAttribute(
      "aria-label",
      `Ditambahkan: ${products[key].name}`
    );

    window.setTimeout(function () {
      button.textContent = "+";

      button.setAttribute(
        "aria-label",
        `Tambah ${products[key].name} ke keranjang`
      );
    }, 700);
  }
};

// Tombol tambah pada katalog
document.addEventListener(
  "click",
  function (event) {
    const button = event.target.closest(".add-button[data-product]");

    if (!button) return;

    event.preventDefault();

    const key = button.getAttribute("data-product");

    if (key) {
      window.addToCart(key);
    }
  },
  true
);

// Tombol jumlah dan hapus pada keranjang
document.getElementById("cartItems").addEventListener(
  "click",
  function (event) {
    const button = event.target.closest("button[data-cart-action]");

    if (!button) return;

    const key = button.dataset.key;
    const action = button.dataset.cartAction;

    if (!Object.prototype.hasOwnProperty.call(products, key)) {
      return;
    }

    if (action === "plus") {
      cart[key] = Math.min(20, (cart[key] || 0) + 1);
    }

    if (action === "minus") {
      cart[key] = Math.max(0, (cart[key] || 0) - 1);
    }

    if (action === "remove") {
      cart[key] = 0;
    }

    renderCart();
  }
);

// Ganti event listener tombol checkout dengan kode ini
document.getElementById("checkoutBtn").addEventListener("click", function () {
  const entries = Object.entries(cart).filter(([, quantity]) => quantity > 0);

  if (entries.length === 0) {
    alert("Keranjang masih kosong. Tambahkan buah terlebih dahulu.");
    return;
  }

  updateSummary();

  orderMessage.hidden = false;
  orderMessage.textContent =
    "Pesanan sudah disesuaikan dengan isi keranjang. Lengkapi nama, nomor HP, dan alamat pengiriman.";

  document.getElementById("pesan").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  window.setTimeout(function () {
    document.getElementById("customerName").focus({
      preventScroll: true
    });
  }, 450);
});

// Pesan melalui WhatsApp
document.getElementById("whatsappOrderBtn").addEventListener(
  "click",
  function () {
    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const address = document.getElementById("customerAddress").value.trim();
    const notes = document.getElementById("notes").value.trim();

    const entries = Object.entries(cart).filter(
      ([, quantity]) => quantity > 0
    );


    const orderDetails = entries.length
      ? entries
          .map(
            ([key, count]) =>
              `- ${products[key].name} (${count}): ${formatRupiah(
                products[key].price * count
              )}`
          )
          .join("\n")
      : `- ${product.name} (${quantity}): ${formatRupiah(
          product.price * quantity
        )}`;

    const message =
      `Halo Lyora Fresh, saya ingin memesan buah.\n\n` +
      `Nama: ${name}\n` +
      `Nomor HP: ${phone}\n` +
      `Pesanan:\n${orderDetails}\n` +
      `Total buah: ${formatRupiah(total)}\n` +
      `Alamat pengiriman: ${address}` +
      (notes ? `\nCatatan: ${notes}` : "") +
      `\n\nMohon konfirmasi ketersediaan dan ongkir. Terima kasih.`;

    const whatsappURL =
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  }
);

// Simulasi pengiriman formulir

orderForm.addEventListener("submit", function (event) {
  event.preventDefault();

  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const entries = Object.entries(cart).filter(
    ([, quantity]) => quantity > 0
  );

  if (entries.length === 0) {
    orderMessage.hidden = false;
    orderMessage.textContent =
      "Keranjang masih kosong. Silakan pilih buah dari katalog terlebih dahulu.";
    return;
  }

  const total = entries.reduce(
    (sum, [key, quantity]) =>
      sum + products[key].price * quantity,
    0
  );

  const orderDetails = entries
    .map(([key, quantity]) =>
      `${products[key].name} (${quantity})`
    )
    .join(", ");

  orderMessage.hidden = false;
  orderMessage.textContent =
    `Terima kasih, ${name}! Pesanan kamu: ${orderDetails}. ` +
    `Total ${formatRupiah(total)}. Ini hanya konfirmasi simulasi, ` +
    "belum ada pembayaran atau pengiriman sungguhan.";

  entries.forEach(([key]) => {
    delete cart[key];
  });

  renderCart();

  orderMessage.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});


// Menu navigasi untuk layar kecil
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
  const isOpen = navLinks.classList.toggle("open");

  menuToggle.setAttribute("aria-expanded", isOpen);

  menuToggle.setAttribute(
    "aria-label",
    isOpen ? "Tutup menu navigasi" : "Buka menu navigasi"
  );

  menuToggle.textContent = isOpen ? "×" : "☰";
});

// Tutup menu setelah link diklik
navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");

    menuToggle.textContent = "☰";
  });
});

// Jalankan saat halaman dibuka
updateSummary();
renderCart();