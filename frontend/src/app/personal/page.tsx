import Layout from "@/components/ui/layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Personal() {
  return (
    <Layout>
      <Card className="bg-gray-900 border border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Personal Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400">Manage your personal passwords here.</p>
          {/* Add your personal passwords list or management UI here */}
        </CardContent>
      </Card>
    </Layout>
  )
}