import { Header } from '@/components/layout/header'
import { Nav } from '@/components/layout/nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { BauhausPattern } from '@/components/ui/bauhaus-pattern'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative">
      <BauhausPattern variant="circles" opacity={0.15} />
      <Header />
      <div className="flex-1 flex relative z-10">
        <Nav />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
