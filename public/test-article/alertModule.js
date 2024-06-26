'use client';
export function AlertModule() {
  return (
    <button
      className="bg-cyan-500 text-white p-2 border border-white rounded-md hover:cursor-pointer"
      onClick={() => alert('哦吼？ 你点击了？')}
    >
      这是一个外部引入的按钮
    </button>
  );
}
