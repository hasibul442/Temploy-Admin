import { clearTokenCookie } from '@/utils/services/tokenCookie';

async function readCookie(name) {
   if (typeof window === 'undefined') {
      const { cookies } = await import('next/headers');
      return (await cookies()).get(name)?.value;
   }
   const match = document.cookie.split('; ').find((part) => part.startsWith(`${name}=`));
   return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}

// The gateway's admin auth answers 401 (expired/invalid token, employee gone) or 403 with
// `auth_status: false` (not an admin token): the session is over either way.
const isSessionGone = (status, data) => status === 401 || data?.auth_status === false;

let redirecting = false;
function endSession() {
   if (typeof window === 'undefined') return { message: 'Session expired', response: { status: 401 } };
   if (!redirecting) {
      redirecting = true;
      clearTokenCookie().finally(() => window.location.replace('/auth/login'));
   }
   return new Promise(() => {});
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
       'Accept-Language': 'en',
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
           if (props.includeAuth && isSessionGone(res.status, data)) return endSession();
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
