// 自定义加载器函数，直接返回外部图片的完整 URL
export const imageLoader = ({ src }: { src: string }) => {
  return src;
};
