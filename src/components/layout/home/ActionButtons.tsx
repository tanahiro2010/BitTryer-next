import Link from "next/link";

interface ActionButtonsProps {
  primaryText?: string;
  secondaryText?: string;
}

export default function ActionButtons({ 
  primaryText = "無料で10万円分を受け取る",
  secondaryText = "詳細を見る",
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4 mb-10 text-center">
      <Link 
        href="/login"
        className="w-full md:w-1/2 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors border">
        {primaryText}
      </Link>
      <Link 
        href="/"
        className="w-full md:w-1/2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-100 transition-colors">
        {secondaryText}
      </Link>
    </div>
  );
}
