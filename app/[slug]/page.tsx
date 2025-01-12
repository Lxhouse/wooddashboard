import { readdir, readFile } from 'fs/promises';
import matter from 'gray-matter';
import './markdown.css';
import Link from '../Link';
import remarkSmartpants from 'remark-smartypants';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXRemote } from 'next-mdx-remote/rsc';
import overnight from 'overnight/themes/Overnight-Slumber.json';
import rehypeKatex from 'rehype-katex';
overnight.colors['editor.background'] = 'var(--code-bg)';
import { sans } from '../fonts';
import path from 'path';

interface IPostData {
  slug: string;
  title: string;
  date: string;
  spoiler: string;
}

export async function generateStaticParams() {
  // 1. 扫描 public 目录
  const entries = await readdir('./public/', { withFileTypes: true });

  // 2. 获取所有目录
  const dirs = entries.filter((entry) => entry.isDirectory());

  // 3. 检查每个目录是否包含 index.md
  const slugs = [];

  for (const dir of dirs) {
    try {
      const indexPath = path.join('./public', dir.name, 'index.md');
      await readFile(indexPath, 'utf8');
      slugs.push(dir.name);
    } catch (error) {
      // 如果文件不存在或无法读取，跳过这个目录
      continue;
    }
  }

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: IPostData }) {
  const file = await readFile('./public/' + params.slug + '/index.md', 'utf8');
  let { data } = matter(file);
  return {
    title: data.title + ' — wooddashboard',
    description: data.spoiler,
  };
}

// 自定义标题组件
function CustomHeading({
  level,
  children,
  ...props
}: {
  level: number;
  children: React.ReactNode;
}) {
  const text = children?.toString() || '';
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  // 移除标题前的 # 符号
  const cleanText = text.replace(/^#+\s*/, '');

  return (
    <Tag id={id} {...props}>
      <a href={`#${id}`} className="anchor">
        {cleanText}
      </a>
    </Tag>
  );
}

export default async function postPage({ params }: { params: IPostData }) {
  const filename = './public/' + params.slug + '/index.md';
  const file = await readFile(filename, 'utf8');
  let postComponents = {};
  try {
    postComponents = await import(`../../public/${params.slug}/components.js`);
  } catch (e: any) {
    if (!e || e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    }
  }
  const { content, data } = matter(file);

  // 获取文章标题列表
  const headings = await getHeadings(content);

  // 创建一个 TableOfContents 组件并传入 headings
  function TableOfContents() {
    return (
      <nav className="text-sm" aria-label="Table of contents">
        <p className="mb-4 text-base font-medium text-gray-900 dark:text-gray-100">
          目录
        </p>
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block rounded-sm transition-all duration-200
                  ${heading.depth === 2 ? 'pl-2' : 'pl-6'}`}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // 创建自定义组件对象
  const components = {
    a: Link,
    h1: (props: any) => <CustomHeading level={1} {...props} />,
    h2: (props: any) => <CustomHeading level={2} {...props} />,
    h3: (props: any) => <CustomHeading level={3} {...props} />,
    h4: (props: any) => <CustomHeading level={4} {...props} />,
    ...postComponents,
  };

  return (
    <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
      <div className="relative lg:flex lg:gap-8">
        <article className="prose prose-lg dark:prose-invert lg:min-w-[720px] lg:max-w-[720px] xl:min-w-[800px] xl:max-w-[800px]">
          <h1
            className={[
              sans.className,
              'text-[40px] font-black leading-[44px] text-[--title] mb-4',
            ].join(' ')}
          >
            {data.title}
          </h1>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-8">
            {new Date(data.date).toLocaleDateString('zh-CN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
          <div className="markdown">
            <MDXRemote
              source={content}
              components={components}
              options={{
                mdxOptions: {
                  useDynamicImport: true,
                  remarkPlugins: [remarkSmartpants],
                  rehypePlugins: [
                    rehypeKatex,
                    [rehypePrettyCode, { theme: overnight }],
                  ],
                },
              }}
            />
            <hr className="my-8" />
            <p className="flex gap-8">
              <Link href="www.baidu.com">Discuss on</Link>
              <Link href="www.baidu.com">Edit on GitHub</Link>
            </p>
          </div>
        </article>
        <nav className="hidden lg:block lg:min-w-[240px] lg:max-w-[240px] xl:min-w-[280px] xl:max-w-[280px]">
          <div className="sticky top-8">
            <TableOfContents />
          </div>
        </nav>
      </div>
    </div>
  );
}

// getHeadings 函数保持不变
async function getHeadings(content: string) {
  const headingLines = content
    .split('\n')
    .filter((line) => line.match(/^#{2,3} /));
  return headingLines.map((line) => {
    const level = line.match(/^(#{2,3}) /)[1].length;
    const text = line.replace(/^#{2,3} /, '');
    return {
      text,
      id: text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      depth: level,
    };
  });
}
