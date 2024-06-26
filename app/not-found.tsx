import { sans } from "./fonts";
import Link from "./Link";
import "./[slug]/markdown.css";

export default function NotFound() {
  return (
    <article className="markdown">
      <h1
        className={[
          sans.className,
          "text-[40px] font-black leading-[44px] text-[--title]",
        ].join(" ")}
      >
        Not found
      </h1>
      <div className="markdown mt-10">
        <p>这篇文章没有被找到 ?(没有创建 ?)</p>
        <p>
          如果你认为是网站的问题,可以点击这里告诉我{" "}
          <Link href="https://github.com/Lxhouse/wooddashboard/issues">
            点击这里
          </Link>
        </p>
        <p>
          如果是之前的文章,你却找不到了,可以来这里寻找试试{" "}
          <Link href="https://github.com/Lxhouse/wooddashboard/tree/main/public">
            文章档案馆
          </Link>
        </p>
        <p>希望你可以找到你需要的那篇文章</p>
      </div>
    </article>
  );
}
