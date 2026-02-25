import { Sidebar } from '@/components/admin/Sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">设置</h1>

        <div className="max-w-2xl space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">店铺信息</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">店铺名称</Label>
                <Input
                  id="storeName"
                  defaultValue="流云帆布鞋"
                />
              </div>
              <div>
                <Label htmlFor="owner">店主</Label>
                <Input
                  id="owner"
                  defaultValue="朱文格"
                />
              </div>
              <div>
                <Label htmlFor="phone">联系电话</Label>
                <Input
                  id="phone"
                  defaultValue="15224226812"
                />
              </div>
              <div>
                <Label htmlFor="address">地址</Label>
                <Input
                  id="address"
                  defaultValue="聊城东昌府区香江一期广场东路西排28"
                />
              </div>
              <Button>保存更改</Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">管理员账号</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="zhuwenge@liuyun.186633.xyz"
                  disabled
                />
                <p className="text-sm text-slate-500 mt-1">
                  邮箱无法修改，如需更改请联系技术支持
                </p>
              </div>
              <div>
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="留空则不修改密码"
                />
              </div>
              <Button variant="outline">更新密码</Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ 部分设置功能需要配置 Supabase 后端才能正常使用。
              产品数据将在您上传图片后自动显示。
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
