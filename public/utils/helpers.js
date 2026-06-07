export async function fetchGet(routes) {
  const res = await fetch(routes);

  if (res.ok) {
    const data = await res.json();
    return data;
  }
}

export function fetchPost(params, cb, route = "/folder") {
  fetch(route, {
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

export const getSpinnerIcon = (spinnerTemplate, attr = "subFoldersAndFiles") => {
  const icon = spinnerTemplate.content
    .cloneNode(true)
    .querySelector(".spinner_icon");
  icon.setAttribute("data-spinner-icon", attr);
  return icon;
};

export const removeSpinnerIcon = (wrap, attr = "subFoldersAndFiles") => {
  const icon = wrap.querySelector(`[data-spinner-icon='${attr}']`);
  if (icon) icon.remove();
};