import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, User as UserIcon, Calendar } from "lucide-react";
import SearchForm from "@/components/layout/search-form";
import User from "@/lib/user";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    limit?: string;
    page?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, limit, page } = await searchParams;
  const users = await User.some(
    {
      name: {
        contains: q ?? "",
        mode: "insensitive",
      },
    },
    parseInt(limit ?? "20"),
    parseInt(page ?? "0"),
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* ヘッダーセクション */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">ユーザー検索</h1>
          </div>
          <SearchForm defaultValue={q as string} />
        </div>

        {q && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-600">検索クエリ:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              "{q}"
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">{users.length}</span>{" "}
            件のユーザーが見つかりました
          </p>
        </div>
      </div>

      {/* 検索結果 */}
      {!q ? (
        <div className="text-center py-16">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ユーザーを検索してください
          </h3>
          <p className="text-gray-600">
            上の検索フォームにユーザー名を入力して検索を開始してください。
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            「{q}」に一致するユーザーが見つかりませんでした
          </h3>
          <p className="text-gray-600">
            別のキーワードで検索してみてください。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card
              key={user.userId}
              className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-gray-900 truncate">
                      {user.user.name}
                    </h2>
                    <p className="text-sm text-gray-500 font-mono">
                      ID: {user.user.client_id.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      登録日:{" "}
                      {new Date(user.user.createdAt).toLocaleDateString(
                        "ja-JP",
                      )}
                    </span>
                  </div>

                  <Link
                    href={`/portfolio/${user.userId}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    ポートフォリオを見る
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
