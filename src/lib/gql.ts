export async function gql<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>,
  accessToken?: string | null,
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `GraphQL request failed: ${res.status} ${res.statusText} - ${text}`,
    );
  }

  const json = (await res.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("\n"));
  }
  if (!json.data) throw new Error("No data returned from GraphQL request");
  return json.data;
}
