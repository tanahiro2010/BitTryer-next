interface FeatureListProps {
  features: string[];
}

export default function FeatureList({ features }: FeatureListProps) {
  return (
    <div className="space-y-4">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-gray-700">{feature}</span>
        </div>
      ))}
    </div>
  );
}
