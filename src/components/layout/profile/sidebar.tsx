export default function Sidebar() {
    return (
        <div className="w-1/5 border-r p-4">
            <h2 className="font-bold text-lg mb-4">User Menu</h2>
            <ul>
                <li className="mb-2">
                    <a href="/profile" className="text-blue-500 hover:underline">Profile</a>
                </li>
                <li className="mb-2">
                    <a href="/settings" className="text-blue-500 hover:underline">Settings</a>
                </li>
                <li className="mb-2">
                    <a href="/logout" className="text-blue-500 hover:underline">Logout</a>
                </li>
            </ul>
        </div>
    )
}