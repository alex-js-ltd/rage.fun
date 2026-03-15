async function client<DataType>(
  endpoint: string,
  config: RequestInit,
): Promise<DataType> {
  return fetch(`${endpoint}`, config).then(async (response) => {
    const contentType = response.headers.get("content-type");

    let data = null;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    }

    if (response.ok) {
      return data;
    } else {
      return Promise.reject(data);
    }
  });
}

export { client };
