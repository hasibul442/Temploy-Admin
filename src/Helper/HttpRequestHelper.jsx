
export async function PostRequestData(data, url) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to create");
  }

  return res.json();
}

export async function GetRequestData(url) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.json();
}


export async function DeleteRequestData(id, url) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete data");
  }

  return res.json();
}

export async function GetDetails(url) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch details");
  }

  return res.json();
}

export async function UpdateRequestData(data, url) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${url}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to update data");
  }

  return res.json();
}