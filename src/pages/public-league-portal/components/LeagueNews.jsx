import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const LeagueNews = ({ news }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const categories = {
      'news': 'Newspaper',
      'player-spotlight': 'Star',
      'team-achievement': 'Trophy',
      'announcement': 'Megaphone',
      'match-preview': 'Eye'
    };
    return categories?.[category] || 'FileText';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'news': 'text-primary bg-primary/10',
      'player-spotlight': 'text-warning bg-warning/10',
      'team-achievement': 'text-success bg-success/10',
      'announcement': 'text-accent bg-accent/10',
      'match-preview': 'text-secondary bg-secondary/10'
    };
    return colors?.[category] || 'text-muted-foreground bg-muted';
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">League News & Updates</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Latest news and announcements
            </p>
          </div>
          <Button variant="outline" size="sm" iconName="Rss" iconPosition="left">
            All News
          </Button>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {news?.map((article, index) => (
            <article key={article?.id} className={`${index !== news?.length - 1 ? 'pb-6 border-b border-border' : ''}`}>
              {/* Featured Article */}
              {index === 0 && (
                <div className="mb-6">
                  <div className="relative rounded-lg overflow-hidden bg-muted h-48 md:h-64">
                    <Image 
                      src={article?.image} 
                      alt={article?.imageAlt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article?.category)}`}>
                          <Icon name={getCategoryIcon(article?.category)} size={12} />
                          <span className="capitalize">{article?.category?.replace('-', ' ')}</span>
                        </span>
                        <span className="text-xs text-white/80">{formatDate(article?.publishedAt)}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {article?.title}
                      </h3>
                      <p className="text-sm text-white/90 line-clamp-2">
                        {article?.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Articles */}
              {index > 0 && (
                <div className="flex space-x-4">
                  {/* Article Image */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image 
                      src={article?.image} 
                      alt={article?.imageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article?.category)}`}>
                        <Icon name={getCategoryIcon(article?.category)} size={10} />
                        <span className="capitalize">{article?.category?.replace('-', ' ')}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(article?.publishedAt)}</span>
                    </div>
                    
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm md:text-base">
                      {article?.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {article?.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <Icon name="User" size={12} />
                        <span>{article?.author}</span>
                        <span>•</span>
                        <span>{article?.readTime} min read</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="xs" iconName="Share2">
                          Share
                        </Button>
                        <Button variant="ghost" size="xs" iconName="ExternalLink">
                          Read More
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Featured Article Actions */}
              {index === 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="User" size={14} />
                    <span>{article?.author}</span>
                    <span>•</span>
                    <span>{article?.readTime} min read</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" iconName="Share2" iconPosition="left">
                      Share
                    </Button>
                    <Button variant="default" size="sm" iconName="ExternalLink" iconPosition="right">
                      Read Full Article
                    </Button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" iconName="Plus" iconPosition="left">
            Load More Articles
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeagueNews;