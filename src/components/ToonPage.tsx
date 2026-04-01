import React, { useState } from 'react';
import { Calendar, Image as ImageIcon, Share2, ChevronDown } from 'lucide-react';
import { POSTS, FEATURED_COUNT, type Post } from '../data/posts';
import Seo from './Seo';

const PostCard: React.FC<{ post: Post; featured?: boolean }> = ({ post, featured = false }) => {
  return (
    <div className={`bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all ${featured ? 'md:col-span-2 lg:col-span-3 lg:flex' : ''}`}>
      <div className={`relative ${featured ? 'lg:w-2/3' : 'aspect-video'}`}>
        <img
          src={post.image}
          alt={post.alt || post.title}
          className="w-full h-full object-cover"
          loading={featured ? 'eager' : 'lazy'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent"></div>
        {featured && (
          <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            LATEST TOON
          </div>
        )}
      </div>

      <div className={`p-6 ${featured ? 'lg:w-1/3 flex flex-col justify-center' : ''}`}>
        <div className="flex items-center gap-2 text-slate-400 text-xs mb-3">
          <Calendar className="w-4 h-4" /> {post.date}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{post.title}</h3>
        <p className="text-slate-400 mb-6">{post.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: post.title, text: post.description, url: `https://btctoon.com/toon#${post.id}` });
            }
          }}
          className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold transition-colors border border-white/10 mt-auto"
        >
          <Share2 className="w-4 h-4" /> Share Toon
        </button>
      </div>
    </div>
  );
}

export default function ToonPage() {
  const [showAll, setShowAll] = useState(false);

  const featured = POSTS.slice(0, FEATURED_COUNT);
  const older    = POSTS.slice(FEATURED_COUNT);

  return (
    <div className="pt-8 pb-20 px-4 max-w-7xl mx-auto min-h-[80vh]">
      <Seo
        title="Toon of the Day | Crypto Battle Comics – btctoon.com"
        description="Daily crypto comic strips inspired by real Bitcoin price action and market sentiment. Bulls vs Bears illustrated on btctoon.com."
        path="/toon"
        image={POSTS[0]?.image}
        imageAlt="Toon of the Day – btctoon.com"
      />
      <div className="text-center mb-16 pt-12">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
          <ImageIcon className="w-10 h-10 text-purple-500" /> Toon of the Day
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Daily comic strips inspired by the day&#39;s price action and market sentiment on btctoon.com.
        </p>
      </div>

      {/* Featured posts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featured.map((post, i) => (
          <PostCard key={post.id} post={post} featured={i === 0} />
        ))}
      </div>

      {/* Older posts — collapsed behind "See More" */}
      {older.length > 0 && (
        <div className="mt-12">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="mx-auto flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-colors"
            >
              <ChevronDown className="w-4 h-4" /> See {older.length} More Post{older.length > 1 ? 's' : ''}
            </button>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {older.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
