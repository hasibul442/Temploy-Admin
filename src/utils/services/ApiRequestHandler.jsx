import Cookies from 'js-cookie';

async function readCookie(name) {
   if (typeof window === 'undefined') {
      const { cookies } = await import('next/headers');
      return (await cookies()).get(name)?.value;
   }
   return Cookies.get(name);
}

export async function ApiRequestHandler(props) {
   const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://temploy-api-gateway.vercel.app/api";
   const v1 = process.env.NEXT_PUBLIC_API_VERSION_1 || "v1";
   const url = `${baseUrl}/${v1}`;
//    const lang = (await readCookie('NEXT_LOCALE')) || 'en';

   const headers = {
       'Content-Type': 'application/json',
       Accept: "application/json",
       'Access-Control-Allow-Origin' : '*',
    //    'Accept-Language': lang,
    //    'Accept-Currency' : currency,
   };
    if (props.includeAuth == true) {
         headers.Authorization = `Bearer ${await readCookie('token')}`;
    }

   try {
       const res = await fetch(`${url}/${props.endpoint}`, {
           method: props.method,
           headers: headers,
           // axios never cached, so keep that behaviour unless a caller opts in.
           cache: props.cache ?? 'no-store',
           ...(props.method !== "GET" && props.data !== undefined
               ? { body: JSON.stringify(props.data) }
               : {}),
       });

       // fetch only rejects on network failure, so a 4xx/5xx has to be turned into
       // the `{ message, response }` shape the call sites already check for.
       const text = await res.text();
       const data = text ? JSON.parse(text) : null;

       if (!res.ok) {
           return {
               message: data?.message || `Request failed with status ${res.status}`,
               response: { status: res.status, data },
           };
       }

       return { data, status: res.status };
   } catch (error) {
       return error;
   }
}
