import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const CoachingStaff = ({ staff }) => {
  const getRoleIcon = (role) => {
    switch (role?.toLowerCase()) {
      case 'head coach': return 'Crown';
      case 'assistant coach': return 'Users';
      case 'trainer': return 'Activity';
      case 'team manager': return 'Briefcase';
      default: return 'User';
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'head coach': return 'text-primary';
      case 'assistant coach': return 'text-accent';
      case 'trainer': return 'text-success';
      case 'team manager': return 'text-secondary';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Coaching Staff</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff?.map((member) => (
          <div key={member?.id} className="bg-muted rounded-lg p-4 micro-interaction hover:shadow-md transition-all">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={member?.photo}
                  alt={member?.photoAlt}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{member?.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon 
                    name={getRoleIcon(member?.role)} 
                    size={14} 
                    className={getRoleColor(member?.role)}
                  />
                  <span className="text-sm text-muted-foreground">{member?.role}</span>
                </div>
              </div>
            </div>

            {/* Experience and Qualifications */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={14} className="text-muted-foreground" />
                <span className="text-sm text-foreground">{member?.experience} years experience</span>
              </div>
              
              {member?.certifications && member?.certifications?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Award" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Certifications</span>
                  </div>
                  <div className="space-y-1">
                    {member?.certifications?.map((cert, index) => (
                      <span 
                        key={index}
                        className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mr-1 mb-1"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {member?.achievements && member?.achievements?.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="Trophy" size={14} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">Key Achievements</span>
                  </div>
                  <ul className="space-y-1">
                    {member?.achievements?.slice(0, 2)?.map((achievement, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start space-x-1">
                        <Icon name="ChevronRight" size={10} className="mt-0.5 flex-shrink-0" />
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contact Info */}
              {member?.email && (
                <div className="flex items-center space-x-2 pt-2 border-t border-border">
                  <Icon name="Mail" size={14} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{member?.email}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {staff?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No coaching staff information available.</p>
        </div>
      )}
    </div>
  );
};

export default CoachingStaff;