export default function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-6">
      <div className="h-8 w-48 skeleton rounded-lg"/>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_,i)=><div key={i} className="h-28 skeleton rounded-2xl"/>)}
      </div>
      <div className="h-64 skeleton rounded-2xl"/>
    </div>
  )
}
