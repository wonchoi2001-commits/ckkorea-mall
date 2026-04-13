import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-52 w-full">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.price === null ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
            {product.type}
          </span>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
            {product.shipping}
          </span>
        </div>
        <div className="text-lg font-bold leading-7">{product.name}</div>
        <div className="mt-1 text-sm text-slate-500">{product.brand}</div>
        <div className="mt-2 text-sm text-slate-600">규격: {product.spec}</div>
        <div className="text-sm text-slate-600">판매단위: {product.unit}</div>
        <div className="mt-3 min-h-[48px] text-sm leading-6 text-slate-500">{product.desc}</div>
        <div className="mt-4 text-2xl font-black">{formatPrice(product.price)}</div>
        <div className="mt-1 text-xs text-slate-500">{product.stock}</div>
        <div className="mt-5 flex gap-2">
          {product.price === null ? (
            <button className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              견적문의
            </button>
          ) : (
            <>
              <button className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50">
                상세보기
              </button>
              <button className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                담기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
