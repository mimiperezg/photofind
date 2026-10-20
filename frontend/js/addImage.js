import { createImage } from "./imagesApi.js";
import { resizeImage } from "./resizeImage.js";
import {
  FALLBACK_IMAGE,
  clearErrors,
  parseTags,
  showMessage,
} from "./imageUi.js";

function AddImage() {
  const me = {};
  // the resized upload, set once the user picks a file
  let uploadDataUrl = null;

  const fileInput = document.getElementById("file-input");
  const urlInput = document.getElementById("url-input");
  const tagsInput = document.getElementById("tags-input");
  const preview = document.getElementById("preview");
  const previewImg = document.getElementById("preview-img");
  const previewInfo = document.getElementById("preview-info");
  const saveBtn = document.getElementById("save-btn");

  const currentSource = () =>
    document.querySelector("input[name=source]:checked").value;

  const showPreview = (src, info) => {
    previewImg.src = src;
    previewInfo.textContent = info;
    preview.classList.remove("d-none");
  };

  const hidePreview = () => {
    preview.classList.add("d-none");
    previewImg.removeAttribute("src");
  };

  me.onSourceChange = () => {
    const source = currentSource();
    document
      .getElementById("upload-fields")
      .classList.toggle("d-none", source !== "upload");
    document
      .getElementById("url-fields")
      .classList.toggle("d-none", source !== "url");

    hidePreview();
    if (source === "upload" && uploadDataUrl) {
      showPreview(uploadDataUrl, "");
    } else if (source === "url" && urlInput.value) {
      me.onUrlChange();
    }
  };

  me.onFileChange = async () => {
    uploadDataUrl = null;
    hidePreview();
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const { dataUrl, width, height } = await resizeImage(file);
      uploadDataUrl = dataUrl;
      // base64 is about 4/3 the size of the bytes it holds
      const kb = Math.round((dataUrl.length * 3) / 4 / 1024);
      showPreview(dataUrl, `${width} × ${height}, about ${kb} KB`);
    } catch (err) {
      fileInput.value = "";
      showMessage(err.message, "danger");
    }
  };

  me.onUrlChange = () => {
    const url = urlInput.value.trim();
    if (!url) {
      hidePreview();
      return;
    }
    showPreview(url, "");
    previewImg.onerror = () => {
      previewImg.onerror = null;
      previewImg.src = FALLBACK_IMAGE;
      previewInfo.textContent =
        "Couldn't load that URL. Check that it links directly to an image.";
    };
  };

  // live badges so users can see how their tags will be split up
  me.onTagsInput = () => {
    const tags = parseTags(tagsInput.value);
    const container = document.getElementById("tags-preview");
    container.replaceChildren(
      ...tags.map((tag) => {
        const badge = document.createElement("span");
        badge.className = "badge rounded-pill text-bg-light border";
        badge.textContent = tag;
        return badge;
      })
    );
    tagsInput.classList.toggle("is-invalid", tags.length > 10);
  };

  me.onSubmit = async (event) => {
    event.preventDefault();
    const source = currentSource();
    const src = source === "upload" ? uploadDataUrl : urlInput.value.trim();
    const tags = parseTags(tagsInput.value);

    if (!src) {
      showMessage(
        source === "upload" ? "Choose an image file" : "Paste an image URL",
        "danger"
      );
      return;
    }
    if (tags.length > 10) {
      showMessage("Use at most 10 tags", "danger");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    try {
      const image = await createImage({
        source,
        src,
        tags,
        description: document.getElementById("description-input").value,
      });
      window.location.href = `image.html?id=${image._id}&created=1`;
    } catch (err) {
      showMessage(`Failed to save image: ${err.message}`, "danger");
      saveBtn.disabled = false;
      saveBtn.textContent = "Save";
    }
  };

  me.setup = () => {
    document
      .querySelectorAll("input[name=source]")
      .forEach((radio) => radio.addEventListener("change", me.onSourceChange));
    fileInput.addEventListener("change", me.onFileChange);
    urlInput.addEventListener("change", me.onUrlChange);
    tagsInput.addEventListener("input", me.onTagsInput);
    const form = document.getElementById("add-form");
    form.addEventListener("submit", me.onSubmit);
    // a file pick fires "input" before "change", so a bad-file error still shows
    form.addEventListener("input", clearErrors);
  };

  return me;
}

const addImage = AddImage();
addImage.setup();
