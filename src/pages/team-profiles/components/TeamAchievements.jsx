import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const TeamAchievements = ({ achievements }) => {
  const getAchievementIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'championship': return 'Trophy';
      case 'tournament': return 'Award';
      case 'milestone': return 'Target';
      case 'record': return 'TrendingUp';
      default: return 'Star';
    }
  };

  const getAchievementColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'championship': return 'text-yellow-600';
      case 'tournament': return 'text-primary';
      case 'milestone': return 'text-success';
      case 'record': return 'text-accent';
      default: return 'text-secondary';
    }
  };

  const sortedAchievements = achievements?.sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Team Achievements</h2>
      {/* Featured Achievement */}
      {sortedAchievements?.length > 0 && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-6 space-y-4 lg:space-y-0">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                <Icon 
                  name={getAchievementIcon(sortedAchievements?.[0]?.type)} 
                  size={32} 
                  color="white"
                />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {sortedAchievements?.[0]?.title}
              </h3>
              <p className="text-muted-foreground mb-2">{sortedAchievements?.[0]?.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{sortedAchievements?.[0]?.date}</span>
                </div>
                {sortedAchievements?.[0]?.venue && (
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{sortedAchievements?.[0]?.venue}</span>
                  </div>
                )}
              </div>
            </div>
            {sortedAchievements?.[0]?.image && (
              <div className="w-full lg:w-32 h-32 rounded-lg overflow-hidden">
                <Image
                  src={sortedAchievements?.[0]?.image}
                  alt={sortedAchievements?.[0]?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Achievement Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Achievement Timeline</h3>
        
        {sortedAchievements?.slice(1)?.map((achievement, index) => (
          <div key={achievement?.id} className="flex items-start space-x-4 p-4 bg-muted rounded-lg micro-interaction hover:shadow-md transition-all">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                achievement?.type?.toLowerCase() === 'championship' ? 'bg-yellow-100' :
                achievement?.type?.toLowerCase() === 'tournament' ? 'bg-primary/10' :
                achievement?.type?.toLowerCase() === 'milestone' ? 'bg-success/10' :
                achievement?.type?.toLowerCase() === 'record'? 'bg-accent/10' : 'bg-secondary/10'
              }`}>
                <Icon 
                  name={getAchievementIcon(achievement?.type)} 
                  size={20} 
                  className={getAchievementColor(achievement?.type)}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                <h4 className="font-semibold text-foreground">{achievement?.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full mt-1 sm:mt-0 ${
                  achievement?.type?.toLowerCase() === 'championship' ? 'bg-yellow-100 text-yellow-800' :
                  achievement?.type?.toLowerCase() === 'tournament' ? 'bg-primary/10 text-primary' :
                  achievement?.type?.toLowerCase() === 'milestone' ? 'bg-success/10 text-success' :
                  achievement?.type?.toLowerCase() === 'record'? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'
                }`}>
                  {achievement?.type}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">{achievement?.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={12} />
                  <span>{achievement?.date}</span>
                </div>
                {achievement?.venue && (
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={12} />
                    <span>{achievement?.venue}</span>
                  </div>
                )}
                {achievement?.opponent && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Users" size={12} />
                    <span>vs {achievement?.opponent}</span>
                  </div>
                )}
                {achievement?.score && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Target" size={12} />
                    <span>{achievement?.score}</span>
                  </div>
                )}
              </div>
            </div>
            
            {achievement?.image && (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={achievement?.image}
                  alt={achievement?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {achievements?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No achievements recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default TeamAchievements;