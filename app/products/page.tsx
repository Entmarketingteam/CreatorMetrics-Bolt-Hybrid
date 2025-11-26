import Link from "next/link";
import { getActiveFunnels } from "@/lib/funnelStore";

export default function ProductsPage() {
  const funnels = getActiveFunnels();

  const products = funnels.flatMap((f) =>
    ((f as any).products || []).map((p: any) => ({
      ...p,
      creatorName: f.creatorName,
    }))
  );

  return (
    <div>
      <h1 className="cm-section-title">Products</h1>
      <p className="cm-section-subtitle">
        All Amazon + LTK products across all creators.
      </p>

      {products.length === 0 ? (
        <p className="cm-section-subtitle" style={{ marginTop: 16 }}>
          No product data yet. Upload IG / LTK / Amazon exports to see products.
        </p>
      ) : (
        <div className="cm-table-wrap" style={{ marginTop: 14 }}>
          <table className="cm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Platform</th>
                <th>Creator</th>
                <th>Clicks</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Conv%</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any, idx: number) => (
                <tr key={`${p.productId}_${idx}`}>
                  <td>
                    <Link href={`/products/${encodeURIComponent(p.productId)}`}>
                      {p.title}
                    </Link>
                  </td>
                  <td>{p.platform.toUpperCase()}</td>
                  <td>{p.creatorName}</td>
                  <td>{p.clicks}</td>
                  <td>{p.orders}</td>
                  <td>${p.revenue.toLocaleString()}</td>
                  <td>{(p.conversionRate * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
