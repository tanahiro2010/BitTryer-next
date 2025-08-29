import CreateCoinForm from "@/components/layout/profile/portfolio/coins/form";

export default function NewCoinPage() {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 tracking-tight">新規コイン作成</h1>
            <CreateCoinForm />
        </div>
    );
}