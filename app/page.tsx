import { readdir, readFile } from 'fs/promises';
import matter from 'gray-matter';
import Link from './Link';
interface IPostData {
  slug: string;
  title: string;
  date: string;
}

export const metadata = {
  title: "wooddashboard — A blog by Zhe Mu",
  description: "A personal blog by Zhe Mu",
};


export async function getPosts(): Promise<IPostData[]> {
  try {
    const entries = await readdir('./public/', { withFileTypes: true });

    const dirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    const fileContents = await Promise.all(
      dirs.map((dir) => readFile(`./public/${dir}/index.md`, 'utf8'))
    );

    const posts: IPostData[] = dirs.map((slug, i) => {
      const fileContent = fileContents[i];
      const { data } = matter(fileContent);
      return { slug, ...data } as IPostData;
    });

    posts.sort((a, b) => (Date.parse(a.date) < Date.parse(b.date) ? 1 : -1));

    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}
export default async function Home() {
  const posts = await getPosts();
  return <div className="relative -top-[10px] flex flex-col gap-8">
    {posts.map((post =>
      <Link key={post.slug} className='block py-4 hover:scale-[1.0005]' href={`/${post.slug}/`}>
        <article> {post.title}</article>
      </Link>
    ))}
  </div>;
}
