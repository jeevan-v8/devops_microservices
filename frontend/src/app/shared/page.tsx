import Layout from "@/components/ui/layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Shared() {
  return (
    <Layout>
      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Shared Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Manage your shared passwords here.</p>
          {/* Add your personal passwords list or management UI here */}
        </CardContent>
      </Card>
    </Layout>
  )
}