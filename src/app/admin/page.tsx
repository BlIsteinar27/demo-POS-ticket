"use client";

import { useEffect, useState } from "react";
import { getTodaySales, getSalesByCategory } from "@/app/actions/reports";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface ReportData {
  totalUSD: number;
  totalVES: number;
  paymentMethods: Record<string, number>;
  pagoMovilRefs: Array<{ reference: string; amount: number; date: string }>;
  salesCount: number;
}

interface CategoryData {
  [category: string]: {
    count: number;
    total: number;
    items: Array<{ name: string; quantity: number; total: number }>;
  };
}

export default function AdminPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [categoryData, setCategoryData] = useState<CategoryData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    setLoading(true);
    const [salesResult, categoryResult] = await Promise.all([
      getTodaySales(),
      getSalesByCategory(),
    ]);

    if (salesResult.success && salesResult.data) {
      setReport(salesResult.data);
    }

    if (categoryResult.success && categoryResult.data) {
      setCategoryData(categoryResult.data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando reporte...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Reporte de Ventas - Hoy
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={loadReport} className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <Link href="/" className="flex-1 sm:flex-none">
            <Button variant="outline" className="w-full">
              <span className="hidden sm:inline">Ir al POS</span>
              <span className="sm:hidden">POS</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total USD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${report.totalUSD.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VES</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Bs. {report.totalVES.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.salesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pago Móvil</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(report.paymentMethods["PAGO_MOVIL"] || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desglose por método de pago */}
        <Card>
          <CardHeader>
            <CardTitle>Desglose por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(report.paymentMethods).map(([method, amount]) => (
                <div key={method} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{method}</span>
                  <span className="text-sm font-bold">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
              {Object.keys(report.paymentMethods).length === 0 && (
                <p className="text-sm text-gray-500">No hay ventas hoy</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ventas por categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(categoryData).map(([category, data]) => (
                <div key={category} className="border-b pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm font-bold">
                      ${data.total.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.count} ítems vendidos
                  </div>
                  <div className="mt-2 space-y-1">
                    {data.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-xs text-gray-600"
                      >
                        <span>{item.name}</span>
                        <span>
                          {item.quantity} x ${item.total.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(categoryData).length === 0 && (
                <p className="text-sm text-gray-500">No hay ventas hoy</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referencias de Pago Móvil */}
      {report.pagoMovilRefs.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Referencias de Pago Móvil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Referencia
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Monto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Hora
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.pagoMovilRefs.map((ref, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 text-sm font-mono">
                        {ref.reference}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        ${ref.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {new Date(ref.date).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
