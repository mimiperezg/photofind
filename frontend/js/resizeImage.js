// shrinks an image file on a canvas so it's small enough to store in MongoDB.
// returns a JPEG data URL plus the new size
export async function resizeImage(file, maxSize = 1024, quality = 0.8) {
  if (!file.type.startsWith("image/")) {
    throw new Error("That file isn't an image");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // e.g. HEIC photos from iPhones, which most browsers can't decode
    throw new Error("This browser can't read that image format");
  }

  // only ever shrink, never enlarge small images
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  // JPEG has no transparency, so give transparent PNGs a white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return {
    dataUrl: canvas.toDataURL("image/jpeg", quality),
    width: canvas.width,
    height: canvas.height,
  };
}
