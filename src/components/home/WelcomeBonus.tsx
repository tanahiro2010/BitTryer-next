export default function WelcomeBonus() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center space-x-2">
        <span className="text-blue-600 font-bold">🎁</span>
        <span className="text-blue-800 font-medium">初回登録特典</span>
      </div>
      <p className="text-blue-700 mt-1">
        新規登録で<span className="font-bold text-xl">10万円分</span>のサイト内通貨をプレゼント！
      </p>
    </div>
  );
}
