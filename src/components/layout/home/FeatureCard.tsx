interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  bgColor?: string;
  iconColor?: string;
}

export default function FeatureCard({
  icon,
  title,
  description,
  bgColor = "bg-blue-100",
  iconColor = "text-blue-600",
}: FeatureCardProps) {
  return (
    <div className="text-center space-y-4">
      <div
        className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mx-auto`}
      >
        <span className={`${iconColor} font-bold`}>{icon}</span>
      </div>
      <h3 className="font-medium text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}
