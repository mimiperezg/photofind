import { getImages, getTags } from "./imagesApi.js";
import { createImageCard, showMessage } from "./imageUi.js";

function Gallery() {
  const me = {};
  // the selected tag lives in the URL (?tag=beach) so filtered views can be shared
  const params = new URLSearchParams(window.location.search);
  let currentTag = params.get("tag") || "";
  let page = 1;
  let shown = 0;

  const grid = document.getElementById("gallery-grid");
  const loadMore = document.getElementById("load-more");
  const summary = document.getElementById("gallery-summary");

  const filterButton = (label, tag, count) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-sm btn-outline-dark";
    button.dataset.tag = tag;
    button.classList.toggle("active", tag === currentTag);
    button.setAttribute("aria-pressed", tag === currentTag);
    button.textContent = count === undefined ? label : `${label} (${count})`;
    button.addEventListener("click", () => me.selectTag(tag));
    return button;
  };

  me.renderTags = async () => {
    const container = document.getElementById("tag-filter");
    try {
      const tags = await getTags();
      container.replaceChildren(
        filterButton("All", ""),
        ...tags.map(({ tag, count }) => filterButton(tag, tag, count))
      );
    } catch (err) {
      showMessage(`Failed to load tags: ${err.message}`, "danger");
    }
  };

  const updateSummary = (total) => {
    if (total === 0) {
      summary.textContent = currentTag
        ? `No images tagged "${currentTag}".`
        : "No images yet. Add your first one!";
      return;
    }
    const noun = total === 1 ? "image" : "images";
    const what = currentTag ? `${noun} tagged "${currentTag}"` : noun;
    summary.textContent = `Showing ${shown} of ${total} ${what}`;
  };

  // loads the next page of images and adds them to the end of the grid
  me.loadPage = async () => {
    const tag = currentTag;
    loadMore.disabled = true;
    try {
      const { images, total } = await getImages({ tag, page });
      // the user picked a different tag while this was loading
      if (tag !== currentTag) return;
      grid.append(...images.map((image) => createImageCard(image)));
      shown += images.length;
      page += 1;
      updateSummary(total);
      loadMore.classList.toggle("d-none", shown >= total);
    } catch (err) {
      showMessage(`Failed to load images: ${err.message}`, "danger");
    } finally {
      loadMore.disabled = false;
    }
  };

  me.selectTag = (tag) => {
    currentTag = tag;
    page = 1;
    shown = 0;
    grid.replaceChildren();

    const url = new URL(window.location);
    if (tag) url.searchParams.set("tag", tag);
    else url.searchParams.delete("tag");
    history.replaceState(null, "", url);

    document.querySelectorAll("#tag-filter .btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.tag === tag);
      b.setAttribute("aria-pressed", b.dataset.tag === tag);
    });
    me.loadPage();
  };

  me.setup = () => {
    loadMore.addEventListener("click", me.loadPage);

    // the detail page sends us back here with ?deleted=1 after a delete
    if (params.has("deleted")) {
      showMessage("Image deleted");
      const url = new URL(window.location);
      url.searchParams.delete("deleted");
      history.replaceState(null, "", url);
    }

    me.renderTags();
    me.loadPage();
  };

  return me;
}

const gallery = Gallery();
gallery.setup();
