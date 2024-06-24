import { readdir, readFile } from 'fs/promises';
import Color from "colorjs.io";
import matter from 'gray-matter';
import Link from './Link';
import { sans } from './fonts';
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
/** 文章标题 */
function PostTitle({ post }: { post: IPostData }) {
  let lightStart = new Color("lab(63 59.32 -1.47)");
  let lightEnd = new Color("lab(33 42.09 -43.19)");
  let lightRange = lightStart.range(lightEnd);
  let darkStart = new Color("lab(81 32.36 -7.02)");
  let darkEnd = new Color("lab(78 19.97 -36.75)");
  let darkRange = darkStart.range(darkEnd);
  let today = new Date();
  let timeSinceFirstPost = today.getTime() - new Date(2018, 10, 30).getTime();
  let timeSinceThisPost = today.getTime() - new Date(post.date).getTime();
  let staleness = timeSinceThisPost / timeSinceFirstPost;
  return <h2 className={[sans.className, "text-[28px] font-black", "text-[--lightLink] dark:text-[--darkLink]"].join((" "))}
    style={{
      "--lightLink": lightRange(staleness).toString(),
      "--darkkLink": darkRange(staleness).toString(),
    } as React.CSSProperties}>
    {post?.title || ''}
  </h2>
}
export default async function Home() {
  const posts = await getPosts();
  return <div className="relative -top-[10px] flex flex-col gap-8">
    {posts.map((post =>
      <Link key={post.slug} className='block py-4 hover:scale-[1.0005]' href={`/${post.slug}/`}>
        <article> <PostTitle post={post} /></article>
      </Link>
    ))}
  </div>;
}
