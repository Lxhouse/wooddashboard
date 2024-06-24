import './globals.css';
import AutoRefresh from './AutoRefresh';
import { serif } from './fonts';
import HomeLink from './HomeLink';
import Link from './Link';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AutoRefresh>
      <html lang="en" className={serif.className}>
        <body className="mx-auto max-w-2xl bg-[--bg] px-5 py-12 text-[--text]">
          <header className="mb-14 flex flex-row place-content-between">
            <HomeLink />
            <span className="relative top-[4px] italic ">by
              <Link href="https://www.yuque.com/zhemu-emxtq" target="_blank" className='ml-2'>
                <img
                  alt="Zhe Mu"
                  src="https://avatars.githubusercontent.com/u/82502913"
                  className="relative -top-1 mx-1 inline h-8 w-8 rounded-full"
                />
              </Link></span>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </AutoRefresh>
  );
}
