-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  price_usd numeric NOT NULL CHECK (price_usd >= 0::numeric),
  category USER-DEFINED NOT NULL DEFAULT 'Comida'::product_category,
  is_active boolean NOT NULL DEFAULT true,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sales (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  total_usd numeric NOT NULL CHECK (total_usd >= 0::numeric),
  total_ves numeric NOT NULL CHECK (total_ves >= 0::numeric),
  tasa numeric NOT NULL CHECK (tasa > 0::numeric),
  tasa_day timestamp with time zone NOT NULL DEFAULT now(),
  payment_method USER-DEFINED NOT NULL,
  payment_reference character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sales_pkey PRIMARY KEY (id)
);
CREATE TABLE public.sale_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  sale_id uuid NOT NULL,
  product_id uuid NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_usd numeric NOT NULL CHECK (unit_price_usd >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sale_items_pkey PRIMARY KEY (id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id),
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);