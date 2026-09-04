import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { CartItem } from "@/types";

interface ResumenProps {
  cart: CartItem[];
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
}

export function Resumen({ cart, clearCart, updateQuantity }: ResumenProps) {
  return (
    <div className="flex-1 overflow-y-auto mb-2 md:mb-4 min-h-0">
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h2 className="font-bold text-lg md:text-xl text-zinc-800">
          Ticket Actual
        </h2>
        {cart.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 md:h-auto"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Limpiar</span>
          </Button>
        )}
      </div>

      <div className="divide-y">
        {cart.length === 0 ? (
          <p className="text-zinc-400 text-center py-4 md:py-8 text-sm md:text-base">
            Carrito vacío
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="py-2 md:py-2 flex justify-between items-center"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-sm md:text-base text-zinc-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs md:text-sm text-zinc-500">
                  ${item.price_usd.toFixed(2)} x {item.quantity} = $
                  {(item.price_usd * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-1 md:gap-2 items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="h-7 w-7 md:h-8 md:w-8 text-sm md:text-lg font-bold"
                >
                  -
                </Button>
                <Badge className="bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-2 md:px-3 py-1 text-sm md:text-base">
                  {item.quantity}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="h-7 w-7 md:h-8 md:w-8 text-sm md:text-lg font-bold"
                >
                  +
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
