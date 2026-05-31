export async function fetchGet(routes) {
  const res = await fetch(routes);

  if (res.ok) {
    const data = await res.json();
    return data;
  }
}

