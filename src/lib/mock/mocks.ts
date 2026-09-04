import { PaymentMethod } from "@/types";
import { Smartphone, DollarSign, Banknote, CreditCard } from "lucide-react";

const MOCK_TASA = 36.5; // Tasa del día fija para MVP
const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "PAGO_MOVIL", label: "Pago Móvil", shortLabel: "PM", icon: Smartphone },
  {
    id: "EFECTIVO_USD",
    label: "Efectivo $",
    shortLabel: "USD",
    icon: DollarSign,
  },
  {
    id: "EFECTIVO_VES",
    label: "Efectivo Bs",
    shortLabel: "Bs",
    icon: Banknote,
  },
  { id: "PUNTO", label: "Punto", shortLabel: "Punto", icon: CreditCard },
];

export { PAYMENT_METHODS, MOCK_TASA };
