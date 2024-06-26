import { readdir, readFile } from 'fs/promises';
import matter from 'gray-matter';
import './markdown.css';
import Link from '../Link';
import remarkSmartpants from 'remark-smartypants';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { remarkMdxEvalCodeBlock } from './mdx';
import overnight from 'overnight/themes/Overnight-Slumber.json';
import rehypeKatex from 'rehype-katex';
overnight.colors['editor.background'] = 'var(--code-bg)';
import { sans } from '../fonts';
interface IPostData {
  slug: string;
  title: string;
  date: string;
  spoiler: string;
}

export async function generateStaticParams() {
  const entries = await readdir('./public/', { withFileTypes: true });
  const dirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return dirs.map((dir) => ({ slug: dir }));
}

export async function generateMetadata({ params }: { params: IPostData }) {
  const file = await readFile('./public/' + params.slug + '/index.md', 'utf8');
  let { data } = matter(file);
  return {
    title: data.title + ' — wooddashboard',
    description: data.spoiler,
  };
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

  return (
    <article>
      <h1
        className={[
          sans.className,
          'text-[40px] font-black leading-[44px] text-[--title]',
        ].join(' ')}
      >
        {data.title}
      </h1>
      <p className="mt-2 text-[13px] text-gray-700 dark:text-gray-300">
        {new Date(data.date).toLocaleDateString('zh-CN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </p>
      <div className="markdown mt-10">
        <MDXRemote
          source={content}
          components={{ a: Link, ...postComponents }}
          options={{
            mdxOptions: {
              useDynamicImport: true,
              remarkPlugins: [
                remarkSmartpants,
                [remarkMdxEvalCodeBlock, filename],
              ],
              rehypePlugins: [
                rehypeKatex,
                [
                  rehypePrettyCode,
                  {
                    theme: overnight,
                  },
                ],
              ],
            },
          }}
        ></MDXRemote>
        <hr />
        <p>
          <Link href="www.baidu.com">Discuss on</Link>
          &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
          <Link href="www.baidu.com">Edit on GitHub</Link>
        </p>
      </div>
    </article>
  );
}
