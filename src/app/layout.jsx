
import "./globals.css";
import Script from 'next/script';

export const metadata = {
  title: "Admin Dashboard",
  description: "Developed by Hasibul Hasan"
};


export default function RootLayout({ children }) {
  // const pathname = isAuthPath();

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="apple-touch-icon" sizes="76x76" href="/assets/img/apple-icon.png" />
        <link rel="icon" type="image/png" href="/assets/img/favicon.png" />
        <link href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700,800" rel="stylesheet" />
        <link href="https://demos.creative-tim.com/soft-ui-dashboard/assets/css/nucleo-icons.css" rel="stylesheet" />
        <link href="https://demos.creative-tim.com/soft-ui-dashboard/assets/css/nucleo-svg.css" rel="stylesheet" />
        <script src="https://kit.fontawesome.com/42d5adcbca.js" crossOrigin="anonymous"></script>
        <link id="pagestyle" href="/assets/css/soft-ui-dashboard.css?v=1.1.0" rel="stylesheet" />
        {/* <script defer data-site="YOUR_DOMAIN_HERE" src="https://api.nepcha.com/js/nepcha-analytics.js"></script> */}
      </head>
      <body suppressHydrationWarning={true}>

        {children}

        {/* Common JS */}
        <Script src="/assets/js/core/popper.min.js" async />
        <Script src="/assets/js/core/bootstrap.min.js" async />
        <Script src="/assets/js/plugins/perfect-scrollbar.min.js" async />
        <Script src="/assets/js/plugins/smooth-scrollbar.min.js" async />
        {/* <Script id="scrollbar-init" strategy="afterInteractive">
          {`var win = navigator.platform.indexOf('Win') > -1;
            if (win && document.querySelector('#sidenav-scrollbar')) {
              var options = { damping: '0.5' };
              Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
            }`}
        </Script> */}
        <Script src="https://buttons.github.io/buttons.js" strategy="lazyOnload" async defer />
        <Script src="/assets/js/soft-ui-dashboard.min.js?v=1.1.0" strategy="lazyOnload" />
      </body>
    </html>
  );
}
