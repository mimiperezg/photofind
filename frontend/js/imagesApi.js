// small wrapper around fetch for the /api/images routes.
// every function returns the parsed JSON or throws an Error with the server's message

const request = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `${res.status} ${res.statusText}`);
  }
  return data;
};

export const getImages = ({ tag, page = 1 } = {}) => {
  const params = new URLSearchParams({ page });
  if (tag) params.set("tag", tag);
  return request(`/api/images?${params}`);
};

export const getTags = () => request("/api/images/tags");

export const searchImages = (q) =>
  request(`/api/images/search?${new URLSearchParams({ q })}`);

export const getImage = (id) => request(`/api/images/${id}`);

export const createImage = (image) =>
  request("/api/images", { method: "POST", body: JSON.stringify(image) });

export const updateImage = (id, updates) =>
  request(`/api/images/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });

export const deleteImage = (id) =>
  request(`/api/images/${id}`, { method: "DELETE" });
