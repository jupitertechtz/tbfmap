import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SocialMediaFeed = ({ posts }) => {
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInHours = Math.floor((now - postTime) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return postTime?.toLocaleDateString();
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'twitter': return 'Twitter';
      case 'facebook': return 'Facebook';
      case 'instagram': return 'Instagram';
      case 'youtube': return 'Youtube';
      default: return 'Share2';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'twitter': return 'text-blue-500';
      case 'facebook': return 'text-blue-600';
      case 'instagram': return 'text-pink-500';
      case 'youtube': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg card-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Latest Updates</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="ExternalLink">
            Follow Us
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {posts?.map((post) => (
          <div key={post?.id} className="bg-muted rounded-lg p-4 micro-interaction hover:shadow-md transition-all">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Users" size={16} color="white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">TBF Official</p>
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getPlatformIcon(post?.platform)} 
                      size={12} 
                      className={getPlatformColor(post?.platform)}
                    />
                    <span className="text-xs text-muted-foreground">{getTimeAgo(post?.timestamp)}</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" iconName="ExternalLink" />
            </div>

            {/* Post Content */}
            <div className="mb-3">
              <p className="text-foreground text-sm leading-relaxed">{post?.content}</p>
            </div>

            {/* Post Media */}
            {post?.media && (
              <div className="mb-3 rounded-lg overflow-hidden">
                {post?.media?.type === 'image' && (
                  <div className="w-full h-48">
                    <Image
                      src={post?.media?.url}
                      alt={post?.media?.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {post?.media?.type === 'video' && (
                  <div className="w-full h-48 bg-black rounded-lg flex items-center justify-center">
                    <Icon name="Play" size={32} color="white" />
                  </div>
                )}
              </div>
            )}

            {/* Post Hashtags */}
            {post?.hashtags && post?.hashtags?.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {post?.hashtags?.map((hashtag, index) => (
                    <span 
                      key={index}
                      className="text-xs text-primary hover:text-primary/80 cursor-pointer"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Post Engagement */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Icon name="Heart" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post?.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="MessageCircle" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post?.comments || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Share2" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{post?.shares || 0}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{post?.platform}</span>
            </div>
          </div>
        ))}
      </div>
      {posts?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Share2" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No recent social media updates.</p>
          <Button variant="outline" size="sm" className="mt-4" iconName="ExternalLink">
            Follow Our Social Media
          </Button>
        </div>
      )}
      {/* Social Media Links */}
      <div className="mt-6 pt-6 border-t border-border">
        <p className="text-sm font-medium text-foreground mb-3">Follow us on social media</p>
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" iconName="Twitter" className="text-blue-500 hover:bg-blue-50">
            Twitter
          </Button>
          <Button variant="ghost" size="sm" iconName="Facebook" className="text-blue-600 hover:bg-blue-50">
            Facebook
          </Button>
          <Button variant="ghost" size="sm" iconName="Instagram" className="text-pink-500 hover:bg-pink-50">
            Instagram
          </Button>
          <Button variant="ghost" size="sm" iconName="Youtube" className="text-red-500 hover:bg-red-50">
            YouTube
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaFeed;