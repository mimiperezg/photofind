import { searchImages } from "./imagesApi.js";
import { createImageCard, showMessage } from "./imageUi.js";

function Search() {
  const me = {};
  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");
  const summary = document.getElementById("search-summary");
  // counts searches so a slow old response can't overwrite a newer one
  let latest = 0;

  me.run = async (q) => {
    const id = ++latest;
    results.replaceChildren();

    if (!q.trim()) {
      summary.textContent = "";
      return;
    }
    summary.textContent = "Searching...";

    try {
      const { terms, results: images } = await searchImages(q);
      if (id !== latest) return;

      if (terms.length === 0) {
        summary.textContent =
          'Try more specific words, like "beach" or "sunset".';
      } else if (images.length === 0) {
        summary.textContent = `No images match "${q}".`;
      } else {
        const s = images.length === 1 ? "" : "s";
        summary.textContent = `${images.length} image${s} for "${q}", best matches first`;
      }

      results.append(
        ...images.map((image) =>
          createImageCard(image, {
            confidence: image.confidence,
            matchedTerms: image.matchedTerms,
          })
        )
      );
    } catch (err) {
      if (id !== latest) return;
      summary.textContent = "";
      showMessage(`Search failed: ${err.message}`, "danger");
    }
  };

  me.setup = () => {
    // the query lives in the URL (?q=...) so the back button and links work
    const q = new URLSearchParams(window.location.search).get("q") || "";
    input.value = q;
    if (q) me.run(q);

    document.getElementById("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      const url = new URL(window.location);
      if (value) url.searchParams.set("q", value);
      else url.searchParams.delete("q");
      history.pushState(null, "", url);
      me.run(value);
    });

    window.addEventListener("popstate", () => {
      const value = new URLSearchParams(window.location.search).get("q") || "";
      input.value = value;
      me.run(value);
    });

    input.focus();
  };

  return me;
}

const search = Search();
search.setup();
