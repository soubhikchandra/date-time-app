import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg p-12 text-center">
      <h1 className="text-2xl font-bold">Tool not found</h1>
      <p className="mt-2 text-gray-500">That calculator doesn&apos;t exist.</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to tools
      </Link>
    </div>
  );
}