import ViewProducts from "@/components/products/ViewProducts";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <ViewProducts params={params} />
    </div>
  );
}
