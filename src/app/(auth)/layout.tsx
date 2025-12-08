import { BauhausPattern } from '@/components/ui/bauhaus-pattern'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      <BauhausPattern variant="triangles" opacity={0.2} />
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  )
}
