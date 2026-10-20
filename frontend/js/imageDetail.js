import { deleteImage, getImage, updateImage } from "./imagesApi.js";
import {
  FALLBACK_IMAGE,
  clearErrors,
  parseTags,
  showMessage,
  tagLink,
} from "./imageUi.js";

function ImageDetail() {
  const me = {};
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  let image = null;

  const viewPanel = document.getElementById("view-panel");
  const editForm = document.getElementById("edit-form");

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  me.renderView = () => {
    const tags = document.getElementById("detail-tags");
    if (image.tags.length) {
      tags.replaceChildren(...image.tags.map(tagLink));
    } else {
      tags.textContent = "No tags";
    }
    tags.classList.toggle("text-body-secondary", !image.tags.length);

    const desc = document.getElementById("detail-description");
    desc.textContent = image.description || "No description";
    desc.classList.toggle("text-body-secondary", !image.description);

    const from = image.source === "url" ? "Added from URL" : "Uploaded";
    document.getElementById("detail-meta").textContent =
      `${from} ${formatDate(image.createdAt)}`;

    const img = document.getElementById("detail-img");
    img.alt = image.description || image.tags.join(", ") || "Image";
    if (!img.getAttribute("src")) {
      img.addEventListener("error", () => (img.src = FALLBACK_IMAGE), {
        once: true,
      });
      img.src = image.src;
    }
  };

  me.showEdit = () => {
    document.getElementById("edit-tags").value = image.tags.join(", ");
    document.getElementById("edit-description").value = image.description;
    viewPanel.classList.add("d-none");
    editForm.classList.remove("d-none");
    document.getElementById("edit-tags").focus();
  };

  me.hideEdit = () => {
    editForm.classList.add("d-none");
    viewPanel.classList.remove("d-none");
  };

  me.onSave = async (event) => {
    event.preventDefault();
    const tags = parseTags(document.getElementById("edit-tags").value);
    if (tags.length > 10) {
      showMessage("Use at most 10 tags", "danger");
      return;
    }

    const saveBtn = document.getElementById("save-btn");
    saveBtn.disabled = true;
    try {
      const updates = await updateImage(id, {
        tags,
        description: document.getElementById("edit-description").value,
      });
      Object.assign(image, updates);
      me.renderView();
      me.hideEdit();
      showMessage("Changes saved");
    } catch (err) {
      showMessage(`Failed to save changes: ${err.message}`, "danger");
    } finally {
      saveBtn.disabled = false;
    }
  };

  me.onDelete = async () => {
    if (!confirm("Delete this image? This can't be undone.")) {
      return;
    }
    try {
      await deleteImage(id);
      window.location.href = "gallery.html?deleted=1";
    } catch (err) {
      showMessage(`Failed to delete image: ${err.message}`, "danger");
    }
  };

  me.setup = async () => {
    if (!id) {
      showMessage("No image selected.", "danger");
      return;
    }

    try {
      image = await getImage(id);
    } catch (err) {
      showMessage(`Couldn't load this image: ${err.message}`, "danger");
      return;
    }

    me.renderView();
    document.getElementById("image-content").classList.remove("d-none");

    // the add page sends us here with ?created=1
    if (params.has("created")) {
      showMessage("Image added");
      history.replaceState(null, "", `image.html?id=${id}`);
    }

    document.getElementById("edit-btn").addEventListener("click", me.showEdit);
    document
      .getElementById("cancel-btn")
      .addEventListener("click", me.hideEdit);
    document
      .getElementById("delete-btn")
      .addEventListener("click", me.onDelete);
    editForm.addEventListener("submit", me.onSave);
    editForm.addEventListener("input", clearErrors);
  };

  return me;
}

const imageDetail = ImageDetail();
imageDetail.setup();
