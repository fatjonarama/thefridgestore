"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteProduct } from "@/db/mutations";

export default function DeleteProductButton({ id, name }: { id: number; name: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  return (
    <button
      disabled={deleting}
      onClick={async () => {
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
        setDeleting(true);
        await deleteProduct(id);
        router.refresh();
      }}
      className="text-white/70 hover:text-fridge-orange disabled:opacity-50"
    >
      {deleting ? "…" : "DELETE"}
    </button>
  );
}
