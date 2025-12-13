import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Unauthorized</h1>
            <p>You do not have permission to access this page.</p>
            <Link href="/" className="text-blue-500 hover:underline">
                Go Home
            </Link>
        </div>
    );
}
