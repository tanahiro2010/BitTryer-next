export default function WarningNotice() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-2">
        <span className="text-amber-600 font-bold mt-0.5">⚠️</span>
        <div>
          <p className="text-amber-800 font-medium text-sm">重要なお知らせ</p>
          <p className="text-amber-700 text-sm mt-1">
            これはゲームです。サイト内通貨は実際の暗号資産ではなく、換金することはできません。
          </p>
        </div>
      </div>
    </div>
  );
}
