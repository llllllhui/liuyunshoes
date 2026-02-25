import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <p className="mb-2">店主：朱文格</p>
            <p className="mb-2">
              电话：<a href="tel:15224226812" className="hover:text-slate-300">15224226812</a>
            </p>
            <p className="mb-2">地址：聊城东昌府区香江一期广场东路西排28</p>
            <p>
              网址：<a href="https://liuyun.186633.xyz/" className="hover:text-slate-300">liuyun.186633.xyz</a>
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/products/new" className="hover:text-slate-300">新品推荐</Link>
              <Link href="/products/hot" className="hover:text-slate-300">爆款专区</Link>
              <Link href="/products/classic" className="hover:text-slate-300">经典款式</Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>版权所有 © 2025 流云帆布鞋</p>
        </div>
      </div>
    </footer>
  )
}
