import { getPostBySlug } from '@/lib/posts'
import ImagePageClient from '@/components/ImagePageClient'
import 'katex/dist/katex.min.css'

export default async function ImagePage() {
  const post = await getPostBySlug('mhc-trition')
  const blogContent = post?.content ?? ''

  return <ImagePageClient blogContent={blogContent} />
}
