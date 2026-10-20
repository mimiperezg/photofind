// pieces of UI shared by the gallery, search, add and detail pages.
// user text (tags, descriptions) always goes in with textContent, never innerHTML

export const FALLBACK_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 3'><rect width='4' height='3' fill='#dee2e6'/><text x='2' y='1.7' font-size='0.4' text-anchor='middle' fill='#6c757d' font-family='sans-serif'>image unavailable</text></svg>"
  );

// shows a bootstrap alert in #message-area. success messages go away on their own
export const showMessage = (msg, type = "success") => {
  const area = document.getElementById("message-area");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} py-2 px-3 mb-3`;
  alert.setAttribute("role", type === "danger" ? "alert" : "status");
  alert.textContent = msg;

  area.replaceChildren(alert);
  if (type === "success") {
    setTimeout(() => alert.remove(), 3000);
  }
};

// removes an error once the user starts fixing it, so it doesn't look current
export const clearErrors = () => {
  document
    .querySelectorAll("#message-area .alert-danger")
    .forEach((alert) => alert.remove());
};

// "Beach, dog,  , DOG" -> ["beach", "dog"]. the server does the same cleanup
export const parseTags = (text) => [
  ...new Set(
    text
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, " "))
      .filter((t) => t !== "")
  ),
];

// a tag badge that links to the gallery filtered by that tag
export const tagLink = (tag) => {
  const a = document.createElement("a");
  a.className = "badge rounded-pill text-bg-light border tag-badge";
  a.href = `gallery.html?tag=${encodeURIComponent(tag)}`;
  a.textContent = tag;
  return a;
};

// adds text to parent, wrapping any whole-word or partial matches of terms in <mark>
const appendHighlighted = (parent, text, terms = []) => {
  if (terms.length === 0) {
    parent.append(text);
    return;
  }
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  // split with a capture group keeps the matches at the odd indexes
  text.split(pattern).forEach((part, i) => {
    if (i % 2 === 1) {
      const mark = document.createElement("mark");
      mark.textContent = part;
      parent.append(mark);
    } else if (part) {
      parent.append(part);
    }
  });
};

// card for the gallery grid and search results.
// pass confidence and matchedTerms to show how well it matched a search
export const createImageCard = (image, { confidence, matchedTerms } = {}) => {
  const col = document.createElement("div");
  col.className = "col";

  const card = document.createElement("div");
  card.className = "card h-100 image-card";

  const link = document.createElement("a");
  link.href = `image.html?id=${image._id}`;
  link.className = "image-card-link";

  const img = document.createElement("img");
  img.className = "card-img-top image-thumb";
  img.src = image.src;
  img.loading = "lazy";
  img.alt = image.description || image.tags.join(", ") || "Image";
  img.addEventListener("error", () => (img.src = FALLBACK_IMAGE), {
    once: true,
  });
  link.append(img);

  const body = document.createElement("div");
  body.className = "card-body p-2";

  if (confidence !== undefined) {
    const badge = document.createElement("span");
    const percent = Math.round(confidence * 100);
    badge.className = `badge mb-1 ${percent >= 75 ? "text-bg-success" : percent >= 40 ? "text-bg-warning" : "text-bg-secondary"}`;
    badge.textContent = `${percent}% match`;
    body.append(badge);
  }

  if (image.description) {
    const desc = document.createElement("p");
    desc.className = "small mb-1 image-desc";
    appendHighlighted(desc, image.description, matchedTerms);
    body.append(desc);
  }

  const tags = document.createElement("div");
  tags.className = "d-flex flex-wrap gap-1";
  image.tags.forEach((tag) => {
    const badge = tagLink(tag);
    if (matchedTerms?.some((t) => tag.includes(t))) {
      badge.classList.add("tag-matched");
    }
    tags.append(badge);
  });
  body.append(tags);

  card.append(link, body);
  col.append(card);
  return col;
};
