import { Input } from "@/components/ui/input"

export default function LoginPage() {
    return (
        <div className="max-w-7xl mx-auto mt-10">
            <div className="hidden md:block"> {  /** PCの画面 */}
                <div className="flex justify-center">
                    <div className="border rounded-lg p-3 w-1/2">
                        <h1 className="text-3xl font-bold text-center">ログイン</h1>

                        <form action=""></form>
                        <Input></Input>
                    </div>
                </div>

            </div>

            <div className="block md:hidden"> { /** スマホの画面 */}
                <h1 className="text-2xl font-bold">ログイン</h1>
                <form className="mt-6">
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium">メールアドレス</label>
                        <input type="email" id="email" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-sm font-medium">パスワード</label>
                        <input type="password" id="password" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white font-medium rounded-md p-2 hover:bg-blue-700 transition-colors">ログイン</button>
                </form>
            </div>
        </div>
    )
}