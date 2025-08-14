import {
  DesktopRegisterForm,
  MobileRegisterForm,
} from "@/components/layout/register/form";

export default function RegisterPage() {
  return (
    <div className="max-w-7xl mx-auto mt-10">
      <div className="hidden md:block">
        {" "}
        {/** PCの画面 */}
        <div className="flex justify-center">
          <div className="border rounded-lg p-3 w-1/2">
            <h1 className="text-3xl font-bold text-center">アカウント登録</h1>

            <DesktopRegisterForm />
          </div>
        </div>
      </div>

      <div className="block md:hidden px-3">
        {" "}
        {/** スマホの画面 */}
        <h1 className="text-2xl font-bold">アカウント登録</h1>
        <MobileRegisterForm />
      </div>
    </div>
  );
}
