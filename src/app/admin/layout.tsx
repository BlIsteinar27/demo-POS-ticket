import Link from "next/link";
import { Package, BarChart3, Home } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="flex items-center text-gray-700 hover:text-gray-900"
              >
                <Home className="w-5 h-5 mr-2" />
                <span className="font-semibold">POS</span>
              </Link>
              <div className="flex space-x-4">
                <Link
                  href="/admin"
                  className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Reportes
                </Link>
                <Link
                  href="/admin/productos"
                  className="flex items-center text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Productos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
