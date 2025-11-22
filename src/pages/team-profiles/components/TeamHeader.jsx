import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const TeamHeader = ({ team }) => {
  const primaryColor = team?.primaryColor || '#DC2626';
  const secondaryColor = team?.secondaryColor || '#F59E0B';
  
  return (
    <div 
      className="bg-card rounded-lg card-shadow p-6 mb-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor}15 0%, ${secondaryColor}10 100%)`,
        borderLeft: `4px solid ${primaryColor}`
      }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-6 lg:space-y-0 relative z-10">
        {/* Team Logo and Colors */}
        <div className="flex flex-col items-center lg:items-start">
          <div 
            className="w-32 h-32 lg:w-40 lg:h-40 rounded-lg overflow-hidden mb-4 shadow-lg border-4"
            style={{ 
              backgroundColor: primaryColor + '20',
              borderColor: primaryColor
            }}
          >
            <Image
              src={team?.logo}
              alt={team?.logoAlt}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                e.target.src = '/assets/images/no_image.png';
              }}
            />
          </div>
          <div className="flex items-center space-x-2">
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: primaryColor }}
              title={`Primary Color: ${primaryColor}`}
            />
            <div 
              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
              style={{ backgroundColor: secondaryColor }}
              title={`Secondary Color: ${secondaryColor}`}
            />
            <span className="text-sm text-muted-foreground ml-2">Team Colors</span>
          </div>
        </div>

        {/* Team Information */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">{team?.name}</h1>
          <p className="text-lg text-muted-foreground mb-4">{team?.fullName}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {team?.foundedYear && (
            <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Calendar" size={16} style={{ color: primaryColor }} />
              <span className="text-sm text-foreground">Founded {team?.foundedYear}</span>
            </div>
            )}
            {(team?.homeVenue || team?.venueAddress) && (
            <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="MapPin" size={16} style={{ color: primaryColor }} />
                <span className="text-sm text-foreground">
                  {team?.homeVenue || team?.venueAddress}
                  {team?.city && `, ${team?.city}`}
                </span>
            </div>
            )}
            {team?.league && team?.league !== 'N/A' && (
            <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Trophy" size={16} style={{ color: primaryColor }} />
              <span className="text-sm text-foreground">{team?.league}</span>
            </div>
            )}
            {team?.currentPosition > 0 && (
            <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Target" size={16} style={{ color: primaryColor }} />
              <span className="text-sm text-foreground">Position #{team?.currentPosition}</span>
            </div>
            )}
            {team?.category && (
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Users" size={16} style={{ color: primaryColor }} />
                <span className="text-sm text-foreground capitalize">{team?.category}</span>
              </div>
            )}
            {team?.division && (
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Layers" size={16} style={{ color: primaryColor }} />
                <span className="text-sm text-foreground">{team?.division}</span>
              </div>
            )}
            {team?.contactEmail && (
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Mail" size={16} style={{ color: primaryColor }} />
                <a 
                  href={`mailto:${team?.contactEmail}`}
                  className="text-sm text-foreground hover:underline"
                  style={{ color: primaryColor }}
                >
                  {team?.contactEmail}
                </a>
              </div>
            )}
            {team?.website && (
              <div className="flex items-center justify-center lg:justify-start space-x-2">
                <Icon name="Globe" size={16} style={{ color: primaryColor }} />
                <a 
                  href={team?.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground hover:underline"
                  style={{ color: primaryColor }}
                >
                  Website
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Current Season Stats */}
        <div 
          className="rounded-lg p-4 min-w-0 lg:min-w-[200px] shadow-md"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            color: 'white'
          }}
        >
          <h3 className="text-sm font-semibold mb-3 text-center" style={{ color: 'white' }}>
            {new Date().getFullYear()} Season
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: 'white' }}>{team?.wins || 0}</p>
              <p className="text-xs opacity-90">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'white' }}>{team?.losses || 0}</p>
              <p className="text-xs opacity-90">Losses</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'white' }}>{team?.winPercentage?.toFixed(0) || 0}%</p>
              <p className="text-xs opacity-90">Win Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;