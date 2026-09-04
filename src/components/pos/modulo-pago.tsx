import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHODS, MOCK_TASA } from "@/lib/mock/mocks";
import { Delete, ChevronUp, ChevronDown } from "lucide-react";
import { PaymentMethod } from "@/types";
import { useState } from "react";

interface ModuloPagoProps {
  totalVES: number;
  totalUSD: number;
  paymentMethod: PaymentMethod | null;
  setPaymentMethod: (method: PaymentMethod) => void;
  isPagoMovil: boolean;
  reference: string;
  setReference: (reference: string) => void;
  handleNumpadPress: (value: string) => void;
  handleNumpadDelete: () => void;
  handleRegisterSale: () => void;
  canRegister: boolean;
}

export function ModuloPago({
  totalVES,
  totalUSD,
  paymentMethod,
  setPaymentMethod,
  isPagoMovil,
  reference,
  setReference,
  handleNumpadPress,
  handleNumpadDelete,
  handleRegisterSale,
  canRegister,
}: ModuloPagoProps) {
  const [numpadExpanded, setNumpadExpanded] = useState(false);
  return (
    <div className="border-t pt-2 md:pt-3 flex flex-col gap-2 md:gap-3">
      {/* Cálculo de Totales */}
      <Card className="bg-gradient-to-br from-secondary/20 to-accent/10 border-secondary/30">
        <CardContent className="p-2 md:p-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              Total Bs (Tasa: {MOCK_TASA})
            </p>
            <p className="text-lg md:text-xl font-black text-foreground">
              Bs. {totalVES.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
              Total USD
            </p>
            <p className="text-xl md:text-2xl font-black text-primary">
              ${totalUSD.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selector de Método de Pago */}
      <div className="grid grid-cols-4 gap-1 md:gap-1.5">
        {PAYMENT_METHODS.map((method) => {
          const Icon = method.icon;

          return (
            <Button
              key={method.id}
              variant={paymentMethod === method.id ? "default" : "outline"}
              onClick={() => setPaymentMethod(method.id)}
              className="text-xs font-bold h-9 md:h-10 px-1 flex flex-col items-center justify-center gap-0.5"
            >
              <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="hidden md:inline">{method.label}</span>
              <span className="md:hidden">{method.shortLabel}</span>
            </Button>
          );
        })}
      </div>

      {/* Bloque Numpad (Sólo visible si es Pago Móvil) */}
      {isPagoMovil && (
        <div className="bg-gradient-to-br from-secondary/10 to-accent/5 p-2 rounded-lg border border-secondary/30">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs font-bold text-muted-foreground">
              Ref. Pago Móvil (4 dígitos):
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base md:text-lg font-black tracking-widest text-primary">
                {reference.padEnd(4, "-")}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setNumpadExpanded(!numpadExpanded)}
                className="h-6 w-6 p-0"
              >
                {numpadExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {numpadExpanded && (
            <div className="grid grid-cols-3 gap-1">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <Button
                  key={num}
                  variant="outline"
                  onClick={() => handleNumpadPress(num)}
                  className="h-8 md:h-9 font-bold text-sm md:text-base bg-white"
                >
                  {num}
                </Button>
              ))}
              <Button
                variant="destructive"
                onClick={handleNumpadDelete}
                className="h-8 md:h-9 col-span-1 font-bold"
              >
                <Delete className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => handleNumpadPress("0")}
                className="h-8 md:h-9 font-bold text-sm md:text-base bg-white"
              >
                0
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Botón Principal de Acción */}
      <Button
        onClick={handleRegisterSale}
        disabled={!canRegister}
        className="w-full h-10 md:h-12 text-base md:text-lg bg-primary hover:bg-primary/90 tracking-wide uppercase shadow-lg"
      >
        Registrar Venta
      </Button>
    </div>
  );
}
