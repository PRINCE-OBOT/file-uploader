export async function fetchGet(routes) {
  const res = await fetch(routes);

  if (res.ok) {
    const data = await res.json();
    return data;
  }
}

export function fetchPost(params, cb) {
  fetch(`/folder`, {
    method: "POST",
    body: params
  })
    .then((res) => res.text())
    .then((res) => {
      if (!JSON.parse(res).ok) return;
      cb();
    })
    .catch((err) => {
      console.error("Folder creation error:", err);
    });
}

export const getValidUrl = (url) => {
  return `/${url.split("/").slice(1).join("/")}`;
};
