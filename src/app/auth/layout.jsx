import { Suspense } from "react";

export default function AppLayout({ children }) {
return (
    <>
      <Suspense>
        {children}
      </Suspense>
    </>
  );
}