"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NotFound from '../../notFound';
import Loading from '../../../components/loading';
import RenderHtmlContent from '../../../components/renderHtmlContent';

export default function SitePage() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredMediaUrl, setFeaturedMediaUrl] = useState(null);

  useEffect(() => {
    async function fetchData() {
      if (id) {
        try {
          const res = await fetch(`https://dev-test.yourballistic.com/wp-json/wp/v2/pages/${id}`);
          if (res.status === 404) {
            setPage(null);
            setLoading(false);
            return;
          }
          if (!res.ok) {
            throw new Error(`Error: ${res.status}`);
          }
          const data = await res.json();
          setPage(data);

          // Fetch featured media if available
          if (data.featured_media) {
            const mediaRes = await fetch(data._links['wp:featuredmedia'][0].href);
            if (mediaRes.ok) {
              const mediaData = await mediaRes.json();
              setFeaturedMediaUrl(mediaData.source_url);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError(error);
        } finally {
          setLoading(false);
        }
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <Loading />;
  if (error) return <NotFound />;
  if (!page) return <NotFound />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{page.title.rendered}</h1>
      {featuredMediaUrl && (
        <img src={featuredMediaUrl} alt={page.title.rendered} className="mb-4 w-full h-auto rounded" />
      )}
      <RenderHtmlContent content={page.content.rendered} />
    </div>
  );
}
